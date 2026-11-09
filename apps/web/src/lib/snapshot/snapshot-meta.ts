import type { SnapshotId } from './snapshot-id';
import { SNAPSHOT_IDS, snapshotDisplayLabel } from './snapshot-id';
import { formatDateRu } from '@/lib/format/ru';

/**
 * Demo narrative as-of dates (DOC-PROD-024 / lifecycle matrix 01–19).
 * Not a substitute for committed API `scenarioAsOfDate` on the active trigger.
 * Locked by contract test against the approved calendar.
 */
export const SNAPSHOT_AS_OF: Record<SnapshotId, string> = {
  '01': '2027-02-15',
  '02': '2027-02-28',
  '03': '2027-03-01',
  '04': '2027-03-20',
  '05': '2027-04-10',
  '06': '2027-04-20',
  '07': '2027-05-15',
  '08': '2027-06-01',
  '09': '2027-06-20',
  '10': '2027-07-05',
  '11': '2027-07-20',
  '12': '2027-08-01',
  '13': '2027-08-12',
  '14': '2027-08-22',
  '15': '2027-09-01',
  '16': '2027-09-10',
  '17': '2027-09-15',
  '18': '2027-09-18',
  '19': '2027-09-22',
};

/** Short RU context for selector disclosure (presentation only). */
export const SNAPSHOT_CONTEXT_RU: Record<SnapshotId, string> = {
  '01': 'Базовый план',
  '02': 'Локальные отклонения',
  '03': 'Срыв HVAC / Production Start',
  '04': 'Каскад готовности',
  '05': 'Параллельное давление',
  '06': 'Управленческие решения',
  '07': 'Частичное восстановление',
  '08': 'Остаточный риск',
  '09': 'Восстановление инженерных систем / автоматизация',
  '10': 'Волна монтажа производства',
  '11': 'Прогресс; Production Start ещё +14',
  '12': 'Интеграция BMS/EMS',
  '13': 'Готовность к демо-гейту IQ',
  '14': 'Решения пусконаладки',
  '15': 'Явное восстановление сценария +7',
  '16': 'PQ / финальная готовность',
  '17': 'Базовая дата без фактического старта',
  '18': 'Go / No-Go',
  '19': 'Production Start достигнут',
};

export function snapshotAsOfRu(id: SnapshotId): string {
  return formatDateRu(SNAPSHOT_AS_OF[id]);
}

export function snapshotOptionLabel(id: SnapshotId): string {
  return `${snapshotDisplayLabel(id)} — ${snapshotAsOfRu(id)} — ${SNAPSHOT_CONTEXT_RU[id]}`;
}

/** Every SnapshotId must have as-of + RU context (compile-time completeness). */
export function assertSnapshotMetaComplete(): void {
  for (const id of SNAPSHOT_IDS) {
    if (!SNAPSHOT_AS_OF[id] || !SNAPSHOT_CONTEXT_RU[id]) {
      throw new Error(`Missing snapshot meta for ${id}`);
    }
  }
}
