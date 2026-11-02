import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WORKSTREAM_IDS, type WorkstreamId } from '../../data/workstream-ids';
import { SNAPSHOT_IDS, type SnapshotId } from '../../snapshot/snapshot-id';
import {
  DEMO_PROJECT_BAC_RUB,
  DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
} from '../money';

/** Project-level integer RUB measures (DOC-PROD-026). */
export class ProjectCostDto {
  @ApiProperty({
    example: DEMO_PROJECT_BAC_RUB,
    description: 'BAC — approved budget including contingency',
  })
  approvedBudgetRub!: number;

  @ApiProperty({ example: 120_000_000 })
  actualCostRub!: number;

  @ApiProperty({
    example: 980_000_000,
    description: 'Parallel obligation signal — not additive to EAC',
  })
  committedCostRub!: number;

  @ApiProperty({ example: 6_080_000_000 })
  etcRub!: number;

  @ApiProperty({
    example: DEMO_PROJECT_BAC_RUB,
    description: 'EAC = Actual + ETC',
  })
  eacRub!: number;

  @ApiProperty({ example: 0, description: 'VAC = BAC − EAC' })
  vacRub!: number;

  @ApiProperty({
    example: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
    description: 'Project-level reserve inside BAC (not a Workstream)',
  })
  contingencyTotalRub!: number;

  @ApiProperty({ example: 0 })
  contingencyConsumedRub!: number;

  @ApiProperty({ example: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB })
  contingencyRemainingRub!: number;
}

/** Workstream authoritative control-budget measures. */
export class WorkstreamCostDto {
  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: WorkstreamId;

  @ApiProperty({ example: 880_000_000 })
  approvedControlBudgetRub!: number;

  @ApiProperty({ example: 0 })
  actualCostRub!: number;

  @ApiProperty({ example: 0 })
  committedCostRub!: number;

  @ApiProperty({ example: 880_000_000 })
  etcRub!: number;

  @ApiProperty({ example: 880_000_000 })
  eacRub!: number;

  @ApiProperty({ example: 0 })
  vacRub!: number;
}

/** Selective Equipment cost subset — optional; Σ EQ ≠ WS budget. */
export class EquipmentCostDto {
  @ApiProperty({ example: 'EQ-HVAC-01' })
  equipmentId!: string;

  @ApiPropertyOptional({ example: 120_000_000 })
  approvedCostRub?: number;

  @ApiPropertyOptional({ example: 80_000_000 })
  committedCostRub?: number;

  @ApiPropertyOptional({ example: 40_000_000 })
  actualCostRub?: number;

  @ApiPropertyOptional({ example: 120_000_000 })
  forecastCostRub?: number;
}

/**
 * Explicit Project ↔ Workstream EAC bridge (DOC-PROD-026).
 * Project EAC = workstreamEacSumRub + projectLevelForecastRub.
 * Contingency is not a ninth Workstream and is not hidden inside WS ETC.
 */
export class CostReconciliationDto {
  @ApiProperty({
    example: 5_850_000_000,
    description: 'Σ Workstream eacRub (control-level forecasts only)',
  })
  workstreamEacSumRub!: number;

  @ApiProperty({
    example: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
    description:
      'Project-level forecast residual inside Project EAC but outside WS control forecasts. Demo: min(contingencyRemaining, etc) — unused contingency still expected mid-lifecycle; 0 at closeout when ETC=0.',
  })
  projectLevelForecastRub!: number;
}

export class ProjectCostsOverviewDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty({ example: 'PRJ-01' })
  projectId!: string;

  @ApiProperty({ type: ProjectCostDto })
  project!: ProjectCostDto;

  @ApiProperty({ type: [WorkstreamCostDto] })
  workstreams!: WorkstreamCostDto[];

  @ApiProperty({
    type: [EquipmentCostDto],
    description: 'Selective cost-bearing equipment only',
  })
  equipment!: EquipmentCostDto[];

  @ApiProperty({
    type: CostReconciliationDto,
    description:
      'Why Project EAC need not equal Σ WS EAC when Project BAC includes contingency reserve',
  })
  reconciliation!: CostReconciliationDto;
}
