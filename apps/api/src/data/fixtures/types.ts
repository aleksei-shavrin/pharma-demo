import type { SnapshotId } from '../../snapshot/snapshot-id';
import type { WorkstreamId } from '../workstream-ids';

/** Re-export API snapshot id — fixtures are discrete A–H maps (E1: A–C populated). */
export type { SnapshotId };
export type { WorkstreamId };

export type EquipmentStatus = 'OnTrack' | 'Delayed';
export type IssueStatus = 'Open' | 'Mitigating' | 'Closed';
export type Rag = 'Green' | 'Red';
export type ProjectStatus = 'Green' | 'Yellow' | 'Red';
export type DecisionType = 'PrioritizeRecovery' | 'AcceptDateSlip';

export interface ProjectFixture {
  id: string;
  name: string;
  baselineProductionStart: string;
  forecastProductionStart: string;
}

export interface MilestoneFixture {
  id: string;
  name: string;
  baselineDate: string;
  forecastDate: string;
  rag: Rag;
  /** null for project-level MS-PS (no fake workstream). */
  workstream: WorkstreamId | null;
}

export interface EquipmentFixture {
  id: string;
  projectId: string;
  name: string;
  critical: boolean;
  baselineDelivery: string;
  forecastDelivery: string;
  status: EquipmentStatus;
  workstream: WorkstreamId;
}

export interface RiskFixture {
  id: string;
  title: string;
  rag: Rag;
  milestoneId: string;
  equipmentId: string | null;
  issueId: string | null;
  workstream: WorkstreamId;
}

export interface IssueFixture {
  id: string;
  title: string;
  status: IssueStatus;
  owner: string;
  equipmentId: string;
  milestoneId: string;
  workstream: WorkstreamId;
}

export interface DecisionFixture {
  id: string;
  projectId: string;
  milestoneId: string | null;
  type: DecisionType;
  ownerRole: string;
  dueDate: string | null;
  note: string;
}

/** Dashboard/read-model only — not Domain entity fields. */
export interface TopExceptionFixture {
  id: string;
  title: string;
  causeImpact: string;
  links: { type: 'equipment' | 'issue' | 'risk' | 'milestone'; id: string }[];
  priority: number;
}

/** Fixture-authored trend — not a diff engine. */
export interface TrendFixture {
  better: string[];
  worse: string[];
  unchangedCritical: string[];
}

/**
 * Collection-shaped discrete snapshot (E1+).
 * Temporary E1 stubs are multi-record but not full DOC-PROD-021.
 */
export interface SnapshotFixture {
  id: SnapshotId;
  scenarioAsOfDate: string;
  project: ProjectFixture;
  milestones: MilestoneFixture[];
  equipment: EquipmentFixture[];
  risks: RiskFixture[];
  issues: IssueFixture[];
  decisions: DecisionFixture[];
  /** Curated Demo order — read-model metadata only. */
  topExceptions: TopExceptionFixture[];
  trend: TrendFixture;
}
