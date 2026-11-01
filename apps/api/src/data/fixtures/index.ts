import { SNAPSHOT_A } from './snapshot-a';
import { SNAPSHOT_B } from './snapshot-b';
import { SNAPSHOT_C } from './snapshot-c';
import type { SnapshotFixture, SnapshotId } from './types';

export * from './types';
export { SNAPSHOT_A, SNAPSHOT_B, SNAPSHOT_C };

/** All discrete Demo v1 snapshots keyed by id. */
export const SNAPSHOTS: Record<SnapshotId, SnapshotFixture> = {
  A: SNAPSHOT_A,
  B: SNAPSHOT_B,
  C: SNAPSHOT_C,
};

export const DEFAULT_SNAPSHOT_ID: SnapshotId = 'A';
