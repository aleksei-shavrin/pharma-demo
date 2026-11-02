/**
 * Integer RUB contract helpers (DOC-PROD-026 / R2-C1).
 * No float money; Committed is never added into EAC.
 */

import {
  WORKSTREAM_IDS,
  type WorkstreamId,
} from '../data/workstream-ids';

/** Frozen Demo BAC (R2-D0-R1). Fictional — not a real plant appraisal. */
export const DEMO_PROJECT_BAC_RUB = 6_200_000_000;
export const DEMO_WORKSTREAM_BUDGETS_SUM_RUB = 5_850_000_000;
export const DEMO_PROJECT_CONTINGENCY_TOTAL_RUB = 350_000_000;

/** Frozen CBS approved control budgets (DOC-PROD-026 §4). */
export const DEMO_WORKSTREAM_CBS_RUB: Readonly<
  Record<WorkstreamId, number>
> = {
  'WS-BLD': 850_000_000,
  'WS-CLN': 740_000_000,
  'WS-HVAC': 880_000_000,
  'WS-UTL': 940_000_000,
  'WS-PRD': 1_100_000_000,
  'WS-PKG': 690_000_000,
  'WS-QC': 400_000_000,
  'WS-AUT': 250_000_000,
};

export function isIntegerRub(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    Number.isSafeInteger(value) &&
    Number.isFinite(value)
  );
}

export function assertIntegerRub(value: unknown, field: string): number {
  if (!isIntegerRub(value)) {
    throw new Error(`${field} must be a safe integer RUB value`);
  }
  return value;
}

/** Σ frozen WS CBS must equal DEMO_WORKSTREAM_BUDGETS_SUM_RUB. */
export function sumWorkstreamCbsRub(): number {
  return WORKSTREAM_IDS.reduce(
    (sum, id) => sum + DEMO_WORKSTREAM_CBS_RUB[id],
    0,
  );
}

/** Authoritative: EAC = Actual + ETC (never Actual + Committed + ETC). */
export function computeEacRub(actualCostRub: number, etcRub: number): number {
  return assertIntegerRub(actualCostRub, 'actualCostRub') +
    assertIntegerRub(etcRub, 'etcRub');
}

export function computeVacRub(
  approvedBudgetRub: number,
  eacRub: number,
): number {
  return (
    assertIntegerRub(approvedBudgetRub, 'approvedBudgetRub') -
    assertIntegerRub(eacRub, 'eacRub')
  );
}

export function computeContingencyRemainingRub(
  contingencyTotalRub: number,
  contingencyConsumedRub: number,
): number {
  return (
    assertIntegerRub(contingencyTotalRub, 'contingencyTotalRub') -
    assertIntegerRub(contingencyConsumedRub, 'contingencyConsumedRub')
  );
}

export type ProjectCostMeasures = {
  approvedBudgetRub: number;
  actualCostRub: number;
  committedCostRub: number;
  etcRub: number;
  eacRub: number;
  vacRub: number;
  contingencyTotalRub: number;
  contingencyConsumedRub: number;
  contingencyRemainingRub: number;
};

export type WorkstreamCostMeasures = {
  approvedControlBudgetRub: number;
  actualCostRub: number;
  committedCostRub: number;
  etcRub: number;
  eacRub: number;
  vacRub: number;
};

/** Selective Equipment cost subset — optional fields; not a full CBS. */
export type EquipmentCostMeasures = {
  approvedCostRub?: number;
  committedCostRub?: number;
  actualCostRub?: number;
  forecastCostRub?: number;
};

export function assertProjectCostInvariants(m: ProjectCostMeasures): void {
  for (const [k, v] of Object.entries(m)) {
    assertIntegerRub(v, k);
  }
  if (m.eacRub !== computeEacRub(m.actualCostRub, m.etcRub)) {
    throw new Error('eacRub must equal actualCostRub + etcRub');
  }
  if (m.vacRub !== computeVacRub(m.approvedBudgetRub, m.eacRub)) {
    throw new Error('vacRub must equal approvedBudgetRub - eacRub');
  }
  if (
    m.contingencyRemainingRub !==
    computeContingencyRemainingRub(
      m.contingencyTotalRub,
      m.contingencyConsumedRub,
    )
  ) {
    throw new Error(
      'contingencyRemainingRub must equal contingencyTotal - consumed',
    );
  }
}

/** Frozen Demo CBS: BAC = Σ WS control budgets + project contingency. */
export function assertFrozenDemoBacCbs(): void {
  if (sumWorkstreamCbsRub() !== DEMO_WORKSTREAM_BUDGETS_SUM_RUB) {
    throw new Error('Frozen Demo WS CBS sum broken');
  }
  if (
    DEMO_PROJECT_BAC_RUB !==
    DEMO_WORKSTREAM_BUDGETS_SUM_RUB + DEMO_PROJECT_CONTINGENCY_TOTAL_RUB
  ) {
    throw new Error('Frozen Demo BAC CBS arithmetic broken');
  }
}

export function assertWorkstreamCostInvariants(m: WorkstreamCostMeasures): void {
  for (const [k, v] of Object.entries(m)) {
    assertIntegerRub(v, k);
  }
  if (m.eacRub !== computeEacRub(m.actualCostRub, m.etcRub)) {
    throw new Error('workstream eacRub must equal actual + etc');
  }
  if (m.vacRub !== computeVacRub(m.approvedControlBudgetRub, m.eacRub)) {
    throw new Error(
      'workstream vacRub must equal approvedControlBudgetRub - eacRub',
    );
  }
}
