/**
 * Discrete Demo v1 snapshot machine ids (R2: A–S).
 * Fixtures currently populate A–H only (R2-L1 adds I–S overlays).
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

/** Snapshots loaded in Nest fixtures today (enrichment A–H). */
export const POPULATED_SNAPSHOT_IDS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
] as const;
export type PopulatedSnapshotId = (typeof POPULATED_SNAPSHOT_IDS)[number];

export const SNAPSHOT_IDS_ALLOWED_MESSAGE =
  'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S';

export function isSnapshotId(value: string): value is SnapshotId {
  return (SNAPSHOT_IDS as readonly string[]).includes(value);
}

export function isPopulatedSnapshotId(
  value: string,
): value is PopulatedSnapshotId {
  return (POPULATED_SNAPSHOT_IDS as readonly string[]).includes(value);
}
