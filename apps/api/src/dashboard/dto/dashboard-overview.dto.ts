import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SNAPSHOT_IDS, type SnapshotId } from '../../snapshot/snapshot-id';
import { WORKSTREAM_IDS, type WorkstreamId } from '../../data/workstream-ids';

export class VarianceDto {
  @ApiProperty({
    description: 'Subject of variance (never mix delivery vs PS)',
  })
  subject!: 'equipment_delivery' | 'production_start';

  @ApiProperty()
  baselineDate!: string;

  @ApiProperty()
  forecastDate!: string;

  @ApiProperty({
    description: 'forecast − baseline in calendar days (derived, BR-004)',
  })
  deltaDays!: number;
}

export class DashboardProjectDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  baselineProductionStart!: string;

  @ApiProperty()
  forecastProductionStart!: string;

  @ApiProperty({ type: VarianceDto })
  productionStartVariance!: VarianceDto;
}

export class DashboardEquipmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  critical!: boolean;

  @ApiProperty({ enum: ['OnTrack', 'Delayed'] })
  status!: 'OnTrack' | 'Delayed';

  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: WorkstreamId;

  @ApiProperty()
  baselineDelivery!: string;

  @ApiProperty()
  forecastDelivery!: string;

  @ApiProperty({ type: VarianceDto })
  deliveryVariance!: VarianceDto;
}

export class DashboardIssueDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: ['Open', 'Mitigating', 'Closed'] })
  status!: 'Open' | 'Mitigating' | 'Closed';

  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: WorkstreamId;

  @ApiProperty()
  equipmentId!: string;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    description: 'null when Issue has no milestone (e.g. ISS-UTL-02)',
  })
  milestoneId!: string | null;
}

export class DashboardRiskDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: ['Green', 'Red'] })
  rag!: 'Green' | 'Red';

  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: WorkstreamId;

  @ApiPropertyOptional({ nullable: true, type: String })
  equipmentId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    description: 'null when Risk has no milestone (e.g. RISK-UTL-02)',
  })
  milestoneId!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  issueId!: string | null;
}

export class DashboardMilestoneDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['Green', 'Red'] })
  rag!: 'Green' | 'Red';

  @ApiPropertyOptional({
    enum: WORKSTREAM_IDS,
    nullable: true,
    description: 'null for project-level MS-PS',
  })
  workstream!: WorkstreamId | null;

  @ApiProperty()
  baselineDate!: string;

  @ApiProperty()
  forecastDate!: string;
}

export class DashboardDecisionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  projectId!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  milestoneId!: string | null;

  @ApiProperty({ enum: ['PrioritizeRecovery', 'AcceptDateSlip'] })
  type!: 'PrioritizeRecovery' | 'AcceptDateSlip';

  @ApiProperty()
  ownerRole!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  dueDate!: string | null;

  @ApiProperty()
  note!: string;
}

export class DirectEdgeDto {
  @ApiProperty({ description: 'DOC-BA-015 direct relationship only' })
  kind!: 'direct';

  @ApiProperty()
  fromType!: 'equipment' | 'issue' | 'risk' | 'milestone' | 'decision';

  @ApiProperty()
  fromId!: string;

  @ApiProperty()
  toType!: 'equipment' | 'issue' | 'risk' | 'milestone' | 'decision';

  @ApiProperty()
  toId!: string;
}

export class DerivedImpactDto {
  @ApiProperty({
    description:
      'Machine rule id (BR-004). Not for director UI copy — FE presents narrative.',
  })
  rule!: 'BR-004';

  @ApiProperty()
  equipmentDeliveryDeltaDays!: number;

  @ApiProperty()
  productionStartDeltaDays!: number;

  @ApiProperty({
    description:
      'Semantic kind for presentation: none = no slip; aligned_slip = EQ delivery slip equals PS slip (derived, not EQ—MS Domain edge).',
    enum: ['none', 'aligned_slip'],
  })
  kind!: 'none' | 'aligned_slip';
}

export class DecisionHonestyDto {
  @ApiProperty({
    description:
      'Always false in Demo v1 when Decision is recorded (BR-006). FE builds user copy.',
  })
  recoveryExecuted!: false;
}

export type DecisionPanelState = 'absent' | 'needed' | 'recorded';

export class WorkstreamRollupDto {
  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: WorkstreamId;

  @ApiProperty({ enum: ['Green', 'Yellow', 'Red'] })
  status!: 'Green' | 'Yellow' | 'Red';
}

export class TopExceptionLinkDto {
  @ApiProperty({ enum: ['equipment', 'issue', 'risk', 'milestone'] })
  type!: 'equipment' | 'issue' | 'risk' | 'milestone';

  @ApiProperty()
  id!: string;
}

/**
 * Dashboard/read-model Top Exception.
 * `priority` is presentation metadata only — NOT a Domain field.
 */
export class TopExceptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  causeImpact!: string;

  @ApiProperty({ type: [TopExceptionLinkDto] })
  links!: TopExceptionLinkDto[];

  @ApiProperty({
    description:
      'Curated Demo management order on read model only (not Domain managementPriority)',
  })
  priority!: number;
}

export class TrendDto {
  @ApiProperty({ type: [String] })
  better!: string[];

  @ApiProperty({ type: [String] })
  worse!: string[];

  @ApiProperty({ type: [String] })
  unchangedCritical!: string[];
}

export class DashboardOverviewDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty({ enum: ['Green', 'Yellow', 'Red'] })
  projectStatus!: 'Green' | 'Yellow' | 'Red';

  @ApiProperty({ type: DashboardProjectDto })
  project!: DashboardProjectDto;

  @ApiProperty({ type: [DashboardEquipmentDto] })
  equipment!: DashboardEquipmentDto[];

  @ApiProperty({ type: [DashboardIssueDto] })
  issues!: DashboardIssueDto[];

  @ApiProperty({ type: [DashboardRiskDto] })
  risks!: DashboardRiskDto[];

  @ApiProperty({ type: [DashboardMilestoneDto] })
  milestones!: DashboardMilestoneDto[];

  @ApiProperty({ type: [DashboardDecisionDto] })
  decisions!: DashboardDecisionDto[];

  @ApiProperty({ type: [WorkstreamRollupDto] })
  workstreamRollups!: WorkstreamRollupDto[];

  @ApiProperty({ type: [TopExceptionDto] })
  topExceptions!: TopExceptionDto[];

  @ApiProperty({ type: TrendDto })
  trend!: TrendDto;

  @ApiProperty({ enum: ['absent', 'needed', 'recorded'] })
  decisionPanelState!: DecisionPanelState;

  @ApiProperty({ type: [DirectEdgeDto] })
  directEdges!: DirectEdgeDto[];

  @ApiProperty({ type: DerivedImpactDto })
  derivedImpact!: DerivedImpactDto;

  @ApiPropertyOptional({
    type: DecisionHonestyDto,
    nullable: true,
    description:
      'Present when Decision recorded; recoveryExecuted is always false in Demo v1 (BR-006). UI prose is FE-owned.',
  })
  decisionHonesty!: DecisionHonestyDto | null;
}
