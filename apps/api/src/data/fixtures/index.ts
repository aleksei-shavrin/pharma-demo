import { buildAllSnapshots } from './build-snapshot';
import type { PopulatedSnapshotId, SnapshotFixture, SnapshotId } from './types';

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
 * Populated Demo snapshots A–S (R2-L1 lifecycle fixtures).
 */
export const SNAPSHOTS: Record<PopulatedSnapshotId, SnapshotFixture> =
  buildAllSnapshots();

export const SNAPSHOT_A = SNAPSHOTS.A;
export const SNAPSHOT_B = SNAPSHOTS.B;
export const SNAPSHOT_C = SNAPSHOTS.C;
export const SNAPSHOT_D = SNAPSHOTS.D;
export const SNAPSHOT_E = SNAPSHOTS.E;
export const SNAPSHOT_F = SNAPSHOTS.F;
export const SNAPSHOT_G = SNAPSHOTS.G;
export const SNAPSHOT_H = SNAPSHOTS.H;
export const SNAPSHOT_I = SNAPSHOTS.I;
export const SNAPSHOT_J = SNAPSHOTS.J;
export const SNAPSHOT_K = SNAPSHOTS.K;
export const SNAPSHOT_L = SNAPSHOTS.L;
export const SNAPSHOT_M = SNAPSHOTS.M;
export const SNAPSHOT_N = SNAPSHOTS.N;
export const SNAPSHOT_O = SNAPSHOTS.O;
export const SNAPSHOT_P = SNAPSHOTS.P;
export const SNAPSHOT_Q = SNAPSHOTS.Q;
export const SNAPSHOT_R = SNAPSHOTS.R;
export const SNAPSHOT_S = SNAPSHOTS.S;

export const DEFAULT_SNAPSHOT_ID: SnapshotId = 'A';
