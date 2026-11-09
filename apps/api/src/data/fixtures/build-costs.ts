/**
 * Builds discrete 01–19 ProjectCostsOverview fixtures (DOC-PROD-026).
 * Project totals authored; WS control forecasts exclude project-level
 * contingency residual still held in Project EAC (not a ninth Workstream).
 */
import {
  DEMO_PROJECT_BAC_RUB,
  DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
  DEMO_WORKSTREAM_CBS_RUB,
  assertProjectCostInvariants,
  assertWorkstreamCostInvariants,
  computeContingencyRemainingRub,
  computeEacRub,
  computeVacRub,
  type EquipmentCostMeasures,
  type ProjectCostMeasures,
  type WorkstreamCostMeasures,
} from '../../contracts/money';
import { WORKSTREAM_IDS, type WorkstreamId } from '../workstream-ids';
import { PROJECT } from './catalog';
import { buildEquipmentCosts } from './cost-equipment';
import { PROJECT_COST_STORY } from './cost-project-story';
import {
  WS_ACTUAL_WEIGHTS,
  WS_COMMITTED_WEIGHTS,
  WS_ETC_WEIGHTS,
  distributeByWeights,
} from './cost-ws-weights';
import { SNAPSHOT_STATES } from './snapshot-states';
import type { PopulatedSnapshotId } from './types';

export type BuiltWorkstreamCost = WorkstreamCostMeasures & {
  workstream: WorkstreamId;
};

export type BuiltEquipmentCostRow = EquipmentCostMeasures & {
  equipmentId: string;
};

/**
 * Explicit Project ↔ WS reconciliation (not Σ WS EAC = Project EAC).
 * Demo: residual is unallocated contingency still expected inside Project EAC
 * while ETC remains; at closeout (ETC=0) residual is 0 and unused remaining
 * contingency sits outside EAC (honest unused reserve ≠ saving, ≠ WS overrun).
 */
export type CostReconciliation = {
  workstreamEacSumRub: number;
  projectLevelForecastRub: number;
};

export type BuiltProjectCosts = {
  snapshotId: PopulatedSnapshotId;
  scenarioAsOfDate: string;
  projectId: string;
  project: ProjectCostMeasures;
  workstreams: BuiltWorkstreamCost[];
  equipment: BuiltEquipmentCostRow[];
  reconciliation: CostReconciliation;
};

/**
 * Portion of Project EAC that is not Workstream control forecast.
 * Mid-lifecycle: unused contingency still expected in EAC (≠ automatic +VAC).
 * Closeout ETC=0: residual 0 — leftover contingencyRemaining is outside EAC.
 */
export function computeProjectLevelForecastRub(
  contingencyRemainingRub: number,
  etcRub: number,
): number {
  return Math.min(contingencyRemainingRub, etcRub);
}

function buildProjectMeasures(
  snapshotId: PopulatedSnapshotId,
): ProjectCostMeasures {
  const authored = PROJECT_COST_STORY[snapshotId];
  const eacRub = computeEacRub(authored.actualCostRub, authored.etcRub);
  const project: ProjectCostMeasures = {
    approvedBudgetRub: DEMO_PROJECT_BAC_RUB,
    actualCostRub: authored.actualCostRub,
    committedCostRub: authored.committedCostRub,
    etcRub: authored.etcRub,
    eacRub,
    vacRub: computeVacRub(DEMO_PROJECT_BAC_RUB, eacRub),
    contingencyTotalRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
    contingencyConsumedRub: authored.contingencyConsumedRub,
    contingencyRemainingRub: computeContingencyRemainingRub(
      DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
      authored.contingencyConsumedRub,
    ),
  };
  assertProjectCostInvariants(project);
  if (
    project.contingencyConsumedRub < 0 ||
    project.contingencyConsumedRub > project.contingencyTotalRub
  ) {
    throw new Error(`contingencyConsumed out of range on ${snapshotId}`);
  }
  return project;
}

