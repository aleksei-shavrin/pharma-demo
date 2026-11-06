import { describe, expect, it } from 'vitest';
import { trendHeading } from './trend-heading';

describe('trendHeading', () => {
  it('у A нет предыдущей буквы', () => {
    expect(trendHeading('A')).toBe('Изменения по сценарию');
  });

  it('называет предыдущую букву сценария, а не открытый до этого снимок', () => {
    expect(trendHeading('B')).toBe('Изменения к снимку A');
    expect(trendHeading('C')).toBe('Изменения к снимку B');
    expect(trendHeading('F')).toBe('Изменения к снимку E');
  });
});
