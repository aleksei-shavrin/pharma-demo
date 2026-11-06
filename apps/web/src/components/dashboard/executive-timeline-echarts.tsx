'use client';

import { useEffect, useRef, useState } from 'react';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ExecutiveTimelineExperimentModel } from '@/lib/dashboard/executive-timeline-experiment';
import {
  EXPERIMENT_NARROW_LABEL_WIDTH_PX,
  echartsLabelDistance,
  echartsLabelPosition,
  selectVisibleMilestoneLabelIds,
} from '@/lib/dashboard/executive-timeline-experiment-labels';
import { ECHARTS_PLOT_INSET_PX } from '@/lib/dashboard/snapshot-caption-position';
import { formatDateRu } from '@/lib/format/ru';
import { ExecutiveTimelineSnapshotChrome } from './executive-timeline-snapshot-chrome';

echarts.use([
  ScatterChart,
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
  MarkAreaComponent,
  CanvasRenderer,
]);

type TimelineThemeColors = {
  axis: string;
  axisMuted: string;
  text: string;
  textMuted: string;
  ragGreen: string;
  ragRed: string;
  bandFill: string;
  bandBorder: string;
  snapshotLine: string;
  tooltipBg: string;
  tooltipBorder: string;
};

function parseIsoUtcMs(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function readCssVar(name: string, root: HTMLElement): string {
  return getComputedStyle(root).getPropertyValue(name).trim();
}

function resolveTimelineThemeColors(root: HTMLElement): TimelineThemeColors {
  return {
    axis: readCssVar('--border', root),
    axisMuted: readCssVar('--border-subtle', root),
    text: readCssVar('--text', root),
    textMuted: readCssVar('--text-muted', root),
    ragGreen: readCssVar('--status-ok-border', root),
    ragRed: readCssVar('--status-danger-border', root),
    bandFill: readCssVar('--border-subtle', root),
    bandBorder: readCssVar('--border', root),
    snapshotLine: readCssVar('--primary', root),
    tooltipBg: readCssVar('--surface-raised', root),
    tooltipBorder: readCssVar('--border', root),
  };
}

function ragColor(rag: 'Green' | 'Red', colors: TimelineThemeColors): string {
  return rag === 'Green' ? colors.ragGreen : colors.ragRed;
}

function statusWord(rag: 'Green' | 'Red'): string {
  return rag === 'Green' ? 'В норме' : 'Критично';
}

/**
 * PS span: markArea + diamond endpoints; forecast point carries visible Δ label.
 */
export function buildExecutiveTimelineOption(
  model: ExecutiveTimelineExperimentModel,
  colors: TimelineThemeColors,
  visibleLabelIds: Set<string>,
): EChartsOption {
  const horizonMin = parseIsoUtcMs(model.horizonStart);
  const horizonMax = parseIsoUtcMs(model.horizonEnd);
  const asOfMs = parseIsoUtcMs(model.scenarioAsOfDate);
  const { band } = model;

  const monthLabelByMs = new Map<number, string>();
  for (const tick of model.monthTicks) {
    monthLabelByMs.set(parseIsoUtcMs(tick.date), tick.label);
  }

  const milestoneData = model.ordinaryPoints.map((point) => {
    const showLabel = visibleLabelIds.has(point.id);
    return {
      value: [parseIsoUtcMs(point.forecastDate), 0] as [number, number],
      name: point.shortLabel,
      rag: point.rag,
      entityId: point.id,
      forecastDate: point.forecastDate,
      title: point.name,
      label: {
        show: showLabel,
        formatter: point.shortLabel,
        position: echartsLabelPosition(point.labelSide),
        distance: echartsLabelDistance(point.labelLane),
        color: colors.text,
        fontSize: 10,
        lineHeight: 12,
      },
    };
  });

  const psEndpointData: {
    value: [number, number];
    kind: 'baseline' | 'forecast';
    label?: {
      show: boolean;
      formatter: string;
      position: 'top' | 'bottom';
      distance: number;
      color: string;
      fontSize: number;
      fontWeight?: 'bold';
    };
  }[] = [];

  if (!band.coincident) {
    psEndpointData.push(
      {
        value: [parseIsoUtcMs(band.baselineDate), 0],
        kind: 'baseline',
        label: {
          show: true,
          formatter: 'План',
          position: 'bottom',
          distance: 8,
          color: colors.textMuted,
          fontSize: 9,
        },
      },
      {
        value: [parseIsoUtcMs(band.forecastDate), 0],
        kind: 'forecast',
        label: {
          show: true,
          formatter: band.deltaLabel,
          position: 'top',
          distance: 10,
          color: colors.ragRed,
          fontSize: 10,
          fontWeight: 'bold',
        },
      },
    );
  } else {
    psEndpointData.push({
      value: [parseIsoUtcMs(band.forecastDate), 0],
      kind: 'forecast',
      label: {
        show: true,
        formatter: 'ПС',
        position: 'top',
        distance: 10,
        color: colors.text,
        fontSize: 10,
      },
    });
  }

  const markArea =
    !band.coincident
      ? {
          silent: true,
          itemStyle: {
            color: colors.bandFill,
            opacity: 0.45,
            borderColor: colors.bandBorder,
            borderWidth: 0.75,
          },
          data: [
            [
              { xAxis: band.baselineDate },
              { xAxis: band.forecastDate },
            ],
          ] as [{ xAxis: string }, { xAxis: string }][],
        }
      : undefined;

  return {
    animation: false,
    grid: {
      left: ECHARTS_PLOT_INSET_PX,
      right: ECHARTS_PLOT_INSET_PX,
      top: 36,
      bottom: 36,
      containLabel: false,
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.text, fontSize: 12 },
      formatter: (params) => {
        if (!params || typeof params !== 'object' || !('data' in params)) {
          return '';
        }
        const data = params.data as {
          name?: string;
          title?: string;
          entityId?: string;
          forecastDate?: string;
          rag?: 'Green' | 'Red';
          kind?: 'baseline' | 'forecast';
        };
        if (data.kind === 'baseline') {
          return `План запуска<br/>${formatDateRu(band.baselineDate)}`;
        }
        if (data.kind === 'forecast') {
          return `Прогноз запуска<br/>${formatDateRu(band.forecastDate)}<br/>${band.deltaLabel}`;
        }
        const rag = data.rag ?? 'Green';
        const lines = [
          `<strong>${data.name ?? ''}</strong>`,
          data.title ?? '',
          data.entityId ? `<span style="opacity:0.7">${data.entityId}</span>` : '',
          `Прогноз: ${formatDateRu(data.forecastDate ?? '')}`,
          statusWord(rag),
        ].filter(Boolean);
        return lines.join('<br/>');
      },
    },
    xAxis: {
      type: 'time',
      min: horizonMin,
      max: horizonMax,
      axisLine: { lineStyle: { color: colors.axis, width: 2 } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        color: colors.textMuted,
        fontSize: 10,
        formatter: (value: number) => {
          const ms = typeof value === 'number' ? value : Number(value);
          const direct = monthLabelByMs.get(ms);
          if (direct) return direct;
          for (const [tickMs, label] of monthLabelByMs) {
            if (Math.abs(tickMs - ms) < 36 * 60 * 60 * 1000) return label;
          }
          return '';
        },
      },
    },
    yAxis: {
      type: 'value',
      min: -1,
      max: 1,
      show: false,
    },
    series: [
      {
        name: 'milestones',
        type: 'scatter',
        symbolSize: 10,
        z: 3,
        data: milestoneData,
        itemStyle: {
          color: (params) => {
            const rag = (params.data as { rag?: 'Green' | 'Red' }).rag ?? 'Green';
            return ragColor(rag, colors);
          },
          borderColor: colors.text,
          borderWidth: 0.5,
        },
        // Caption lives in ExecutiveTimelineSnapshotChrome — line only here.
        markLine: {
          symbol: 'none',
          silent: true,
          z: 2,
          lineStyle: {
            color: colors.snapshotLine,
            type: 'dashed',
            width: 1.5,
          },
          label: { show: false },
          data: [{ xAxis: asOfMs }],
        },
        markArea,
      },
      {
        name: 'ps-endpoints',
        type: 'scatter',
        symbol: 'diamond',
        symbolSize: 9,
        z: 4,
        data: psEndpointData,
        itemStyle: {
          color: (params) => {
            const kind = (params.data as { kind?: string }).kind;
            return kind === 'forecast' && !band.coincident
              ? colors.ragRed
              : colors.bandBorder;
          },
          borderColor: colors.text,
          borderWidth: 0.5,
        },
      },
    ],
  };
}

