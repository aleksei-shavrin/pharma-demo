import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  EXECUTIVE_TIMELINE_MILESTONE_IDS,
  EXECUTIVE_TIMELINE_SHORT_LABEL,
  type ExecutiveTimelineMilestoneId,
} from './executive-timeline-ids';

/** Honest Demo horizon (days inclusive span via UTC date math). */
export const TIMELINE_HORIZON_START = '2027-02-01';
export const TIMELINE_HORIZON_END = '2027-10-20';

/** Neighbour distance below this % (~80px on ~1280px track) triggers label flip. */
export const LABEL_COLLISION_RATIO = 80 / 1280;

export type LabelSide = 'above' | 'below';

export type TimelineMilestonePoint = {
  id: ExecutiveTimelineMilestoneId;
  name: string;
  shortLabel: string;
  rag: 'Green' | 'Red';
  baselineDate: string;
  forecastDate: string;
  ratio: number;
  labelSide: LabelSide;
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

/** Month starts from Mar 2027 through Oct 2027 inside horizon (Feb label at start). */
export function timelineMonthTicks(): MonthTick[] {
  const ticks: MonthTick[] = [
    { date: TIMELINE_HORIZON_START, ratio: 0, label: RU_MONTH_SHORT[1] },
  ];
  for (let month = 2; month <= 9; month += 1) {
    const date = `2027-${String(month + 1).padStart(2, '0')}-01`;
    ticks.push({
      date,
      ratio: dateToRatio(date),
      label: RU_MONTH_SHORT[month],
    });
  }
  return ticks;
}

export function resolveExecutiveMilestones(
  data: DashboardOverview,
): TimelineMilestonePoint[] {
  const points: TimelineMilestonePoint[] = EXECUTIVE_TIMELINE_MILESTONE_IDS.map(
    (id) => {
      const ms = data.milestones.find((m) => m.id === id);
      if (!ms) {
        throw new Error(`Dashboard missing executive timeline milestone ${id}`);
      }
      return {
        id,
        name: ms.name,
        shortLabel: EXECUTIVE_TIMELINE_SHORT_LABEL[id],
        rag: ms.rag,
        baselineDate: ms.baselineDate,
        forecastDate: ms.forecastDate,
        ratio: dateToRatio(ms.forecastDate),
        labelSide: 'above' as LabelSide,
      };
    },
  );

  // Alternate labels when neighbours are closer than collision threshold.
  for (let i = 0; i < points.length; i += 1) {
    if (i === 0) {
      points[i].labelSide = 'below';
      continue;
    }
    const gap = points[i].ratio - points[i - 1].ratio;
    if (gap < LABEL_COLLISION_RATIO) {
      points[i].labelSide =
        points[i - 1].labelSide === 'above' ? 'below' : 'above';
    } else {
      points[i].labelSide = i % 2 === 0 ? 'below' : 'above';
    }
  }

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
