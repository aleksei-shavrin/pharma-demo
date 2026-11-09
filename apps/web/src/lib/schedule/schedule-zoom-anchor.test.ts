/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { centeredChartScrollX } from './schedule-scroll-anchor';
import {
  pickNearestRowDateFocus,
  pickZoomAnchor,
  zoomAnchorFocusPos,
  zoomAnchorIntersectsViewport,
  type ZoomAnchorCandidate,
} from './schedule-zoom-anchor';

describe('schedule-zoom-anchor', () => {
  const scrollX = 100;
  const vw = 400; // view [100, 500], center 300

  it('long bar intersecting viewport uses midpoint even when start is left of clip', () => {
    const bar: ZoomAnchorCandidate = {
      id: 'work:1',
      startPos: 40,
      endPos: 360,
    };
    expect(zoomAnchorIntersectsViewport(bar, scrollX, vw)).toBe(true);
    expect(zoomAnchorFocusPos(bar)).toBe(200);
  });

  it('milestone uses exact date; out-of-view start-only bar rejected', () => {
    const ms: ZoomAnchorCandidate = {
      id: 'milestone:MS-1',
      startPos: 250,
      point: true,
    };
    expect(zoomAnchorFocusPos(ms)).toBe(250);
    const far: ZoomAnchorCandidate = {
      id: 'work:far',
      startPos: 900,
      endPos: 950,
    };
    expect(zoomAnchorIntersectsViewport(far, scrollX, vw)).toBe(false);
  });

  it('prefers selected intersecting bar over nearer neighbor', () => {
    const candidates: ZoomAnchorCandidate[] = [
      { id: 'work:near', startPos: 280, endPos: 320 },
      { id: 'work:sel', startPos: 50, endPos: 450 },
    ];
    const pick = pickZoomAnchor(candidates, {
      scrollX,
      viewportWidthPx: vw,
      selectedId: 'work:sel',
    });
    expect(pick?.reason).toBe('selected');
    expect(pick?.id).toBe('work:sel');
    expect(pick?.focusPos).toBe(250);
  });

  it('without selection picks nearest visible to center', () => {
    const candidates: ZoomAnchorCandidate[] = [
      { id: 'work:a', startPos: 120, endPos: 160 },
      { id: 'work:b', startPos: 290, endPos: 310 },
      { id: 'milestone:m', startPos: 480, point: true },
    ];
    const pick = pickZoomAnchor(candidates, {
      scrollX,
      viewportWidthPx: vw,
      selectedId: null,
    });
    expect(pick?.reason).toBe('nearest-visible');
    expect(pick?.id).toBe('work:b');
  });

  it('empty center date is never returned — null when nothing intersects', () => {
    const candidates: ZoomAnchorCandidate[] = [
      { id: 'work:far', startPos: 2000, endPos: 2100 },
    ];
    expect(
      pickZoomAnchor(candidates, {
        scrollX,
        viewportWidthPx: vw,
        selectedId: 'work:far',
      }),
    ).toBeNull();
  });

  it('row-date fallback picks nearest logical date when bars off-screen', () => {
    const pick = pickNearestRowDateFocus(
      [
        { id: 'work:a', pos: 50 },
        { id: 'work:b', pos: 800 },
      ],
      scrollX,
      vw,
    );
    expect(pick?.reason).toBe('row-date');
    expect(pick?.id).toBe('work:a');
    expect(pick?.focusPos).toBe(50);
  });

  it('centering focus within 2px after fake rescale (clamped at edges)', () => {
    const focusBefore = 250;
    const max = 5000;
    const x = centeredChartScrollX(focusBefore, vw, max);
    // After 2× density the same calendar focus maps to 500
    const focusAfter = 500;
    const xAfter = centeredChartScrollX(focusAfter, vw, max);
    expect(Math.abs(xAfter + vw / 2 - focusAfter)).toBeLessThanOrEqual(2);
    expect(Math.abs(x + vw / 2 - focusBefore)).toBeLessThanOrEqual(2);
    // edge clamp
    expect(centeredChartScrollX(10, vw, max)).toBe(0);
  });

  it('rejects NaN geometry and empty row-date lists', () => {
    expect(
      zoomAnchorIntersectsViewport(
        { id: 'x', startPos: Number.NaN },
        0,
        100,
      ),
    ).toBe(false);
    expect(zoomAnchorFocusPos({ id: 'x', startPos: Number.NaN })).toBeNaN();
    expect(pickNearestRowDateFocus([], 0, 100)).toBeNull();
    expect(
      pickNearestRowDateFocus([{ id: 'bad', pos: Number.NaN }], 0, 100),
    ).toBeNull();
  });
});
