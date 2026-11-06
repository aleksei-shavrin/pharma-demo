/** Horizontal inset of the ECharts plot. The as-of line uses this grid; the caption must use the same inset. */
export const ECHARTS_PLOT_INSET_PX = 10;

/**
 * Caption anchor on the same horizontal scale as the as-of line.
 * A positive inset matches a chart grid that does not span the full host width.
 */
export function snapshotCaptionLeft(ratio: number, plotInsetPx = 0): string {
  if (plotInsetPx <= 0) return `${ratio * 100}%`;
  return `calc(${plotInsetPx}px + (100% - ${plotInsetPx * 2}px) * ${ratio})`;
}
