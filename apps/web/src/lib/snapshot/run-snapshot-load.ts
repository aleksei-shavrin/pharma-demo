import type { ProjectStub } from '@/lib/api-client';
import type { SnapshotId } from './snapshot-id';
import type { SeqAllocator } from './snapshot-seq';
import type { SnapshotAction } from './snapshot-state';

export type FetchProjectStub = (
  projectId: string,
  snapshot: SnapshotId,
) => Promise<ProjectStub>;

/**
 * Shared load path used by SnapshotProvider (and tests).
 * Allocates seq synchronously before any await.
 */
export async function runSnapshotLoad(opts: {
  snapshot: SnapshotId;
  projectId: string;
  allocateSeq: SeqAllocator;
  dispatch: (action: SnapshotAction) => void;
  fetchProject: FetchProjectStub;
}): Promise<void> {
  const seq = opts.allocateSeq();
  opts.dispatch({ type: 'request', snapshot: opts.snapshot, seq });
  try {
    const project = await opts.fetchProject(opts.projectId, opts.snapshot);
    if (project.snapshotId !== opts.snapshot) {
      throw new Error(
        `API returned snapshot ${project.snapshotId}, expected ${opts.snapshot}`,
      );
    }
    opts.dispatch({
      type: 'success',
      snapshot: opts.snapshot,
      project,
      seq,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    opts.dispatch({ type: 'failure', error: message, seq });
  }
}
