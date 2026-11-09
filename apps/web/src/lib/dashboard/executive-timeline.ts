import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  EXECUTIVE_TIMELINE_MILESTONE_IDS,
  shortLabelForMilestone,
} from './executive-timeline-ids';

/**
 * Full demo horizon: minimal pre-project epoch through Production Start month.
 * certainty: assumption — source MD has no dates; Feb-only start is infeasible vs PS.
 */
/** Covers ALAP earliestNecessaryStart (see r6-dating-feasibility). */
export const TIMELINE_HORIZON_START = '2026-09-01';
export const TIMELINE_HORIZON_END = '2027-09-30';

/** Phase divider (assumption): pre-project ends; execution preference begins. */
export const EXECUTION_PHASE_START = '2027-02-01';

/** Bonus overview density — not a substitute for the full 189 universe. */
export const OVERVIEW_MILESTONE_IDS = EXECUTIVE_TIMELINE_MILESTONE_IDS;

/** Neighbour distance below this (~80px on ~1280px track) triggers side flip. */
export const LABEL_COLLISION_RATIO = 80 / 1280;

/** Tighter gap (~40px) escalates to outer label lane. */
export const LABEL_TIGHT_RATIO = 40 / 1280;

/** Aug–Sep late cluster on the fixed horizon. */
export const LATE_STAGE_RATIO = 0.7;

/** Max horizontal label nudge while keeping a readable vertical stem. */
export const MAX_VERTICAL_STEM_NUDGE_PX = 10;

export type LabelSide = 'above' | 'below';

export type LabelAlign = 'start' | 'center' | 'end';

/**
 * 0 = near axis; 1 = mid; 2 = outer.
 * Stem length grows with lane; marker X stays on true date.
 */
export type LabelLane = 0 | 1 | 2;

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
  /** Occupies a shared side:lane slot that milestones must not reuse nearby. */
  reservesSlot: boolean;
};

/**
 * Chrome layout (R2-U1-R8): snapshot + reserved PS zone for presentation model.
 * Dashboard FE renders PS via ECharts legend/endpoints (not a separate cluster component).
 */
export type TimelineChromeLayout = {
  snapshot: TimelineAnnotationLayout;
  /** Reserved below-right zone for the consolidated PS annotation. */
  psCluster: TimelineAnnotationLayout;
  /** @deprecated R8 — kept null; PS copy lives in ECharts legend */
  baseline: TimelineAnnotationLayout | null;
  /** @deprecated R8 — kept null; PS copy lives in ECharts legend */
  forecast: TimelineAnnotationLayout | null;
  /** @deprecated R8 — kept null; PS copy lives in ECharts legend */
  coincident: TimelineAnnotationLayout | null;
  /** @deprecated R8 — delta lives in ECharts PS legend */
  delta: TimelineAnnotationLayout & { band: 'axis-mid' };
};

export type TimelineSlotRef = {
  key: string;
  side: LabelSide;
  lane: LabelLane;
  occupant: string;
  ratio: number;
};

