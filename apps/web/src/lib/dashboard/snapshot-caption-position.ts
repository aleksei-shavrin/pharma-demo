/**
 * ECharts plot insets. Caption «Дата снимка» MUST use the same left/right as
 * `grid.left` / `grid.right` so the label aligns with the as-of markLine.
 */
export const ECHARTS_PLOT_INSET_PX = 10;

/** Left gutter for program category labels on densify lanes. */
export const ECHARTS_GRID_LEFT_PX = 128;

export const ECHARTS_GRID_RIGHT_PX = ECHARTS_PLOT_INSET_PX;

export type PlotInsets = {
  leftPx: number;
  rightPx: number;
};

export const ECHARTS_PLOT_INSETS: PlotInsets = {
  leftPx: ECHARTS_GRID_LEFT_PX,
  rightPx: ECHARTS_GRID_RIGHT_PX,
};

/**
 * Caption anchor on the same horizontal scale as the as-of line inside the grid.
 * Symmetric `plotInsetPx` kept for vis / legacy callers.
 */
export function snapshotCaptionLeft(
  ratio: number,
  plotInsetPxOrInsets: number | PlotInsets = 0,
): string {
  if (typeof plotInsetPxOrInsets === 'number') {
    const inset = plotInsetPxOrInsets;
    if (inset <= 0) return `${ratio * 100}%`;
    return `calc(${inset}px + (100% - ${inset * 2}px) * ${ratio})`;
  }
  const { leftPx, rightPx } = plotInsetPxOrInsets;
  if (leftPx <= 0 && rightPx <= 0) return `${ratio * 100}%`;
  return `calc(${leftPx}px + (100% - ${leftPx + rightPx}px) * ${ratio})`;
}
