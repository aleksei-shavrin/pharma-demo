import {
  isSelectableSnapshotId,
  type SnapshotId,
} from './snapshot-id';

/** Session-scoped key for last successfully committed Demo snapshot. */
export const SNAPSHOT_SESSION_KEY = 'ppc.demo.snapshot';

/**
 * Read a selectable SnapshotId from sessionStorage, or null if missing/invalid.
 * E1: only A–C are restored (D–H unfinished until E2).
 */
export function readSessionSnapshot(): SnapshotId | null {
  try {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    const raw = sessionStorage.getItem(SNAPSHOT_SESSION_KEY);
    if (raw === null) {
      return null;
    }
    return isSelectableSnapshotId(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Persist last successfully committed snapshot. No-op if storage inaccessible. */
export function writeSessionSnapshot(snapshot: SnapshotId): void {
  try {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, snapshot);
  } catch {
    // Private mode / quota — presentation restore is best-effort.
  }
}

/** Bootstrap target: valid session value, otherwise A. */
export function resolveBootstrapSnapshot(): SnapshotId {
  return readSessionSnapshot() ?? 'A';
}
