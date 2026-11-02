/**
 * DOC-PROD-026 §5 — normative project-level A–S cost story (authored).
 * Derived: eac = actual + etc; vac = BAC − eac; remaining = total − consumed.
 */
import type { PopulatedSnapshotId } from './types';

export type AuthoredProjectCost = {
  actualCostRub: number;
  committedCostRub: number;
  etcRub: number;
  contingencyConsumedRub: number;
};

/** Frozen project totals — do not invent; DOC-PROD-026 is authoritative. */
export const PROJECT_COST_STORY: Record<
  PopulatedSnapshotId,
  AuthoredProjectCost
> = {
  A: {
    actualCostRub: 120_000_000,
    committedCostRub: 980_000_000,
    etcRub: 6_080_000_000,
    contingencyConsumedRub: 0,
  },
  B: {
    actualCostRub: 180_000_000,
    committedCostRub: 1_050_000_000,
    etcRub: 6_030_000_000,
    contingencyConsumedRub: 0,
  },
  C: {
    actualCostRub: 210_000_000,
    committedCostRub: 1_120_000_000,
    etcRub: 6_060_000_000,
    contingencyConsumedRub: 40_000_000,
  },
  D: {
    actualCostRub: 280_000_000,
    committedCostRub: 1_280_000_000,
    etcRub: 6_040_000_000,
    contingencyConsumedRub: 60_000_000,
  },
  E: {
    actualCostRub: 360_000_000,
    committedCostRub: 1_520_000_000,
    etcRub: 6_020_000_000,
    contingencyConsumedRub: 90_000_000,
  },
  F: {
    actualCostRub: 390_000_000,
    committedCostRub: 1_560_000_000,
    etcRub: 5_990_000_000,
    contingencyConsumedRub: 90_000_000,
  },
  G: {
    actualCostRub: 520_000_000,
    committedCostRub: 1_780_000_000,
    etcRub: 5_880_000_000,
    contingencyConsumedRub: 120_000_000,
  },
  H: {
    actualCostRub: 610_000_000,
    committedCostRub: 1_920_000_000,
    etcRub: 5_800_000_000,
    contingencyConsumedRub: 140_000_000,
  },
  I: {
    actualCostRub: 780_000_000,
    committedCostRub: 2_180_000_000,
    etcRub: 5_620_000_000,
    contingencyConsumedRub: 160_000_000,
  },
  J: {
    actualCostRub: 980_000_000,
    committedCostRub: 2_520_000_000,
    etcRub: 5_430_000_000,
    contingencyConsumedRub: 180_000_000,
  },
  K: {
    actualCostRub: 1_180_000_000,
    committedCostRub: 2_760_000_000,
    etcRub: 5_230_000_000,
    contingencyConsumedRub: 190_000_000,
  },
  L: {
    actualCostRub: 1_360_000_000,
    committedCostRub: 2_980_000_000,
    etcRub: 5_050_000_000,
    contingencyConsumedRub: 210_000_000,
  },
  M: {
    actualCostRub: 1_520_000_000,
    committedCostRub: 3_120_000_000,
    etcRub: 4_900_000_000,
    contingencyConsumedRub: 230_000_000,
  },
  N: {
    actualCostRub: 1_580_000_000,
    committedCostRub: 3_160_000_000,
    etcRub: 4_840_000_000,
    contingencyConsumedRub: 230_000_000,
  },
  O: {
    actualCostRub: 1_820_000_000,
    committedCostRub: 3_380_000_000,
    etcRub: 4_560_000_000,
    contingencyConsumedRub: 250_000_000,
  },
  P: {
    actualCostRub: 2_180_000_000,
    committedCostRub: 3_620_000_000,
    etcRub: 4_180_000_000,
    contingencyConsumedRub: 270_000_000,
  },
  Q: {
    actualCostRub: 2_360_000_000,
    committedCostRub: 3_700_000_000,
    etcRub: 3_980_000_000,
    contingencyConsumedRub: 280_000_000,
  },
  R: {
    actualCostRub: 2_520_000_000,
    committedCostRub: 3_760_000_000,
    etcRub: 3_800_000_000,
    contingencyConsumedRub: 290_000_000,
  },
  S: {
    actualCostRub: 6_280_000_000,
    committedCostRub: 6_280_000_000,
    etcRub: 0,
    contingencyConsumedRub: 320_000_000,
  },
};
