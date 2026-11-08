import { describe, expect, it } from 'vitest';
import {
  filtersFromSearchParams,
  mergeRegisterSearchParams,
  searchParamsFromFilters,
  DEFAULT_REGISTER_FILTERS,
} from './register-filters';

describe('register deep-link query contract', () => {
  it('maps active issues without conflating RAG', () => {
    const f = filtersFromSearchParams(
      new URLSearchParams('type=Issue&issueStatus=active'),
    );
    expect(f.type).toBe('Issue');
    expect(f.issueStatus).toBe('active');
    expect(f.rag).toBe('all');
  });

  it('maps red risks via rag=Red (not attention)', () => {
    const f = filtersFromSearchParams(
      new URLSearchParams('type=Risk&rag=Red'),
    );
    expect(f.type).toBe('Risk');
    expect(f.rag).toBe('Red');
    expect(f.attention).toBe('all');
  });

  it('maps critical delayed equipment', () => {
    const f = filtersFromSearchParams(
      new URLSearchParams('critical=1&status=Delayed'),
    );
    expect(f.critical).toBe('1');
    expect(f.equipmentStatus).toBe('Delayed');
  });

  it('round-trips filters to search params', () => {
    const f = {
      ...DEFAULT_REGISTER_FILTERS,
      type: 'Risk' as const,
      rag: 'Red' as const,
    };
    const q = searchParamsFromFilters(f);
    expect(q.get('type')).toBe('Risk');
    expect(q.get('rag')).toBe('Red');
    expect(q.get('attention')).toBeNull();
  });

  it('mergeRegisterSearchParams keeps non-filter context keys', () => {
    const current = new URLSearchParams('foo=bar');
    const merged = mergeRegisterSearchParams(current, {
      ...DEFAULT_REGISTER_FILTERS,
      query: 'DEC-001',
    });
    expect(merged.get('foo')).toBe('bar');
    expect(merged.get('q')).toBe('DEC-001');
  });

  it('mergeRegisterSearchParams can retain dashboard program context', () => {
    const current = new URLSearchParams('q=old&program=PRG-CON&attention=attention');
    const merged = mergeRegisterSearchParams(
      current,
      { ...DEFAULT_REGISTER_FILTERS, query: 'new' },
      { retainKeys: ['program'] },
    );
    expect(merged.get('q')).toBe('new');
    expect(merged.get('attention')).toBeNull();
    expect(merged.get('program')).toBe('PRG-CON');
  });
});
