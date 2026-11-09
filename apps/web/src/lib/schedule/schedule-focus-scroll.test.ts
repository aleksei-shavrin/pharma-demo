import { describe, expect, it } from 'vitest';
import {
  centeredChartScrollX,
  centeredOwnedScrollTop,
  clampScroll,
} from './schedule-scroll-anchor';
import { SCHEDULE_ROW_HEIGHT_PX } from './schedule-geometry';
import { parseSelectionKeyId } from './selection-key';

describe('schedule focus reveal / center math', () => {
  it('centers chart date in viewport and clamps at edges', () => {
    const viewport = 800;
    const max = 4000;
    expect(centeredChartScrollX(2000, viewport, max)).toBe(1600);
    expect(centeredChartScrollX(100, viewport, max)).toBe(0);
    expect(centeredChartScrollX(4800, viewport, max)).toBe(max);
    expect(centeredChartScrollX(Number.NaN, viewport, max)).toBe(0);
  });

  it('centers owned vertical scroll with row-height mid and clamps', () => {
    const vh = 640;
    const max = 10000;
    const idx = 100;
    const expected =
      idx * SCHEDULE_ROW_HEIGHT_PX - vh / 2 + SCHEDULE_ROW_HEIGHT_PX / 2;
    expect(
      centeredOwnedScrollTop(idx, SCHEDULE_ROW_HEIGHT_PX, vh, max),
    ).toBe(expected);
    expect(centeredOwnedScrollTop(0, SCHEDULE_ROW_HEIGHT_PX, vh, max)).toBe(0);
    expect(
      centeredOwnedScrollTop(5000, SCHEDULE_ROW_HEIGHT_PX, vh, 50),
    ).toBe(50);
  });

  it('parses focus query selection keys; rejects invalid', () => {
    expect(parseSelectionKeyId('milestone:MS-BLD-EXC')).toEqual({
      kind: 'milestone',
      entityId: 'MS-BLD-EXC',
    });
    expect(parseSelectionKeyId('milestone:MS-DOES-NOT-EXIST')?.entityId).toBe(
      'MS-DOES-NOT-EXIST',
    );
    expect(parseSelectionKeyId('not-a-key')).toBeNull();
    expect(parseSelectionKeyId('')).toBeNull();
  });

  it('clampScroll matches center helpers at zero/max', () => {
    expect(clampScroll(-5, 10)).toBe(0);
    expect(clampScroll(15, 10)).toBe(10);
  });
});