export function ExecutiveTimelineEcharts({
  model,
}: {
  model: ExecutiveTimelineExperimentModel;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const modelRef = useRef(model);
  modelRef.current = model;
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const chart = echarts.init(host, undefined, { renderer: 'canvas' });
    chartRef.current = chart;

    const applyOption = (isNarrow: boolean) => {
      const root = document.documentElement;
      const colors = resolveTimelineThemeColors(root);
      const visible = selectVisibleMilestoneLabelIds(
        modelRef.current.ordinaryPoints,
        { narrow: isNarrow },
      );
      chart.setOption(
        buildExecutiveTimelineOption(modelRef.current, colors, visible),
        { notMerge: true },
      );
    };

    const measure = () => {
      const isNarrow = host.clientWidth < EXPERIMENT_NARROW_LABEL_WIDTH_PX;
      setNarrow(isNarrow);
      chart.resize();
      applyOption(isNarrow);
    };

    measure();

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(host);

    const themeObserver = new MutationObserver(() => {
      applyOption(host.clientWidth < EXPERIMENT_NARROW_LABEL_WIDTH_PX);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      themeObserver.disconnect();
      resizeObserver.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    const host = hostRef.current;
    if (!chart || !host) return;
    const isNarrow = host.clientWidth < EXPERIMENT_NARROW_LABEL_WIDTH_PX;
    setNarrow(isNarrow);
    const colors = resolveTimelineThemeColors(document.documentElement);
    const visible = selectVisibleMilestoneLabelIds(model.ordinaryPoints, {
      narrow: isNarrow,
    });
    chart.setOption(buildExecutiveTimelineOption(model, colors, visible), {
      notMerge: true,
    });
  }, [model]);

  return (
    <div
      className="relative w-full min-w-0"
      data-timeline-renderer="echarts"
      data-timeline-layout="experiment-echarts"
      data-timeline-labels-narrow={narrow ? 'true' : 'false'}
    >
      <p className="sr-only">{model.textSummary}</p>
      <ExecutiveTimelineSnapshotChrome
        scenarioAsOfDate={model.scenarioAsOfDate}
        plotInsetPx={ECHARTS_PLOT_INSET_PX}
      />
      <div
        ref={hostRef}
        className="h-[240px] w-full min-w-0"
        role="img"
        aria-label={model.textSummary}
      />
    </div>
  );
}
