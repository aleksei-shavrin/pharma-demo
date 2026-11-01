import { ApiProperty } from '@nestjs/swagger';

/** I1 project stub response — OpenAPI contract. */
export class ProjectStubDto {
  @ApiProperty({ example: 'PRJ-01' })
  id!: string;

  @ApiProperty({ example: 'Facility Expansion Alpha' })
  name!: string;

  @ApiProperty({ example: '2027-09-15' })
  baselineProductionStart!: string;

  @ApiProperty({ example: '2027-09-15' })
  forecastProductionStart!: string;

  /** I1: always A until Snapshot API lands in I2. */
  @ApiProperty({ example: 'A' })
  snapshotId!: string;

  @ApiProperty({ example: '2027-02-15' })
  scenarioAsOfDate!: string;
}
