/**
 * Discrete Demo v1 snapshot machine ids (R2: A–S).
 * UI selector still exposes populated A–H until R2-U1/L1.
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

/** Snapshots selectable in AppBar today (populated fixtures A–H). */
export const SELECTABLE_SNAPSHOT_IDS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
] as const;
export type SelectableSnapshotId = (typeof SELECTABLE_SNAPSHOT_IDS)[number];

export function isSnapshotId(value: string): value is SnapshotId {
  return (SNAPSHOT_IDS as readonly string[]).includes(value);
}

export function isSelectableSnapshotId(
  value: string,
): value is SelectableSnapshotId {
  return (SELECTABLE_SNAPSHOT_IDS as readonly string[]).includes(value);
}
