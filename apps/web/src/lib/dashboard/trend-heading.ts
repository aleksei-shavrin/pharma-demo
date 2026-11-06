import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { previousScenarioSnapshot } from '@/lib/snapshot/snapshot-id';

/** Заголовок блока изменений: буква предшественника в порядке A–S, не открытый до этого снимок. */
export function trendHeading(snapshotId: SnapshotId): string {
  const previous = previousScenarioSnapshot(snapshotId);
  if (!previous) return 'Изменения по сценарию';
  return `Изменения к снимку ${previous}`;
}
