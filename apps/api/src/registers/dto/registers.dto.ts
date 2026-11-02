import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SNAPSHOT_IDS, type SnapshotId } from '../../snapshot/snapshot-id';
import { WORKSTREAM_IDS } from '../../data/workstream-ids';

export class RegisterVarianceDto {
  @ApiProperty({ description: 'forecast − baseline in calendar days' })
  deltaDays!: number;

  @ApiProperty()
  baselineDate!: string;

  @ApiProperty()
  forecastDate!: string;
}

export class EquipmentRegisterItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  critical!: boolean;

  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: string;

  @ApiProperty({ enum: ['OnTrack', 'Delayed'] })
  status!: 'OnTrack' | 'Delayed';

  @ApiProperty()
  baselineDelivery!: string;

  @ApiProperty()
  forecastDelivery!: string;

  @ApiProperty({ type: RegisterVarianceDto })
  deliveryVariance!: RegisterVarianceDto;

  /** Active (Open|Mitigating) Issues linked to this equipment — backend-authored. */
  @ApiProperty({ type: [String] })
  relatedActiveIssueIds!: string[];

  /** Red Risks linked to this equipment — backend-authored. */
  @ApiProperty({ type: [String] })
  relatedRedRiskIds!: string[];
}

export class EquipmentRegisterDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty()
  projectId!: string;

  @ApiProperty({ type: [EquipmentRegisterItemDto] })
  items!: EquipmentRegisterItemDto[];
}

export class IssuesRisksRowDto {
  @ApiProperty({
    enum: ['Issue', 'Risk'],
    description:
      'Single-table Type column (BA-OQ-006 resolved — Demo v1 register decision)',
  })
  type!: 'Issue' | 'Risk';

  @ApiProperty()
  id!: string;

  @ApiProperty({
    description:
      'Issue title or Risk display name from read model (not Owner)',
  })
  title!: string;

  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: string;

  @ApiPropertyOptional({
    enum: ['Open', 'Mitigating', 'Closed'],
    nullable: true,
    description: 'Issue status only; null for Risk rows',
  })
  issueStatus!: 'Open' | 'Mitigating' | 'Closed' | null;

  @ApiPropertyOptional({
    enum: ['Green', 'Red'],
    nullable: true,
    description: 'Risk RAG only; null for Issue rows',
  })
  rag!: 'Green' | 'Red' | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Linked Equipment id when present on the fixture',
  })
  equipmentId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Issue→Risk via Risk.issueId reverse link; Risk→Issue via Risk.issueId',
  })
  linkedIssueId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Issue→Risk via Risk.issueId reverse link; null when Risk has no Issue (e.g. RISK-COM-01)',
  })
  linkedRiskId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Direct Issue→Milestone or Risk→Milestone when present',
  })
  milestoneId!: string | null;

  @ApiPropertyOptional({ description: 'Issue optional cost impact (integer RUB)' })
  costImpactRub?: number;

  @ApiPropertyOptional({ enum: ['realized', 'forecast'] })
  costImpactBasis?: 'realized' | 'forecast';

  @ApiPropertyOptional({ description: 'Risk optional exposure (integer RUB)' })
  costExposureRub?: number;

  @ApiPropertyOptional()
  mitigationCostRub?: number;
}

export class IssuesRisksRegisterDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty()
  projectId!: string;

  @ApiProperty({ type: [IssuesRisksRowDto] })
  rows!: IssuesRisksRowDto[];
}

export class MilestoneRegisterItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    description: 'Fixture/machine name; FE applies director-facing label',
  })
  name!: string;

  @ApiProperty({
    enum: WORKSTREAM_IDS,
    nullable: true,
    description: 'null for project-level MS-PS (no fake workstream)',
  })
  workstream!: string | null;

  @ApiProperty({ enum: ['Green', 'Red'] })
  rag!: 'Green' | 'Red';

  @ApiProperty()
  baselineDate!: string;

  @ApiProperty()
  forecastDate!: string;

  @ApiProperty({ type: RegisterVarianceDto })
  dateVariance!: RegisterVarianceDto;

  /** Active Issues with direct Issue→Milestone — backend-authored. */
  @ApiProperty({ type: [String] })
  relatedActiveIssueIds!: string[];

  /** Red Risks with Risk→Milestone — backend-authored. */
  @ApiProperty({ type: [String] })
  relatedRedRiskIds!: string[];
}

export class MilestonesRegisterDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty()
  projectId!: string;

  @ApiProperty({ type: [MilestoneRegisterItemDto] })
  items!: MilestoneRegisterItemDto[];
}
