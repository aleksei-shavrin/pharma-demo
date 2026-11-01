import type { SnapshotFixture } from '../data/fixtures/types';
import {
  primaryDecision,
  productionStartIssue,
  productionStartMilestone,
  productionStartRisk,
  psDriverEquipment,
} from '../data/snapshot-access';
import { calendarDaysDelta } from './calendar-days-delta';

export type DecisionPanelState = 'absent' | 'needed' | 'recorded';

/**
 * Snapshot-wide derived management impact (BR-004 / BR-006 honesty).
 * Uses sole PS driver spine (EQ-HVAC-01 / RISK-001 / MS-PS).
 */
export type DerivedImpact = {
  kind: 'none' | 'aligned_slip';
  equipmentDeliveryDeltaDays: number;
  productionStartDeltaDays: number;
  equipmentStatus: 'OnTrack' | 'Delayed';
  equipmentForecastDelivery: string;
  issueId: string | null;
  issueStatus: 'Open' | 'Mitigating' | 'Closed' | null;
  riskId: string;
  riskRag: 'Green' | 'Red';
  milestoneId: string;
  milestoneName: string;
  milestoneRag: 'Green' | 'Red';
  productionStartForecast: string;
  decisionState: DecisionPanelState;
  decision: {
    id: string;
    type: 'PrioritizeRecovery' | 'AcceptDateSlip';
    projectId: string;
    milestoneId: string | null;
    ownerRole: string;
    dueDate: string | null;
    note: string;
  } | null;
  recoveryExecuted: false | null;
};

export function decisionPanelState(
  snapshot: SnapshotFixture,
): DecisionPanelState {
  if (snapshot.decisions.length > 0) {
    return 'recorded';
  }
  const issue = productionStartIssue(snapshot);
  const eq = psDriverEquipment(snapshot);
  if (
    issue &&
    (issue.status === 'Open' || issue.status === 'Mitigating') &&
    eq.status === 'Delayed'
  ) {
    return 'needed';
  }
  return 'absent';
}

export function computeDerivedImpact(snapshot: SnapshotFixture): DerivedImpact {
  const equipment = psDriverEquipment(snapshot);
  const issue = productionStartIssue(snapshot);
  const risk = productionStartRisk(snapshot);
  const milestone = productionStartMilestone(snapshot);
  const decision = primaryDecision(snapshot);

  const deliveryDelta = calendarDaysDelta(
    equipment.baselineDelivery,
    equipment.forecastDelivery,
  );
  const psDelta = calendarDaysDelta(
    snapshot.project.baselineProductionStart,
    snapshot.project.forecastProductionStart,
  );
  const state = decisionPanelState(snapshot);

  return {
    kind: deliveryDelta === 0 ? 'none' : 'aligned_slip',
    equipmentDeliveryDeltaDays: deliveryDelta,
    productionStartDeltaDays: psDelta,
    equipmentStatus: equipment.status,
    equipmentForecastDelivery: equipment.forecastDelivery,
    issueId: issue?.id ?? null,
    issueStatus: issue?.status ?? null,
    riskId: risk.id,
    riskRag: risk.rag,
    milestoneId: milestone.id,
    milestoneName: milestone.name,
    milestoneRag: milestone.rag,
    productionStartForecast: snapshot.project.forecastProductionStart,
    decisionState: state,
    decision: decision
      ? {
          id: decision.id,
          type: decision.type,
          projectId: decision.projectId,
          milestoneId: decision.milestoneId,
          ownerRole: decision.ownerRole,
          dueDate: decision.dueDate,
          note: decision.note,
        }
      : null,
    recoveryExecuted: state === 'recorded' ? false : null,
  };
}
