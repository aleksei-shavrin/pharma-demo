import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  WorkstreamDetailDto,
  WorkstreamListDto,
} from '../contracts/dto/workstream.dto';
import { SNAPSHOT_IDS, type SnapshotId } from '../snapshot/snapshot-id';
import { SnapshotQueryPipe } from '../snapshot/snapshot-query.pipe';
import { WorkstreamsService } from './workstreams.service';

@ApiTags('workstreams')
@Controller('v1/projects')
export class WorkstreamsController {
  constructor(private readonly workstreamsService: WorkstreamsService) {}

  @Get(':id/workstreams')
  @ApiOperation({
    summary: 'Workstream catalog with backend-owned RAG (Demo v1 R2-W1)',
  })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: 'A' },
  })
  @ApiOkResponse({ type: WorkstreamListDto })
  @ApiNotFoundResponse({ description: 'Project not found in that snapshot' })
  list(
    @Param('id') id: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): WorkstreamListDto {
    return this.workstreamsService.list(id, snapshot);
  }

  @Get(':id/workstreams/:workstreamId')
  @ApiOperation({
    summary:
      'Workstream detail — RAG, membership projections, cost summary (Demo v1 R2-W1)',
  })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: 'A' },
  })
  @ApiOkResponse({ type: WorkstreamDetailDto })
  @ApiNotFoundResponse({
    description: 'Project or Workstream not found in that snapshot',
  })
  getDetail(
    @Param('id') id: string,
    @Param('workstreamId') workstreamId: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): WorkstreamDetailDto {
    return this.workstreamsService.getDetail(id, workstreamId, snapshot);
  }
}
