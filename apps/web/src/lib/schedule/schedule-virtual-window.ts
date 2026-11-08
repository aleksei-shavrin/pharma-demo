import { SCHEDULE_ROW_HEIGHT_PX } from './schedule-geometry';

/** Extra rows above/below the visible band. Keeps mid-scroll paint stable. */
export const SCHEDULE_VIRTUAL_OVERSCAN_ROWS = 8;

export type ScheduleVirtualWindow = {
  startIndex: number;
  endIndex: number;
  rowCount: number;
  rowHeight: number;
  scrollTop: number;
  viewportHeight: number;
};

/**
 * Inclusive-exclusive row window for a shared Y owner.
 * Logical height stays `rowCount * rowHeight`; DOM only mounts `[start, end)`.
 */
export function computeScheduleVirtualWindow(args: {
  scrollTop: number;
  viewportHeight: number;
  rowCount: number;
  rowHeight?: number;
  overscan?: number;
}): ScheduleVirtualWindow {
  const rowHeight = args.rowHeight ?? SCHEDULE_ROW_HEIGHT_PX;
  const overscan = args.overscan ?? SCHEDULE_VIRTUAL_OVERSCAN_ROWS;
  const rowCount = Math.max(0, Math.floor(args.rowCount));
  const scrollTop = Math.max(0, args.scrollTop);
  const viewportHeight = Math.max(0, args.viewportHeight);

  if (rowCount === 0 || rowHeight <= 0) {
    return {
      startIndex: 0,
      endIndex: 0,
      rowCount,
      rowHeight,
      scrollTop,
      viewportHeight,
    };
  }

  const rawStart = Math.floor(scrollTop / rowHeight) - overscan;
  const visibleRows = Math.ceil(viewportHeight / rowHeight) + 1;
  const rawEnd = Math.floor(scrollTop / rowHeight) + visibleRows + overscan;
  const startIndex = Math.max(0, Math.min(rowCount, rawStart));
  const endIndex = Math.max(startIndex, Math.min(rowCount, rawEnd));

  return {
    startIndex,
    endIndex,
    rowCount,
    rowHeight,
    scrollTop,
    viewportHeight,
  };
}

export function virtualWindowSpacerPx(window: ScheduleVirtualWindow): {
  topPx: number;
  bottomPx: number;
} {
  const { startIndex, endIndex, rowCount, rowHeight } = window;
  return {
    topPx: startIndex * rowHeight,
    bottomPx: Math.max(0, rowCount - endIndex) * rowHeight,
  };
}

/** Upper bound for DOM rows in a healthy virtual window (viewport + 2×overscan + pad). */
export function virtualWindowDomBudget(
  viewportHeight: number,
  rowHeight = SCHEDULE_ROW_HEIGHT_PX,
  overscan = SCHEDULE_VIRTUAL_OVERSCAN_ROWS,
): number {
  if (rowHeight <= 0) return overscan * 2;
  return Math.ceil(viewportHeight / rowHeight) + overscan * 2 + 2;
}
