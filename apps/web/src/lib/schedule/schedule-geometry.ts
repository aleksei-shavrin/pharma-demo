import type { ScheduleItem, ScheduleWorkItem } from '@/lib/api-client';
import type { ScheduleComparisonMode } from './schedule-comparison';
import { scheduleSortDate } from './schedule-item-dates';
import { computeTimelineVisibleRange } from './to-gantt-presentation';

/** Shared compact row height for Table / Split / Timeline (px). */
export const SCHEDULE_ROW_HEIGHT_PX = 48;

/**
 * Pitch of a hierarchical DHTMLX row. The list beside that chart uses the same
 * pitch so one scroll offset keeps a table row next to its bar.
 */
export const SCHEDULE_GANTT_ROW_HEIGHT_PX = 72;

/** Sticky schedule header band height (px). */
export const SCHEDULE_HEADER_HEIGHT_PX = 40;

/** Approximate month column width for timeline mapping. */
export const SCHEDULE_MONTH_COL_PX = 72;

export type ScheduleMonthTick = {
  iso: string;
  label: string;
  /** Left edge of month start within horizon (0–100). */
  xPct: number;
};

export type ScheduleMonthSpan = {
  iso: string;
  label: string;
  leftPct: number;
  widthPct: number;
};

export type ScheduleHorizon = {
  startMs: number;
  endMs: number;
  startIso: string;
  endIso: string;
  widthPx: number;
  months: ScheduleMonthTick[];
};

/**
 * Month header cells spanning [tick_i, tick_{i+1}) — avoids boundary-centered
 * labels that clip at the left/right timeline edges.
 */
export function monthLabelSpans(
  months: ScheduleMonthTick[],
): ScheduleMonthSpan[] {
  return months.map((m, i) => {
    const leftPct = m.xPct;
    const rightPct = i + 1 < months.length ? months[i + 1].xPct : 100;
    return {
      iso: m.iso,
      label: m.label,
      leftPct,
      widthPct: Math.max(rightPct - leftPct, 0),
    };
  });
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTH_RU = [
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
];

/** Build presentation horizon + month ticks from control-point and work dates. */
export function buildScheduleHorizon(
  items: ScheduleItem[],
  comparison: ScheduleComparisonMode = 'forecast',
): ScheduleHorizon {
  const range = computeTimelineVisibleRange(items, undefined, comparison);
  const start = parseIso(range.start);
  const end = parseIso(range.end);
  const startMs = start.getTime();
  const endMs = Math.max(end.getTime(), startMs + 1);

  const months: ScheduleMonthTick[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor.getTime() < endMs) {
    const iso = toIso(cursor);
    const xPct = dateToPercent(iso, startMs, endMs);
    months.push({
      iso,
      label: `${MONTH_RU[cursor.getMonth()]} ${String(cursor.getFullYear()).slice(2)}`,
      xPct,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const spanMonths = Math.max(months.length, 1);
  const widthPx = Math.max(spanMonths * SCHEDULE_MONTH_COL_PX, 480);

  return {
    startMs,
    endMs,
    startIso: range.start,
    endIso: range.end,
    widthPx,
    months,
  };
}

export function dateToPercent(
  iso: string,
  startMs: number,
  endMs: number,
): number {
  const t = parseIso(iso).getTime();
  const pct = ((t - startMs) / (endMs - startMs)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function dateToXPx(iso: string, horizon: ScheduleHorizon): number {
  return (dateToPercent(iso, horizon.startMs, horizon.endMs) / 100) * horizon.widthPx;
}

export type MarkerGeometry = {
  forecastXPct: number;
  baselineXPct: number;
  showBaseline: boolean;
  connectorLeftPct: number;
  connectorWidthPct: number;
};

export function markerGeometry(
  item: ScheduleItem,
  horizon: ScheduleHorizon,
): MarkerGeometry {
  if (item.kind !== 'milestone' && item.kind !== 'equipment_delivery') {
    return {
      forecastXPct: 0,
      baselineXPct: 0,
      showBaseline: false,
      connectorLeftPct: 0,
      connectorWidthPct: 0,
    };
  }
  const forecastXPct = dateToPercent(
    item.forecastDate,
    horizon.startMs,
    horizon.endMs,
  );
  const baselineXPct = dateToPercent(
    item.baselineDate,
    horizon.startMs,
    horizon.endMs,
  );
  const showBaseline = item.baselineDate !== item.forecastDate;
  const left = Math.min(baselineXPct, forecastXPct);
  const right = Math.max(baselineXPct, forecastXPct);
  return {
    forecastXPct,
    baselineXPct,
    showBaseline,
    connectorLeftPct: left,
    connectorWidthPct: Math.max(right - left, 0),
  };
}

export type WorkBarGeometry = { leftPct: number; widthPct: number };

const MS_PER_DAY = 86_400_000;

/** Полоса работы: endDate включительно, поэтому правый край — начало следующего дня. */
export function workBarGeometry(
  item: ScheduleWorkItem,
  horizon: ScheduleHorizon,
): WorkBarGeometry {
  const leftPct = dateToPercent(item.startDate, horizon.startMs, horizon.endMs);
  const endExclusiveMs = parseIso(item.endDate).getTime() + MS_PER_DAY;
  const rawRightPct =
    ((endExclusiveMs - horizon.startMs) / (horizon.endMs - horizon.startMs)) *
    100;
  const rightPct = Math.min(100, Math.max(0, rawRightPct));
  return { leftPct, widthPct: Math.max(rightPct - leftPct, 0) };
}

/** Same canonical order as API — safe after client-side filter. */
export function sortScheduleItems(items: ScheduleItem[]): ScheduleItem[] {
  return [...items].sort((a, b) => {
    const dateA = scheduleSortDate(a);
    const dateB = scheduleSortDate(b);
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    if (a.kind !== b.kind) {
      return KIND_SORT_RANK[a.kind] - KIND_SORT_RANK[b.kind];
    }
    return a.id.localeCompare(b.id);
  });
}

const KIND_SORT_RANK: Record<ScheduleItem['kind'], number> = {
  equipment_delivery: 0,
  milestone: 1,
  work: 2,
  project_group: 3,
  stage_group: 4,
};

export function isScheduleAttention(item: ScheduleItem): boolean {
  if (item.kind === 'project_group' || item.kind === 'stage_group') return false;
  if (item.kind === 'equipment_delivery') return item.status === 'Delayed';
  if (item.kind === 'work') return item.status === 'Delayed';
  if (item.kind === 'milestone') return item.rag === 'Red';
  return false;
}
