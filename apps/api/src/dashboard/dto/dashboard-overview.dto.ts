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

  @ApiPropertyOptional({
    description: 'Optional integer RUB impact (not a CBS node)',
  })
  costImpactRub?: number;

  @ApiPropertyOptional({ enum: ['realized', 'forecast'] })
  costImpactBasis?: 'realized' | 'forecast';
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

  @ApiPropertyOptional({
    description: 'Optional exposure integer RUB (≠ BAC line)',
  })
  costExposureRub?: number;

  @ApiPropertyOptional()
  mitigationCostRub?: number;
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

  @ApiProperty({ nullable: true })
  programId!: string | null;

  @ApiProperty({ nullable: true })
  projectId!: string | null;

  @ApiProperty()
  portfolioVisible!: boolean;
}

export class DecisionExecutionSourceDto {
  @ApiProperty({
    enum: ['demo'],
    description: 'Illustrative demo provenance — not GMP evidence',
  })
  kind!: 'demo';

  @ApiProperty()
  label!: string;
}

export class DecisionExecutionDto {
  @ApiProperty({ enum: ['not_started', 'in_progress', 'completed'] })
  status!: 'not_started' | 'in_progress' | 'completed';

  @ApiProperty()
  evidenceNote!: string;

  @ApiProperty({ type: DecisionExecutionSourceDto })
  source!: DecisionExecutionSourceDto;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty()
  observationId!: string;

  @ApiProperty()
  asOfDate!: string;
}

export class DecisionHonestyDto {
  @ApiProperty({
    description:
      'DEPRECATED BR-006 legacy: always false when Decision recorded. NOT execution status — do not interpret as «action not done».',
    deprecated: true,
  })
  recoveryExecuted!: false;

  @ApiProperty({
    enum: ['within_baseline', 'deviation_persists'],
    description:
      'Forecast deviation vs baseline (independent of executionStatus). BR-006: record alone does not clear deviation.',
  })
  forecastDeviation!: 'within_baseline' | 'deviation_persists';
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

  @ApiProperty({
    description: 'Person owner id (PER-*)',
    pattern: String.raw`^PER-\d{2,}$`,
    example: 'PER-01',
  })
  ownerPersonId!: string;

  @ApiProperty({
    description: 'Director-facing owner name from Person catalogue',
  })
  ownerFullNameRu!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  dueDate!: string | null;

  @ApiProperty()
  note!: string;

  @ApiProperty({ enum: ['none', 'upcoming', 'passed'] })
  dueState!: 'none' | 'upcoming' | 'passed';

  @ApiProperty({
    enum: ['unknown', 'not_started', 'in_progress', 'completed'],
    description: 'Read-only demo execution status; unknown when no observation',
  })
  executionStatus!: 'unknown' | 'not_started' | 'in_progress' | 'completed';

  @ApiPropertyOptional({
    type: DecisionExecutionDto,
    nullable: true,
    description: 'Null when executionStatus=unknown',
  })
  execution!: DecisionExecutionDto | null;

  @ApiPropertyOptional({
    description:
      'Recorded cost intent; alone does not mutate project EAC (BR-006 analogue)',
  })
  approvedCostImpactRub?: number;
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

export type DecisionPanelState = 'absent' | 'needed' | 'recorded';

export class WorkstreamRollupDto {
  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: WorkstreamId;

  @ApiProperty({ enum: ['Green', 'Yellow', 'Red'] })
  status!: 'Green' | 'Yellow' | 'Red';
}

export class ProgramSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['Green', 'Yellow', 'Red'] })
  status!: 'Green' | 'Yellow' | 'Red';

  @ApiPropertyOptional({
    nullable: true,
    type: Number,
    description:
      'Schedule leaf progress % (parity with GET /programs); null when no leaves',
  })
  progressPct!: number | null;

  @ApiProperty()
  leafCompleted!: number;

  @ApiProperty()
  leafTotal!: number;

  @ApiProperty({
    enum: ['ok', 'warn', 'danger'],
    description: 'Same fill tone policy as schedule / programs list',
  })
  progressFillTone!: 'ok' | 'warn' | 'danger';
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

