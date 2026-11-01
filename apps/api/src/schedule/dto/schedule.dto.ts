import { ApiProperty, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { SNAPSHOT_IDS, type SnapshotId } from '../../snapshot/snapshot-id';

export class ScheduleVarianceDto {
  @ApiProperty()
  baselineDate!: string;

  @ApiProperty()
  forecastDate!: string;

  @ApiProperty({ description: 'forecast − baseline in calendar days' })
  deltaDays!: number;
}

export class ScheduleEquipmentItemDto {
  @ApiProperty({ enum: ['equipment_delivery'] })
  kind!: 'equipment_delivery';

  @ApiProperty({ example: 'EQ-HVAC-01' })
  id!: string;

  @ApiProperty()
  critical!: boolean;

  @ApiProperty({ enum: ['OnTrack', 'Delayed'] })
  status!: 'OnTrack' | 'Delayed';

  @ApiProperty({ description: 'Equipment baselineDelivery' })
  baselineDate!: string;

  @ApiProperty({ description: 'Equipment forecastDelivery' })
  forecastDate!: string;

  @ApiProperty({ type: ScheduleVarianceDto })
  dateVariance!: ScheduleVarianceDto;
}

export class ScheduleMilestoneItemDto {
  @ApiProperty({ enum: ['milestone'] })
  kind!: 'milestone';

  @ApiProperty({ example: 'MS-PS' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ['Green', 'Red'] })
  rag!: 'Green' | 'Red';

  @ApiProperty({ description: 'Milestone baselineDate' })
  baselineDate!: string;

  @ApiProperty({ description: 'Milestone forecastDate' })
  forecastDate!: string;

  @ApiProperty({ type: ScheduleVarianceDto })
  dateVariance!: ScheduleVarianceDto;
}

@ApiExtraModels(ScheduleEquipmentItemDto, ScheduleMilestoneItemDto)
export class ScheduleDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty()
  projectId!: string;

  @ApiProperty({
    description:
      'Control-point rows only (Equipment delivery + Milestone). No Activity/WBS/CPM. Ordered by forecastDate, then kind, then id.',
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(ScheduleEquipmentItemDto) },
        { $ref: getSchemaPath(ScheduleMilestoneItemDto) },
      ],
    },
  })
  items!: Array<ScheduleEquipmentItemDto | ScheduleMilestoneItemDto>;
}
