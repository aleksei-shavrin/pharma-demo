/**
 * Discrete Demo v1 snapshot machine ids (R2: A–S).
 * R2-U1: AppBar selector exposes full A–S (19).
 */
export const SNAPSHOT_IDS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
] as const;
export type SnapshotId = (typeof SNAPSHOT_IDS)[number];

/** Snapshots selectable in AppBar (R2-U1: full populated A–S). */
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
