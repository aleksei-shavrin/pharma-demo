/**
 * Selective Equipment cost subset (DOC-PROD-026 §3.4).
 * Intentionally incomplete — Σ EQ ≠ WS BAC.
 */
import type { WorkstreamId } from '../workstream-ids';
import type { EquipmentId } from './catalog';
import type { PopulatedSnapshotId } from './types';

export type CostBearingEquipmentDef = {
  equipmentId: EquipmentId;
  workstream: WorkstreamId;
  approvedCostRub: number;
};

/** Story-relevant purchased packages only (~10 of ~52). */
export const COST_BEARING_EQUIPMENT: readonly CostBearingEquipmentDef[] = [
  {
    equipmentId: 'EQ-CLN-01',
    workstream: 'WS-CLN',
    approvedCostRub: 75_000_000,
  },
  {
    equipmentId: 'EQ-HVAC-01',
    workstream: 'WS-HVAC',
    approvedCostRub: 120_000_000,
  },
  {
    equipmentId: 'EQ-HVAC-02',
    workstream: 'WS-HVAC',
    approvedCostRub: 95_000_000,
  },
  {
    equipmentId: 'EQ-UTL-01',
    workstream: 'WS-UTL',
    approvedCostRub: 85_000_000,
  },
  {
    equipmentId: 'EQ-UTL-02',
    workstream: 'WS-UTL',
    approvedCostRub: 110_000_000,
  },
  {
    equipmentId: 'EQ-PRD-01',
    workstream: 'WS-PRD',
    approvedCostRub: 180_000_000,
  },
  {
    equipmentId: 'EQ-PRD-02',
    workstream: 'WS-PRD',
    approvedCostRub: 70_000_000,
  },
  {
    equipmentId: 'EQ-PKG-01',
    workstream: 'WS-PKG',
    approvedCostRub: 90_000_000,
  },
  {
    equipmentId: 'EQ-QC-01',
    workstream: 'WS-QC',
    approvedCostRub: 45_000_000,
  },
  {
    equipmentId: 'EQ-AUT-01',
    workstream: 'WS-AUT',
    approvedCostRub: 55_000_000,
  },
] as const;

export const COST_BEARING_EQUIPMENT_IDS = COST_BEARING_EQUIPMENT.map(
  (e) => e.equipmentId,
);

/**
 * Progress basis points toward approved (0–10_000).
 * HVAC-01 carries modest forecast overrun after C (recovery spend), settles at S.
 */
export type EqProgress = {
  actualBp: number;
  committedBp: number;
  /** Forecast vs approved; 10_000 = at approved. */
  forecastBp: number;
};

const PROGRESS: Record<PopulatedSnapshotId, EqProgress> = {
  A: { actualBp: 400, committedBp: 2500, forecastBp: 10_000 },
  B: { actualBp: 700, committedBp: 2800, forecastBp: 10_000 },
  C: { actualBp: 900, committedBp: 3200, forecastBp: 10_500 },
  D: { actualBp: 1200, committedBp: 3800, forecastBp: 10_800 },
  E: { actualBp: 1600, committedBp: 4500, forecastBp: 11_000 },
  F: { actualBp: 1800, committedBp: 4700, forecastBp: 11_000 },
  G: { actualBp: 2400, committedBp: 5400, forecastBp: 11_200 },
  H: { actualBp: 2800, committedBp: 5800, forecastBp: 11_300 },
  I: { actualBp: 3400, committedBp: 6400, forecastBp: 11_200 },
  J: { actualBp: 4200, committedBp: 7200, forecastBp: 11_200 },
  K: { actualBp: 5000, committedBp: 7800, forecastBp: 11_100 },
  L: { actualBp: 5600, committedBp: 8200, forecastBp: 11_100 },
  M: { actualBp: 6200, committedBp: 8600, forecastBp: 11_200 },
  N: { actualBp: 6500, committedBp: 8700, forecastBp: 11_200 },
  O: { actualBp: 7200, committedBp: 9000, forecastBp: 11_000 },
  P: { actualBp: 8000, committedBp: 9300, forecastBp: 10_900 },
  Q: { actualBp: 8500, committedBp: 9500, forecastBp: 10_800 },
  R: { actualBp: 9000, committedBp: 9700, forecastBp: 10_700 },
  S: { actualBp: 10_000, committedBp: 10_000, forecastBp: 10_500 },
};

/** HVAC spine gets extra forecast pressure C–N (recovery package). */
function forecastBpFor(
  equipmentId: EquipmentId,
  snapshotId: PopulatedSnapshotId,
  base: number,
): number {
  if (equipmentId !== 'EQ-HVAC-01') {
    return Math.min(base, 10_500);
  }
  return base;
}

function scale(approved: number, bp: number): number {
  return Math.floor((approved * bp) / 10_000);
}

export type BuiltEquipmentCost = {
  equipmentId: EquipmentId;
  approvedCostRub: number;
  committedCostRub: number;
  actualCostRub: number;
  forecastCostRub: number;
};

export function buildEquipmentCosts(
  snapshotId: PopulatedSnapshotId,
): BuiltEquipmentCost[] {
  const p = PROGRESS[snapshotId];
  return COST_BEARING_EQUIPMENT.map((def) => {
    const forecastBp = forecastBpFor(def.equipmentId, snapshotId, p.forecastBp);
    const actual = scale(def.approvedCostRub, p.actualBp);
    const committed = Math.min(
      scale(def.approvedCostRub, forecastBp),
      Math.max(actual, scale(def.approvedCostRub, p.committedBp)),
    );
    const forecast = scale(def.approvedCostRub, forecastBp);
    return {
      equipmentId: def.equipmentId,
      approvedCostRub: def.approvedCostRub,
      actualCostRub: actual,
      committedCostRub: committed,
      forecastCostRub: forecast,
    };
  });
}
