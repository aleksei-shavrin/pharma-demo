/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { daysWord, formatDateRu, formatDeltaDays } from './ru';

describe('formatDateRu', () => {
  it('formats ISO to DD.MM.YYYY', () => {
    expect(formatDateRu('2027-03-02')).toBe('02.03.2027');
    expect(formatDateRu('2027-10-06')).toBe('06.10.2027');
  });
});

describe('daysWord / formatDeltaDays', () => {
  it('handles Russian plurals', () => {
    expect(daysWord(1)).toBe('день');
    expect(daysWord(21)).toBe('день');
    expect(daysWord(2)).toBe('дня');
    expect(daysWord(4)).toBe('дня');
    expect(daysWord(5)).toBe('дней');
    expect(daysWord(11)).toBe('дней');
  });

  it('formats deltas', () => {
    expect(formatDeltaDays(0)).toBe('без отклонения');
    expect(formatDeltaDays(21)).toBe('+21 день');
    expect(formatDeltaDays(-3)).toBe('−3 дня');
  });
});
