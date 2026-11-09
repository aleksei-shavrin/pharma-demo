import { describe, expect, it } from 'vitest';
import {
  horizontalRangesOverlap,
  resolveTopCaptionLayout,
  TIMELINE_TOP_CAPTION_COLLISION_WIDTH_PX,
} from './timeline-top-caption-layout';

describe('resolveTopCaptionLayout', () => {
  it('preserves wide single-line forecast and edge-aware align', () => {
    const mid = resolveTopCaptionLayout({ hostWidth: 900, plotRatio: 0.4 });
    expect(mid.narrow).toBe(false);
    expect(mid.forecastMultiline).toBe(false);
    expect(mid.forecastWidthPx).toBeNull();
    expect(mid.snapshotAlign).toBe('center');
    expect(mid.snapshotMaxWidthPx).toBe(144);

    const nearEnd = resolveTopCaptionLayout({
      hostWidth: 900,
      plotRatio: 0.9,
    });
    expect(nearEnd.snapshotAlign).toBe('end');
  });

  it('wraps forecast and end-aligns caption under collision width', () => {
    const layout = resolveTopCaptionLayout({
      hostWidth: TIMELINE_TOP_CAPTION_COLLISION_WIDTH_PX - 1,
      plotRatio: 0.55,
    });
    expect(layout.narrow).toBe(true);
    expect(layout.snapshotAlign).toBe('end');
    expect(layout.forecastMultiline).toBe(true);
    expect(layout.forecastWidthPx).toBe(72);
    expect(layout.snapshotMaxWidthPx).toBeLessThan(144);
  });
});

describe('horizontalRangesOverlap', () => {
  it('detects inclusive X overlap with optional gap', () => {
    expect(horizontalRangesOverlap(0, 40, 50, 90)).toBe(false);
    expect(horizontalRangesOverlap(0, 40, 39, 90)).toBe(true);
    expect(horizontalRangesOverlap(0, 40, 45, 90, 8)).toBe(true);
    expect(horizontalRangesOverlap(0, 40, 49, 90, 8)).toBe(false);
  });
});
