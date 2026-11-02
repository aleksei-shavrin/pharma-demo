import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WORKSTREAM_IDS, type WorkstreamId } from '../../data/workstream-ids';
import type { SnapshotId } from '../../snapshot/snapshot-id';
import { SNAPSHOT_IDS } from '../../snapshot/snapshot-id';
import {
  PERSON_ID_API_PROPERTY,
  type PersonId,
} from '../person-id';

/** Person reference entity — not HRIS (DOC-PROD-025). */
export class PersonDto {
  @ApiProperty(PERSON_ID_API_PROPERTY)
  id!: PersonId;

  @ApiProperty({ example: 'Иванов Алексей Петрович' })
  fullNameRu!: string;

  @ApiProperty({ example: 'Директор проекта' })
  roleTitleRu!: string;

  @ApiPropertyOptional({
    enum: WORKSTREAM_IDS,
    nullable: true,
    description: 'Primary workstream when meaningful',
  })
  primaryWorkstreamId!: WorkstreamId | null;

  @ApiProperty({ example: true })
  active!: boolean;
}

export class PersonListDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty({ example: 'PRJ-01' })
  projectId!: string;

  @ApiProperty({ type: [PersonDto] })
  items!: PersonDto[];
}

/** Responsibility projections — navigational only; no budget ownership. */
export class PersonDetailDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty({ example: 'PRJ-01' })
  projectId!: string;

  @ApiProperty({ type: PersonDto })
  person!: PersonDto;

  @ApiProperty({ type: [String], description: 'Issue ids owned' })
  issueIds!: string[];

  @ApiProperty({ type: [String], description: 'Decision ids owned' })
  decisionIds!: string[];

  @ApiProperty({
    type: [String],
    description: 'Optional responsible Equipment ids',
  })
  equipmentIds!: string[];

  @ApiProperty({
    enum: WORKSTREAM_IDS,
    isArray: true,
    description: 'Workstream ids where person is lead',
  })
  leadWorkstreamIds!: WorkstreamId[];
}
