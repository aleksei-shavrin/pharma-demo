import { EXPERIMENT_NARROW_LABEL_WIDTH_PX } from './executive-timeline-experiment-labels';
import type { SnapshotLabelAlign } from './executive-timeline-experiment-labels';

/** Card-inner plot width where top captions collide on Snapshot 03-class layouts. */
export const TIMELINE_TOP_CAPTION_COLLISION_WIDTH_PX = 420;

export type TopCaptionLayout = {
  narrow: boolean;
  snapshotAlign: SnapshotLabelAlign;
  snapshotMaxWidthPx: number;
  forecastWidthPx: number | null;
  forecastMultiline: boolean;
  forecastGapPx: number;
};

/**
 * Responsive contract for «Дата снимка» vs red PS forecast label.
 * Wide: preserve default center/edge align + single-line forecast.
 * Narrow: end-align caption to as-of, wrap forecast, reserve horizontal gap.
 */
export function resolveTopCaptionLayout(opts: {
  hostWidth: number;
  plotRatio: number;
}): TopCaptionLayout {
  const narrow =
    opts.hostWidth > 0 &&
    opts.hostWidth < TIMELINE_TOP_CAPTION_COLLISION_WIDTH_PX;
  if (!narrow) {
    let snapshotAlign: SnapshotLabelAlign = 'center';
    if (opts.plotRatio < 0.08) snapshotAlign = 'start';
    else if (opts.plotRatio > 0.85) snapshotAlign = 'end';
    return {
      narrow: false,
      snapshotAlign,
      snapshotMaxWidthPx: 144,
      forecastWidthPx: null,
      forecastMultiline: false,
      forecastGapPx: 8,
    };
  }
  return {
    narrow: true,
    // Keep caption to the left of the dashed line so it does not grow into forecast.
    snapshotAlign: 'end',
    snapshotMaxWidthPx: 80,
    // Keep right-aligned forecast from extending left across the as-of caption.
    forecastWidthPx: 72,
    forecastMultiline: true,
    forecastGapPx: 10,
  };
}

/** Axis-aligned rects overlap horizontally (inclusive), ignoring Y. */
export function horizontalRangesOverlap(
  aLeft: number,
  aRight: number,
  bLeft: number,
  bRight: number,
  gapPx = 0,
): boolean {
  return aLeft < bRight + gapPx && bLeft < aRight + gapPx;
}

export function isTimelineHostNarrow(hostWidth: number): boolean {
  return hostWidth > 0 && hostWidth < EXPERIMENT_NARROW_LABEL_WIDTH_PX;
}
