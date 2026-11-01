import type {
  DecisionFixture,
  EquipmentFixture,
  IssueFixture,
  MilestoneFixture,
  RiskFixture,
  SnapshotFixture,
} from './fixtures/types';

/** Sole BR-004 Production Start driver equipment. */
export const PS_DRIVER_EQUIPMENT_ID = 'EQ-HVAC-01';
export const PS_MILESTONE_ID = 'MS-PS';
export const PS_RISK_ID = 'RISK-001';
export const PS_ISSUE_ID = 'ISS-001';

export function findEquipment(
  snapshot: SnapshotFixture,
  id: string,
): EquipmentFixture | undefined {
  return snapshot.equipment.find((e) => e.id === id);
}

export function findMilestone(
  snapshot: SnapshotFixture,
  id: string,
): MilestoneFixture | undefined {
  return snapshot.milestones.find((m) => m.id === id);
}

export function findRisk(
  snapshot: SnapshotFixture,
  id: string,
): RiskFixture | undefined {
  return snapshot.risks.find((r) => r.id === id);
}

export function findIssue(
  snapshot: SnapshotFixture,
  id: string,
): IssueFixture | undefined {
  return snapshot.issues.find((i) => i.id === id);
}

export function findDecision(
  snapshot: SnapshotFixture,
  id: string,
): DecisionFixture | undefined {
  return snapshot.decisions.find((d) => d.id === id);
}

/** HVAC long-lead / BR-004 spine equipment. */
export function psDriverEquipment(
  snapshot: SnapshotFixture,
): EquipmentFixture {
  const eq = findEquipment(snapshot, PS_DRIVER_EQUIPMENT_ID);
  if (!eq) {
    throw new Error(
      `Snapshot ${snapshot.id} missing PS driver ${PS_DRIVER_EQUIPMENT_ID}`,
    );
  }
  return eq;
}

export function productionStartMilestone(
  snapshot: SnapshotFixture,
): MilestoneFixture {
  const ms = findMilestone(snapshot, PS_MILESTONE_ID);
  if (!ms) {
    throw new Error(`Snapshot ${snapshot.id} missing ${PS_MILESTONE_ID}`);
  }
  return ms;
}

export function productionStartRisk(snapshot: SnapshotFixture): RiskFixture {
  const risk = findRisk(snapshot, PS_RISK_ID);
  if (!risk) {
    throw new Error(`Snapshot ${snapshot.id} missing ${PS_RISK_ID}`);
  }
  return risk;
}

export function productionStartIssue(
  snapshot: SnapshotFixture,
): IssueFixture | null {
  return findIssue(snapshot, PS_ISSUE_ID) ?? null;
}

/** Canonical DEC-001 only — never substitute another Decision. */
export function primaryDecision(
  snapshot: SnapshotFixture,
): DecisionFixture | null {
  return findDecision(snapshot, 'DEC-001') ?? null;
}
