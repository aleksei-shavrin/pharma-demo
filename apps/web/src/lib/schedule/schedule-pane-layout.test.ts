/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { resolveScheduleTimelineLayout } from './schedule-pane-layout';

describe('resolveScheduleTimelineLayout', () => {
  it('ставит столбец при колонке 308px', () => {
    expect(resolveScheduleTimelineLayout(308)).toBe('stack');
  });

  it('ставит столбец при колонке 720px', () => {
    expect(resolveScheduleTimelineLayout(720)).toBe('stack');
  });

  it('ставит столбец при окне 1024px со сайдбаром (колонка 696px)', () => {
    expect(resolveScheduleTimelineLayout(696)).toBe('stack');
  });

  it('ставит ряд при окне 1023px без сайдбара (колонка 935px)', () => {
    expect(resolveScheduleTimelineLayout(935)).toBe('row');
  });

  it('ставит ряд при колонке 1200px', () => {
    expect(resolveScheduleTimelineLayout(1200)).toBe('row');
  });
});
