import { describe, expect, it } from 'vitest';
import { trendHeading } from './trend-heading';

describe('trendHeading', () => {
  it('у A нет предыдущей буквы', () => {
    expect(trendHeading('01')).toBe('Изменения по сценарию');
  });

  it('называет ordinal предшественника, а не открытый до этого снимок', () => {
    expect(trendHeading('02')).toBe('Изменения к снимку 01');
    expect(trendHeading('03')).toBe('Изменения к снимку 02');
    expect(trendHeading('06')).toBe('Изменения к снимку 05');
    expect(trendHeading('10')).toBe('Изменения к снимку 09');
  });
});
