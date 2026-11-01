export const SNAPSHOT_IDS = ['A', 'B', 'C'] as const;
export type SnapshotId = (typeof SNAPSHOT_IDS)[number];

export function isSnapshotId(value: string): value is SnapshotId {
  return (SNAPSHOT_IDS as readonly string[]).includes(value);
}
