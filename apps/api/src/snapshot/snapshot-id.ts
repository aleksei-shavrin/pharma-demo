/**
 * Discrete Demo v1 snapshot machine ids (enrichment A–H).
 * E1 populates A–C only; D–H are valid machine ids but may 404 until E2.
 */
export const SNAPSHOT_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export type SnapshotId = (typeof SNAPSHOT_IDS)[number];

/** Snapshots currently loaded in Nest fixtures (E1 temporary). */
export const POPULATED_SNAPSHOT_IDS = ['A', 'B', 'C'] as const;
export type PopulatedSnapshotId = (typeof POPULATED_SNAPSHOT_IDS)[number];

export function isSnapshotId(value: string): value is SnapshotId {
  return (SNAPSHOT_IDS as readonly string[]).includes(value);
}

export function isPopulatedSnapshotId(
  value: string,
): value is PopulatedSnapshotId {
  return (POPULATED_SNAPSHOT_IDS as readonly string[]).includes(value);
}
