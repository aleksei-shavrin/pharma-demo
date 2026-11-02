import type { WorkstreamDetail } from '@/lib/api-client';

/** Compact director preview — not a full register. */
export const WORKSTREAM_SECTION_PREVIEW_LIMIT = 4;

type Milestone = WorkstreamDetail['milestones'][number];
type Equipment = WorkstreamDetail['equipment'][number];
type Issue = WorkstreamDetail['issues'][number];
type Risk = WorkstreamDetail['risks'][number];
type Decision = WorkstreamDetail['decisions'][number];

export type AttentionRow =
  | { kind: 'issue'; item: Issue }
  | { kind: 'risk'; item: Risk };

function ragRank(rag: 'Green' | 'Red'): number {
  return rag === 'Red' ? 0 : 1;
}

function equipmentRank(e: Equipment): number {
  if (e.status === 'Delayed' && e.critical) return 0;
  if (e.status === 'Delayed') return 1;
  if (e.critical) return 2;
  return 3;
}

function issueRank(status: Issue['status']): number {
  if (status === 'Open') return 0;
  if (status === 'Mitigating') return 1;
  return 2;
}

function attentionRank(row: AttentionRow): number {
  // Attention first: Red risks → Open/Mitigating → calm Green risks → Closed.
  if (row.kind === 'risk' && row.item.rag === 'Red') return 0;
  if (row.kind === 'issue' && row.item.status !== 'Closed') {
    return 10 + issueRank(row.item.status);
  }
  if (row.kind === 'risk') return 20;
  return 30;
}

export function sortMilestonesForPreview(items: Milestone[]): Milestone[] {
  return [...items].sort((a, b) => {
    const rag = ragRank(a.rag) - ragRank(b.rag);
    if (rag !== 0) return rag;
    return a.forecastDate.localeCompare(b.forecastDate);
  });
}

export function sortEquipmentForPreview(items: Equipment[]): Equipment[] {
  return [...items].sort((a, b) => {
    const rank = equipmentRank(a) - equipmentRank(b);
    if (rank !== 0) return rank;
    return a.forecastDelivery.localeCompare(b.forecastDelivery);
  });
}

export function sortAttentionForPreview(
  issues: Issue[],
  risks: Risk[],
): AttentionRow[] {
  const rows: AttentionRow[] = [
    ...risks.map((item) => ({ kind: 'risk' as const, item })),
    ...issues.map((item) => ({ kind: 'issue' as const, item })),
  ];
  return rows.sort((a, b) => {
    const rank = attentionRank(a) - attentionRank(b);
    if (rank !== 0) return rank;
    return a.item.id.localeCompare(b.item.id);
  });
}

export function sortDecisionsForPreview(items: Decision[]): Decision[] {
  return [...items].sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.id.localeCompare(b.id);
  });
}

export function previewSlice<T>(
  items: T[],
  expanded: boolean,
  limit = WORKSTREAM_SECTION_PREVIEW_LIMIT,
): { visible: T[]; total: number; overflow: boolean } {
  const total = items.length;
  const overflow = total > limit;
  if (expanded || !overflow) {
    return { visible: items, total, overflow };
  }
  return { visible: items.slice(0, limit), total, overflow };
}
