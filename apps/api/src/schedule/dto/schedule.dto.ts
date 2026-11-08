import {
  ApiProperty,
  ApiPropertyOptional,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { WORKSTREAM_IDS } from '../../data/workstream-ids';
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

  @ApiProperty({ description: 'RU equipment name for director-facing rows' })
  name!: string;

  @ApiProperty({ enum: WORKSTREAM_IDS })
  workstream!: string;

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

  @ApiProperty({ nullable: true, type: String })
  parentKey!: string | null;

  @ApiProperty({ nullable: true, type: String })
  wbs!: string | null;

  @ApiProperty({ nullable: true, type: Number })
  siblingOrder!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  progressPct!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  sourceWeeks!: number | null;
}

export class ScheduleMilestoneItemDto {
  @ApiProperty({ enum: ['milestone'] })
  kind!: 'milestone';

  @ApiProperty({ example: 'MS-PS' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    enum: WORKSTREAM_IDS,
    nullable: true,
    description: 'null for project-level MS-PS',
  })
  workstream!: string | null;

  @ApiProperty({ enum: ['Green', 'Red'] })
  rag!: 'Green' | 'Red';

  @ApiProperty({ description: 'Milestone baselineDate' })
  baselineDate!: string;

  @ApiProperty({ description: 'Milestone forecastDate' })
  forecastDate!: string;

  @ApiProperty({ type: ScheduleVarianceDto })
  dateVariance!: ScheduleVarianceDto;

  @ApiProperty({ nullable: true, type: String })
  parentKey!: string | null;

  @ApiProperty({ nullable: true, type: String })
  wbs!: string | null;

  @ApiProperty({ nullable: true, type: Number })
  siblingOrder!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  progressPct!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  sourceWeeks!: number | null;

  @ApiPropertyOptional({
    enum: ['catalog_milestone', 'controlpoint'],
    description: 'catalog MS vs imported analyst КТ (zero-duration)',
  })
  sourceKind?: 'catalog_milestone' | 'controlpoint';

  @ApiPropertyOptional({
    description: 'Raw analyst source status for imported КТ',
  })
  sourceStatus?: string | null;
}

export const SCHEDULE_GROUP_KINDS = ['project_group', 'stage_group'] as const;

export type ScheduleGroupKind = (typeof SCHEDULE_GROUP_KINDS)[number];

/**
 * Schedule view-model group. No stored forecast interval: the client
 * summarizes children. progressPct MAY be an equal-weight rollup of leaves.
 */
export class ScheduleGroupItemDto {
  @ApiProperty({ enum: SCHEDULE_GROUP_KINDS })
  kind!: ScheduleGroupKind;

  @ApiProperty({ example: 'AN-08' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    nullable: true,
    type: String,
    example: 'project_group:AN-08',
    description: 'kind:id of a group in the same snapshot, or null',
  })
  parentKey!: string | null;

  @ApiProperty({ nullable: true, type: String, example: '8.2' })
  wbs!: string | null;

  @ApiProperty({ nullable: true, type: Number })
  siblingOrder!: number | null;

  @ApiProperty({
    nullable: true,
    type: Number,
    description:
      'Equal-weight rollup of known leaf progressPct under this group, or null when no known leaves.',
  })
  progressPct!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  sourceWeeks!: number | null;
}

export type ScheduleWorkStatus =
  'Waiting' | 'OnSchedule' | 'Delayed' | 'Completed';

export const SCHEDULE_WORK_STATUSES = [
  'Waiting',
  'OnSchedule',
  'Delayed',
  'Completed',
] as const satisfies readonly ScheduleWorkStatus[];

export type ScheduleLinkType = 'FS' | 'SS' | 'FF' | 'SF';

export const SCHEDULE_LINK_TYPES = [
  'FS',
  'SS',
  'FF',
  'SF',
] as const satisfies readonly ScheduleLinkType[];

export class ScheduleWorkItemDto {
  @ApiProperty({ enum: ['work'] })
  kind!: 'work';

