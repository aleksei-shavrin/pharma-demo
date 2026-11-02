/**
 * Machine contract A–H (enrichment). UI selector exposes full A–H (E7).
 */
export const SNAPSHOT_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export type SnapshotId = (typeof SNAPSHOT_IDS)[number];

/** All Demo snapshots are selectable in AppBar (E7). */
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
