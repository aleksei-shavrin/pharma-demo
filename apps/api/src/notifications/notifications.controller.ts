import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationListDto } from '../contracts/dto/notification.dto';
import { SNAPSHOT_IDS, type SnapshotId } from '../snapshot/snapshot-id';
import { SnapshotQueryPipe } from '../snapshot/snapshot-query.pipe';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('v1/projects')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':id/notifications')
  @ApiOperation({
    summary:
      'Director notification read-model for snapshot (Demo v1 R2-N1; not SoT)',
  })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: 'A' },
  })
  @ApiOkResponse({ type: NotificationListDto })
  @ApiNotFoundResponse({ description: 'Project not found in that snapshot' })
  list(
    @Param('id') id: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): NotificationListDto {
    return this.notificationsService.list(id, snapshot);
  }
}
