import type { SnapshotId } from './snapshot-id';

/**
 * Phase groups for A–S selector (DOC-PROD-024). Presentation only.
 */
export type SnapshotPhaseGroup = {
  id: string;
  titleRu: string;
  ids: readonly SnapshotId[];
};

export const SNAPSHOT_PHASE_GROUPS: readonly SnapshotPhaseGroup[] = [
  { id: 'early', titleRu: 'Ранний этап', ids: ['A', 'B'] },
  { id: 'disruption', titleRu: 'Срыв и давление', ids: ['C', 'D', 'E'] },
  {
    id: 'management',
    titleRu: 'Управленческие меры',
    ids: ['F', 'G', 'H'],
  },
  { id: 'installation', titleRu: 'Монтаж', ids: ['I', 'J', 'K'] },
  {
    id: 'commissioning',
    titleRu: 'Пусконаладка',
    ids: ['L', 'M', 'N'],
  },
  {
    id: 'closeout',
    titleRu: 'Готовность и старт',
    ids: ['O', 'P', 'Q', 'R', 'S'],
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
