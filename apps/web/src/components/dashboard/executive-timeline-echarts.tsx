'use client';

import { useEffect, useRef, useState } from 'react';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { EffectScatterChart, ScatterChart } from 'echarts/charts';
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
  TIMELINE_PORTFOLIO_LANE_KEY,
  TIMELINE_PROGRAM_ORDER,
  isTimelinePortfolioLane,
  timelineProgramLabel,
} from '@/lib/dashboard/timeline-program-labels';
import {
  dateToPlotRatio,
  escapeHtmlText,
  resolveTimelinePlotDomain,
  scheduleMilestoneFocusHref,
} from '@/lib/dashboard/timeline-plot-domain';
import {
  ECHARTS_GRID_LEFT_PX,
  ECHARTS_GRID_RIGHT_PX,
  ECHARTS_PLOT_INSETS,
} from '@/lib/dashboard/snapshot-caption-position';
import {
  TIMELINE_CAPTION_BLOCK_PX,
  TIMELINE_CAPTION_GAP_PX,
  TIMELINE_FORECAST_LABEL_DISTANCE_PX,
  TIMELINE_GRID_BOTTOM_PX,
  TIMELINE_GRID_TOP_PX,
  TIMELINE_SNAPSHOT_CAPTION_TOP_PX,
} from '@/lib/dashboard/timeline-caption-gap';
import { formatDateRu } from '@/lib/format/ru';
import {
  horizontalRangesOverlap,
  resolveTopCaptionLayout,
} from '@/lib/dashboard/timeline-top-caption-layout';
import { formatStatusPillHtml } from '@/lib/status-pill-presentation';
import { ExecutiveTimelineSnapshotChrome } from './executive-timeline-snapshot-chrome';

echarts.use([
  ScatterChart,
  EffectScatterChart,
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
  /** Light row wash for portfolio/unassigned lane (`--surface-sunken`). */
  laneBandFill: string;
  snapshotLine: string;
  tooltipBg: string;
  tooltipBorder: string;
};

/** Keep permanent PS endpoint captions inside the card near plot edges. */
export function psEndpointLabelAlign(
  atMs: number,
  minMs: number,
  maxMs: number,
): 'left' | 'center' | 'right' {
  const span = Math.max(1, maxMs - minMs);
  const ratio = (atMs - minMs) / span;
  if (ratio >= 0.62) return 'right';
  if (ratio <= 0.38) return 'left';
  return 'center';
}

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
    laneBandFill: readCssVar('--surface-sunken', root),
    snapshotLine: readCssVar('--primary', root),
    tooltipBg: readCssVar('--surface-raised', root),
    tooltipBorder: readCssVar('--border', root),
  };
}

export type EchartsMilestoneMeta = {
  id: string;
  programId?: string | null;
};

