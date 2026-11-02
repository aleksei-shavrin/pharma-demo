import {
  isSelectableSnapshotId,
  type SnapshotId,
} from './snapshot-id';

export const SNAPSHOT_SESSION_KEY = 'ppc.demo.snapshot';

/**
 * Read a selectable SnapshotId (A–H) from sessionStorage, or null if missing/invalid.
 * Contract accepts A–S, but UI bootstrap stays on populated selectable set until R2-L1/U1.
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

/**
 * Persist last successfully committed snapshot.
 * Non-selectable ids (I–S until L1/U1) are ignored — presentation restore is A–H only.
 */
export function writeSessionSnapshot(snapshot: SnapshotId): void {
  try {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    if (!isSelectableSnapshotId(snapshot)) {
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
