import type { ScheduleItem } from '@/lib/api-client';
import { computeTimelineVisibleRange } from './to-gantt-presentation';

/** Shared compact row height for Table / Split / Timeline (px). */
export const SCHEDULE_ROW_HEIGHT_PX = 48;

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

/** Build presentation horizon + month ticks from control-point dates. */
export function buildScheduleHorizon(items: ScheduleItem[]): ScheduleHorizon {
  const range = computeTimelineVisibleRange(items);
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

/** Same canonical order as API — safe after client-side filter. */
export function sortScheduleItems(items: ScheduleItem[]): ScheduleItem[] {
  return [...items].sort((a, b) => {
    if (a.forecastDate !== b.forecastDate) {
      return a.forecastDate.localeCompare(b.forecastDate);
    }
    if (a.kind !== b.kind) {
      return a.kind === 'equipment_delivery' ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
  });
}

export function isScheduleAttention(item: ScheduleItem): boolean {
  if (item.kind === 'equipment_delivery') return item.status === 'Delayed';
  return item.rag === 'Red';
}
