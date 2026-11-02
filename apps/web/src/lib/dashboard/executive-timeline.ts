import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  EXECUTIVE_TIMELINE_MILESTONE_IDS,
  requireExecutiveShortLabel,
} from './executive-timeline-ids';

/**
 * Demo horizon covers early execution through Production Start (S: 22.09).
 * R2-U1: end of September 2027 (DOC-PROD-024 close-out).
 * Horizon frozen — do not extend for late-label density (R2-U1-R3).
 */
export const TIMELINE_HORIZON_START = '2027-02-01';
export const TIMELINE_HORIZON_END = '2027-09-30';

/** Neighbour distance below this (~80px on ~1280px track) triggers side flip. */
export const LABEL_COLLISION_RATIO = 80 / 1280;

/** Tighter gap (~40px) escalates to outer label lane. */
export const LABEL_TIGHT_RATIO = 40 / 1280;

export type LabelSide = 'above' | 'below';

export type LabelAlign = 'start' | 'center' | 'end';

/** 0 = near axis; 1 = outer lane (R2-U1-R3 late-stage density). */
export type LabelLane = 0 | 1;

export type TimelineMilestonePoint = {
  id: string;
  name: string;
  shortLabel: string;
  rag: 'Green' | 'Red';
  baselineDate: string;
  forecastDate: string;
  ratio: number;
  labelSide: LabelSide;
  labelAlign: LabelAlign;
  labelLane: LabelLane;
  /** Bounded label-only horizontal nudge (px); marker stays on true date. */
  labelNudgePx: number;
};

export type ProductionStartBand = {
  baselineDate: string;
  forecastDate: string;
  baselineRatio: number;
  forecastRatio: number;
  deltaDays: number;
  coincident: boolean;
  deltaLabel: string;
};

export type MonthTick = {
  date: string;
  ratio: number;
  label: string;
};

export type TimelineAnnotationLayout = {
  side: LabelSide;
  lane: LabelLane;
  align: LabelAlign;
  nudgePx: number;
};

/**
 * Deterministic layout for snapshot / PS baseline / PS forecast captions.
 * Marker X stays on true date; only label lanes/sides/nudges change.
 */
export type TimelineChromeLayout = {
  snapshot: TimelineAnnotationLayout;
  baseline: TimelineAnnotationLayout | null;
  forecast: TimelineAnnotationLayout | null;
  coincident: TimelineAnnotationLayout | null;
};

function parseIsoUtc(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

const HORIZON_START_MS = parseIsoUtc(TIMELINE_HORIZON_START);
const HORIZON_END_MS = parseIsoUtc(TIMELINE_HORIZON_END);
const HORIZON_SPAN_MS = HORIZON_END_MS - HORIZON_START_MS;

/** Linear date → [0,1] ratio on fixed Demo horizon. */
export function dateToRatio(isoDate: string): number {
  const t = parseIsoUtc(isoDate);
  if (Number.isNaN(t) || HORIZON_SPAN_MS <= 0) return 0;
  const r = (t - HORIZON_START_MS) / HORIZON_SPAN_MS;
  if (r < 0) return 0;
  if (r > 1) return 1;
  return r;
}

const RU_MONTH_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
] as const;

/** Month starts from Mar 2027 through Sep 2027 inside horizon (Feb at start). */
export function timelineMonthTicks(): MonthTick[] {
  const ticks: MonthTick[] = [
    { date: TIMELINE_HORIZON_START, ratio: 0, label: RU_MONTH_SHORT[1] },
  ];
  for (let month = 2; month <= 8; month += 1) {
    const date = `2027-${String(month + 1).padStart(2, '0')}-01`;
    ticks.push({
      date,
      ratio: dateToRatio(date),
      label: RU_MONTH_SHORT[month],
    });
  }
  return ticks;
}

/** Authoritative Dashboard subset violated — do not silently repair. */
export class ExecutiveMilestoneIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutiveMilestoneIntegrityError';
  }
}

function edgeAlign(ratio: number): LabelAlign {
  if (ratio < 0.08) return 'start';
  if (ratio > 0.88) return 'end';
  return 'center';
}

function toTimelinePoint(
  id: string,
  ms: DashboardOverview['milestones'][number],
): TimelineMilestonePoint {
  const ratio = dateToRatio(ms.forecastDate);
  return {
    id,
    name: ms.name,
    shortLabel: requireExecutiveShortLabel(id),
    rag: ms.rag,
    baselineDate: ms.baselineDate,
    forecastDate: ms.forecastDate,
    ratio,
    labelSide: 'above',
    labelAlign: edgeAlign(ratio),
    labelLane: 0,
    labelNudgePx: 0,
  };
}

function sameSlot(a: TimelineMilestonePoint, b: TimelineMilestonePoint): boolean {
  return a.labelSide === b.labelSide && a.labelLane === b.labelLane;
}

/**
 * R2-U1-R3: deterministic multi-lane collision policy.
 * Keeps marker X on true forecast date; only moves text.
 */
