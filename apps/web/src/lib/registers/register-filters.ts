import type { WorkstreamId } from '@/lib/api-client';
import {
  matchesProgramFilter,
  programFilterLabel,
  type ProgramFilterId,
} from '@/lib/registers/program-filter';

/** Presentation filters only — no backend query API. */
export type AttentionFilter = 'all' | 'attention' | 'normal';
export type EntityTypeFilter = 'all' | 'Issue' | 'Risk';

export type IssueStatusFilter = 'all' | 'active' | 'Closed';
export type RagFilter = 'all' | 'Red' | 'Green';
export type EquipmentStatusFilter = 'all' | 'Delayed' | 'OnTrack';
export type CriticalFilter = 'all' | '1';

export type RegisterFilterState = {
  attention: AttentionFilter;
  /** Canonical program filter (replaces user-facing «Направление»). */
  program: ProgramFilterId;
  type: EntityTypeFilter;
  query: string;
  /** Open|Mitigating when active — not the same as attention. */
  issueStatus: IssueStatusFilter;
  /** Explicit RAG filter for risks/milestones — not attention. */
  rag: RagFilter;
  equipmentStatus: EquipmentStatusFilter;
  critical: CriticalFilter;
};

export const DEFAULT_REGISTER_FILTERS: RegisterFilterState = {
  attention: 'all',
  program: 'all',
  type: 'all',
  query: '',
  issueStatus: 'all',
  rag: 'all',
  equipmentStatus: 'all',
  critical: 'all',
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
  workstream: string | null | undefined,
): boolean {
  if (filter === 'all') return true;
  return workstream === filter;
}

export function matchesProgram(
  filter: ProgramFilterId,
  workstream: string | null | undefined,
): boolean {
  return matchesProgramFilter(filter, workstream);
}

export function workstreamOptionLabel(id: WorkstreamId | 'all'): string {
  return id === 'all' ? 'Все программы' : id;
}

export function programOptionLabel(id: ProgramFilterId): string {
  return programFilterLabel(id);
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
    f.program !== 'all' ||
    f.type !== 'all' ||
    f.issueStatus !== 'all' ||
    f.rag !== 'all' ||
    f.equipmentStatus !== 'all' ||
    f.critical !== 'all' ||
    normalizeQuery(f.query).length > 0
  );
}

/** Parse dashboard deep-link query into register filters. */
export function filtersFromSearchParams(
  params: URLSearchParams,
): RegisterFilterState {
  const next = { ...DEFAULT_REGISTER_FILTERS };
  const type = params.get('type');
  if (type === 'Issue' || type === 'Risk') next.type = type;
  const attention = params.get('attention');
  if (attention === 'attention' || attention === 'active') {
    next.attention = 'attention';
  } else if (attention === 'normal') {
    next.attention = 'normal';
  }
  const issueStatus = params.get('issueStatus');
  if (issueStatus === 'active' || issueStatus === 'Closed') {
    next.issueStatus = issueStatus;
  }
  const rag = params.get('rag');
  if (rag === 'Red' || rag === 'Green') next.rag = rag;
  const status = params.get('status');
  if (status === 'Delayed' || status === 'OnTrack') {
    next.equipmentStatus = status;
  }
  const critical = params.get('critical');
  if (critical === '1') next.critical = '1';
  const q = params.get('q');
  if (q) next.query = q;
  const program = params.get('program');
  if (program) next.program = program as ProgramFilterId;
  return next;
}

/** Query keys owned by register filter state (rewritten on apply). */
export const REGISTER_FILTER_QUERY_KEYS = [
  'type',
  'attention',
  'issueStatus',
  'rag',
  'status',
  'critical',
  'program',
  'q',
] as const;

export function searchParamsFromFilters(
  f: RegisterFilterState,
): URLSearchParams {
  const p = new URLSearchParams();
  if (f.type !== 'all') p.set('type', f.type);
  if (f.attention !== 'all') p.set('attention', f.attention);
  if (f.issueStatus !== 'all') p.set('issueStatus', f.issueStatus);
  if (f.rag !== 'all') p.set('rag', f.rag);
  if (f.equipmentStatus !== 'all') p.set('status', f.equipmentStatus);
  if (f.critical !== 'all') p.set('critical', f.critical);
  if (f.program !== 'all') p.set('program', f.program);
  if (normalizeQuery(f.query)) p.set('q', f.query);
  return p;
}

/**
 * Rewrite filter keys while preserving unrelated query context.
 * Snapshot lives in sessionStorage via SnapshotProvider — not in the URL.
 * `retainKeys` keeps keys that other surfaces use as context (e.g. dashboard
 * `program`) even when they overlap the register filter vocabulary.
 */
export function mergeRegisterSearchParams(
  current: URLSearchParams,
  filters: RegisterFilterState,
  options?: { retainKeys?: readonly string[] },
): URLSearchParams {
  const retain = new Set(options?.retainKeys ?? []);
  const merged = new URLSearchParams(current.toString());
  for (const key of REGISTER_FILTER_QUERY_KEYS) {
    if (retain.has(key)) continue;
    merged.delete(key);
  }
  const next = searchParamsFromFilters(filters);
  for (const [key, value] of next.entries()) {
    merged.set(key, value);
  }
  return merged;
}
