import { SCHEDULE_MONTH_COL_PX } from './schedule-geometry';

/** Floor for DHTMLX month columns — same constant as the board month grid. */
export const SCHEDULE_GANTT_MIN_COLUMN_WIDTH_PX = SCHEDULE_MONTH_COL_PX;

/** Short RU month labels for the DHTMLX month scale (lowercase). */
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

const RU_MONTH_FULL = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
] as const;

function monthIndex(date: Date): number {
  return Math.min(11, Math.max(0, date.getMonth()));
}

/** Visible scale caption: short month + two-digit year (`янв 27`). */
export function formatMonthScaleShort(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  return `${RU_MONTH_SHORT[monthIndex(date)]} ${yy}`;
}

/** Tooltip / accessible full caption (`январь 2027`). */
export function formatMonthScaleFull(date: Date): string {
  return `${RU_MONTH_FULL[monthIndex(date)]} ${date.getFullYear()}`;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * DHTMLX `scales[].format` HTML: short label + `title` with the full month name.
 * Vendor injects the return value into the scale cell via innerHTML.
 */
export function formatMonthScaleCellHtml(date: Date): string {
  const short = formatMonthScaleShort(date);
  const full = formatMonthScaleFull(date);
  return `<span title="${escapeAttr(full)}">${escapeAttr(short)}</span>`;
}

/** Pure scale entry for `gantt.config.scales` — keeps adapter free of inline format strings. */
export function scheduleMonthScaleEntry(): {
  unit: 'month';
  step: number;
  format: (date: Date) => string;
} {
  return { unit: 'month', step: 1, format: formatMonthScaleCellHtml };
}
