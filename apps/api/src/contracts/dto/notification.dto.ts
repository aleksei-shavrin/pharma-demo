import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SNAPSHOT_IDS, type SnapshotId } from '../../snapshot/snapshot-id';

export const NOTIFICATION_TAXONOMIES = [
  'critical_risk',
  'issue',
  'milestone',
  'cost',
  'decision',
  'recovery',
  'readiness',
] as const;

export type NotificationTaxonomy = (typeof NOTIFICATION_TAXONOMIES)[number];

export const NOTIFICATION_SEVERITIES = [
  'critical',
  'attention',
  'info',
] as const;

export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];

/**
 * Notification read-model — not SoT; cannot mutate Risk/Issue/Milestone/Cost.
 * UI storage (future R2-N1): popup preference → localStorage; read/unread → sessionStorage.
 */
export class NotificationEntityRefDto {
  @ApiProperty({
    enum: [
      'equipment',
      'issue',
      'risk',
      'milestone',
      'decision',
      'workstream',
      'person',
    ],
  })
  type!:
    | 'equipment'
    | 'issue'
    | 'risk'
    | 'milestone'
    | 'decision'
    | 'workstream'
    | 'person';

  @ApiProperty({ example: 'ISS-001' })
  id!: string;
}

export class NotificationDto {
  @ApiProperty({ example: 'NTF-C-001' })
  id!: string;

  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty({ enum: NOTIFICATION_SEVERITIES })
  severity!: NotificationSeverity;

  @ApiProperty({ enum: NOTIFICATION_TAXONOMIES })
  taxonomy!: NotificationTaxonomy;

  @ApiProperty({ example: 'Критический сдвиг Production Start' })
  titleRu!: string;

  @ApiPropertyOptional({ nullable: true })
  bodyRu!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '/equipment/EQ-HVAC-01',
  })
  href!: string | null;

  @ApiPropertyOptional({ type: [NotificationEntityRefDto] })
  entityRefs!: NotificationEntityRefDto[];
}

export class NotificationListDto {
  @ApiProperty({ enum: SNAPSHOT_IDS })
  snapshotId!: SnapshotId;

  @ApiProperty()
  scenarioAsOfDate!: string;

  @ApiProperty({ example: 'PRJ-01' })
  projectId!: string;

  @ApiProperty({ type: [NotificationDto] })
  items!: NotificationDto[];
}