export type ExecutiveTimelinePresentation = {
  points: TimelineMilestonePoint[];
  band: ProductionStartBand;
  chrome: TimelineChromeLayout;
  /** All reserved/occupied side:lane assignments (milestones + chrome). */
  slots: TimelineSlotRef[];
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

/** Month ticks across full horizon (2026-08 → 2027-09). */
export function timelineMonthTicks(): MonthTick[] {
  const ticks: MonthTick[] = [];
  const cursor = new Date(Date.UTC(2026, 8, 1)); // Sep 2026
  const end = new Date(Date.UTC(2027, 8, 1)); // Sep 2027
  while (cursor <= end) {
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth();
    const date = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    ticks.push({
      date,
      ratio: dateToRatio(date),
      label: RU_MONTH_SHORT[m],
    });
    cursor.setUTCMonth(m + 1);
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
  if (ratio > 0.85) return 'end';
  return 'center';
}

export function slotKey(side: LabelSide, lane: LabelLane): string {
  return `${side}:${lane}`;
}

function clampNudge(nudge: number): number {
  if (nudge > MAX_VERTICAL_STEM_NUDGE_PX) return MAX_VERTICAL_STEM_NUDGE_PX;
  if (nudge < -MAX_VERTICAL_STEM_NUDGE_PX) return -MAX_VERTICAL_STEM_NUDGE_PX;
  return nudge;
}

function toTimelinePoint(
  id: string,
  ms: DashboardOverview['milestones'][number],
): TimelineMilestonePoint {
  const ratio = dateToRatio(ms.forecastDate);
  return {
    id,
    name: ms.name,
    shortLabel: shortLabelForMilestone(id, ms.name),
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
 * Late-stage chrome reservations (shared with milestone layout) — R2-U1-R8.
 *
 * ABOVE lane 2 — Snapshot (top chrome)
 * BELOW lane 0+1 near PS current X — reserved for ONE PS cluster annotation
 * MS-COM-GO and other late milestones prefer ABOVE lanes only
 */
export function buildLateChromeReservations(
  band: ProductionStartBand,
  asOfRatio: number,
): { chrome: TimelineChromeLayout; reserved: TimelineSlotRef[] } {
  const late =
    asOfRatio >= LATE_STAGE_RATIO || band.forecastRatio >= LATE_STAGE_RATIO;
  const asOfNearForecast =
    Math.abs(asOfRatio - band.forecastRatio) < LABEL_TIGHT_RATIO;
  const psRatio = band.forecastRatio;

  const snapshot: TimelineAnnotationLayout = {
    side: 'above',
    lane: late ? 2 : 0,
    align: edgeAlign(asOfRatio),
    nudgePx: clampNudge(
      asOfNearForecast ? (asOfRatio > 0.85 ? -10 : 8) : late ? -8 : 0,
    ),
    reservesSlot: true,
  };

  const psCluster: TimelineAnnotationLayout = {
    side: 'below',
    lane: 0,
    align: 'end',
    nudgePx: 0,
    reservesSlot: true,
  };

  const reserved: TimelineSlotRef[] = [
    {
      key: slotKey(snapshot.side, snapshot.lane),
      side: snapshot.side,
      lane: snapshot.lane,
      occupant: 'chrome:snapshot',
      ratio: asOfRatio,
    },
    // Reserve both near-axis below lanes around PS so milestones stay above.
    {
      key: slotKey('below', 0),
      side: 'below',
      lane: 0,
      occupant: 'chrome:ps-cluster',
      ratio: psRatio,
    },
    {
      key: slotKey('below', 1),
      side: 'below',
      lane: 1,
      occupant: 'chrome:ps-cluster',
      ratio: psRatio,
    },
  ];

  const deltaBase = {
    side: 'below' as const,
    lane: 0 as LabelLane,
    align: 'end' as const,
    nudgePx: 0,
    reservesSlot: false,
    band: 'axis-mid' as const,
  };

  return {
    chrome: {
      snapshot,
      psCluster,
      baseline: null,
      forecast: null,
      coincident: null,
      delta: deltaBase,
    },
    reserved,
  };
}

/**
 * Curated late-stage preference for stable executive IDs (excluding MS-PS chrome).
 * Prefers ABOVE lanes so PS owns BELOW 0/1.
 */
const LATE_ID_SLOT_PREFERENCE: Record<
  string,
  Array<{ side: LabelSide; lane: LabelLane }>
> = {
  'MS-PKG-SAT': [
    { side: 'above', lane: 0 },
    { side: 'below', lane: 2 },
    { side: 'above', lane: 1 },
  ],
  'MS-COM-OQ': [
    { side: 'above', lane: 1 },
    { side: 'above', lane: 0 },
    { side: 'below', lane: 2 },
  ],
  // Keep «Решение о запуске» ABOVE — outer lane first to clear PS cluster below.
  'MS-COM-GO': [
    { side: 'above', lane: 1 },
    { side: 'above', lane: 0 },
    { side: 'below', lane: 2 },
  ],
};

const LATE_FALLBACK_ORDER: Array<{ side: LabelSide; lane: LabelLane }> = [
  { side: 'above', lane: 0 },
  { side: 'above', lane: 1 },
  { side: 'below', lane: 2 },
  { side: 'above', lane: 2 },
  // below 0/1 reserved for PS cluster — last resort only
  { side: 'below', lane: 0 },
  { side: 'below', lane: 1 },
];

function slotBlocked(
  occupied: TimelineSlotRef[],
  side: LabelSide,
  lane: LabelLane,
  ratio: number,
): boolean {
  return occupied.some(
    (s) =>
      s.side === side &&
      s.lane === lane &&
      Math.abs(s.ratio - ratio) < LABEL_COLLISION_RATIO,
  );
}

function pickLateSlot(
  id: string,
  ratio: number,
  occupied: TimelineSlotRef[],
): { side: LabelSide; lane: LabelLane } {
  const preferred = [
    ...(LATE_ID_SLOT_PREFERENCE[id] ?? []),
    ...LATE_FALLBACK_ORDER,
  ];
  for (const cand of preferred) {
    if (!slotBlocked(occupied, cand.side, cand.lane, ratio)) {
      return cand;
    }
  }
  return { side: 'above', lane: 1 };
}

/**
 * R2-U1-R6: milestone label layout aware of chrome reservations.
 * MS-PS is chrome-owned — excluded from milestone slot competition.
 */
export function applyExecutiveLabelLayout(
  points: TimelineMilestonePoint[],
  chromeReserved: TimelineSlotRef[] = [],
): TimelineSlotRef[] {
  const occupied: TimelineSlotRef[] = [...chromeReserved];

  for (let i = 0; i < points.length; i += 1) {
    const p = points[i]!;
    p.labelSide = i % 2 === 0 ? 'below' : 'above';
    p.labelLane = 0;
    p.labelAlign = edgeAlign(p.ratio);
    p.labelNudgePx = 0;
  }

  for (let i = 0; i < points.length; i += 1) {
    const cur = points[i]!;

    // PS marker is rendered as chrome — do not consume a milestone slot.
    if (cur.id === 'MS-PS') {
      cur.labelSide = 'below';
      cur.labelLane = 1;
      cur.labelAlign = edgeAlign(cur.ratio);
      cur.labelNudgePx = 0;
      continue;
    }

    const late = cur.ratio >= LATE_STAGE_RATIO;
    if (late) {
      const slot = pickLateSlot(cur.id, cur.ratio, occupied);
      cur.labelSide = slot.side;
      cur.labelLane = slot.lane;
      cur.labelAlign = edgeAlign(cur.ratio);
      // Prefer align over large nudge so vertical stem stays honest.
      cur.labelNudgePx = 0;
      occupied.push({
        key: slotKey(cur.labelSide, cur.labelLane),
        side: cur.labelSide,
        lane: cur.labelLane,
        occupant: `milestone:${cur.id}`,
        ratio: cur.ratio,
      });
      continue;
    }

    for (let j = i - 1; j >= 0; j -= 1) {
      const prev = points[j]!;
      if (prev.id === 'MS-PS') continue;
      const gap = cur.ratio - prev.ratio;
      if (gap >= LABEL_COLLISION_RATIO) break;

      if (sameSlot(cur, prev)) {
        cur.labelSide = prev.labelSide === 'above' ? 'below' : 'above';
      }
      if (gap < LABEL_TIGHT_RATIO || sameSlot(cur, prev)) {
        cur.labelLane = (Math.min(2, cur.labelLane + 1) as LabelLane);
        if (sameSlot(cur, prev)) {
          cur.labelSide = prev.labelSide === 'above' ? 'below' : 'above';
        }
      }
      if (slotBlocked(occupied, cur.labelSide, cur.labelLane, cur.ratio)) {
        const alt = pickLateSlot(cur.id, cur.ratio, occupied);
        cur.labelSide = alt.side;
        cur.labelLane = alt.lane;
      }
      if (cur.labelAlign === 'center') {
        cur.labelNudgePx = clampNudge(i % 2 === 0 ? -8 : 8);
      }
    }

    occupied.push({
      key: slotKey(cur.labelSide, cur.labelLane),
      side: cur.labelSide,
      lane: cur.labelLane,
      occupant: `milestone:${cur.id}`,
      ratio: cur.ratio,
    });
  }

  return occupied;
}

/**
 * Snapshot-aware executive subset from API `executiveMilestoneIds`.
 */
export function resolveExecutiveMilestones(
  data: DashboardOverview,
): TimelineMilestonePoint[] {
  return resolveExecutiveTimelinePresentation(data).points;
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
 * @deprecated Prefer resolveExecutiveTimelinePresentation — chrome alone
 * ignores milestone slot competition (R5 defect). Kept for call sites.
 */
export function resolveTimelineChromeLayout(
  data: DashboardOverview,
  band: ProductionStartBand,
): TimelineChromeLayout {
  const asOfRatio = dateToRatio(data.scenarioAsOfDate);
  return buildLateChromeReservations(band, asOfRatio).chrome;
}

/**
 * Unified late-stage presentation: chrome reservations + milestone slots.
 * Guarantees no two nearby annotations share the same side:lane.
 */
export function resolveExecutiveTimelinePresentation(
  data: DashboardOverview,
): ExecutiveTimelinePresentation {
  let ids: readonly string[];
  if (data.timelineScope === 'program') {
    ids = data.executiveMilestoneIds ?? [];
  } else if (data.executiveMilestoneIds !== undefined) {
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
  // Stable scope order = API executiveMilestoneIds (baseline sort); do not
  // re-order by forecast ratio when presenting the universe list.
  const band = resolveProductionStartBand(data);
  const asOfRatio = dateToRatio(data.scenarioAsOfDate);
  const { chrome, reserved } = buildLateChromeReservations(band, asOfRatio);
  // Full-horizon universe densifies ratios; skip collision layout here.
  // Overview density in the strip may still render labeled markers.
  const slots =
    points.length <= 12
      ? applyExecutiveLabelLayout(points, reserved)
      : points.map((p) => ({
          key: p.id,
          side: p.labelSide,
          lane: p.labelLane,
          ratio: p.ratio,
          occupant: p.id,
        }));

  return { points, band, chrome, slots };
}

/** Nearby annotations must not share an identical side:lane. */
export function assertNoSlotCollisions(slots: TimelineSlotRef[]): void {
  for (let i = 0; i < slots.length; i += 1) {
    for (let j = i + 1; j < slots.length; j += 1) {
      const a = slots[i]!;
      const b = slots[j]!;
      if (
        a.side === b.side &&
        a.lane === b.lane &&
        Math.abs(a.ratio - b.ratio) < LABEL_COLLISION_RATIO
      ) {
        throw new Error(
          `timeline slot collision ${a.key} between ${a.occupant} and ${b.occupant}`,
        );
      }
    }
  }
}

export function buildTimelineTextSummary(data: DashboardOverview): string {
  const { points, band } = resolveExecutiveTimelinePresentation(data);
  const lines = [
    `Дата снимка: ${formatDateRu(data.scenarioAsOfDate)}`,
    `Запуск производства: базовый план ${formatDateRu(band.baselineDate)}, прогноз ${formatDateRu(band.forecastDate)}, ${band.deltaLabel}`,
    ...points.map(
      (m) =>
        `${m.shortLabel} (${m.id}): прогноз ${formatDateRu(m.forecastDate)}, ${m.rag === 'Green' ? 'Веха в норме' : 'Веха критична'}`,
    ),
  ];
  return lines.join('. ');
}