export class PeopleFocusEntityLinkDto {
  @ApiProperty({ enum: ['issue', 'equipment'] })
  type!: 'issue' | 'equipment';

  @ApiProperty()
  id!: string;
}

export class PeopleFocusReasonDto {
  @ApiProperty()
  text!: string;

  @ApiProperty({ type: [PeopleFocusEntityLinkDto] })
  links!: PeopleFocusEntityLinkDto[];
}

export class PeopleFocusPersonDto {
  @ApiProperty({ pattern: String.raw`^PER-\d{2,}$`, example: 'PER-02' })
  personId!: string;

  @ApiProperty()
  fullNameRu!: string;

  @ApiProperty()
  roleTitleRu!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  primaryWorkstreamId!: string | null;

  @ApiProperty()
  criticalIncidentCount!: number;

  @ApiProperty()
  otherActiveIssueCount!: number;

  @ApiProperty()
  hasNewCritical!: boolean;

  @ApiProperty()
  incidentGrowth!: number;

  @ApiProperty({
    description:
      'Critical keys removed for this person vs previous; 0 when previous unknown',
  })
  criticalSignalsRemoved!: number;

  @ApiProperty({ type: [PeopleFocusReasonDto] })
  reasons!: PeopleFocusReasonDto[];

  @ApiProperty({ type: [String] })
  criticalIncidentKeys!: string[];

  @ApiProperty({ type: [String] })
  activeIssueIds!: string[];

  @ApiProperty({ type: [String] })
  delayedCriticalEquipmentIds!: string[];
}

export class PeopleFocusSummaryDto {
  @ApiProperty({ description: 'People with ≥1 open issue or critical delay' })
  peopleWithQuestions!: number;

  @ApiProperty({ description: 'Distinct critical incidents (deduped)' })
  criticalQuestionCount!: number;

  @ApiPropertyOptional({
    nullable: true,
    type: Number,
    description:
      'New critical incidents vs previous snapshot (not all new issues); null on A',
  })
  newCriticalQuestionCount!: number | null;

  @ApiPropertyOptional({
    nullable: true,
    type: Number,
    description:
      'Critical keys present on previous but not current (same predicate); null on A',
  })
  removedCriticalSignalCount!: number | null;

  @ApiProperty({
    description:
      'Active issues not tied to a critical Delayed EQ case (not “low severity”)',
  })
  otherActiveIssueCount!: number;
}

export class PeopleFocusPanelDto {
  @ApiPropertyOptional({
    enum: SNAPSHOT_IDS,
    nullable: true,
    description: 'Previous SNAPSHOT_IDS neighbor; null on A',
  })
  previousSnapshotId!: SnapshotId | null;

  @ApiProperty({ type: PeopleFocusSummaryDto })
  summary!: PeopleFocusSummaryDto;

  @ApiProperty({ type: [PeopleFocusPersonDto] })
  people!: PeopleFocusPersonDto[];

  @ApiProperty({
    type: [String],
    description: 'Critical Delayed EQ with null responsiblePersonId',
  })
  unassignedDelayedCriticalEquipmentIds!: string[];

  @ApiProperty()
  totalPeopleInFocus!: number;
}

export class DashboardOverviewDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty({ enum: ['Green', 'Yellow', 'Red'] })
  projectStatus!: 'Green' | 'Yellow' | 'Red';

  @ApiProperty({
    type: [String],
    description:
      'Fixture-authored executive milestone subset (always includes MS-PS)',
  })
  executiveMilestoneIds!: string[];

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

  @ApiProperty({ type: [ProgramSummaryDto] })
  programs!: ProgramSummaryDto[];

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
      'Present when DEC-001 recorded. recoveryExecuted deprecated always-false; use forecastDeviation + executionStatus.',
  })
  decisionHonesty!: DecisionHonestyDto | null;

  @ApiProperty({
    type: PeopleFocusPanelDto,
    description:
      'Director people-focus: owners of open critical delivery questions (not HR scores)',
  })
  peopleFocus!: PeopleFocusPanelDto;
}
