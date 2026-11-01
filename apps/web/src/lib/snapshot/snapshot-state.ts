import type { ProjectStub } from '@/lib/api-client';
import type { SnapshotId } from './snapshot-id';

export type SnapshotStatus = 'idle' | 'loading' | 'error';

export type SnapshotState = {
  /** Last successfully loaded snapshot — never optimistic. */
  active: SnapshotId;
  /** In-flight target while loading; null when settled. */
  requested: SnapshotId | null;
  status: SnapshotStatus;
  error: string | null;
  /** Minimal snapshot-aware payload proving API coherence (I2). */
  project: ProjectStub | null;
  /** Latest request seq (for ignoring stale responses). */
  requestSeq: number;
};

export type SnapshotAction =
  | { type: 'request'; snapshot: SnapshotId; seq: number }
  | {
      type: 'success';
      snapshot: SnapshotId;
      project: ProjectStub;
      seq: number;
    }
  | { type: 'failure'; error: string; seq: number };

export const initialSnapshotState: SnapshotState = {
  active: 'A',
  requested: null,
  status: 'idle',
  error: null,
  project: null,
  requestSeq: 0,
};

/**
 * Pure atomic snapshot switch reducer.
 * Active snapshot changes only on success for the latest request seq.
 */
export function snapshotReducer(
  state: SnapshotState,
  action: SnapshotAction,
): SnapshotState {
  switch (action.type) {
    case 'request':
      return {
        ...state,
        requested: action.snapshot,
        status: 'loading',
        error: null,
        requestSeq: action.seq,
      };
    case 'success':
      if (action.seq !== state.requestSeq) {
        return state;
      }
      return {
        ...state,
        active: action.snapshot,
        requested: null,
        status: 'idle',
        error: null,
        project: action.project,
      };
    case 'failure':
      if (action.seq !== state.requestSeq) {
        return state;
      }
      return {
        ...state,
        requested: null,
        status: 'error',
        error: action.error,
        // active + project unchanged — no partial / mixed state
      };
    default:
      return state;
  }
}
