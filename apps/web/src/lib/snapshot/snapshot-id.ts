/**
 * Machine contract A–H (enrichment). UI selector exposes A–C only until E2/E7.
 */
export const SNAPSHOT_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export type SnapshotId = (typeof SNAPSHOT_IDS)[number];

/** Selectable in current TopBar (E1: do not present unfinished D–H). */
export const SELECTABLE_SNAPSHOT_IDS = ['A', 'B', 'C'] as const;
export type SelectableSnapshotId = (typeof SELECTABLE_SNAPSHOT_IDS)[number];

export function isSnapshotId(value: string): value is SnapshotId {
  return (SNAPSHOT_IDS as readonly string[]).includes(value);
}

export function isSelectableSnapshotId(
  value: string,
): value is SelectableSnapshotId {
  return (SELECTABLE_SNAPSHOT_IDS as readonly string[]).includes(value);
}
