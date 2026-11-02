import type { SnapshotId } from './snapshot-id';
import { SNAPSHOT_IDS } from './snapshot-id';
import { formatDateRu } from '@/lib/format/ru';

/**
 * Demo narrative as-of dates for selector option labels (DOC-PROD-022).
 * Not a substitute for committed API `scenarioAsOfDate` on the active trigger.
 * Locked by contract test against the approved A–H calendar.
 */
export const SNAPSHOT_AS_OF: Record<SnapshotId, string> = {
  A: '2027-02-15',
  B: '2027-02-28',
  C: '2027-03-01',
  D: '2027-03-20',
  E: '2027-04-10',
  F: '2027-04-20',
  G: '2027-05-15',
  H: '2027-06-01',
};

/** Short RU context for selector disclosure (presentation only). */
export const SNAPSHOT_CONTEXT_RU: Record<SnapshotId, string> = {
  A: 'Базовый план',
  B: 'Локальные отклонения',
  C: 'Срыв HVAC / Production Start',
  D: 'Каскад готовности',
  E: 'Параллельное давление',
  F: 'Управленческие решения',
  G: 'Частичное восстановление',
  H: 'Остаточный риск',
};

export function snapshotAsOfRu(id: SnapshotId): string {
  return formatDateRu(SNAPSHOT_AS_OF[id]);
}

export function snapshotOptionLabel(id: SnapshotId): string {
  return `${id} — ${snapshotAsOfRu(id)} — ${SNAPSHOT_CONTEXT_RU[id]}`;
}

/** Every SnapshotId must have as-of + RU context (compile-time completeness). */
export function assertSnapshotMetaComplete(): void {
  for (const id of SNAPSHOT_IDS) {
    if (!SNAPSHOT_AS_OF[id] || !SNAPSHOT_CONTEXT_RU[id]) {
      throw new Error(`Missing snapshot meta for ${id}`);
    }
  }
}
