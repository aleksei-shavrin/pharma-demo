/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  SCHEDULE_ZOOM_DEFAULT_INDEX,
  SCHEDULE_ZOOM_LEVELS,
  canZoomIn,
  canZoomOut,
  chartViewportCenterPosPx,
  formatZoomMonthCellHtml,
  paddedLeftChartScrollX,
  readGanttZoomApi,
  scheduleZoomVendorLevels,
  scrollXKeepingDateOffset,
} from './schedule-gantt-zoom';
import { centeredChartScrollX } from './schedule-scroll-anchor';

describe('schedule-gantt-zoom', () => {
  it('five month-density levels; default 384px (index 3); all unit=month', () => {
    expect(SCHEDULE_ZOOM_LEVELS).toHaveLength(5);
    expect(SCHEDULE_ZOOM_LEVELS.every((l) => l.unit === 'month')).toBe(true);
    expect(SCHEDULE_ZOOM_LEVELS.map((l) => l.minColumnWidth)).toEqual([
      48, 96, 192, 384, 768,
    ]);
    expect(SCHEDULE_ZOOM_LEVELS[SCHEDULE_ZOOM_DEFAULT_INDEX]?.minColumnWidth).toBe(
      384,
    );
    expect(SCHEDULE_ZOOM_DEFAULT_INDEX).toBe(3);
    expect(canZoomOut(0)).toBe(false);
    expect(canZoomIn(4)).toBe(false);
    expect(canZoomIn(SCHEDULE_ZOOM_DEFAULT_INDEX)).toBe(true);
  });

  it('default density is ~5.3× legacy 72px month column', () => {
    const def = SCHEDULE_ZOOM_LEVELS[SCHEDULE_ZOOM_DEFAULT_INDEX]!.minColumnWidth;
    expect(def / 72).toBeCloseTo(5.333, 2);
  });

  it('month cells are uppercase RU', () => {
    expect(formatZoomMonthCellHtml(new Date(2027, 8, 15))).toMatch(/СЕН/);
  });

  it('vendor levels expose min_column_width and month format', () => {
    const levels = scheduleZoomVendorLevels();
    expect(levels[2]?.min_column_width).toBe(192);
    expect(levels[2]?.scales[0]?.unit).toBe('month');
    expect(typeof levels[2]?.scales[0]?.format).toBe('function');
  });

  it('paddedLeftChartScrollX keeps bar inset from left clip', () => {
    expect(paddedLeftChartScrollX(400, 80, 2000)).toBe(320);
    expect(paddedLeftChartScrollX(40, 80, 2000)).toBe(0);
    expect(paddedLeftChartScrollX(1900, 80, 1000)).toBe(1000);
  });

  it('center-date roundtrip keeps the same scroll X after fake rescale', () => {
    const scrollBefore = 120;
    const viewport = 800;
    const max = 5000;
    const centerPos = chartViewportCenterPosPx(scrollBefore, viewport);
    expect(centerPos).toBe(520);
    // Same scale: pos unchanged → restore centers again → same X.
    const scrollAfter = centeredChartScrollX(centerPos, viewport, max);
    expect(scrollAfter).toBe(scrollBefore);
    // Density rescale doubles all positions; offset rule keeps center date.
    const posAfter = centerPos * 2;
    const offset = centerPos - scrollBefore;
    expect(scrollXKeepingDateOffset(posAfter, offset, max)).toBe(
      centeredChartScrollX(posAfter, viewport, max),
    );
  });

  it('scrollXKeepingDateOffset preserves selected-bar offset (±1px)', () => {
    const barPosBefore = 900;
    const scrollBefore = 400;
    const offset = barPosBefore - scrollBefore; // 500
    const barPosAfter = 1800; // 2× density
    expect(scrollXKeepingDateOffset(barPosAfter, offset, 10000)).toBe(1300);
    expect(scrollXKeepingDateOffset(50, 80, 10000)).toBe(0);
    expect(scrollXKeepingDateOffset(Number.NaN, 10, 100)).toBe(0);
    expect(scrollXKeepingDateOffset(50, Number.NaN, 100)).toBe(50);
    expect(chartViewportCenterPosPx(Number.NaN, 800)).toBe(0);
    expect(chartViewportCenterPosPx(100, Number.NaN)).toBe(100);
  });

  it('readGanttZoomApi requires init+zoomIn+zoomOut+setLevel', () => {
    expect(readGanttZoomApi({})).toBeNull();
    expect(
      readGanttZoomApi({
        ext: {
          zoom: {
            init: () => {},
            zoomIn: () => {},
            zoomOut: () => {},
          } as never,
        },
      }),
    ).toBeNull();
    expect(
      readGanttZoomApi({
        ext: {
          zoom: {
            init: () => {},
            zoomIn: () => {},
            zoomOut: () => {},
            setLevel: () => {},
          },
        },
      }),
    ).not.toBeNull();
  });
});
