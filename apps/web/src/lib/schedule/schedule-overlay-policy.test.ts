import { describe, expect, it } from 'vitest';
import { shouldPaintComparisonGhosts } from './schedule-overlay-policy';

describe('shouldPaintComparisonGhosts', () => {
  it('skips ghosts in baseline-only', () => {
    expect(shouldPaintComparisonGhosts('baseline')).toBe(false);
  });

  it('keeps ghosts for forecast and actual', () => {
    expect(shouldPaintComparisonGhosts('forecast')).toBe(true);
    expect(shouldPaintComparisonGhosts('actual')).toBe(true);
  });
});
