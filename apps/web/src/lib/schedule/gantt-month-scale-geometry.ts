import {
  formatMonthScaleFull,
  formatMonthScaleShort,
} from './schedule-month-scale';
import { isoFromDate } from './schedule-scroll-anchor';

/** One month cell aligned to DHTMLX scale coordinates (`getScale()`; `posFromDate` fallback). */
export type GanttMonthScaleCell = {
  iso: string;
  label: string;
  title: string;
  leftPx: number;
  widthPx: number;
};

export type GanttMonthScaleGeometry = {
  /** Timeline content width in px (same space as vendor bars). */
  totalWidthPx: number;
  rangeStartIso: string;
  rangeEndIso: string;
  months: GanttMonthScaleCell[];
};

export const SCHEDULE_CHART_SCALE_EVENT = 'ppc-schedule-chart-scale';

/** Sticky header → vendor: request `gantt.scrollTo(x, y)`. */
export const SCHEDULE_CHART_HSCROLL_REQUEST = 'ppc-schedule-chart-hscroll-request';

/** Vendor → sticky header: current horizontal scroll x. */
export const SCHEDULE_CHART_HSCROLL_EVENT = 'ppc-schedule-chart-hscroll';

/** Subset of the object returned by DHTMLX `gantt.getScale()`. */
export type GanttScaleLike = {
  /** Cell start dates. */
  trace_x?: ReadonlyArray<Date | string>;
  /** Cell left offsets in px (data-area space). */
  left?: ReadonlyArray<number>;
  /** Cell widths in px. */
  width?: ReadonlyArray<number>;
  full_width?: number;
  /** Defensive alternative to trace_x/left/width: explicit cells. */
  cells?: ReadonlyArray<{
    date?: Date | string;
    start_date?: Date | string;
    left?: number;
    width?: number;
  }>;
};

type PosDateGantt = {
  config: {
    start_date?: Date | string;
    end_date?: Date | string;
    scales?: ReadonlyArray<{ unit?: string }>;
  };
  /** Preferred source of truth when present. */
  getScale?: () => GanttScaleLike | null | undefined;
  /** Fallback only when `getScale` is missing. */
  posFromDate?: (date: Date) => number;
  dateFromPos?: (x: number) => Date;
};

