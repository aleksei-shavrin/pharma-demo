/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import {
  baselineBox,
  forecastBarTop,
  paintBaselineOverlay,
  shouldPaintBaseline,
  type BaselinePaintTask,
} from './baseline-overlay';

const ROW_TOP = 200;
const BAR_HEIGHT = 16;
const ROW_HEIGHT = 64;

describe('baselineBox', () => {
  it('places the baseline above the centered forecast bar inside the row', () => {
    const box = baselineBox(ROW_TOP, BAR_HEIGHT, ROW_HEIGHT);
    const barTop = forecastBarTop(ROW_TOP, BAR_HEIGHT, ROW_HEIGHT);

    expect(box.height).toBe(BAR_HEIGHT);
    expect(box.top).toBeGreaterThanOrEqual(ROW_TOP);
    expect(box.top).toBeLessThan(barTop);
    expect(box.top + box.height).toBeLessThanOrEqual(barTop);
    expect(barTop - (box.top + box.height)).toBe(4);
    expect(box.top + box.height).toBeLessThanOrEqual(ROW_TOP + ROW_HEIGHT);
  });

  it('returns no box when the row has no band above the forecast bar', () => {
    expect(baselineBox(0, 30, 32)).toEqual({ top: 0, height: 0 });
    expect(baselineBox(10, 16, 16)).toEqual({ top: 10, height: 0 });
  });

  it('rejects non-finite geometry', () => {
    expect(baselineBox(Number.NaN, 16, 64)).toEqual({ top: 0, height: 0 });
  });
});

describe('shouldPaintBaseline', () => {
  it('accepts an ordered inclusive pair, including one day', () => {
    expect(shouldPaintBaseline('2027-02-26', '2027-03-08')).toBe(true);
    expect(shouldPaintBaseline('2027-03-04', '2027-03-04')).toBe(true);
  });

  it('rejects a missing end, a blank start, and an inverted interval', () => {
    expect(shouldPaintBaseline('2027-02-26', null)).toBe(false);
    expect(shouldPaintBaseline(undefined, '2027-03-08')).toBe(false);
    expect(shouldPaintBaseline('  ', '2027-03-08')).toBe(false);
    expect(shouldPaintBaseline('2027-03-08', '2027-02-26')).toBe(false);
    expect(shouldPaintBaseline('not-a-date', '2027-03-08')).toBe(false);
  });
});

describe('paintBaselineOverlay', () => {
  const withBaseline: BaselinePaintTask = {
    taskId: 'child',
    forecastTop: ROW_TOP,
    barHeight: BAR_HEIGHT,
    rowHeight: ROW_HEIGHT,
    baselineStart: '2027-02-26',
    baselineEnd: '2027-03-08',
    left: 40,
    width: 110,
  };

  it('paints a node only for a task that has a baseline', () => {
    const host = document.createElement('div');
    const painted = paintBaselineOverlay(host, [
      withBaseline,
      {
        ...withBaseline,
        taskId: 'no-baseline',
        baselineStart: null,
        baselineEnd: null,
        left: 80,
      },
    ]);

    expect(painted).toBe(1);
    const node = host.querySelector<HTMLElement>('[data-baseline-task="child"]');
    expect(node).not.toBeNull();
    expect(host.querySelector('[data-baseline-task="no-baseline"]')).toBeNull();
    expect(node?.style.top).toBe(`${baselineBox(ROW_TOP, BAR_HEIGHT, ROW_HEIGHT).top}px`);
    expect(node?.style.left).toBe('40px');
    expect(node?.style.width).toBe('110px');
  });

  it('drops a hidden task and moves the remaining bar to the new row top', () => {
    const host = document.createElement('div');
    paintBaselineOverlay(host, [
      withBaseline,
      { ...withBaseline, taskId: 'B-base', forecastTop: 264, left: 200, width: 80 },
    ]);

    const moved = paintBaselineOverlay(host, [
      { ...withBaseline, taskId: 'B-base', forecastTop: 200, left: 200, width: 80 },
    ]);

    expect(moved).toBe(1);
    expect(host.querySelector('[data-baseline-task="child"]')).toBeNull();
    const kept = host.querySelector<HTMLElement>('[data-baseline-task="B-base"]');
    expect(kept?.style.top).toBe(`${baselineBox(200, BAR_HEIGHT, ROW_HEIGHT).top}px`);
  });
});
