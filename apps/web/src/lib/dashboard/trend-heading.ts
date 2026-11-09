import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import {
  previousScenarioSnapshot,
  snapshotDisplayLabel,
} from '@/lib/snapshot/snapshot-id';

/** Заголовок блока изменений: ordinal предшественника в порядке 01–19. */
export function trendHeading(snapshotId: SnapshotId): string {
  const previous = previousScenarioSnapshot(snapshotId);
  if (!previous) return 'Изменения по сценарию';
  return `Изменения к снимку ${snapshotDisplayLabel(previous)}`;
}
