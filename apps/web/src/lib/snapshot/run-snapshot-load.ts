import type { DashboardOverview, ProjectStub } from '@/lib/api-client';
import { projectStubFromDashboard } from '@/lib/api-client';
import type { SnapshotId } from './snapshot-id';
import type { SeqAllocator } from './snapshot-seq';
import type { SnapshotAction } from './snapshot-state';

export type FetchDashboard = (
  projectId: string,
  snapshot: SnapshotId,
) => Promise<DashboardOverview>;

/**
 * Shared load path used by SnapshotProvider (and tests).
 * Allocates seq synchronously before any await.
 * Commits dashboard + project stub atomically on success.
 */
export async function runSnapshotLoad(opts: {
  snapshot: SnapshotId;
  projectId: string;
  allocateSeq: SeqAllocator;
  dispatch: (action: SnapshotAction) => void;
  fetchDashboard: FetchDashboard;
}): Promise<void> {
  const seq = opts.allocateSeq();
  opts.dispatch({ type: 'request', snapshot: opts.snapshot, seq });
  try {
    const dashboard = await opts.fetchDashboard(opts.projectId, opts.snapshot);
    if (dashboard.snapshotId !== opts.snapshot) {
      throw new Error(
        `API returned snapshot ${dashboard.snapshotId}, expected ${opts.snapshot}`,
      );
    }
    const project: ProjectStub = projectStubFromDashboard(dashboard);
    opts.dispatch({
      type: 'success',
      snapshot: opts.snapshot,
      project,
      dashboard,
      seq,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    opts.dispatch({ type: 'failure', error: message, seq });
  }
}
