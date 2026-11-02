import { describe, expect, it } from 'vitest';
import { formatRubRu } from './ru';

describe('formatRubRu', () => {
  it('formats integer RUB with grouping', () => {
    expect(formatRubRu(6_200_000_000)).toBe('6 200 000 000 ₽');
    expect(formatRubRu(-80_000_000)).toBe('−80 000 000 ₽');
    expect(formatRubRu(0)).toBe('0 ₽');
  });
});
