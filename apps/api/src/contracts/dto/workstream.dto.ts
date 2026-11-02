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
    description: 'Lead Person id (PER-*); null when unset',
  })
  leadPersonId!: PersonId | null;

  @ApiProperty({ example: 3 })
  sortOrder!: number;
}

export class WorkstreamListDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty({ example: 'PRJ-01' })
  projectId!: string;

  @ApiProperty({ type: [WorkstreamCatalogItemDto] })
  items!: WorkstreamCatalogItemDto[];
}

/** Aggregate ids — projections only; not Domain edges. */
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

  @ApiPropertyOptional({ type: WorkstreamCostDto, nullable: true })
  cost!: WorkstreamCostDto | null;
}
