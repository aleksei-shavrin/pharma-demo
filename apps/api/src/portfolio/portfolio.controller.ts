import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SNAPSHOT_IDS, type SnapshotId } from '../snapshot/snapshot-id';
import { SnapshotQueryPipe } from '../snapshot/snapshot-query.pipe';
import { PortfolioService } from './portfolio.service';

@ApiTags('portfolio')
@Controller('v1/projects/:projectId')
export class PortfolioController {
  constructor(private readonly portfolio: PortfolioService) {}

  @Get('programs')
  @ApiQuery({ name: 'snapshot', required: false, enum: SNAPSHOT_IDS })
  @ApiNotFoundResponse({ description: 'Запись не найдена в этом снимке' })
  listPrograms(
    @Param('projectId') projectId: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ) {
    return this.portfolio.listPrograms(projectId, snapshot);
  }

  @Get('programs/:programId')
  @ApiQuery({ name: 'snapshot', required: false, enum: SNAPSHOT_IDS })
  @ApiNotFoundResponse({ description: 'Запись не найдена в этом снимке' })
  getProgram(
    @Param('projectId') projectId: string,
    @Param('programId') programId: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ) {
    return this.portfolio.getProgram(projectId, programId, snapshot);
  }

  @Get('analyst-projects')
  @ApiQuery({ name: 'snapshot', required: false, enum: SNAPSHOT_IDS })
  listProjects(
    @Param('projectId') projectId: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ) {
    return this.portfolio.listProjects(projectId, snapshot);
  }

  @Get('analyst-projects/:analystProjectId')
  @ApiQuery({ name: 'snapshot', required: false, enum: SNAPSHOT_IDS })
  @ApiNotFoundResponse({ description: 'Запись не найдена в этом снимке' })
  getProject(
    @Param('projectId') projectId: string,
    @Param('analystProjectId') analystProjectId: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ) {
    return this.portfolio.getProject(projectId, analystProjectId, snapshot);
  }
}
