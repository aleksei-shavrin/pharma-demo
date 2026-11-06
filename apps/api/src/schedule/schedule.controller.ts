import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SNAPSHOT_IDS, type SnapshotId } from '../snapshot/snapshot-id';
import { SnapshotQueryPipe } from '../snapshot/snapshot-query.pipe';
import { ScheduleDto } from './dto/schedule.dto';
import { ScheduleService } from './schedule.service';

@ApiTags('schedule')
@Controller('v1/projects')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get(':id/schedule')
  @ApiOperation({
    summary:
      'Schedule read model: control points (Milestone + Equipment delivery) + Work bars + links',
  })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: 'A' },
  })
  @ApiOkResponse({ type: ScheduleDto })
  @ApiNotFoundResponse({ description: 'Project not found in that snapshot' })
  getSchedule(
    @Param('id') id: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): ScheduleDto {
    return this.scheduleService.getSchedule(id, snapshot);
  }
}
