import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectCostsOverviewDto } from '../contracts/dto/cost.dto';
import { SNAPSHOT_IDS, type SnapshotId } from '../snapshot/snapshot-id';
import { SnapshotQueryPipe } from '../snapshot/snapshot-query.pipe';
import { CostsService } from './costs.service';

@ApiTags('costs')
@Controller('v1/projects')
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  @Get(':id/costs')
  @ApiOperation({
    summary:
      'Project Controls cost overview — project / workstream / selective equipment (integer RUB)',
  })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: '01' },
  })
  @ApiOkResponse({ type: ProjectCostsOverviewDto })
  @ApiNotFoundResponse({ description: 'Project not found in that snapshot' })
  getCosts(
    @Param('id') id: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): ProjectCostsOverviewDto {
    return this.costsService.getOverview(id, snapshot);
  }
}
