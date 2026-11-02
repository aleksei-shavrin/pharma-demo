import type { SnapshotId } from './snapshot-id';
import { SNAPSHOT_IDS } from './snapshot-id';
import { formatDateRu } from '@/lib/format/ru';

/**
 * Demo narrative as-of dates (DOC-PROD-024 / lifecycle matrix A–S).
 * Not a substitute for committed API `scenarioAsOfDate` on the active trigger.
 * Locked by contract test against the approved calendar.
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
  I: '2027-06-20',
  J: '2027-07-05',
  K: '2027-07-20',
  L: '2027-08-01',
  M: '2027-08-12',
  N: '2027-08-22',
  O: '2027-09-01',
  P: '2027-09-10',
  Q: '2027-09-15',
  R: '2027-09-18',
  S: '2027-09-22',
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
  I: 'Восстановление инженерных систем / автоматизация',
  J: 'Волна монтажа производства',
  K: 'Прогресс; Production Start ещё +14',
  L: 'Интеграция BMS/EMS',
  M: 'Готовность к демо-гейту IQ',
  N: 'Решения пусконаладки',
  O: 'Явное восстановление сценария +7',
  P: 'PQ / финальная готовность',
  Q: 'Базовая дата без фактического старта',
  R: 'Go / No-Go',
  S: 'Production Start достигнут',
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