function publishTimelineHostProbe(
  host: HTMLElement,
  option: EChartsOption & {
    __rowCount?: number;
    __rowHeight?: number;
    __plotDomain?: { minMs: number; maxMs: number };
  },
  chart?: echarts.ECharts | null,
): void {
  if (option.__plotDomain) {
    host.setAttribute('data-plot-min-ms', String(option.__plotDomain.minMs));
    host.setAttribute('data-plot-max-ms', String(option.__plotDomain.maxMs));
  }
  host.setAttribute('data-grid-left', String(ECHARTS_GRID_LEFT_PX));
  host.setAttribute('data-grid-right', String(ECHARTS_GRID_RIGHT_PX));
  host.setAttribute('data-grid-top', String(TIMELINE_GRID_TOP_PX));
  host.setAttribute('data-grid-bottom', String(TIMELINE_GRID_BOTTOM_PX));
  host.setAttribute('data-row-height', String(option.__rowHeight ?? 36));
  host.setAttribute('data-row-count', String(option.__rowCount ?? 1));
  host.setAttribute('data-caption-gap', String(TIMELINE_CAPTION_GAP_PX));
  host.removeAttribute('data-hover-probe');

  const yAxisOpt = Array.isArray(option.yAxis) ? option.yAxis[0] : option.yAxis;
  const yData = (
    yAxisOpt && typeof yAxisOpt === 'object' && 'data' in yAxisOpt
      ? (yAxisOpt as { data?: unknown[] }).data
      : undefined
  ) ?? [];
  const portfolioLabel = timelineProgramLabel(TIMELINE_PORTFOLIO_LANE_KEY);
  const portfolioY = yData.find((entry) => {
    if (typeof entry === 'string') return entry === portfolioLabel;
    if (entry && typeof entry === 'object' && 'value' in entry) {
      return (entry as { value?: string }).value === portfolioLabel;
    }
    return false;
  });
  const portfolioBold =
    !!portfolioY &&
    typeof portfolioY === 'object' &&
    (portfolioY as { textStyle?: { fontWeight?: string } }).textStyle
      ?.fontWeight === 'bold';
  const splitArea =
    yAxisOpt && typeof yAxisOpt === 'object' && 'splitArea' in yAxisOpt
      ? (
          yAxisOpt as {
            splitArea?: {
              show?: boolean;
              interval?: number;
              areaStyle?: { color?: string | string[] };
            };
          }
        ).splitArea
      : undefined;
  const splitColors = Array.isArray(splitArea?.areaStyle?.color)
    ? splitArea.areaStyle.color
    : [];
  const portfolioSplitIdx = yData.findIndex((entry) => {
    if (typeof entry === 'string') return entry === portfolioLabel;
    if (entry && typeof entry === 'object' && 'value' in entry) {
      return (entry as { value?: string }).value === portfolioLabel;
    }
    return false;
  });
  const portfolioBandPainted =
    !!splitArea?.show &&
    portfolioBold &&
    portfolioSplitIdx >= 0 &&
    typeof splitColors[portfolioSplitIdx] === 'string' &&
    splitColors[portfolioSplitIdx] !== 'rgba(0,0,0,0)' &&
    splitColors[portfolioSplitIdx] !== 'transparent';

  host.setAttribute(
    'data-portfolio-lane',
    portfolioBold ? TIMELINE_PORTFOLIO_LANE_KEY : 'absent',
  );
  host.setAttribute('data-portfolio-lane-bold', portfolioBold ? 'true' : 'false');
  host.setAttribute(
    'data-portfolio-lane-band',
    portfolioBandPainted ? 'splitArea' : 'absent',
  );
  host.setAttribute(
    'data-portfolio-lane-band-index',
    portfolioBandPainted ? String(portfolioSplitIdx) : '',
  );

  const series = option.series;
  const list = Array.isArray(series) ? series : series ? [series] : [];

  const ps = list.find(
    (s) => s && typeof s === 'object' && (s as { name?: string }).name === 'ps-endpoints',
  ) as
    | {
        data?: Array<{
          kind?: string;
          value?: [number, number];
          label?: {
            formatter?: string;
            align?: string;
            distance?: number;
          };
        }>;
      }
    | undefined;
  const forecast = ps?.data?.find((d) => d.kind === 'forecast');
  if (forecast?.label) {
    host.setAttribute(
      'data-ps-forecast-formatter',
      String(forecast.label.formatter ?? ''),
    );
    host.setAttribute(
      'data-ps-forecast-align',
      String(forecast.label.align ?? ''),
    );
    host.setAttribute(
      'data-ps-forecast-distance',
      String(forecast.label.distance ?? TIMELINE_CAPTION_GAP_PX),
    );
  }
  if (chart && forecast?.value) {
    try {
      const pt = chart.convertToPixel({ seriesName: 'ps-endpoints' }, [
        forecast.value[0],
        forecast.value[1],
      ]);
      if (Array.isArray(pt) && pt.length >= 2) {
        host.setAttribute('data-ps-forecast-anchor-x', String(Math.round(pt[0])));
        host.setAttribute('data-ps-forecast-anchor-y', String(Math.round(pt[1])));
      }
    } catch {
      /* convert may fail before first layout */
    }
  }
}

/**
 * Align snapshot caption **bottom** with PS forecast label **bottom**.
 * Forecast label is ECharts position:'top' with `distance` above the endpoint.
 */
