import { describe, expect, it } from 'vitest';
import {
  SCHEDULE_VIRTUAL_OVERSCAN_ROWS,
  computeScheduleVirtualWindow,
  virtualWindowDomBudget,
  virtualWindowSpacerPx,
} from './schedule-virtual-window';
import { SCHEDULE_ROW_HEIGHT_PX } from './schedule-geometry';

describe('computeScheduleVirtualWindow', () => {
  it('returns empty window for zero rows', () => {
    const w = computeScheduleVirtualWindow({
      scrollTop: 0,
      viewportHeight: 640,
      rowCount: 0,
    });
    expect(w).toMatchObject({ startIndex: 0, endIndex: 0, rowCount: 0 });
  });

  it('keeps last row reachable at end scroll', () => {
    const rowCount = 688;
    const viewportHeight = 640;
    const scrollTop = rowCount * SCHEDULE_ROW_HEIGHT_PX - viewportHeight;
    const w = computeScheduleVirtualWindow({
      scrollTop,
      viewportHeight,
      rowCount,
    });
    expect(w.endIndex).toBe(rowCount);
    expect(w.startIndex).toBeLessThan(rowCount);
    const { topPx, bottomPx } = virtualWindowSpacerPx(w);
    expect(topPx + (w.endIndex - w.startIndex) * w.rowHeight + bottomPx).toBe(
      rowCount * SCHEDULE_ROW_HEIGHT_PX,
    );
  });

  it('bounds DOM rows under budget with overscan', () => {
    const viewportHeight = 640;
    const w = computeScheduleVirtualWindow({
      scrollTop: 4000,
      viewportHeight,
      rowCount: 688,
    });
    const mounted = w.endIndex - w.startIndex;
    expect(mounted).toBeLessThanOrEqual(
      virtualWindowDomBudget(viewportHeight),
    );
    expect(mounted).toBeGreaterThan(SCHEDULE_VIRTUAL_OVERSCAN_ROWS);
  });

  it('clamps mid scroll without negative spacers', () => {
    const w = computeScheduleVirtualWindow({
      scrollTop: 320,
      viewportHeight: 320,
      rowCount: 40,
      overscan: 2,
    });
    const spacers = virtualWindowSpacerPx(w);
    expect(spacers.topPx).toBeGreaterThanOrEqual(0);
    expect(spacers.bottomPx).toBeGreaterThanOrEqual(0);
    expect(w.startIndex).toBeGreaterThanOrEqual(0);
    expect(w.endIndex).toBeLessThanOrEqual(40);
  });
});
