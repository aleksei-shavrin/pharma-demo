/**
 * DOC-PROD-026 §5 — normative project-level 01–19 cost story (authored).
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
  '01': {
    actualCostRub: 120_000_000,
    committedCostRub: 980_000_000,
    etcRub: 6_080_000_000,
    contingencyConsumedRub: 0,
  },
  '02': {
    actualCostRub: 180_000_000,
    committedCostRub: 1_050_000_000,
    etcRub: 6_030_000_000,
    contingencyConsumedRub: 0,
  },
  '03': {
    actualCostRub: 210_000_000,
    committedCostRub: 1_120_000_000,
    etcRub: 6_060_000_000,
    contingencyConsumedRub: 40_000_000,
  },
  '04': {
    actualCostRub: 280_000_000,
    committedCostRub: 1_280_000_000,
    etcRub: 6_040_000_000,
    contingencyConsumedRub: 60_000_000,
  },
  '05': {
    actualCostRub: 360_000_000,
    committedCostRub: 1_520_000_000,
    etcRub: 6_020_000_000,
    contingencyConsumedRub: 90_000_000,
  },
  '06': {
    actualCostRub: 390_000_000,
    committedCostRub: 1_560_000_000,
    etcRub: 5_990_000_000,
    contingencyConsumedRub: 90_000_000,
  },
  '07': {
    actualCostRub: 520_000_000,
    committedCostRub: 1_780_000_000,
    etcRub: 5_880_000_000,
    contingencyConsumedRub: 120_000_000,
  },
  '08': {
    actualCostRub: 610_000_000,
    committedCostRub: 1_920_000_000,
    etcRub: 5_800_000_000,
    contingencyConsumedRub: 140_000_000,
  },
  '09': {
    actualCostRub: 780_000_000,
    committedCostRub: 2_180_000_000,
    etcRub: 5_620_000_000,
    contingencyConsumedRub: 160_000_000,
  },
  '10': {
    actualCostRub: 980_000_000,
    committedCostRub: 2_520_000_000,
    etcRub: 5_430_000_000,
    contingencyConsumedRub: 180_000_000,
  },
  '11': {
    actualCostRub: 1_180_000_000,
    committedCostRub: 2_760_000_000,
    etcRub: 5_230_000_000,
    contingencyConsumedRub: 190_000_000,
  },
  '12': {
    actualCostRub: 1_360_000_000,
    committedCostRub: 2_980_000_000,
    etcRub: 5_050_000_000,
    contingencyConsumedRub: 210_000_000,
  },
  '13': {
    actualCostRub: 1_520_000_000,
    committedCostRub: 3_120_000_000,
    etcRub: 4_900_000_000,
    contingencyConsumedRub: 230_000_000,
  },
  '14': {
    actualCostRub: 1_580_000_000,
    committedCostRub: 3_160_000_000,
    etcRub: 4_840_000_000,
    contingencyConsumedRub: 230_000_000,
  },
  '15': {
    actualCostRub: 1_820_000_000,
    committedCostRub: 3_380_000_000,
    etcRub: 4_560_000_000,
    contingencyConsumedRub: 250_000_000,
  },
  '16': {
    actualCostRub: 2_180_000_000,
    committedCostRub: 3_620_000_000,
    etcRub: 4_180_000_000,
    contingencyConsumedRub: 270_000_000,
  },
  '17': {
    actualCostRub: 2_360_000_000,
    committedCostRub: 3_700_000_000,
    etcRub: 3_980_000_000,
    contingencyConsumedRub: 280_000_000,
  },
  '18': {
    actualCostRub: 2_520_000_000,
    committedCostRub: 3_760_000_000,
    etcRub: 3_800_000_000,
    contingencyConsumedRub: 290_000_000,
  },
  '19': {
    actualCostRub: 6_280_000_000,
    committedCostRub: 6_280_000_000,
    etcRub: 0,
    contingencyConsumedRub: 320_000_000,
  },
};
