/**
 * Scroll anchor for one calendar. The view stores it across mode and
 * comparison changes; renderers only read and write the same object.
 */

export type ScheduleScrollAnchor = {
  rowKey: string | null;
  rowOffsetPx: number;
  tableScrollLeft: number;
  chartDateIso: string | null;
  verticalScrollTop: number;
  /**
   * One-shot focus deep-link: center `chartDateIso` in the chart viewport.
   * Ordinary restore keeps left-edge (`posFromDate`). Cleared after apply.
   */
  centerChartDateOnce?: boolean;
};

export function emptyScheduleScrollAnchor(): ScheduleScrollAnchor {
  return {
    rowKey: null,
    rowOffsetPx: 0,
    tableScrollLeft: 0,
    chartDateIso: null,
    verticalScrollTop: 0,
    centerChartDateOnce: false,
  };
}

/** Keep a scroll offset inside the element's reachable range. */
export function clampScroll(value: number, max: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const limit = Number.isFinite(max) && max > 0 ? max : 0;
  return Math.min(value, limit);
}

/**
 * Horizontal scroll so `datePosPx` sits at the viewport midpoint when bounds allow.
 */
export function centeredChartScrollX(
  datePosPx: number,
  viewportWidthPx: number,
  maxScrollX: number,
): number {
  if (!Number.isFinite(datePosPx) || !Number.isFinite(viewportWidthPx)) return 0;
  const half = Math.max(0, viewportWidthPx) / 2;
  return clampScroll(datePosPx - half, maxScrollX);
}

/**
 * Vertical scroll so row midpoint sits at the owner viewport midpoint when bounds allow.
 * `stickyInsetPx` accounts for sticky chrome (month scale) that shrinks the visible clip.
 */
export function centeredOwnedScrollTop(
  rowIndex: number,
  rowHeightPx: number,
  viewportHeightPx: number,
  maxScrollTop: number,
  stickyInsetPx = 0,
): number {
  if (
    !Number.isFinite(rowIndex) ||
    rowIndex < 0 ||
    !Number.isFinite(rowHeightPx) ||
    rowHeightPx <= 0
  ) {
    return 0;
  }
  const sticky = Math.max(0, stickyInsetPx);
  const target =
    rowIndex * rowHeightPx +
    rowHeightPx / 2 -
    (Math.max(0, viewportHeightPx) + sticky) / 2;
  return clampScroll(target, maxScrollTop);
}

/** Local calendar day. Gantt positions use local dates, not UTC midnight. */
export function isoFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function captureRowAnchor(
  viewport: HTMLElement,
  root: ParentNode = viewport,
  selector = '[data-schedule-row]',
  keyAttribute = 'data-schedule-row',
): { rowKey: string | null; rowOffsetPx: number } {
  const origin = viewport.getBoundingClientRect().top;
  const rows = root.querySelectorAll<HTMLElement>(selector);
  for (const row of rows) {
    const rect = row.getBoundingClientRect();
    if (rect.bottom > origin + 0.5) {
      return {
        rowKey: row.getAttribute(keyAttribute),
        rowOffsetPx: rect.top - origin,
      };
    }
  }
  return { rowKey: null, rowOffsetPx: 0 };
}

export function restoreRowAnchor(
  viewport: HTMLElement,
  rowKey: string | null,
  rowOffsetPx: number,
  root: ParentNode = viewport,
  selector = '[data-schedule-row]',
  keyAttribute = 'data-schedule-row',
): void {
  if (!rowKey) return;
  const row = findRowByKey(root, selector, keyAttribute, rowKey);
  if (!row) return;
  const origin = viewport.getBoundingClientRect().top;
  const delta = row.getBoundingClientRect().top - origin - rowOffsetPx;
  const next = viewport.scrollTop + delta;
  const max = viewport.scrollHeight - viewport.clientHeight;
  viewport.scrollTop = clampScroll(next, max);
}

export function restoreScrollLeft(element: HTMLElement, left: number): void {
  const max = element.scrollWidth - element.clientWidth;
  element.scrollLeft = clampScroll(left, max);
}

const GANTT_VER = '.gantt_ver_scroll';
const GANTT_DATA = '.gantt_data_area';

/** Chart-only mode: read Y from the vendor vertical scroller. */
export function captureChartPaneScroll(chartPane: HTMLElement): {
  rowKey: string | null;
  rowOffsetPx: number;
  verticalScrollTop: number;
} | null {
  const chart = chartPane.querySelector<HTMLElement>(GANTT_VER);
  if (!chart) return null;
  const taskPane =
    chartPane.querySelector<HTMLElement>('.gantt_task') ?? chart;
  const row = captureRowAnchor(
    taskPane,
    chartPane,
    '.gantt_task_row',
    'task_id',
  );
  return {
    rowKey: row.rowKey,
    rowOffsetPx: row.rowOffsetPx,
    verticalScrollTop: chart.scrollTop,
  };
}

/** Chart-only mode: restore Y onto the vendor scroller + task pane. */
export function restoreChartPaneScroll(
  chartPane: HTMLElement,
  verticalScrollTop: number,
  rowKey: string | null,
  rowOffsetPx: number,
): void {
  const chart = chartPane.querySelector<HTMLElement>(GANTT_VER);
  if (!chart) return;
  const max = chart.scrollHeight - chart.clientHeight;
  chart.scrollTop = clampScroll(verticalScrollTop, max);
  const data = chartPane.querySelector<HTMLElement>(GANTT_DATA);
  if (data && data.scrollTop !== chart.scrollTop) {
    data.scrollTop = chart.scrollTop;
  }
  if (!rowKey) return;
  const taskPane =
    chartPane.querySelector<HTMLElement>('.gantt_task') ?? chart;
  restoreRowAnchor(
    chart,
    rowKey,
    rowOffsetPx,
    taskPane,
    '.gantt_task_row',
    'task_id',
  );
}

/**
 * Forward vertical wheel from chart pane to the outer schedule Y owner.
 * Skips ctrl/meta (browser zoom), horizontal-dominant gestures, and zero delta.
 */
export function forwardWheelDeltaToOwner(
  event: Pick<
    WheelEvent,
    'ctrlKey' | 'metaKey' | 'deltaX' | 'deltaY' | 'deltaMode' | 'preventDefault'
  >,
  owner: HTMLElement,
  lineHeightPx: number,
): boolean {
  if (event.ctrlKey || event.metaKey) return false;
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return false;
  let delta = event.deltaY;
  if (event.deltaMode === 1) {
    delta *= lineHeightPx;
  } else if (event.deltaMode === 2) {
    delta *= owner.clientHeight;
  }
  if (delta === 0) return false;
  event.preventDefault();
  owner.scrollTop += delta;
  return true;
}

function findRowByKey(
  root: ParentNode,
  selector: string,
  keyAttribute: string,
  rowKey: string,
): HTMLElement | null {
  const rows = root.querySelectorAll<HTMLElement>(selector);
  for (const row of rows) {
    if (row.getAttribute(keyAttribute) === rowKey) return row;
  }
  return null;
}
