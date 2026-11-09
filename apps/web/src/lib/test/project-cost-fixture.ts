import type { ProjectCost } from '@/lib/api-client';
import {
  DEMO_PROJECT_BAC_RUB,
  DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
} from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { SNAPSHOT_IDS } from '@/lib/snapshot/snapshot-id';

/**
 * DOC-PROD-026 §5 project-level authored story (mirror of API cost-project-story).
 * FE copy only — does not import API internals (architecture boundary).
 * Derived: eac = actual + etc; vac = BAC − eac; remaining = total − consumed.
 */
type AuthoredProjectCost = {
  actualCostRub: number;
  committedCostRub: number;
  etcRub: number;
  contingencyConsumedRub: number;
};

const PROJECT_COST_STORY: Record<SnapshotId, AuthoredProjectCost> = {
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

/** Slim project-level cost signal for FE tests (DOC-PROD-026 integers). */
export function projectCostFixture(snapshotId: SnapshotId): ProjectCost {
  const authored = PROJECT_COST_STORY[snapshotId];
  const eacRub = authored.actualCostRub + authored.etcRub;
  return {
    approvedBudgetRub: DEMO_PROJECT_BAC_RUB,
    actualCostRub: authored.actualCostRub,
    committedCostRub: authored.committedCostRub,
    etcRub: authored.etcRub,
    eacRub,
    vacRub: DEMO_PROJECT_BAC_RUB - eacRub,
    contingencyTotalRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
    contingencyConsumedRub: authored.contingencyConsumedRub,
    contingencyRemainingRub:
      DEMO_PROJECT_CONTINGENCY_TOTAL_RUB - authored.contingencyConsumedRub,
  };
}

/** All SnapshotIds for parity sweeps. */
export const PROJECT_COST_FIXTURE_IDS: readonly SnapshotId[] = SNAPSHOT_IDS;
