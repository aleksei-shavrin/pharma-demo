import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WORKSTREAM_IDS } from '../../data/workstream-ids';
import { SNAPSHOT_IDS, type SnapshotId } from '../../snapshot/snapshot-id';

export class EntityLinkDto {
  @ApiProperty({
    enum: ['equipment', 'issue', 'risk', 'milestone'],
    description: 'Target entity type (DOC-BA-015 direct only)',
  })
  targetType!: 'equipment' | 'issue' | 'risk' | 'milestone';

  @ApiProperty()
  targetId!: string;

  @ApiProperty({
    description: 'Director-facing label source (title/name/id from Domain)',
  })
  displayName!: string;
}

export class EntityImpactDto {
  @ApiProperty({
    enum: ['none', 'aligned_slip'],
    description:
      'Derived management impact kind (not a Domain edge; separate from links)',
  })
  kind!: 'none' | 'aligned_slip';

  @ApiProperty()
  equipmentDeliveryDeltaDays!: number;

  @ApiProperty()
  productionStartDeltaDays!: number;

  @ApiProperty({ enum: ['OnTrack', 'Delayed'] })
  equipmentStatus!: 'OnTrack' | 'Delayed';

  @ApiProperty()
  equipmentForecastDelivery!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  issueId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    enum: ['Open', 'Mitigating', 'Closed'],
  })
  issueStatus!: 'Open' | 'Mitigating' | 'Closed' | null;

  @ApiProperty()
  riskId!: string;

  @ApiProperty({ enum: ['Green', 'Red'] })
  riskRag!: 'Green' | 'Red';

  @ApiProperty()
  milestoneId!: string;

  @ApiProperty()
  milestoneName!: string;

  @ApiProperty({ enum: ['Green', 'Red'] })
  milestoneRag!: 'Green' | 'Red';

  @ApiProperty()
  productionStartForecast!: string;

  @ApiProperty({ enum: ['absent', 'needed', 'recorded'] })
  decisionState!: 'absent' | 'needed' | 'recorded';

  @ApiPropertyOptional({
    nullable: true,
    description: 'Recorded decision summary when present; never a Links edge',
  })
  decision!: {
    id: string;
    type: 'PrioritizeRecovery' | 'AcceptDateSlip';
    projectId: string;
    milestoneId: string | null;
    ownerRole: string;
    dueDate: string | null;
    note: string;
  } | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'false when decision recorded (recovery not executed); null otherwise',
  })
  recoveryExecuted!: false | null;
}

export class DetailVarianceDto {
  @ApiProperty()
  baselineDate!: string;

  @ApiProperty()
  forecastDate!: string;

  @ApiProperty()
  deltaDays!: number;
}

export class EquipmentOverviewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'RU name from Domain fixture' })
  name!: string;

  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: (typeof WORKSTREAM_IDS)[number];

  @ApiProperty()
  critical!: boolean;

  @ApiProperty({ enum: ['OnTrack', 'Delayed'] })
  status!: 'OnTrack' | 'Delayed';

  @ApiProperty()
  baselineDelivery!: string;

  @ApiProperty()
  forecastDelivery!: string;

  @ApiProperty({ type: DetailVarianceDto })
  deliveryVariance!: DetailVarianceDto;
}

export class IssueOverviewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: ['Open', 'Mitigating', 'Closed'] })
  status!: 'Open' | 'Mitigating' | 'Closed';

  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: (typeof WORKSTREAM_IDS)[number];

  @ApiProperty({
    description: 'OwnerRef metadata (SH-*); not a Domain Owner entity',
  })
  owner!: string;
}

export class RiskOverviewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'RU title from Domain fixture' })
  title!: string;

  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: (typeof WORKSTREAM_IDS)[number];

  @ApiProperty({ enum: ['Green', 'Red'] })
  rag!: 'Green' | 'Red';
}

export class MilestoneOverviewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    enum: WORKSTREAM_IDS,
    nullable: true,
    description: 'null for project-level MS-PS',
  })
  workstream!: (typeof WORKSTREAM_IDS)[number] | null;

  @ApiProperty({ enum: ['Green', 'Red'] })
  rag!: 'Green' | 'Red';

  @ApiProperty()
  baselineDate!: string;

  @ApiProperty()
  forecastDate!: string;

  @ApiProperty({ type: DetailVarianceDto })
  dateVariance!: DetailVarianceDto;
}

class DetailEnvelopeBase {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty()
  projectId!: string;

  @ApiProperty({ type: [EntityLinkDto] })
  links!: EntityLinkDto[];

  @ApiProperty({
    type: EntityImpactDto,
    description: 'Derived impact — separate from links (DOC-BA-015)',
  })
  impact!: EntityImpactDto;
}

export class EquipmentDetailDto extends DetailEnvelopeBase {
  @ApiProperty({ type: EquipmentOverviewDto })
  entity!: EquipmentOverviewDto;
}

export class IssueDetailDto extends DetailEnvelopeBase {
  @ApiProperty({ type: IssueOverviewDto })
  entity!: IssueOverviewDto;
}

export class RiskDetailDto extends DetailEnvelopeBase {
  @ApiProperty({ type: RiskOverviewDto })
  entity!: RiskOverviewDto;
}

export class MilestoneDetailDto extends DetailEnvelopeBase {
  @ApiProperty({ type: MilestoneOverviewDto })
  entity!: MilestoneOverviewDto;
}
