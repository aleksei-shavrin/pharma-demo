/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { placeScheduleChartPopover } from './schedule-chart-popover-placement';

describe('placeScheduleChartPopover', () => {
  const panel = { width: 200, height: 100 };
  const viewport = { width: 1000, height: 600 };

  it('centers under owner when space below is enough', () => {
    const pos = placeScheduleChartPopover(
      { left: 400, top: 100, right: 480, bottom: 120, width: 80 },
      panel,
      viewport,
    );
    expect(pos.placeAbove).toBe(false);
    expect(pos.left).toBe(340); // 440-100
    expect(pos.top).toBe(128); // 120+8
  });

  it('flips above near bottom edge and clamps X on left', () => {
    const pos = placeScheduleChartPopover(
      { left: 10, top: 520, right: 50, bottom: 540, width: 40 },
      panel,
      viewport,
    );
    expect(pos.placeAbove).toBe(true);
    expect(pos.left).toBe(8);
    expect(pos.top + panel.height).toBeLessThanOrEqual(520);
  });

  it('clamps right edge so panel stays in viewport', () => {
    const pos = placeScheduleChartPopover(
      { left: 900, top: 50, right: 980, bottom: 70, width: 80 },
      panel,
      viewport,
    );
    expect(pos.left + panel.width).toBeLessThanOrEqual(1000 - 8);
  });

  it('accepts zero panel size fallbacks and still clamps', () => {
    const pos = placeScheduleChartPopover(
      { left: 0, top: 0, right: 10, bottom: 10, width: 10 },
      { width: 0, height: 0 },
      { width: 400, height: 300 },
    );
    expect(pos.left).toBeGreaterThanOrEqual(8);
    expect(pos.top).toBeGreaterThanOrEqual(8);
  });
});
