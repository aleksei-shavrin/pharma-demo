import { isSnapshotId, type SnapshotId } from './snapshot-id';

/** Session-scoped key for last successfully committed Demo snapshot. */
export const SNAPSHOT_SESSION_KEY = 'ppc.demo.snapshot';

/**
 * Read a valid SnapshotId from sessionStorage, or null if missing/invalid/inaccessible.
 * Never returns a value that should be sent to the API without re-validation —
 * callers must treat null as bootstrap A.
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
    return isSnapshotId(raw) ? raw : null;
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
