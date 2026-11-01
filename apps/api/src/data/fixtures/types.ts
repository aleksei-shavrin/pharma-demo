import type { SnapshotId } from '../../snapshot/snapshot-id';

/** Re-export API snapshot id — fixtures stay discrete A|B|C maps. */
export type { SnapshotId };

export type EquipmentStatus = 'OnTrack' | 'Delayed';
export type IssueStatus = 'Open' | 'Mitigating';
export type Rag = 'Green' | 'Red';
export type DecisionType = 'PrioritizeRecovery';

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
}

export interface EquipmentFixture {
  id: string;
  projectId: string;
  critical: boolean;
  baselineDelivery: string;
  forecastDelivery: string;
  status: EquipmentStatus;
}

export interface RiskFixture {
  id: string;
  rag: Rag;
  milestoneId: string;
  equipmentId: string;
  issueId: string | null;
}

export interface IssueFixture {
  id: string;
  title: string;
  status: IssueStatus;
  owner: string;
  equipmentId: string;
  milestoneId: string;
}

export interface DecisionFixture {
  id: string;
  type: DecisionType;
  ownerRole: string;
  dueDate: string;
  note: string;
}

/** One discrete snapshot map (A/B/C). */
export interface SnapshotFixture {
  id: SnapshotId;
  scenarioAsOfDate: string;
  project: ProjectFixture;
  milestone: MilestoneFixture;
  equipment: EquipmentFixture;
  risk: RiskFixture;
  issue: IssueFixture | null;
  decision: DecisionFixture | null;
}
