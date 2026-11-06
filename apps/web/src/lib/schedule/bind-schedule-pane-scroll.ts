type Scrollable = {
  scrollTop: number;
  addEventListener(type: 'scroll', listener: () => void): void;
  removeEventListener(type: 'scroll', listener: () => void): void;
};

/**
 * Keeps the hierarchical list and the DHTMLX task pane on one vertical offset.
 * A lock stops the second scroll event from writing the value back.
 */
export function bindSchedulePaneScroll(
  list: Scrollable,
  chart: Scrollable,
): () => void {
  let source: 'list' | 'chart' | null = null;

  const follow = (from: Scrollable, to: Scrollable, origin: 'list' | 'chart') => {
    if (source !== null && source !== origin) return;
    if (to.scrollTop === from.scrollTop) return;
    source = origin;
    to.scrollTop = from.scrollTop;
    source = null;
  };

  const onList = () => follow(list, chart, 'list');
  const onChart = () => follow(chart, list, 'chart');
  list.addEventListener('scroll', onList);
  chart.addEventListener('scroll', onChart);
  return () => {
    list.removeEventListener('scroll', onList);
    chart.removeEventListener('scroll', onChart);
  };
}

/** Vendor scroller for the task area. The grid is hidden in hierarchical mode. */
export const GANTT_VERTICAL_SCROLL_SELECTOR = '.gantt_ver_scroll';

/** Task rows live here. A reparse can zero it while the scrollbar keeps its offset. */
export const GANTT_DATA_AREA_SELECTOR = '.gantt_data_area';

/**
 * Copies the scrollbar offset onto the task pane.
 * Assigning the same `scrollTop` does not scroll the pane again, so the copy is explicit.
 */
export function copyScrollTop(
  from: { scrollTop: number },
  to: { scrollTop: number } | null,
): void {
  if (!to || to.scrollTop === from.scrollTop) return;
  to.scrollTop = from.scrollTop;
}
