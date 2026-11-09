/**
 * Unified executive-timeline caption geometry (CSS chrome + ECharts PS labels).
 *
 * Snapshot «Дата снимка» and the red PS forecast label share the **same bottom
 * baseline** (not merely equal gaps to different marks). Overlay `top` is
 * measured after ECharts layout via convertToPixel; constants below are
 * fallbacks / reserved grid pad.
 */
/** Measured caption→mark gap (px). Forecast label distance uses the same value. */
export const TIMELINE_CAPTION_GAP_PX = 14;

/**
 * Reserved height for the «Дата снимка» block inside the plot top pad.
 * Narrow 3-line forecast (lineHeight 12) still fits via runtime measure.
 */
export const TIMELINE_CAPTION_BLOCK_PX = 24;

/**
 * ECharts grid.top: room for snapshot caption block + forecast label above plot.
 * Keep lean — no large empty band above the date text.
 */
export const TIMELINE_GRID_TOP_PX =
  TIMELINE_CAPTION_BLOCK_PX + TIMELINE_CAPTION_GAP_PX;

/**
 * Fallback overlay `top` before first geometry measure (≈ lower the caption
 * toward the forecast label bottom). Runtime measure overrides this.
 */
export const TIMELINE_SNAPSHOT_CAPTION_TOP_PX = 12;

/** Alias: PS forecast / coincident label distance === caption gap. */
export const TIMELINE_FORECAST_LABEL_DISTANCE_PX = TIMELINE_CAPTION_GAP_PX;

/**
 * ECharts grid.bottom — month labels + endpoint clearance.
 * Compact chrome: was 48; −20px empty air → 28 (month ticks must remain readable).
 */
export const TIMELINE_GRID_BOTTOM_PX = 28;
