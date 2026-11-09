/**
 * DHTMLX Community gantt.ext.zoom levels for schedule chart.
 * Official: https://docs.dhtmlx.com/gantt/guides/zooming/
 * Installed: dhtmlx-gantt 10.0.3 Community (MIT).
 *
 * All levels use unit=month so fit-mode smart_rendering stays on (week/day
 * units empty bars_area under smart_rendering in this bounded adapter).
 * Density steps 48→96→192→384(default)→768.
 */

export type ScheduleZoomLevelId =
  | 'month-48'
  | 'month-96'
  | 'month-192'
  | 'month-384'
  | 'month-768';

export type ScheduleZoomLevelDef = {
  id: ScheduleZoomLevelId;
  name: string;
  minColumnWidth: number;
  unit: 'month';
  step: number;
};

/** Coarse → fine. Default index = month-384 (3). */
export const SCHEDULE_ZOOM_LEVELS: readonly ScheduleZoomLevelDef[] = [
  { id: 'month-48', name: 'Месяц · обзор', minColumnWidth: 48, unit: 'month', step: 1 },
  { id: 'month-96', name: 'Месяц', minColumnWidth: 96, unit: 'month', step: 1 },
  { id: 'month-192', name: 'Месяц · крупно', minColumnWidth: 192, unit: 'month', step: 1 },
  { id: 'month-384', name: 'Месяц · детально', minColumnWidth: 384, unit: 'month', step: 1 },
  { id: 'month-768', name: 'Месяц · макс', minColumnWidth: 768, unit: 'month', step: 1 },
] as const;

export const SCHEDULE_ZOOM_DEFAULT_INDEX = 3;

const RU_MONTH_SHORT_UPPER = [
  'ЯНВ',
  'ФЕВ',
  'МАР',
  'АПР',
  'МАЙ',
  'ИЮН',
  'ИЮЛ',
  'АВГ',
  'СЕН',
  'ОКТ',
  'НОЯ',
  'ДЕК',
] as const;

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Bold uppercase RU month cell (single-tier 40px header). */
export function formatZoomMonthCellHtml(date: Date): string {
  const label = `${RU_MONTH_SHORT_UPPER[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`;
  return `<span class="ppc-scale-label" title="${escapeAttr(label)}">${escapeAttr(label)}</span>`;
}

export function scheduleZoomVendorLevels(): Array<{
  name: string;
  min_column_width: number;
  scales: Array<{ unit: string; step: number; format: (d: Date) => string }>;
}> {
  return SCHEDULE_ZOOM_LEVELS.map((level) => ({
    name: level.name,
    min_column_width: level.minColumnWidth,
    scales: [{ unit: level.unit, step: level.step, format: formatZoomMonthCellHtml }],
  }));
}

export type GanttZoomApi = {
  init: (cfg: {
    levels: ReturnType<typeof scheduleZoomVendorLevels>;
    activeLevelIndex?: number;
    start?: number;
    /** Disable wheel zoom so vertical scroll is not stolen. */
    trigger?: 'wheel' | null;
    useKey?: string | null;
  }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setLevel: (level: number | string) => void;
  getCurrentLevel?: () => number;
  attachEvent?: (name: string, handler: (...args: unknown[]) => void) => string;
};

export function readGanttZoomApi(gantt: {
  ext?: { zoom?: GanttZoomApi };
}): GanttZoomApi | null {
  const zoom = gantt.ext?.zoom;
  if (!zoom || typeof zoom.init !== 'function') return null;
  if (typeof zoom.zoomIn !== 'function' || typeof zoom.zoomOut !== 'function') {
    return null;
  }
  if (typeof zoom.setLevel !== 'function') return null;
  return zoom;
}

export function canZoomIn(levelIndex: number): boolean {
  return levelIndex < SCHEDULE_ZOOM_LEVELS.length - 1;
}

export function canZoomOut(levelIndex: number): boolean {
  return levelIndex > 0;
}

/** Left-edge scroll with padding so the first bar is not flush to the clip. */
export function paddedLeftChartScrollX(
  datePosPx: number,
  padPx: number,
  maxScrollX: number,
): number {
  if (!Number.isFinite(datePosPx)) return 0;
  const pad = Number.isFinite(padPx) && padPx > 0 ? padPx : 0;
  const x = Math.max(0, datePosPx - pad);
  const max = Number.isFinite(maxScrollX) && maxScrollX > 0 ? maxScrollX : 0;
  return Math.min(x, max);
}

/** Pixel under the horizontal center of the chart viewport (for zoom anchors). */
export function chartViewportCenterPosPx(
  scrollX: number,
  viewportWidthPx: number,
): number {
  if (!Number.isFinite(scrollX)) return 0;
  const half =
    Number.isFinite(viewportWidthPx) && viewportWidthPx > 0
      ? viewportWidthPx / 2
      : 0;
  return Math.max(0, scrollX + half);
}

/**
 * Keep a known date at the same offset from the left edge after rescale.
 * `offsetFromLeftPx = datePosBefore − scrollXBefore`.
 */
export function scrollXKeepingDateOffset(
  datePosAfterPx: number,
  offsetFromLeftPx: number,
  maxScrollX: number,
): number {
  if (!Number.isFinite(datePosAfterPx)) return 0;
  const offset = Number.isFinite(offsetFromLeftPx) ? offsetFromLeftPx : 0;
  const x = Math.max(0, datePosAfterPx - offset);
  const max = Number.isFinite(maxScrollX) && maxScrollX > 0 ? maxScrollX : 0;
  return Math.min(x, max);
}
