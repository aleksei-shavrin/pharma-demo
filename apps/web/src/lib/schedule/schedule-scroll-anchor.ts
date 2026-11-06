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
};

export function emptyScheduleScrollAnchor(): ScheduleScrollAnchor {
  return {
    rowKey: null,
    rowOffsetPx: 0,
    tableScrollLeft: 0,
    chartDateIso: null,
    verticalScrollTop: 0,
  };
}

/** Keep a scroll offset inside the element's reachable range. */
export function clampScroll(value: number, max: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const limit = Number.isFinite(max) && max > 0 ? max : 0;
  return Math.min(value, limit);
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
