import { isSnapshotId, type SnapshotId } from './snapshot-id';

export const SNAPSHOT_SESSION_KEY = 'ppc.demo.snapshot';

/**
 * Read a SnapshotId (A–S) from sessionStorage, or null if missing/invalid.
 * Invalid legacy values fall back safely (bootstrap → A).
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

/**
 * Persist last successfully committed snapshot (A–S after R2-U1).
 */
export function writeSessionSnapshot(snapshot: SnapshotId): void {
  try {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    if (!isSnapshotId(snapshot)) {
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
