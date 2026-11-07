import type { ScheduleComparisonMode } from './schedule-comparison';

/**
 * Fixed column widths for the wide table (Таблица / Разделение).
 * Header and body cells share these values so X/width stay aligned.
 */
export const SCHEDULE_COL_WBS_PX = 72;
export const SCHEDULE_COL_NAME_PX = 160;
export const SCHEDULE_COL_WARN_PX = 48;
export const SCHEDULE_COL_PROGRESS_PX = 148;
export const SCHEDULE_COL_TYPE_PX = 96;
export const SCHEDULE_COL_OBJECT_PX = 140;
export const SCHEDULE_COL_DATE_PX = 96;
export const SCHEDULE_COL_FACT_PX = 120;
export const SCHEDULE_COL_DELTA_PX = 72;
export const SCHEDULE_COL_STATUS_PX = 112;
export const SCHEDULE_COL_CRIT_PX = 80;

/** Matches Tailwind `gap-3` on the sticky rail. */
export const SCHEDULE_COL_GAP_PX = 12;

/** Matches Tailwind `px-3` on each side of the sticky rail. */
export const SCHEDULE_COL_PAD_X_PX = 12;

export type ScheduleWideColId =
  | 'wbs'
  | 'name'
  | 'warn'
  | 'progress'
  | 'type'
  | 'object'
  | 'date-first'
  | 'date-second'
  | 'fact-0'
  | 'fact-1'
  | 'fact-2'
  | 'fact-3'
  | 'delta'
  | 'status'
  | 'crit';

const LEAD_WIDTHS = [
  SCHEDULE_COL_WBS_PX,
  SCHEDULE_COL_NAME_PX,
  SCHEDULE_COL_WARN_PX,
  SCHEDULE_COL_PROGRESS_PX,
] as const;

const MODE_FORECAST_WIDTHS = [
  SCHEDULE_COL_TYPE_PX,
  SCHEDULE_COL_OBJECT_PX,
  SCHEDULE_COL_DATE_PX,
  SCHEDULE_COL_DATE_PX,
  SCHEDULE_COL_DELTA_PX,
  SCHEDULE_COL_STATUS_PX,
  SCHEDULE_COL_CRIT_PX,
] as const;

const MODE_ACTUAL_WIDTHS = [
  SCHEDULE_COL_TYPE_PX,
  SCHEDULE_COL_OBJECT_PX,
  SCHEDULE_COL_DATE_PX,
  SCHEDULE_COL_DATE_PX,
  SCHEDULE_COL_FACT_PX,
  SCHEDULE_COL_FACT_PX,
  SCHEDULE_COL_FACT_PX,
  SCHEDULE_COL_FACT_PX,
  SCHEDULE_COL_DELTA_PX,
  SCHEDULE_COL_STATUS_PX,
  SCHEDULE_COL_CRIT_PX,
] as const;

/** Ordered widths for the wide tree table under the given comparison. */
export function wideTableColumnWidths(
  comparison: ScheduleComparisonMode = 'forecast',
): readonly number[] {
  const mode =
    comparison === 'actual' ? MODE_ACTUAL_WIDTHS : MODE_FORECAST_WIDTHS;
  return [...LEAD_WIDTHS, ...mode];
}

/**
 * Board content min-width: Σ column widths + (n−1)×gap + horizontal padding.
 * Derived from the same widths the cells use — not a hand-picked constant.
 */
export function wideTableMinWidthPx(
  comparison: ScheduleComparisonMode = 'forecast',
): number {
  const widths = wideTableColumnWidths(comparison);
  const gaps = Math.max(0, widths.length - 1) * SCHEDULE_COL_GAP_PX;
  const pad = SCHEDULE_COL_PAD_X_PX * 2;
  let sum = 0;
  for (const w of widths) sum += w;
  return sum + gaps + pad;
}

/** Inline box that header and body cells must share. */
export function scheduleColBoxStyle(widthPx: number): {
  width: number;
  minWidth: number;
  maxWidth: number;
  flex: string;
} {
  return {
    width: widthPx,
    minWidth: widthPx,
    maxWidth: widthPx,
    flex: '0 0 auto',
  };
}
