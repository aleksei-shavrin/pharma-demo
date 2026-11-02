import type { WorkstreamId } from '@/lib/api-client';
import { presentWorkstream } from '@/lib/ui-labels';

/** Presentation filters only — no backend query API. */
export type AttentionFilter = 'all' | 'attention' | 'normal';
export type EntityTypeFilter = 'all' | 'Issue' | 'Risk';

export type RegisterFilterState = {
  attention: AttentionFilter;
  workstream: WorkstreamId | 'all';
  type: EntityTypeFilter;
  query: string;
};

export const DEFAULT_REGISTER_FILTERS: RegisterFilterState = {
  attention: 'all',
  workstream: 'all',
  type: 'all',
  query: '',
};

export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

export function matchesSearch(
  query: string,
  parts: Array<string | null | undefined>,
): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;
  return parts.some((p) => (p ?? '').toLowerCase().includes(q));
}

export function matchesWorkstream(
  filter: WorkstreamId | 'all',
  workstream: WorkstreamId | null | undefined,
): boolean {
  if (filter === 'all') return true;
  return workstream === filter;
}

export function workstreamOptionLabel(id: WorkstreamId | 'all'): string {
  return id === 'all' ? 'Все направления' : presentWorkstream(id);
}

export function attentionOptionLabel(v: AttentionFilter): string {
  if (v === 'all') return 'Все';
  if (v === 'attention') return 'Требуют внимания';
  return 'Норма / закрытые';
}

export function typeOptionLabel(v: EntityTypeFilter): string {
  if (v === 'all') return 'Все типы';
  if (v === 'Issue') return 'Проблемы';
  return 'Риски';
}

export function filtersActive(f: RegisterFilterState): boolean {
  return (
    f.attention !== 'all' ||
    f.workstream !== 'all' ||
    f.type !== 'all' ||
    normalizeQuery(f.query).length > 0
  );
}
