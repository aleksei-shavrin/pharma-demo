import type { SnapshotId } from './snapshot-id';

/**
 * Phase groups for 01–19 selector (DOC-PROD-024). Presentation only.
 */
export type SnapshotPhaseGroup = {
  id: string;
  titleRu: string;
  ids: readonly SnapshotId[];
};

export const SNAPSHOT_PHASE_GROUPS: readonly SnapshotPhaseGroup[] = [
  { id: 'early', titleRu: 'Ранний этап', ids: ['01', '02'] },
  { id: 'disruption', titleRu: 'Срыв и давление', ids: ['03', '04', '05'] },
  {
    id: 'management',
    titleRu: 'Управленческие меры',
    ids: ['06', '07', '08'],
  },
  { id: 'installation', titleRu: 'Монтаж', ids: ['09', '10', '11'] },
  {
    id: 'commissioning',
    titleRu: 'Пусконаладка',
    ids: ['12', '13', '14'],
  },
  {
    id: 'closeout',
    titleRu: 'Готовность и старт',
    ids: ['15', '16', '17', '18', '19'],
  },
] as const;

export function phaseTitleForSnapshot(id: SnapshotId): string {
  for (const g of SNAPSHOT_PHASE_GROUPS) {
    if ((g.ids as readonly string[]).includes(id)) return g.titleRu;
  }
  return '';
}

export function flatSelectableIds(): SnapshotId[] {
  return SNAPSHOT_PHASE_GROUPS.flatMap((g) => [...g.ids]);
}
