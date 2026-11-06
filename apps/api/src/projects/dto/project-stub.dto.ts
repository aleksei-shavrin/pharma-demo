import { ApiProperty } from '@nestjs/swagger';
import { SNAPSHOT_IDS, type SnapshotId } from '../../snapshot/snapshot-id';

/** Project stub response — OpenAPI contract. */
export class ProjectStubDto {
  @ApiProperty({ example: 'PRJ-01' })
  id!: string;

  @ApiProperty({ example: 'Строительство фармацевтической фабрики (Greenfield)' })
  name!: string;

  @ApiProperty({ example: '2027-09-15' })
  baselineProductionStart!: string;

  @ApiProperty({ example: '2027-09-15' })
  forecastProductionStart!: string;

  @ApiProperty({ example: 'A', enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty({ example: '2027-02-15' })
  scenarioAsOfDate!: string;
}
