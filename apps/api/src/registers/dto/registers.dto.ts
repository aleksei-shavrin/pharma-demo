import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SNAPSHOT_IDS, type SnapshotId } from '../../snapshot/snapshot-id';

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
  critical!: boolean;

  @ApiProperty({ enum: ['OnTrack', 'Delayed'] })
  status!: 'OnTrack' | 'Delayed';

  @ApiProperty()
  baselineDelivery!: string;

  @ApiProperty()
  forecastDelivery!: string;

  @ApiProperty({ type: RegisterVarianceDto })
  deliveryVariance!: RegisterVarianceDto;
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

  @ApiPropertyOptional({
    enum: ['Open', 'Mitigating'],
    nullable: true,
    description: 'Issue status only; null for Risk rows',
  })
  issueStatus!: 'Open' | 'Mitigating' | null;

  @ApiPropertyOptional({
    enum: ['Green', 'Red'],
    nullable: true,
    description: 'Risk RAG only; null for Issue rows',
  })
  rag!: 'Green' | 'Red' | null;
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

  @ApiProperty({ enum: ['Green', 'Red'] })
  rag!: 'Green' | 'Red';

  @ApiProperty()
  baselineDate!: string;

  @ApiProperty()
  forecastDate!: string;

  @ApiProperty({ type: RegisterVarianceDto })
  dateVariance!: RegisterVarianceDto;
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