function asDate(value: Date | string | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

type RawCell = { start: Date; left: number; width: number };

/** Normalise `getScale()` into positioned cells; null when unusable. */
function cellsFromScale(scale: GanttScaleLike): RawCell[] | null {
  const cells: RawCell[] = [];
  if (scale.trace_x && scale.trace_x.length > 0) {
    const { trace_x: dates, left, width } = scale;
    const hasWidth = Array.isArray(width) && width.length >= dates.length;
    const hasLeft = Array.isArray(left) && left.length >= dates.length;
    if (!hasWidth && !hasLeft) return null;
    let cursor = 0;
    for (let i = 0; i < dates.length; i += 1) {
      const start = asDate(dates[i]);
      if (!start) return null;
      const l = hasLeft ? left![i] : cursor;
      let w: number;
      if (hasWidth) {
        w = width![i];
      } else {
        const nextLeft = i + 1 < dates.length ? left![i + 1] : scale.full_width;
        w = (nextLeft ?? Number.NaN) - l;
      }
      if (!Number.isFinite(l) || !Number.isFinite(w)) return null;
      cells.push({ start, left: l, width: w });
      cursor = l + w;
    }
  } else if (scale.cells && scale.cells.length > 0) {
    for (const cell of scale.cells) {
      const start = asDate(cell.date ?? cell.start_date);
      const l = cell.left;
      const w = cell.width;
      if (!start || typeof l !== 'number' || typeof w !== 'number') return null;
      if (!Number.isFinite(l) || !Number.isFinite(w)) return null;
      cells.push({ start, left: l, width: w });
    }
  } else {
    return null;
  }
  return cells.length > 0 ? cells : null;
}

/** Group scale cells by calendar month of their start date (month zoom). */
function monthsFromCells(cells: RawCell[]): GanttMonthScaleCell[] {
  const months: GanttMonthScaleCell[] = [];
  const byKey = new Map<string, { cell: GanttMonthScaleCell; right: number }>();
  for (const cell of cells) {
    const labelDate = new Date(cell.start.getFullYear(), cell.start.getMonth(), 1);
    const key = `${labelDate.getFullYear()}-${labelDate.getMonth()}`;
    const right = cell.left + cell.width;
    const existing = byKey.get(key);
    if (existing) {
      const left = Math.min(existing.cell.leftPx, cell.left);
      existing.right = Math.max(existing.right, right);
      existing.cell.leftPx = left;
      existing.cell.widthPx = existing.right - left;
      continue;
    }
    const entry: GanttMonthScaleCell = {
      iso: isoFromDate(labelDate),
      label: formatMonthScaleShort(labelDate),
      title: formatMonthScaleFull(labelDate),
      leftPx: cell.left,
      widthPx: cell.width,
    };
    byKey.set(key, { cell: entry, right });
    months.push(entry);
  }
  return months.filter((m) => m.widthPx > 0.5);
}

function extractFromScale(
  gantt: PosDateGantt,
  scale: GanttScaleLike,
): GanttMonthScaleGeometry | null {
  const cells = cellsFromScale(scale);
  if (!cells) return null;
  // Zoom levels are month-density only — aggregate sticky cells by calendar month.
  const months = monthsFromCells(cells);
  if (months.length === 0) return null;
  const last = cells[cells.length - 1];
  const rightEdge = Math.max(...cells.map((c) => c.left + c.width));
  const totalWidthPx =
    typeof scale.full_width === 'number' && scale.full_width > 0
      ? scale.full_width
      : rightEdge;
  if (!(totalWidthPx > 0)) return null;
  const start = cells[0].start;
  const configuredEnd = asDate(gantt.config.end_date);
  const end =
    configuredEnd && configuredEnd.getTime() > start.getTime()
      ? configuredEnd
      : new Date(last.start.getFullYear(), last.start.getMonth() + 1, 1);
  return {
    totalWidthPx,
    rangeStartIso: isoFromDate(start),
    rangeEndIso: isoFromDate(end),
    months,
  };
}

/**
 * Build sticky-scale cells from the live Gantt scale.
 * Prefers `gantt.getScale()` (trace_x / left / width or cells); falls back to the
 * `posFromDate` mapping only when `getScale` is missing.
 */
export function extractGanttMonthScaleGeometry(
  gantt: PosDateGantt,
): GanttMonthScaleGeometry | null {
  if (typeof gantt.getScale === 'function') {
    const scale = gantt.getScale();
    return scale ? extractFromScale(gantt, scale) : null;
  }
  return extractFromPosFromDate(gantt);
}

function extractFromPosFromDate(
  gantt: PosDateGantt,
): GanttMonthScaleGeometry | null {
  const posFromDate = gantt.posFromDate;
  if (typeof posFromDate !== 'function') return null;
  const start = asDate(gantt.config.start_date);
  const end = asDate(gantt.config.end_date);
  if (!start || !end || !(end.getTime() > start.getTime())) return null;

  const origin = posFromDate(start);
  const endPos = posFromDate(end);
  if (!Number.isFinite(origin) || !Number.isFinite(endPos)) return null;
  const totalWidthPx = Math.max(0, endPos - origin);
  if (totalWidthPx <= 0) return null;

  const months: GanttMonthScaleCell[] = [];
  // First cell starts at timeline start (may be mid-month).
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor.getTime() < end.getTime()) {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const cellStart =
      cursor.getTime() < start.getTime() ? start : new Date(cursor);
    const cellEnd = next.getTime() > end.getTime() ? end : next;
    const left = posFromDate(cellStart) - origin;
    const right = posFromDate(cellEnd) - origin;
    const widthPx = Math.max(0, right - left);
    if (widthPx > 0.5) {
      const labelDate = new Date(cursor);
      months.push({
        iso: isoFromDate(labelDate),
        label: formatMonthScaleShort(labelDate),
        title: formatMonthScaleFull(labelDate),
        leftPx: left,
        widthPx,
      });
    }
    cursor = next;
  }

  // Optional consistency check: leftmost dateFromPos ≈ start.
  if (typeof gantt.dateFromPos === 'function') {
    const back = gantt.dateFromPos(origin);
    if (back instanceof Date && !Number.isNaN(back.getTime())) {
      const drift = Math.abs(back.getTime() - start.getTime());
      // More than ~36h drift means the mapping is not usable for labels.
      if (drift > 36 * 60 * 60 * 1000) return null;
    }
  }

  return {
    totalWidthPx,
    rangeStartIso: isoFromDate(start),
    rangeEndIso: isoFromDate(end),
    months,
  };
}

/** Publish geometry on the gantt host for the external sticky header. */
export function publishGanttMonthScaleGeometry(
  host: HTMLElement,
  geometry: GanttMonthScaleGeometry,
): void {
  host.setAttribute(
    'data-schedule-chart-scale-geometry',
    JSON.stringify(geometry),
  );
  host.dispatchEvent(
    new CustomEvent(SCHEDULE_CHART_SCALE_EVENT, {
      bubbles: true,
      detail: geometry,
    }),
  );
}