  @ApiProperty({ example: 'WK-01' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    enum: WORKSTREAM_IDS,
    nullable: true,
    required: false,
    description: 'Optional workstream; omitted or null when not assigned',
  })
  workstream?: string | null;

  @ApiProperty({ description: 'Work start (inclusive), YYYY-MM-DD' })
  startDate!: string;

  @ApiProperty({
    description: 'Work end (inclusive), YYYY-MM-DD; endDate >= startDate',
  })
  endDate!: string;

  @ApiProperty({ enum: SCHEDULE_WORK_STATUSES })
  status!: ScheduleWorkStatus;

  @ApiProperty({ nullable: true, type: String })
  parentKey!: string | null;

  @ApiProperty({ nullable: true, type: String })
  wbs!: string | null;

  @ApiProperty({ nullable: true, type: Number })
  siblingOrder!: number | null;

  @ApiProperty({
    nullable: true,
    type: Number,
    description:
      'Known progress 0..100. null means unknown, including when status is set. 0 is stored, not omitted.',
  })
  progressPct!: number | null;

  @ApiProperty({ nullable: true, type: Number })
  sourceWeeks!: number | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    description: 'Raw analyst source status when imported',
  })
  sourceStatus?: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Baseline start. Null iff baselineEnd is null.',
  })
  baselineStart!: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Baseline end (inclusive). Null iff baselineStart is null.',
  })
  baselineEnd!: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description:
      'Inclusive actual start. Explicit fixture value. Not derived from status or progress.',
  })
  actualStart!: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description:
      'Inclusive actual end. Null while the fact is open. Not derived from the forecast.',
  })
  actualEnd!: string | null;
}

export class ScheduleLinkDto {
  @ApiProperty({ example: 'LNK-FS-01' })
  id!: string;

  @ApiProperty({
    enum: ['scheduling', 'cross_project_predecessor'],
    description:
      'scheduling is leaf↔leaf (work|milestone) with a planning type. cross_project_predecessor is typed ⇢ leaf↔leaf with no planning type; direction preserved.',
  })
  kind!: 'scheduling' | 'cross_project_predecessor';

  @ApiProperty({
    example: 'work:WK-01',
    description: 'work:<id> or milestone:<id>',
  })
  sourceRef!: string;

  @ApiProperty({
    example: 'work:WK-03',
    description: 'work:<id> or milestone:<id>',
  })
  targetRef!: string;

  @ApiPropertyOptional({ enum: SCHEDULE_LINK_TYPES })
  type?: ScheduleLinkType;
}

export type ScheduleItemDto =
  | ScheduleEquipmentItemDto
  | ScheduleMilestoneItemDto
  | ScheduleGroupItemDto
  | ScheduleWorkItemDto;

@ApiExtraModels(
  ScheduleEquipmentItemDto,
  ScheduleMilestoneItemDto,
  ScheduleGroupItemDto,
  ScheduleWorkItemDto,
  ScheduleLinkDto,
)
export class ScheduleDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty()
  projectId!: string;

  @ApiProperty({
    description:
      'Schedule rows: groups, equipment delivery, milestones, and work bars. Groups have no stored interval. Dated rows are ordered by forecastDate or startDate, then kind, then id. Groups sort by wbs or id; the client reorders the tree. wbs is a stable row code, not a domain WBS or CPM.',
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(ScheduleEquipmentItemDto) },
        { $ref: getSchemaPath(ScheduleMilestoneItemDto) },
        { $ref: getSchemaPath(ScheduleGroupItemDto) },
        { $ref: getSchemaPath(ScheduleWorkItemDto) },
      ],
    },
  })
  items!: ScheduleItemDto[];

  @ApiProperty({
    type: [ScheduleLinkDto],
    description:
      'Dependency links between work items (sourceRef/targetRef = work:<id>). Empty when the snapshot has no works.',
  })
  links!: ScheduleLinkDto[];
}
