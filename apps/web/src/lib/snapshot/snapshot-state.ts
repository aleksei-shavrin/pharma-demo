import type { DashboardOverview, ProjectStub } from '@/lib/api-client';
import type { SnapshotId } from './snapshot-id';

export type SnapshotStatus = 'idle' | 'loading' | 'error';

export type SnapshotState = {
  /** Last successfully loaded snapshot — never optimistic. */
  active: SnapshotId;
  /** In-flight target while loading; null when settled. */
  requested: SnapshotId | null;
  status: SnapshotStatus;
  error: string | null;
  /** Project chip / header — derived from last successful dashboard. */
  project: ProjectStub | null;
  /** Dashboard payload committed atomically with active snapshot. */
  dashboard: DashboardOverview | null;
  /** Latest request seq (for ignoring stale responses). */
  requestSeq: number;
};

export type SnapshotAction =
  | { type: 'request'; snapshot: SnapshotId; seq: number }
  | {
      type: 'success';
      snapshot: SnapshotId;
      project: ProjectStub;
      dashboard: DashboardOverview;
      seq: number;
    }
  | { type: 'failure'; error: string; seq: number };

export const initialSnapshotState: SnapshotState = {
  active: 'A',
  requested: null,
  status: 'idle',
  error: null,
  project: null,
  dashboard: null,
  requestSeq: 0,
};

/**
 * Pure atomic snapshot switch reducer.
 * Active + dashboard + project change only on success for the latest request seq.
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
        dashboard: action.dashboard,
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
        // active + project + dashboard unchanged — no partial / mixed state
      };
    default:
      return state;
  }
}
