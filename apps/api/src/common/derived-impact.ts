import type { SnapshotFixture } from '../data/fixtures/types';
import { calendarDaysDelta } from './calendar-days-delta';

export type DecisionPanelState = 'absent' | 'needed' | 'recorded';

/**
 * Snapshot-wide derived management impact (BR-004 / BR-006 honesty).
 * Not Domain Links — callers must keep Impact separate from edge lists.
 */
export type DerivedImpact = {
  kind: 'none' | 'aligned_slip';
  equipmentDeliveryDeltaDays: number;
  productionStartDeltaDays: number;
  equipmentStatus: 'OnTrack' | 'Delayed';
  equipmentForecastDelivery: string;
  issueId: string | null;
  issueStatus: 'Open' | 'Mitigating' | null;
  riskId: string;
  riskRag: 'Green' | 'Red';
  milestoneId: string;
  milestoneName: string;
  milestoneRag: 'Green' | 'Red';
  productionStartForecast: string;
  decisionState: DecisionPanelState;
  decision: {
    id: string;
    type: 'PrioritizeRecovery';
    ownerRole: string;
    dueDate: string;
    note: string;
  } | null;
  /** false when a decision is recorded; null otherwise — recovery never “done” in Demo v1. */
  recoveryExecuted: false | null;
};

export function decisionPanelState(
  snapshot: SnapshotFixture,
): DecisionPanelState {
  if (snapshot.decision) {
    return 'recorded';
  }
  if (snapshot.issue && snapshot.equipment.status === 'Delayed') {
    return 'needed';
  }
  return 'absent';
}

export function computeDerivedImpact(snapshot: SnapshotFixture): DerivedImpact {
  const deliveryDelta = calendarDaysDelta(
    snapshot.equipment.baselineDelivery,
    snapshot.equipment.forecastDelivery,
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
    equipmentStatus: snapshot.equipment.status,
    equipmentForecastDelivery: snapshot.equipment.forecastDelivery,
    issueId: snapshot.issue?.id ?? null,
    issueStatus: snapshot.issue?.status ?? null,
    riskId: snapshot.risk.id,
    riskRag: snapshot.risk.rag,
    milestoneId: snapshot.milestone.id,
    milestoneName: snapshot.milestone.name,
    milestoneRag: snapshot.milestone.rag,
    productionStartForecast: snapshot.project.forecastProductionStart,
    decisionState: state,
    decision: snapshot.decision
      ? {
          id: snapshot.decision.id,
          type: snapshot.decision.type,
          ownerRole: snapshot.decision.ownerRole,
          dueDate: snapshot.decision.dueDate,
          note: snapshot.decision.note,
        }
      : null,
    recoveryExecuted: state === 'recorded' ? false : null,
  };
}