function measureSnapshotCaptionTopPx(
  chart: echarts.ECharts,
  host: HTMLElement,
  captionEl: HTMLElement | null,
): number | null {
  const anchorY = Number(host.getAttribute('data-ps-forecast-anchor-y'));
  const distance = Number(
    host.getAttribute('data-ps-forecast-distance') ??
      TIMELINE_FORECAST_LABEL_DISTANCE_PX,
  );
  if (!Number.isFinite(anchorY) || !Number.isFinite(distance)) {
    try {
      const opt = chart.getOption() as {
        series?: Array<{ name?: string; data?: Array<{ kind?: string; value?: [number, number] }> }>;
      };
      const series = Array.isArray(opt.series) ? opt.series : [];
      const ps = series.find((s) => s?.name === 'ps-endpoints');
      const forecast = ps?.data?.find((d) => d.kind === 'forecast');
      if (!forecast?.value) return null;
      const pt = chart.convertToPixel({ seriesName: 'ps-endpoints' }, [
        forecast.value[0],
        forecast.value[1],
      ]);
      if (!Array.isArray(pt) || pt.length < 2) return null;
      const labelBottom = pt[1] - TIMELINE_FORECAST_LABEL_DISTANCE_PX;
      const height =
        captionEl?.getBoundingClientRect().height || TIMELINE_CAPTION_BLOCK_PX;
      return Math.max(0, Math.round(labelBottom - height));
    } catch {
      return null;
    }
  }
  const labelBottom = anchorY - distance;
  const height =
    captionEl?.getBoundingClientRect().height || TIMELINE_CAPTION_BLOCK_PX;
  return Math.max(0, Math.round(labelBottom - height));
}

function programIdForPoint(
  point: TimelineMilestonePoint,
  milestones: readonly EchartsMilestoneMeta[],
): string {
  const ms = milestones.find((m) => m.id === point.id);
  return ms?.programId ?? TIMELINE_PORTFOLIO_LANE_KEY;
}

type MilestoneDatum = {
  value: [number, number];
  name: string;
  rag: 'Green' | 'Red';
  entityId: string;
  forecastDate: string;
  title: string;
  programLabel: string;
  label: {
    show: boolean;
    formatter: string;
    position: 'top' | 'bottom';
    distance: number;
    color: string;
    fontSize: number;
    lineHeight: number;
    overflow: 'truncate';
    width: number;
  };
};

function milestoneDatum(
  point: TimelineMilestonePoint,
  y: number,
  showLabel: boolean,
  programLabel: string,
  colors: TimelineThemeColors,
): MilestoneDatum {
  return {
    value: [parseIsoUtcMs(point.forecastDate), y],
    name: point.shortLabel,
    rag: point.rag,
    entityId: point.id,
    forecastDate: point.forecastDate,
    title: point.name,
    programLabel,
    label: {
      show: showLabel,
      formatter: point.shortLabel,
      position: echartsLabelPosition(point.labelSide),
      distance: echartsLabelDistance(point.labelLane),
      color: colors.text,
      fontSize: 10,
      lineHeight: 12,
      overflow: 'truncate',
      width: 72,
    },
  };
}

const TOOLTIP_OUTLINE_LINK_CLASS =
  'inline-flex mt-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--text)] no-underline hover:bg-[var(--interactive)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]';

/** Enterable milestone tooltip HTML — exported for Test First / parity asserts. */
export function formatMilestoneTooltipHtml(data: {
  name?: string;
  title?: string;
  entityId?: string;
  forecastDate?: string;
  rag?: 'Green' | 'Red';
  kind?: 'baseline' | 'forecast';
  programLabel?: string;
  band?: ExecutiveTimelineExperimentModel['band'];
}): string {
  const entityId = data.entityId ?? '';
  const href = entityId
    ? escapeHtmlText(scheduleMilestoneFocusHref(entityId))
    : '';
  const scheduleLink = href
    ? `<a class="${TOOLTIP_OUTLINE_LINK_CLASS}" href="${href}" data-timeline-tooltip-link="schedule">Перейти</a>`
    : '';
  const wrap = (body: string) =>
    `<div style="max-width:min(22rem,90vw);white-space:normal;overflow-wrap:anywhere;word-break:break-word">${body}</div>`;
  if (data.kind === 'baseline' && data.band) {
    return wrap(
      [
        `<strong>${escapeHtmlText('План запуска')}</strong>`,
        escapeHtmlText(formatDateRu(data.band.baselineDate)),
        scheduleLink,
      ]
        .filter(Boolean)
        .join('<br/>'),
    );
  }
  if (data.kind === 'forecast' && data.band) {
    return wrap(
      [
        `<strong>${escapeHtmlText('Прогноз запуска')}</strong>`,
        escapeHtmlText(formatDateRu(data.band.forecastDate)),
        escapeHtmlText(data.band.deltaLabel),
        scheduleLink,
      ]
        .filter(Boolean)
        .join('<br/>'),
    );
  }
  const rag = data.rag ?? 'Green';
  const fullTitle = (data.title ?? '').trim() || (data.name ?? '').trim();
  const lines = [
    `<strong>${escapeHtmlText(fullTitle)}</strong>`,
    entityId
      ? `<span style="opacity:0.7">${escapeHtmlText(entityId)}</span>`
      : '',
    data.programLabel
      ? `Программа: ${escapeHtmlText(data.programLabel)}`
      : '',
    `Прогноз: ${escapeHtmlText(formatDateRu(data.forecastDate ?? ''))}`,
    formatStatusPillHtml({ family: 'rag', entity: 'milestone', value: rag }),
    scheduleLink,
  ].filter(Boolean);
  return wrap(lines.join('<br/>'));
}

