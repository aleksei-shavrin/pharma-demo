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
  selectLaneAwareMilestoneLabelIds,
} from '@/lib/dashboard/executive-timeline-experiment-labels';
import {
  EXECUTION_PHASE_START,
  OVERVIEW_MILESTONE_IDS,
  type TimelineMilestonePoint,
} from '@/lib/dashboard/executive-timeline';
import {
  TIMELINE_PROGRAM_ORDER,
  timelineProgramLabel,
} from '@/lib/dashboard/timeline-program-labels';
import {
  ECHARTS_GRID_LEFT_PX,
  ECHARTS_GRID_RIGHT_PX,
  ECHARTS_PLOT_INSETS,
} from '@/lib/dashboard/snapshot-caption-position';
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
  textSecondary: string;
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
    textSecondary: readCssVar('--text-secondary', root),
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

export type EchartsMilestoneMeta = {
  id: string;
  programId?: string | null;
};

function programIdForPoint(
  point: TimelineMilestonePoint,
  milestones: readonly EchartsMilestoneMeta[],
): string {
  const ms = milestones.find((m) => m.id === point.id);
  return ms?.programId ?? 'none';
}

/**
 * Program-lane scatter: permanent phase / PS / key shortLabels; full tooltip.
 */
export function buildExecutiveTimelineOption(
  model: ExecutiveTimelineExperimentModel,
  colors: TimelineThemeColors,
  visibleLabelIds: Set<string>,
  milestoneMeta: readonly EchartsMilestoneMeta[],
): EChartsOption {
  const horizonMin = parseIsoUtcMs(model.horizonStart);
  const horizonMax = parseIsoUtcMs(model.horizonEnd);
  const asOfMs = parseIsoUtcMs(model.scenarioAsOfDate);
  const executionMs = parseIsoUtcMs(EXECUTION_PHASE_START);
  const { band } = model;

  const monthLabelByMs = new Map<number, string>();
  for (const tick of model.monthTicks) {
    monthLabelByMs.set(parseIsoUtcMs(tick.date), tick.label);
  }

  const presentProgramIds = new Set<string>();
  for (const p of model.ordinaryPoints) {
    presentProgramIds.add(programIdForPoint(p, milestoneMeta));
  }
  const orderedProgramIds = TIMELINE_PROGRAM_ORDER.filter((id) =>
    presentProgramIds.has(id),
  );
  const categories = orderedProgramIds.map((id) => timelineProgramLabel(id));
  const categoryIndex = new Map<string, number>(
    orderedProgramIds.map((id, i) => [id, i]),
  );
  // Fallback single lane when filter emptied programs somehow.
  const yCategories =
    categories.length > 0 ? categories : [timelineProgramLabel('none')];

  const milestoneData = model.ordinaryPoints.map((point) => {
    const pid = programIdForPoint(point, milestoneMeta);
    const y = categoryIndex.get(pid) ?? 0;
    const showLabel = visibleLabelIds.has(point.id);
    return {
      value: [parseIsoUtcMs(point.forecastDate), y] as [number, number],
      name: point.shortLabel,
      rag: point.rag,
      entityId: point.id,
      forecastDate: point.forecastDate,
      title: point.name,
      programLabel: timelineProgramLabel(pid),
      label: {
        show: showLabel,
        formatter: point.shortLabel,
        position: echartsLabelPosition(point.labelSide),
        distance: echartsLabelDistance(point.labelLane),
        color: colors.text,
        fontSize: 10,
        lineHeight: 12,
        overflow: 'truncate' as const,
        width: 72,
      },
    };
  });

  const psY = Math.max(0, yCategories.length - 1);
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
        value: [parseIsoUtcMs(band.baselineDate), psY],
        kind: 'baseline',
        label: {
          show: true,
          formatter: `План ${formatDateRu(band.baselineDate)}`,
          position: 'bottom',
          distance: 8,
          color: colors.textMuted,
          fontSize: 10,
        },
      },
      {
        value: [parseIsoUtcMs(band.forecastDate), psY],
        kind: 'forecast',
        label: {
          show: true,
          formatter: `Прогноз ${formatDateRu(band.forecastDate)} (${band.deltaLabel})`,
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
      value: [parseIsoUtcMs(band.forecastDate), psY],
      kind: 'forecast',
      label: {
        show: true,
        formatter: `ПС ${formatDateRu(band.forecastDate)}`,
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

  const rowHeight = 36;
  const gridTop = 44;
  const gridBottom = 48;

  return {
    animation: false,
    grid: {
      left: ECHARTS_GRID_LEFT_PX,
      right: ECHARTS_GRID_RIGHT_PX,
      top: gridTop,
      bottom: gridBottom,
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
          programLabel?: string;
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
          data.programLabel ? `Программа: ${data.programLabel}` : '',
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
      type: 'category',
      data: yCategories,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { color: colors.axisMuted, type: 'dashed', opacity: 0.5 },
      },
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 10,
        width: 110,
        overflow: 'truncate',
      },
    },
    series: [
      {
        name: 'milestones',
        type: 'scatter',
        symbolSize: 10,
        z: 3,
        data: milestoneData,
        labelLayout: {
          hideOverlap: true,
          moveOverlap: 'shiftY',
        },
        itemStyle: {
          color: (params) => {
            const rag = (params.data as { rag?: 'Green' | 'Red' }).rag ?? 'Green';
            return ragColor(rag, colors);
          },
          borderColor: colors.text,
          borderWidth: 0.5,
        },
        markLine: {
          symbol: 'none',
          silent: true,
          z: 2,
          data: [
            {
              xAxis: asOfMs,
              lineStyle: {
                color: colors.snapshotLine,
                type: 'dashed',
                width: 1.5,
              },
              label: { show: false },
            },
            {
              xAxis: executionMs,
              lineStyle: {
                color: colors.textMuted,
                type: 'dotted',
                width: 1.25,
              },
              label: {
                show: true,
                formatter: 'Исполнение',
                color: colors.textMuted,
                fontSize: 9,
                position: 'insideEndTop',
              },
            },
          ],
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
    // Carry layout hint for host height (not an ECharts field consumers rely on).
    __rowCount: yCategories.length,
    __rowHeight: rowHeight,
    __gridChrome: gridTop + gridBottom,
  } as EChartsOption & {
    __rowCount: number;
    __rowHeight: number;
    __gridChrome: number;
  };
}

/**
 * Prefer overview + Red; densify per program row so adjacent shortLabels
 * (e.g. Котлован / Контур здания) do not all paint on one lane.
 */
export function resolveEchartsVisibleLabelIds(
  ordinaryPoints: readonly TimelineMilestonePoint[],
  narrow: boolean,
  milestoneMeta: readonly EchartsMilestoneMeta[] = [],
): Set<string> {
  const overview = new Set<string>(OVERVIEW_MILESTONE_IDS);
  const keyPoints = ordinaryPoints.filter(
    (p) => overview.has(p.id) || p.rag === 'Red',
  );
  const pool = keyPoints.length > 0 ? keyPoints : ordinaryPoints;
  return selectLaneAwareMilestoneLabelIds(pool, {
    narrow,
    preferIds: overview,
    programIdFor: (p) => programIdForPoint(p, milestoneMeta),
    maxPerProgram: narrow ? 2 : 3,
    maxTotal: narrow ? 6 : 12,
  });
}

export function ExecutiveTimelineEcharts({
  model,
  milestoneMeta,
}: {
  model: ExecutiveTimelineExperimentModel;
  milestoneMeta: readonly EchartsMilestoneMeta[];
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const modelRef = useRef(model);
  const metaRef = useRef(milestoneMeta);
  modelRef.current = model;
  metaRef.current = milestoneMeta;
  const [narrow, setNarrow] = useState(false);
  const [hostHeight, setHostHeight] = useState(280);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const chart = echarts.init(host, undefined, { renderer: 'canvas' });
    chartRef.current = chart;

    const applyOption = (isNarrow: boolean) => {
      const root = document.documentElement;
      const colors = resolveTimelineThemeColors(root);
      const visible = resolveEchartsVisibleLabelIds(
        modelRef.current.ordinaryPoints,
        isNarrow,
        metaRef.current,
      );
      const option = buildExecutiveTimelineOption(
        modelRef.current,
        colors,
        visible,
        metaRef.current,
      );
      const extra = option as EChartsOption & {
        __rowCount?: number;
        __rowHeight?: number;
        __gridChrome?: number;
      };
      const rows = extra.__rowCount ?? 1;
      const h =
        (extra.__gridChrome ?? 92) + rows * (extra.__rowHeight ?? 36);
      setHostHeight(Math.max(240, Math.min(h, 560)));
      chart.setOption(option, { notMerge: true });
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
    const visible = resolveEchartsVisibleLabelIds(
      model.ordinaryPoints,
      isNarrow,
      milestoneMeta,
    );
    const option = buildExecutiveTimelineOption(
      model,
      colors,
      visible,
      milestoneMeta,
    );
    const extra = option as EChartsOption & {
      __rowCount?: number;
      __rowHeight?: number;
      __gridChrome?: number;
    };
    const rows = extra.__rowCount ?? 1;
    const h = (extra.__gridChrome ?? 92) + rows * (extra.__rowHeight ?? 36);
    setHostHeight(Math.max(240, Math.min(h, 560)));
    chart.setOption(option, { notMerge: true });
    chart.resize();
  }, [model, milestoneMeta]);

  return (
    <div
      className="relative w-full min-w-0"
      data-timeline-renderer="echarts"
      data-timeline-layout="experiment-echarts-lanes"
      data-timeline-labels-narrow={narrow ? 'true' : 'false'}
    >
      <p className="sr-only">{model.textSummary}</p>
      <ExecutiveTimelineSnapshotChrome
        scenarioAsOfDate={model.scenarioAsOfDate}
        plotInsets={ECHARTS_PLOT_INSETS}
      />
      <div
        className="mb-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-[var(--text-muted)]"
        data-timeline-ps-legend="true"
      >
        <span>
          План запуска:{' '}
          <span className="tabular-nums text-[var(--text-secondary)]">
            {formatDateRu(model.band.baselineDate)}
          </span>
        </span>
        <span>
          Прогноз:{' '}
          <span className="tabular-nums text-[var(--text-secondary)]">
            {formatDateRu(model.band.forecastDate)}
          </span>
        </span>
        <span>
          Δ:{' '}
          <span className="font-semibold tabular-nums text-[var(--text)]">
            {model.band.deltaLabel}
          </span>
        </span>
      </div>
      <div
        ref={hostRef}
        className="w-full min-w-0"
        style={{ height: hostHeight }}
        role="img"
        aria-label={model.textSummary}
      />
    </div>
  );
}