export function applyExecutiveLabelLayout(
  points: TimelineMilestonePoint[],
): void {
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i]!;
    p.labelSide = i % 2 === 0 ? 'below' : 'above';
    p.labelLane = 0;
    p.labelAlign = edgeAlign(p.ratio);
    p.labelNudgePx = 0;
  }

  for (let i = 1; i < points.length; i += 1) {
    const cur = points[i]!;
    for (let j = i - 1; j >= 0; j -= 1) {
      const prev = points[j]!;
      const gap = cur.ratio - prev.ratio;
      if (gap >= LABEL_COLLISION_RATIO) break;

      if (sameSlot(cur, prev)) {
        cur.labelSide = prev.labelSide === 'above' ? 'below' : 'above';
      }
      if (gap < LABEL_TIGHT_RATIO || sameSlot(cur, prev)) {
        cur.labelLane = 1;
        if (sameSlot(cur, prev)) {
          cur.labelSide = prev.labelSide === 'above' ? 'below' : 'above';
        }
      }
      if (cur.labelAlign === 'center') {
        cur.labelNudgePx = i % 2 === 0 ? -10 : 10;
      }
      if (prev.labelAlign === 'center' && prev.labelNudgePx === 0) {
        prev.labelNudgePx = j % 2 === 0 ? -8 : 8;
      }
    }
  }
}

/**
 * Snapshot-aware executive subset from API `executiveMilestoneIds`.
 *
 * When the field is present it is authoritative: empty / missing MS-PS /
 * unresolved ids throw (no skip, no silent MS-PS inject, no legacy swap).
 * Legacy fallback applies only when the field is absent.
 */
export function resolveExecutiveMilestones(
  data: DashboardOverview,
): TimelineMilestonePoint[] {
  let ids: readonly string[];
  if (data.executiveMilestoneIds !== undefined) {
    if (data.executiveMilestoneIds.length === 0) {
      throw new ExecutiveMilestoneIntegrityError(
        'executiveMilestoneIds is empty',
      );
    }
    if (!data.executiveMilestoneIds.includes('MS-PS')) {
      throw new ExecutiveMilestoneIntegrityError(
        'executiveMilestoneIds must include MS-PS',
      );
    }
    ids = data.executiveMilestoneIds;
  } else {
    ids = EXECUTIVE_TIMELINE_MILESTONE_IDS;
  }

  const points: TimelineMilestonePoint[] = [];
  for (const id of ids) {
    const ms = data.milestones.find((m) => m.id === id);
    if (!ms) {
      throw new ExecutiveMilestoneIntegrityError(
        `executive milestone ${id} missing from milestones collection`,
      );
    }
    points.push(toTimelinePoint(id, ms));
  }

  points.sort((a, b) => a.ratio - b.ratio || a.id.localeCompare(b.id));
  applyExecutiveLabelLayout(points);
  return points;
}

export function resolveProductionStartBand(
  data: DashboardOverview,
): ProductionStartBand {
  const v = data.project.productionStartVariance;
  const coincident = v.deltaDays === 0;
  return {
    baselineDate: v.baselineDate,
    forecastDate: v.forecastDate,
    baselineRatio: dateToRatio(v.baselineDate),
    forecastRatio: dateToRatio(v.forecastDate),
    deltaDays: v.deltaDays,
    coincident,
    deltaLabel: coincident ? 'по плану' : formatDeltaDays(v.deltaDays),
  };
}

/**
 * Chrome annotation lanes for asOf / PS baseline / forecast.
 * Late Aug–Sep: snapshot outer-above; PS baseline below; forecast below-outer
 * (or coincident below) so text does not stack on one side of the same X.
 */
export function resolveTimelineChromeLayout(
  data: DashboardOverview,
  band: ProductionStartBand,
): TimelineChromeLayout {
  const asOfRatio = dateToRatio(data.scenarioAsOfDate);
  const late = asOfRatio >= 0.7 || band.forecastRatio >= 0.7;
  const asOfNearForecast =
    Math.abs(asOfRatio - band.forecastRatio) < LABEL_TIGHT_RATIO;

  const snapshot: TimelineAnnotationLayout = {
    side: 'above',
    lane: late ? 1 : 0,
    align: edgeAlign(asOfRatio),
    nudgePx: asOfNearForecast ? (asOfRatio > 0.85 ? -12 : 12) : 0,
  };

  if (band.coincident) {
    return {
      snapshot,
      baseline: null,
      forecast: null,
      coincident: {
        side: 'below',
        lane: late ? 1 : 0,
        align: edgeAlign(band.baselineRatio),
        nudgePx: asOfNearForecast ? 10 : 0,
      },
    };
  }

  return {
    snapshot,
    baseline: {
      side: 'below',
      lane: 0,
      align: 'end',
      nudgePx: -12,
    },
    forecast: {
      side: asOfNearForecast ? 'below' : 'above',
      lane: asOfNearForecast || late ? 1 : 0,
      align: 'end',
      nudgePx: 12,
    },
    coincident: null,
  };
}

export function buildTimelineTextSummary(data: DashboardOverview): string {
  const milestones = resolveExecutiveMilestones(data);
  const band = resolveProductionStartBand(data);
  const lines = [
    `Дата снимка: ${formatDateRu(data.scenarioAsOfDate)}`,
    `Запуск производства: базовый план ${formatDateRu(band.baselineDate)}, прогноз ${formatDateRu(band.forecastDate)}, ${band.deltaLabel}`,
    ...milestones.map(
      (m) =>
        `${m.shortLabel} (${m.id}): прогноз ${formatDateRu(m.forecastDate)}, ${m.rag === 'Green' ? 'зелёная' : 'красная'}`,
    ),
  ];
  return lines.join('. ');
}