/**
 * Program-lane scatter: permanent phase / PS / key shortLabels; enterable tooltip.
 */
export function buildExecutiveTimelineOption(
  model: ExecutiveTimelineExperimentModel,
  colors: TimelineThemeColors,
  visibleLabelIds: Set<string>,
  milestoneMeta: readonly EchartsMilestoneMeta[],
  preferReducedMotion = false,
  /**
   * When false (explicit portfolio/none program filter), do not paint the
   * portfolio lane wash — single-row view stays ordinary surface.
   * When true (Все программы), accent `none` via splitArea if that lane exists.
   */
  highlightPortfolioLane = true,
  /** Plot host width — drives narrow forecast caption wrapping. */
  hostWidth = 0,
  /** Optional override after runtime X-collision shrink. */
  layoutOverride: Partial<
    ReturnType<typeof resolveTopCaptionLayout>
  > | null = null,
): EChartsOption {
  const domain = resolveTimelinePlotDomain(model);
  const asOfRatioForLayout = dateToPlotRatio(
    model.scenarioAsOfDate,
    domain,
  );
  const topCaptionLayout = {
    ...resolveTopCaptionLayout({
      hostWidth,
      plotRatio: asOfRatioForLayout,
    }),
    ...layoutOverride,
  };
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
  const categoryIndex = new Map<string, number>(
    orderedProgramIds.map((id, i) => [id, i]),
  );
  /** Present only when lane key `none` is in the current point set — never invent on empty. */
  const portfolioLanePresent = orderedProgramIds.includes(
    TIMELINE_PORTFOLIO_LANE_KEY,
  );
  const yAxisData =
    orderedProgramIds.length > 0
      ? orderedProgramIds.map((id) => {
          const label = timelineProgramLabel(id);
          if (!isTimelinePortfolioLane(id)) return label;
          return {
            value: label,
            textStyle: {
              fontWeight: 'bold' as const,
              color: colors.text,
            },
          };
        })
      : [timelineProgramLabel(TIMELINE_PORTFOLIO_LANE_KEY)];
  const yCategories = yAxisData.map((entry) =>
    typeof entry === 'string' ? entry : entry.value,
  );
  const paintPortfolioLaneWash =
    highlightPortfolioLane && portfolioLanePresent;
  /** One color per category; only `none` gets sunken wash when all-programs mode. */
  const splitAreaColors =
    orderedProgramIds.length > 0
      ? orderedProgramIds.map((id) =>
          paintPortfolioLaneWash && isTimelinePortfolioLane(id)
            ? colors.laneBandFill
            : 'rgba(0,0,0,0)',
        )
      : ['rgba(0,0,0,0)'];

  const greenData: MilestoneDatum[] = [];
  const redData: MilestoneDatum[] = [];
  for (const point of model.ordinaryPoints) {
    const pid = programIdForPoint(point, milestoneMeta);
    const y = categoryIndex.get(pid) ?? 0;
    const datum = milestoneDatum(
      point,
      y,
      visibleLabelIds.has(point.id),
      timelineProgramLabel(pid),
      colors,
    );
    if (point.rag === 'Red') redData.push(datum);
    else greenData.push(datum);
  }

  const psY = Math.max(0, yCategories.length - 1);
  const psEndpointData: {
    value: [number, number];
    kind: 'baseline' | 'forecast';
    entityId: string;
    band: ExecutiveTimelineExperimentModel['band'];
    label?: {
      show: boolean;
      formatter: string;
      position: 'top' | 'bottom';
      distance: number;
      align?: 'left' | 'center' | 'right';
      overflow?: 'none' | 'truncate' | 'break';
      color: string;
      fontSize: number;
      fontWeight?: 'bold';
    };
  }[] = [];

  const forecastAlign = topCaptionLayout.narrow
    ? 'right'
    : psEndpointLabelAlign(
        parseIsoUtcMs(band.forecastDate),
        domain.minMs,
        domain.maxMs,
      );
  const baselineAlign = psEndpointLabelAlign(
    parseIsoUtcMs(band.baselineDate),
    domain.minMs,
    domain.maxMs,
  );
  const forecastFormatter = topCaptionLayout.forecastMultiline
    ? `Прогноз\n${formatDateRu(band.forecastDate)}\n(${band.deltaLabel})`
    : `Прогноз ${formatDateRu(band.forecastDate)} (${band.deltaLabel})`;
  /** Keep line gap readable on 10px canvas labels (fontSize + 2). */
  const forecastLineHeight = topCaptionLayout.forecastMultiline ? 12 : undefined;

  if (!band.coincident) {
    psEndpointData.push(
      {
        value: [parseIsoUtcMs(band.baselineDate), psY],
        kind: 'baseline',
        entityId: 'MS-PS',
        band,
        label: {
          show: true,
          formatter: `План ${formatDateRu(band.baselineDate)}`,
          position: 'bottom',
          distance: 8,
          align: baselineAlign,
          overflow: 'none',
          color: colors.textMuted,
          fontSize: 10,
        },
      },
      {
        value: [parseIsoUtcMs(band.forecastDate), psY],
        kind: 'forecast',
        entityId: 'MS-PS',
        band,
        label: {
          show: true,
          formatter: forecastFormatter,
          position: 'top',
          distance: TIMELINE_FORECAST_LABEL_DISTANCE_PX,
          // Near plot right edge: grow left so full «(+N день)» stays in card.
          align: forecastAlign,
          overflow: 'none',
          ...(topCaptionLayout.forecastWidthPx
            ? { width: topCaptionLayout.forecastWidthPx }
            : {}),
          color: colors.ragRed,
          fontSize: 10,
          fontWeight: 'bold',
          ...(forecastLineHeight != null
            ? { lineHeight: forecastLineHeight }
            : {}),
        },
      },
    );
  } else {
    psEndpointData.push({
      value: [parseIsoUtcMs(band.forecastDate), psY],
      kind: 'forecast',
      entityId: 'MS-PS',
      band,
      label: {
        show: true,
        formatter: `ПС ${formatDateRu(band.forecastDate)}`,
        position: 'top',
        distance: TIMELINE_FORECAST_LABEL_DISTANCE_PX,
        align: forecastAlign,
        overflow: 'none',
        ...(topCaptionLayout.forecastWidthPx
          ? { width: topCaptionLayout.forecastWidthPx }
          : {}),
        color: colors.text,
        fontSize: 10,
        ...(forecastLineHeight != null
          ? { lineHeight: forecastLineHeight }
          : {}),
      },
    });
  }

  /** Forecast slip window only — portfolio row wash is yAxis.splitArea (full category height). */
  const markArea =
    !band.coincident
      ? {
          silent: true,
          z: 0,
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
  /** Room for raised overlay caption + forecast labels near plot top. */
  const gridTop = TIMELINE_GRID_TOP_PX;
  const gridBottom = TIMELINE_GRID_BOTTOM_PX;

  const redSeriesType = preferReducedMotion ? 'scatter' : 'effectScatter';

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
      enterable: true,
      appendToBody: true,
      hideDelay: 360,
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.text, fontSize: 12 },
      formatter: (params) => {
        if (!params || typeof params !== 'object' || !('data' in params)) {
          return '';
        }
        return formatMilestoneTooltipHtml(
          params.data as {
            name?: string;
            title?: string;
            entityId?: string;
            forecastDate?: string;
            rag?: 'Green' | 'Red';
            kind?: 'baseline' | 'forecast';
            programLabel?: string;
            band?: ExecutiveTimelineExperimentModel['band'];
          },
        );
      },
    },
    xAxis: {
      type: 'time',
      min: domain.minMs,
      max: domain.maxMs,
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
      data: yAxisData,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { color: colors.axisMuted, type: 'dashed', opacity: 0.5 },
      },
      splitArea: {
        show: paintPortfolioLaneWash,
        interval: 0,
        areaStyle: {
          color: splitAreaColors,
        },
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
        data: greenData,
        labelLayout: {
          hideOverlap: true,
          moveOverlap: 'shiftY',
        },
        itemStyle: {
          color: colors.ragGreen,
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
        name: 'milestones-red',
        type: redSeriesType,
        symbolSize: 10,
        z: 4,
        data: redData,
        labelLayout: {
          hideOverlap: true,
          moveOverlap: 'shiftY',
        },
        itemStyle: {
          color: colors.ragRed,
          borderColor: colors.text,
          borderWidth: 0.5,
        },
        ...(preferReducedMotion
          ? {}
          : {
              rippleEffect: {
                scale: 2.2,
                brushType: 'stroke' as const,
                period: 3.2,
                number: 2,
              },
            }),
      },
      {
        name: 'ps-endpoints',
        type: 'scatter',
        symbol: 'diamond',
        symbolSize: 9,
        z: 5,
        // Labels may extend sideways near plot edges — do not clip the canvas.
        clip: false,
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
    __rowCount: yCategories.length,
    __rowHeight: rowHeight,
    __gridChrome: gridTop + gridBottom,
    __plotDomain: domain,
  } as EChartsOption & {
    __rowCount: number;
    __rowHeight: number;
    __gridChrome: number;
    __plotDomain: ReturnType<typeof resolveTimelinePlotDomain>;
  };
}

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

function readPreferReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ExecutiveTimelineEcharts({
  model,
  milestoneMeta,
  highlightPortfolioLane = true,
}: {
  model: ExecutiveTimelineExperimentModel;
  milestoneMeta: readonly EchartsMilestoneMeta[];
  /** false when toolbar filter is explicit portfolio/`none`. */
  highlightPortfolioLane?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const modelRef = useRef(model);
  const metaRef = useRef(milestoneMeta);
  const highlightRef = useRef(highlightPortfolioLane);
  const reducedRef = useRef(readPreferReducedMotion());
  const layoutOverrideRef = useRef<Partial<
    ReturnType<typeof resolveTopCaptionLayout>
  > | null>(null);
  modelRef.current = model;
  metaRef.current = milestoneMeta;
  highlightRef.current = highlightPortfolioLane;
  const [narrow, setNarrow] = useState(false);
  const [hostHeight, setHostHeight] = useState(280);
  const [captionTopPx, setCaptionTopPx] = useState(
    TIMELINE_SNAPSHOT_CAPTION_TOP_PX,
  );
  const [captionLayout, setCaptionLayout] = useState(() =>
    resolveTopCaptionLayout({
      hostWidth: 0,
      plotRatio: dateToPlotRatio(
        model.scenarioAsOfDate,
        resolveTimelinePlotDomain(model),
      ),
    }),
  );
  const [plotRatio, setPlotRatio] = useState(() =>
    dateToPlotRatio(
      model.scenarioAsOfDate,
      resolveTimelinePlotDomain(model),
    ),
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const chart = echarts.init(host, undefined, { renderer: 'canvas' });
    chartRef.current = chart;
    // Probe hook for Playwright hover acceptance (not a public API).
    (host as HTMLElement & { __timelineEcharts?: echarts.ECharts }).__timelineEcharts =
      chart;

    const estimateForecastHoriz = (): { left: number; right: number } | null => {
      const ax = Number(host.getAttribute('data-ps-forecast-anchor-x'));
      if (!Number.isFinite(ax)) return null;
      const align = host.getAttribute('data-ps-forecast-align') ?? 'center';
      const formatter = host.getAttribute('data-ps-forecast-formatter') ?? '';
      const widthAttr = host.getAttribute('data-ps-forecast-width');
      const width =
        widthAttr && Number.isFinite(Number(widthAttr))
          ? Number(widthAttr)
          : Math.max(
              72,
              Math.ceil(
                Math.max(...formatter.split('\n').map((l) => l.length), 1) * 6.2,
              ),
            );
      if (align === 'right') return { left: ax - width, right: ax };
      if (align === 'left') return { left: ax, right: ax + width };
      return { left: ax - width / 2, right: ax + width / 2 };
    };

    const syncCaptionTop = () => {
      const wrap = host.parentElement;
      const captionEl = wrap?.querySelector(
        '[data-snapshot-label]',
      ) as HTMLElement | null;
      const top = measureSnapshotCaptionTopPx(chart, host, captionEl);
      if (top != null) {
        setCaptionTopPx(top);
        host.setAttribute('data-snapshot-caption-top-measured', String(top));
        if (captionEl) {
          const cap = captionEl.getBoundingClientRect();
          const hostBox = host.getBoundingClientRect();
          const bottom = top + cap.height;
          host.setAttribute(
            'data-snapshot-caption-bottom-measured',
            String(Math.round(bottom)),
          );
          host.setAttribute(
            'data-snapshot-caption-left',
            String(Math.round(cap.left - hostBox.left)),
          );
          host.setAttribute(
            'data-snapshot-caption-right',
            String(Math.round(cap.right - hostBox.left)),
          );
          const forecastBottom =
            Number(host.getAttribute('data-ps-forecast-anchor-y')) -
            Number(
              host.getAttribute('data-ps-forecast-distance') ??
                TIMELINE_FORECAST_LABEL_DISTANCE_PX,
            );
          host.setAttribute(
            'data-ps-forecast-label-bottom-est',
            String(Math.round(forecastBottom)),
          );
          const forecastH = estimateForecastHoriz();
          if (forecastH) {
            host.setAttribute(
              'data-ps-forecast-left-est',
              String(Math.round(forecastH.left)),
            );
            host.setAttribute(
              'data-ps-forecast-right-est',
              String(Math.round(forecastH.right)),
            );
            const gap = Number(
              host.getAttribute('data-top-caption-gap') ?? 8,
            );
            const overlap = horizontalRangesOverlap(
              cap.left - hostBox.left,
              cap.right - hostBox.left,
              forecastH.left,
              forecastH.right,
              gap,
            );
            host.setAttribute(
              'data-top-caption-x-overlap',
              overlap ? 'true' : 'false',
            );
            if (overlap) {
              // End-aligned caption keeps its right edge on as-of — shrink the
              // right-aligned forecast width so it stays to the right of as-of.
              const asOfRight = cap.right - hostBox.left;
              const ax = Number(host.getAttribute('data-ps-forecast-anchor-x'));
              if (Number.isFinite(ax)) {
                const maxForecastW = Math.max(
                  56,
                  Math.floor(ax - asOfRight - gap),
                );
                setCaptionLayout((prev) => {
                  const nextW =
                    prev.forecastWidthPx == null
                      ? maxForecastW
                      : Math.min(prev.forecastWidthPx, maxForecastW);
                  if (prev.forecastWidthPx === nextW) return prev;
                  host.setAttribute('data-ps-forecast-width', String(nextW));
                  layoutOverrideRef.current = {
                    ...(layoutOverrideRef.current ?? {}),
                    forecastWidthPx: nextW,
                    forecastMultiline: true,
                    narrow: true,
                  };
                  // Rebuild once so canvas label width matches shrink.
                  requestAnimationFrame(() => applyOption(isNarrowRef.current));
                  return {
                    ...prev,
                    forecastWidthPx: nextW,
                    forecastMultiline: true,
                  };
                });
              }
            }
          }
        }
      }
    };

    const isNarrowRef = { current: false };

    const applyOption = (isNarrow: boolean) => {
      isNarrowRef.current = isNarrow;
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
        reducedRef.current,
        highlightRef.current,
        host.clientWidth,
        layoutOverrideRef.current,
      );
      const extra = option as EChartsOption & {
        __rowCount?: number;
        __rowHeight?: number;
        __gridChrome?: number;
        __plotDomain?: ReturnType<typeof resolveTimelinePlotDomain>;
      };
      if (extra.__plotDomain) {
        const ratio = dateToPlotRatio(
          modelRef.current.scenarioAsOfDate,
          extra.__plotDomain,
        );
        setPlotRatio(ratio);
        const layout = resolveTopCaptionLayout({
          hostWidth: host.clientWidth,
          plotRatio: ratio,
        });
        setCaptionLayout(layout);
        host.setAttribute(
          'data-top-caption-narrow',
          layout.narrow ? 'true' : 'false',
        );
        host.setAttribute('data-top-caption-gap', String(layout.forecastGapPx));
        if (layout.forecastWidthPx != null) {
          host.setAttribute(
            'data-ps-forecast-width',
            String(layout.forecastWidthPx),
          );
        } else {
          host.removeAttribute('data-ps-forecast-width');
        }
      }
      const rows = extra.__rowCount ?? 1;
      const h =
        (extra.__gridChrome ??
          TIMELINE_GRID_TOP_PX + TIMELINE_GRID_BOTTOM_PX) +
        rows * (extra.__rowHeight ?? 36);
      setHostHeight(Math.max(240, Math.min(h, 560)));
      chart.setOption(option, { notMerge: true });
      publishTimelineHostProbe(host, extra, chart);
      requestAnimationFrame(() => {
        syncCaptionTop();
        chart.resize();
        publishTimelineHostProbe(host, extra, chart);
        syncCaptionTop();
      });
    };

    const measure = () => {
      const isNarrow = host.clientWidth < EXPERIMENT_NARROW_LABEL_WIDTH_PX;
      setNarrow(isNarrow);
      // Fresh measure clears prior collision shrink (recomputed in syncCaptionTop).
      layoutOverrideRef.current = null;
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

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => {
      reducedRef.current = motionQuery.matches;
      applyOption(host.clientWidth < EXPERIMENT_NARROW_LABEL_WIDTH_PX);
    };
    motionQuery.addEventListener('change', onMotion);

    return () => {
      motionQuery.removeEventListener('change', onMotion);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      delete (host as HTMLElement & { __timelineEcharts?: echarts.ECharts })
        .__timelineEcharts;
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
      reducedRef.current,
      highlightPortfolioLane,
      host.clientWidth,
      layoutOverrideRef.current,
    );
    const extra = option as EChartsOption & {
      __rowCount?: number;
      __rowHeight?: number;
      __gridChrome?: number;
      __plotDomain?: ReturnType<typeof resolveTimelinePlotDomain>;
    };
    if (extra.__plotDomain) {
      const ratio = dateToPlotRatio(
        model.scenarioAsOfDate,
        extra.__plotDomain,
      );
      setPlotRatio(ratio);
      const layout = resolveTopCaptionLayout({
        hostWidth: host.clientWidth,
        plotRatio: ratio,
      });
      setCaptionLayout(layout);
      host.setAttribute(
        'data-top-caption-narrow',
        layout.narrow ? 'true' : 'false',
      );
      host.setAttribute('data-top-caption-gap', String(layout.forecastGapPx));
      if (layout.forecastWidthPx != null) {
        host.setAttribute(
          'data-ps-forecast-width',
          String(layout.forecastWidthPx),
        );
      } else {
        host.removeAttribute('data-ps-forecast-width');
      }
    }
    const rows = extra.__rowCount ?? 1;
    const h =
      (extra.__gridChrome ??
        TIMELINE_GRID_TOP_PX + TIMELINE_GRID_BOTTOM_PX) +
      rows * (extra.__rowHeight ?? 36);
    setHostHeight(Math.max(240, Math.min(h, 560)));
    chart.setOption(option, { notMerge: true });
    chart.resize();
    publishTimelineHostProbe(host, extra, chart);
    requestAnimationFrame(() => {
      const captionEl = host.parentElement?.querySelector(
        '[data-snapshot-label]',
      ) as HTMLElement | null;
      const top = measureSnapshotCaptionTopPx(chart, host, captionEl);
      if (top != null) {
        setCaptionTopPx(top);
        host.setAttribute('data-snapshot-caption-top-measured', String(top));
      }
      publishTimelineHostProbe(host, extra, chart);
    });
  }, [model, milestoneMeta, highlightPortfolioLane]);

  return (
    <div
      className="relative w-full min-w-0"
      data-timeline-renderer="echarts"
      data-timeline-layout="experiment-echarts-lanes"
      data-timeline-labels-narrow={narrow ? 'true' : 'false'}
    >
      <p className="sr-only">{model.textSummary}</p>
      <div className="relative w-full min-w-0 overflow-visible">
        <ExecutiveTimelineSnapshotChrome
          scenarioAsOfDate={model.scenarioAsOfDate}
          plotInsets={ECHARTS_PLOT_INSETS}
          plotRatio={plotRatio}
          overlay
          captionTopPx={captionTopPx}
          alignOverride={captionLayout.snapshotAlign}
          maxWidthPx={captionLayout.snapshotMaxWidthPx}
        />
        <div
          ref={hostRef}
          className="w-full min-w-0 overflow-visible"
          style={{ height: hostHeight }}
          role="img"
          aria-label={model.textSummary}
          data-timeline-echarts-host="true"
        />
      </div>
    </div>
  );
}
