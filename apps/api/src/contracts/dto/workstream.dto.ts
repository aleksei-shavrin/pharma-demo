import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WORKSTREAM_IDS, type WorkstreamId } from '../../data/workstream-ids';
import { SNAPSHOT_IDS, type SnapshotId } from '../../snapshot/snapshot-id';
import {
  PERSON_ID_API_PROPERTY,
  type PersonId,
} from '../person-id';
import { WorkstreamCostDto } from './cost.dto';

/**
 * Workstream read-model catalog item (DOC-BA-018).
 * Membership remains via existing `workstream` fields — not causal edges.
 */
export class WorkstreamCatalogItemDto {
  @ApiProperty({ enum: WORKSTREAM_IDS })
  id!: WorkstreamId;

  @ApiProperty({ example: 'HVAC' })
  nameRu!: string;

  @ApiPropertyOptional({
    ...PERSON_ID_API_PROPERTY,
    example: 'PER-08',
    nullable: true,
    description: 'Lead Person id (PER-*); null when unset (until R2-P1)',
  })
  leadPersonId!: PersonId | null;

  @ApiProperty({ example: 3 })
  sortOrder!: number;
}

export class WorkstreamListItemDto extends WorkstreamCatalogItemDto {
  @ApiProperty({ enum: ['Green', 'Yellow', 'Red'] })
  rag!: 'Green' | 'Yellow' | 'Red';
}

export class WorkstreamListDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty({ example: 'PRJ-01' })
  projectId!: string;

  @ApiProperty({ type: [WorkstreamListItemDto] })
  items!: WorkstreamListItemDto[];
}

export class WorkstreamMilestoneSummaryDto {
  @ApiProperty({ example: 'MS-HVAC-IQ' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['Green', 'Red'] })
  rag!: 'Green' | 'Red';

  @ApiProperty()
  baselineDate!: string;

  @ApiProperty()
  forecastDate!: string;
}

export class WorkstreamEquipmentSummaryDto {
  @ApiProperty({ example: 'EQ-HVAC-01' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  critical!: boolean;

  @ApiProperty({ enum: ['OnTrack', 'Delayed'] })
  status!: 'OnTrack' | 'Delayed';

  @ApiProperty()
  baselineDelivery!: string;

  @ApiProperty()
  forecastDelivery!: string;
}

export class WorkstreamIssueSummaryDto {
  @ApiProperty({ example: 'ISS-001' })
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: ['Open', 'Mitigating', 'Closed'] })
  status!: 'Open' | 'Mitigating' | 'Closed';
}

export class WorkstreamRiskSummaryDto {
  @ApiProperty({ example: 'RISK-001' })
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: ['Green', 'Red'] })
  rag!: 'Green' | 'Red';
}

export class WorkstreamDecisionSummaryDto {
  @ApiProperty({ example: 'DEC-HVAC-01' })
  id!: string;

  @ApiProperty({ enum: ['PrioritizeRecovery', 'AcceptDateSlip'] })
  type!: 'PrioritizeRecovery' | 'AcceptDateSlip';

  @ApiProperty()
  note!: string;

  @ApiPropertyOptional({ nullable: true })
  dueDate!: string | null;

  @ApiPropertyOptional({ nullable: true })
  milestoneId!: string | null;
}

export class WorkstreamAttentionDto {
  @ApiProperty({ example: 1 })
  redRiskCount!: number;

  @ApiProperty({ example: 1 })
  delayedCriticalEquipmentCount!: number;

  @ApiProperty({ example: 1 })
  openOrMitigatingIssueCount!: number;
}

/** Aggregate projections — not Domain edges. */
export class WorkstreamDetailDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty({ example: 'PRJ-01' })
  projectId!: string;

  @ApiProperty({ type: WorkstreamCatalogItemDto })
  workstream!: WorkstreamCatalogItemDto;

  @ApiProperty({ enum: ['Green', 'Yellow', 'Red'] })
  rag!: 'Green' | 'Yellow' | 'Red';

  @ApiProperty({ type: WorkstreamAttentionDto })
  attention!: WorkstreamAttentionDto;

  @ApiProperty({ type: [String] })
  equipmentIds!: string[];

  @ApiProperty({ type: [String] })
  milestoneIds!: string[];

  @ApiProperty({ type: [String] })
  issueIds!: string[];

  @ApiProperty({ type: [String] })
  riskIds!: string[];

  @ApiProperty({ type: [String] })
  decisionIds!: string[];

  @ApiProperty({ type: [WorkstreamEquipmentSummaryDto] })
  equipment!: WorkstreamEquipmentSummaryDto[];

  @ApiProperty({ type: [WorkstreamMilestoneSummaryDto] })
  milestones!: WorkstreamMilestoneSummaryDto[];

  @ApiProperty({ type: [WorkstreamIssueSummaryDto] })
  issues!: WorkstreamIssueSummaryDto[];

  @ApiProperty({ type: [WorkstreamRiskSummaryDto] })
  risks!: WorkstreamRiskSummaryDto[];

  @ApiProperty({ type: [WorkstreamDecisionSummaryDto] })
  decisions!: WorkstreamDecisionSummaryDto[];

  @ApiPropertyOptional({ type: WorkstreamCostDto, nullable: true })
  cost!: WorkstreamCostDto | null;
}
