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
import { DashboardService } from './dashboard.service';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';

@ApiTags('dashboard')
@Controller('v1/projects')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(':id/dashboard')
  @ApiOperation({
    summary:
      'Dashboard overview read model (Director narrative; BR-004/BR-006 honesty)',
  })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: 'A' },
  })
  @ApiOkResponse({ type: DashboardOverviewDto })
  @ApiNotFoundResponse({ description: 'Project not found in that snapshot' })
  getDashboard(
    @Param('id') id: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): DashboardOverviewDto {
    return this.dashboardService.getOverview(id, snapshot);
  }
}
