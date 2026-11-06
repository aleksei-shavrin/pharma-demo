import { describe, expect, it } from 'vitest';
import {
  clampScroll,
  emptyScheduleScrollAnchor,
  isoFromDate,
} from './schedule-scroll-anchor';

describe('якорь прокрутки календарного плана', () => {
  it('обрезает позицию по доступному диапазону', () => {
    expect(clampScroll(-10, 100)).toBe(0);
    expect(clampScroll(40, 100)).toBe(40);
    expect(clampScroll(180, 100)).toBe(100);
    expect(clampScroll(Number.NaN, 100)).toBe(0);
    expect(clampScroll(10, Number.NaN)).toBe(0);
  });

  it('пишет локальную дату без сдвига суток', () => {
    expect(isoFromDate(new Date(2027, 2, 1))).toBe('2027-03-01');
  });

  it('начинает с пустого якоря', () => {
    expect(emptyScheduleScrollAnchor()).toEqual({
      rowKey: null,
      rowOffsetPx: 0,
      tableScrollLeft: 0,
      chartDateIso: null,
      verticalScrollTop: 0,
    });
  });
});
