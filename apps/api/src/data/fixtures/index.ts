import { buildAllSnapshots } from './build-snapshot';
import type {
  PopulatedSnapshotId,
  SnapshotFixture,
  SnapshotId,
} from './types';

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

/**
 * Populated Demo snapshots A–H (E2 full DOC-PROD-021/022 fixtures).
 * Accepted SnapshotId space is A–S; I–S overlays are R2-L1.
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

export const DEFAULT_SNAPSHOT_ID: SnapshotId = 'A';
