import type { ProjectStatus, SnapshotFixture } from './fixtures/types';
import {
  productionStartMilestone,
  productionStartRisk,
} from './snapshot-access';
import { WORKSTREAM_IDS, type WorkstreamId } from './workstream-ids';

export type WorkstreamRollup = {
  workstream: WorkstreamId;
  status: ProjectStatus;
};

/**
 * Backend-owned workstream rollup (DOC-PROD-020 / DOC-UX-021).
 * Closed Issue does not create attention. No Issue.critical.
 */
export function workstreamStatus(
  snapshot: SnapshotFixture,
  workstream: WorkstreamId,
): ProjectStatus {
  const hasRedRisk = snapshot.risks.some(
    (r) => r.workstream === workstream && r.rag === 'Red',
  );
  if (hasRedRisk) return 'Red';

  const hasDelayedCritical = snapshot.equipment.some(
    (e) =>
      e.workstream === workstream &&
      e.critical &&
      e.status === 'Delayed',
  );
  const hasActiveIssue = snapshot.issues.some(
    (i) =>
      i.workstream === workstream &&
      (i.status === 'Open' || i.status === 'Mitigating'),
  );
  if (hasDelayedCritical || hasActiveIssue) return 'Yellow';
  return 'Green';
}

export function computeWorkstreamRollups(
  snapshot: SnapshotFixture,
): WorkstreamRollup[] {
  return WORKSTREAM_IDS.map((workstream) => ({
    workstream,
    status: workstreamStatus(snapshot, workstream),
  }));
}

/**
 * Backend-owned overall project status (DOC-PROD-020).
 * RED: MS-PS Red OR RISK-001 Red.
 * YELLOW: not Red AND management attention.
 * GREEN: otherwise.
 */
export function computeProjectStatus(
  snapshot: SnapshotFixture,
): ProjectStatus {
  const msPs = productionStartMilestone(snapshot);
  const risk001 = productionStartRisk(snapshot);
  if (msPs.rag === 'Red' || risk001.rag === 'Red') {
    return 'Red';
  }

  const rollups = computeWorkstreamRollups(snapshot);
  const wsAttention = rollups.some((r) => r.status !== 'Green');
  const activeIssue = snapshot.issues.some(
    (i) => i.status === 'Open' || i.status === 'Mitigating',
  );
  const delayedCritical = snapshot.equipment.some(
    (e) => e.critical && e.status === 'Delayed',
  );
  if (wsAttention || activeIssue || delayedCritical) {
    return 'Yellow';
  }
  return 'Green';
}
