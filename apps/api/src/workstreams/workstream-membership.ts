/**
 * Workstream membership projections (DOC-BA-018).
 * Not causal edges — filter existing snapshot records by workstream field
 * (Decisions via linked Milestone.workstream when present).
 */
import type {
  DecisionFixture,
  EquipmentFixture,
  IssueFixture,
  MilestoneFixture,
  RiskFixture,
  SnapshotFixture,
} from '../data/fixtures/types';
import type { WorkstreamId } from '../data/workstream-ids';

export function equipmentInWorkstream(
  snapshot: SnapshotFixture,
  workstream: WorkstreamId,
): EquipmentFixture[] {
  return snapshot.equipment.filter((e) => e.workstream === workstream);
}

export function milestonesInWorkstream(
  snapshot: SnapshotFixture,
  workstream: WorkstreamId,
): MilestoneFixture[] {
  return snapshot.milestones.filter((m) => m.workstream === workstream);
}

export function issuesInWorkstream(
  snapshot: SnapshotFixture,
  workstream: WorkstreamId,
): IssueFixture[] {
  return snapshot.issues.filter((i) => i.workstream === workstream);
}

export function risksInWorkstream(
  snapshot: SnapshotFixture,
  workstream: WorkstreamId,
): RiskFixture[] {
  return snapshot.risks.filter((r) => r.workstream === workstream);
}

/** Decision → WS via Milestone.workstream; project-level MS (null WS) excluded. */
export function decisionsInWorkstream(
  snapshot: SnapshotFixture,
  workstream: WorkstreamId,
): DecisionFixture[] {
  const byMs = new Map(snapshot.milestones.map((m) => [m.id, m]));
  return snapshot.decisions.filter((d) => {
    if (!d.milestoneId) return false;
    const ms = byMs.get(d.milestoneId);
    return ms?.workstream === workstream;
  });
}
