import { isSnapshotId, type SnapshotId } from './snapshot-id';

export const SNAPSHOT_SESSION_KEY = 'ppc.demo.snapshot';

function clearInvalidSessionValue(): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(SNAPSHOT_SESSION_KEY);
  } catch {
    // ignore
  }
}

/**
 * Read a SnapshotId (01–19) from sessionStorage, or null if missing/invalid.
 * Legacy/non-canonical values are removed; bootstrap falls back to 01.
 * No letter→ordinal mapping table in runtime.
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
    if (isSnapshotId(raw)) {
      return raw;
    }
    clearInvalidSessionValue();
    return null;
  } catch {
    return null;
  }
}

/**
 * Persist last successfully committed snapshot (01–19).
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

/** Bootstrap target: valid session value, otherwise 01. */
export function resolveBootstrapSnapshot(): SnapshotId {
  return readSessionSnapshot() ?? '01';
}
