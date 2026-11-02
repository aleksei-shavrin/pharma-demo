import { describe, expect, it } from 'vitest';
import {
  DEFAULT_REGISTER_FILTERS,
  filtersActive,
  matchesSearch,
  matchesWorkstream,
} from './register-filters';

describe('register filters', () => {
  it('matches title and technical id search', () => {
    expect(matchesSearch('hvac', ['AHU блок', 'EQ-HVAC-01'])).toBe(true);
    expect(matchesSearch('EQ-HVAC', ['AHU блок', 'EQ-HVAC-01'])).toBe(true);
    expect(matchesSearch('xyz', ['AHU блок', 'EQ-HVAC-01'])).toBe(false);
    expect(matchesSearch('  ', ['AHU блок'])).toBe(true);
  });

  it('matches workstream including all', () => {
    expect(matchesWorkstream('all', 'WS-HVAC')).toBe(true);
    expect(matchesWorkstream('WS-HVAC', 'WS-HVAC')).toBe(true);
    expect(matchesWorkstream('WS-PKG', 'WS-HVAC')).toBe(false);
    expect(matchesWorkstream('WS-HVAC', null)).toBe(false);
  });

  it('detects active filters', () => {
    expect(filtersActive(DEFAULT_REGISTER_FILTERS)).toBe(false);
    expect(
      filtersActive({ ...DEFAULT_REGISTER_FILTERS, attention: 'attention' }),
    ).toBe(true);
    expect(
      filtersActive({ ...DEFAULT_REGISTER_FILTERS, query: 'ISS' }),
    ).toBe(true);
  });
});
