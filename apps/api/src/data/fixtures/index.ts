import { SNAPSHOT_A } from './snapshot-a';
import { SNAPSHOT_B } from './snapshot-b';
import { SNAPSHOT_C } from './snapshot-c';
import type { SnapshotFixture, SnapshotId } from './types';

export * from './types';
export { SNAPSHOT_A, SNAPSHOT_B, SNAPSHOT_C };

/**
 * Populated Demo snapshots (E1: A–C temporary stubs).
 * Machine contract allows A–H; D–H absent until E2.
 */
export const SNAPSHOTS: Partial<Record<SnapshotId, SnapshotFixture>> &
  Record<'A' | 'B' | 'C', SnapshotFixture> = {
  A: SNAPSHOT_A,
  B: SNAPSHOT_B,
  C: SNAPSHOT_C,
};

export const DEFAULT_SNAPSHOT_ID: SnapshotId = 'A';
