import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SNAPSHOT_IDS } from '../snapshot/snapshot-id';
import { SnapshotQueryPipe } from '../snapshot/snapshot-query.pipe';
import type { SnapshotId } from '../snapshot/snapshot-id';
import { ProjectStubDto } from './dto/project-stub.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('v1/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':id')
  @ApiOperation({
    summary:
      'Project stub for request-scoped snapshot (default A; discrete A–S)',
  })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: 'A' },
  })
  @ApiOkResponse({
    type: ProjectStubDto,
    description: 'Project stub for the requested snapshot (no mixed fixtures)',
  })
  @ApiNotFoundResponse({ description: 'Project not found in that snapshot' })
  getProject(
    @Param('id') id: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): ProjectStubDto {
    return this.projectsService.getProjectStub(id, snapshot);
  }
}
