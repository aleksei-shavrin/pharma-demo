/**
 * Discrete Demo v1 snapshot machine ids (canonical numeric strings 01–19).
 * AppBar selector, sessionStorage, API query and DOM attrs use the same ids.
 */
export const SNAPSHOT_IDS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
] as const;
export type SnapshotId = (typeof SNAPSHOT_IDS)[number];

/** Snapshots selectable in AppBar (full populated 01–19). */
export const SELECTABLE_SNAPSHOT_IDS = SNAPSHOT_IDS;
export type SelectableSnapshotId = SnapshotId;

export function isSnapshotId(value: string): value is SnapshotId {
  return (SNAPSHOT_IDS as readonly string[]).includes(value);
}

export function isSelectableSnapshotId(
  value: string,
): value is SelectableSnapshotId {
  return isSnapshotId(value);
}

/** Previous id in chronology 01–19. At 01 there is no predecessor. */
export function previousScenarioSnapshot(id: SnapshotId): SnapshotId | null {
  const index = SNAPSHOT_IDS.indexOf(id);
  if (index <= 0) return null;
  return SNAPSHOT_IDS[index - 1] ?? null;
}

/** Display label is the canonical SnapshotId string (identity). */
export function snapshotDisplayLabel(id: string): string {
  return id;
}
