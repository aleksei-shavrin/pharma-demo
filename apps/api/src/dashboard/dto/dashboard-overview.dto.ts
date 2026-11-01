import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SNAPSHOT_IDS, type SnapshotId } from '../../snapshot/snapshot-id';

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
  critical!: boolean;

  @ApiProperty({ enum: ['OnTrack', 'Delayed'] })
  status!: 'OnTrack' | 'Delayed';

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

  @ApiProperty({ enum: ['Open', 'Mitigating'] })
  status!: 'Open' | 'Mitigating';

  @ApiProperty()
  equipmentId!: string;

  @ApiProperty()
  milestoneId!: string;
}

export class DashboardRiskDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['Green', 'Red'] })
  rag!: 'Green' | 'Red';

  @ApiProperty()
  equipmentId!: string;

  @ApiProperty()
  milestoneId!: string;

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

  @ApiProperty()
  baselineDate!: string;

  @ApiProperty()
  forecastDate!: string;
}

export class DashboardDecisionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['PrioritizeRecovery'] })
  type!: 'PrioritizeRecovery';

  @ApiProperty()
  ownerRole!: string;

  @ApiProperty()
  dueDate!: string;

  @ApiProperty()
  note!: string;
}

export class DirectEdgeDto {
  @ApiProperty({ description: 'DOC-BA-015 direct relationship only' })
  kind!: 'direct';

  @ApiProperty()
  fromType!: 'equipment' | 'issue' | 'risk' | 'milestone';

  @ApiProperty()
  fromId!: string;

  @ApiProperty()
  toType!: 'equipment' | 'issue' | 'risk' | 'milestone';

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

/**
 * Decision surface state for Dashboard (Must = read-only).
 * B uses "needed" — not a Domain Decision status "Pending".
 */
export type DecisionPanelState = 'absent' | 'needed' | 'recorded';

export class DashboardOverviewDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty({ type: DashboardProjectDto })
  project!: DashboardProjectDto;

  @ApiProperty({ type: DashboardEquipmentDto })
  equipment!: DashboardEquipmentDto;

  @ApiPropertyOptional({ type: DashboardIssueDto, nullable: true })
  issue!: DashboardIssueDto | null;

  @ApiProperty({ type: DashboardRiskDto })
  risk!: DashboardRiskDto;

  @ApiProperty({ type: DashboardMilestoneDto })
  milestone!: DashboardMilestoneDto;

  @ApiProperty({ enum: ['absent', 'needed', 'recorded'] })
  decisionPanelState!: DecisionPanelState;

  @ApiPropertyOptional({ type: DashboardDecisionDto, nullable: true })
  decision!: DashboardDecisionDto | null;

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
