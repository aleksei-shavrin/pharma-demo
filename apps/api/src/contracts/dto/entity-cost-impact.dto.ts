import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Optional money signals on Risk / Issue / Decision (DOC-PROD-026).
 * Not CBS nodes — exposure/impact ≠ Workstream budget line.
 */
export class RiskCostImpactDto {
  @ApiPropertyOptional({ example: 80_000_000 })
  costExposureRub?: number;

  @ApiPropertyOptional({ example: 15_000_000 })
  mitigationCostRub?: number;
}

export class IssueCostImpactDto {
  @ApiPropertyOptional({ example: 25_000_000 })
  costImpactRub?: number;

  @ApiPropertyOptional({
    enum: ['realized', 'forecast'],
    description: 'Whether costImpactRub is realized or forecast',
  })
  costImpactBasis?: 'realized' | 'forecast';
}

export class DecisionCostImpactDto {
  @ApiPropertyOptional({
    example: 40_000_000,
    description: 'Recorded intent; alone does not mutate EAC',
  })
  approvedCostImpactRub?: number;
}
