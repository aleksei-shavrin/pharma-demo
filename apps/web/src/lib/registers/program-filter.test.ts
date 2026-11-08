import { describe, expect, it } from 'vitest';
import {
  matchesProgramFilter,
  programFilterLabel,
  programLabelForWorkstream,
  PROGRAM_FILTER_OPTIONS,
} from './program-filter';

describe('program-filter', () => {
  it('exposes 7 programs + all', () => {
    expect(PROGRAM_FILTER_OPTIONS.map((o) => o.id)).toEqual([
      'all',
      'PRG-DSN',
      'PRG-CON',
      'PRG-ENG',
      'PRG-EQP',
      'PRG-DIG',
      'PRG-STA',
      'PRG-ORG',
    ]);
  });

  it('matches all / WS tags / untagged programs', () => {
    expect(matchesProgramFilter('all', 'WS-CLN')).toBe(true);
    expect(matchesProgramFilter('PRG-CON', 'WS-CLN')).toBe(true);
    expect(matchesProgramFilter('PRG-CON', 'WS-AUT')).toBe(false);
    expect(matchesProgramFilter('PRG-DSN', null)).toBe(true);
    expect(matchesProgramFilter('PRG-DSN', 'WS-BLD')).toBe(false);
    expect(matchesProgramFilter('PRG-ORG', undefined)).toBe(true);
    expect(matchesProgramFilter('nope' as never, 'WS-CLN')).toBe(true);
  });

  it('labels programs and maps legacy WS tags', () => {
    expect(programFilterLabel('PRG-ENG')).toContain('Инженер');
    expect(programFilterLabel('PRG-ZZZ' as never)).toBe('PRG-ZZZ');
    expect(programLabelForWorkstream('WS-QC')).toBe('Запуск');
    expect(programLabelForWorkstream(null)).toBe('—');
    expect(programLabelForWorkstream('WS-NOPE')).toBe('WS-NOPE');
  });
});