function buildWorkstreams(
  snapshotId: PopulatedSnapshotId,
  project: ProjectCostMeasures,
  projectLevelForecastRub: number,
): BuiltWorkstreamCost[] {
  // Actual / Committed are WS-attributed control signals.
  // ETC excludes project-level forecast residual (contingency still in Project EAC).
  const wsEtcTotal = project.etcRub - projectLevelForecastRub;
  if (wsEtcTotal < 0) {
    throw new Error(`WS ETC total negative on ${snapshotId}`);
  }

  const actuals = distributeByWeights(
    project.actualCostRub,
    WS_ACTUAL_WEIGHTS[snapshotId],
  );
  const committed = distributeByWeights(
    project.committedCostRub,
    WS_COMMITTED_WEIGHTS[snapshotId],
  );
  const etc = distributeByWeights(wsEtcTotal, WS_ETC_WEIGHTS[snapshotId]);

  const rows: BuiltWorkstreamCost[] = WORKSTREAM_IDS.map((id) => {
    const actualCostRub = actuals[id];
    const etcRub = etc[id];
    const eacRub = computeEacRub(actualCostRub, etcRub);
    const approvedControlBudgetRub = DEMO_WORKSTREAM_CBS_RUB[id];
    const measures: WorkstreamCostMeasures = {
      approvedControlBudgetRub,
      actualCostRub,
      committedCostRub: committed[id],
      etcRub,
      eacRub,
      vacRub: computeVacRub(approvedControlBudgetRub, eacRub),
    };
    assertWorkstreamCostInvariants(measures);
    return { workstream: id, ...measures };
  });

  const sumActual = rows.reduce((s, r) => s + r.actualCostRub, 0);
  const sumCommitted = rows.reduce((s, r) => s + r.committedCostRub, 0);
  const sumEtc = rows.reduce((s, r) => s + r.etcRub, 0);
  const sumEac = rows.reduce((s, r) => s + r.eacRub, 0);

  if (sumActual !== project.actualCostRub) {
    throw new Error(`WS actual reconcile failed on ${snapshotId}`);
  }
  if (sumCommitted !== project.committedCostRub) {
    throw new Error(`WS committed reconcile failed on ${snapshotId}`);
  }
  if (sumEtc !== wsEtcTotal) {
    throw new Error(`WS etc reconcile failed on ${snapshotId}`);
  }
  if (sumEac !== project.eacRub - projectLevelForecastRub) {
    throw new Error(`WS eac reconcile failed on ${snapshotId}`);
  }
  return rows;
}

export function buildCosts(snapshotId: PopulatedSnapshotId): BuiltProjectCosts {
  const project = buildProjectMeasures(snapshotId);
  const projectLevelForecastRub = computeProjectLevelForecastRub(
    project.contingencyRemainingRub,
    project.etcRub,
  );
  const workstreams = buildWorkstreams(
    snapshotId,
    project,
    projectLevelForecastRub,
  );
  const workstreamEacSumRub = workstreams.reduce((s, w) => s + w.eacRub, 0);
  if (project.eacRub !== workstreamEacSumRub + projectLevelForecastRub) {
    throw new Error(`Project EAC reconciliation broken on ${snapshotId}`);
  }
  const equipment = buildEquipmentCosts(snapshotId);
  return {
    snapshotId,
    scenarioAsOfDate: SNAPSHOT_STATES[snapshotId].asOf,
    projectId: PROJECT.id,
    project,
    workstreams,
    equipment,
    reconciliation: {
      workstreamEacSumRub,
      projectLevelForecastRub,
    },
  };
}

export function buildAllCosts(): Record<
  PopulatedSnapshotId,
  BuiltProjectCosts
> {
  const ids = Object.keys(PROJECT_COST_STORY) as PopulatedSnapshotId[];
  const out = {} as Record<PopulatedSnapshotId, BuiltProjectCosts>;
  for (const id of ids) {
    out[id] = buildCosts(id);
  }
  return out;
}

export const COST_SNAPSHOTS: Record<PopulatedSnapshotId, BuiltProjectCosts> =
  buildAllCosts();
