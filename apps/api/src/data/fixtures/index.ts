import { assertDecisionExecutionCatalogOrThrow } from '../decision-execution';
import { buildAllSnapshots } from './build-snapshot';
import type { PopulatedSnapshotId, SnapshotFixture, SnapshotId } from './types';

/** Fail-closed at fixture bootstrap — demo execution catalog must be valid. */
assertDecisionExecutionCatalogOrThrow();

export * from './types';
export {
  EQUIPMENT_CATALOG,
  EQUIPMENT_IDS,
  MILESTONE_CATALOG,
  MILESTONE_IDS,
  ISSUE_CATALOG,
  ISSUE_IDS,
  RISK_CATALOG,
  RISK_IDS,
  DECISION_CATALOG,
  DECISION_IDS,
  PROJECT,
} from './catalog';
export { SNAPSHOT_STATES } from './snapshot-states';
export {
  buildSnapshot,
  buildAllSnapshots,
  decisionsPresentAt,
  issuesPresentAt,
  risksPresentAt,
} from './build-snapshot';
export {
  COST_SNAPSHOTS,
  buildCosts,
  buildAllCosts,
  computeProjectLevelForecastRub,
  type BuiltProjectCosts,
  type CostReconciliation,
} from './build-costs';
export { PROJECT_COST_STORY } from './cost-project-story';
export {
  COST_BEARING_EQUIPMENT,
  COST_BEARING_EQUIPMENT_IDS,
} from './cost-equipment';

/**
 * Populated Demo snapshots 01–19 (R2-L1 lifecycle fixtures).
 */
export const SNAPSHOTS: Record<PopulatedSnapshotId, SnapshotFixture> =
  buildAllSnapshots();

export const SNAPSHOT_01 = SNAPSHOTS['01'];
export const SNAPSHOT_02 = SNAPSHOTS['02'];
export const SNAPSHOT_03 = SNAPSHOTS['03'];
export const SNAPSHOT_04 = SNAPSHOTS['04'];
export const SNAPSHOT_05 = SNAPSHOTS['05'];
export const SNAPSHOT_06 = SNAPSHOTS['06'];
export const SNAPSHOT_07 = SNAPSHOTS['07'];
export const SNAPSHOT_08 = SNAPSHOTS['08'];
export const SNAPSHOT_09 = SNAPSHOTS['09'];
export const SNAPSHOT_10 = SNAPSHOTS['10'];
export const SNAPSHOT_11 = SNAPSHOTS['11'];
export const SNAPSHOT_12 = SNAPSHOTS['12'];
export const SNAPSHOT_13 = SNAPSHOTS['13'];
export const SNAPSHOT_14 = SNAPSHOTS['14'];
export const SNAPSHOT_15 = SNAPSHOTS['15'];
export const SNAPSHOT_16 = SNAPSHOTS['16'];
export const SNAPSHOT_17 = SNAPSHOTS['17'];
export const SNAPSHOT_18 = SNAPSHOTS['18'];
export const SNAPSHOT_19 = SNAPSHOTS['19'];

export const DEFAULT_SNAPSHOT_ID: SnapshotId = '01';
