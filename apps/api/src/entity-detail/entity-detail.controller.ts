import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SNAPSHOT_IDS, type SnapshotId } from '../snapshot/snapshot-id';
import { SnapshotQueryPipe } from '../snapshot/snapshot-query.pipe';
import {
  EquipmentDetailDto,
  IssueDetailDto,
  MilestoneDetailDto,
  RiskDetailDto,
} from './dto/entity-detail.dto';
import { EntityDetailService } from './entity-detail.service';

const SNAPSHOT_QUERY = {
  name: 'snapshot' as const,
  required: false,
  enum: SNAPSHOT_IDS,
  description:
    'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
  schema: { default: '01' },
};

@ApiTags('entity-detail')
@Controller('v1/projects')
export class EntityDetailController {
  constructor(private readonly entityDetailService: EntityDetailService) {}

  @Get(':id/equipment/:entityId')
  @ApiOperation({
    summary: 'Equipment detail (Overview + Links + Impact; Links≠Impact)',
  })
  @ApiParam({ name: 'entityId', example: 'EQ-HVAC-01' })
  @ApiQuery(SNAPSHOT_QUERY)
  @ApiOkResponse({ type: EquipmentDetailDto })
  @ApiNotFoundResponse({
    description: 'Project or equipment not found in that snapshot',
  })
  getEquipment(
    @Param('id') id: string,
    @Param('entityId') entityId: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): EquipmentDetailDto {
    return this.entityDetailService.getEquipment(id, entityId, snapshot);
  }

  @Get(':id/issues/:entityId')
  @ApiOperation({
    summary: 'Issue detail (Overview + Links + Impact; Links≠Impact)',
  })
  @ApiParam({ name: 'entityId', example: 'ISS-001' })
  @ApiQuery(SNAPSHOT_QUERY)
  @ApiOkResponse({ type: IssueDetailDto })
  @ApiNotFoundResponse({
    description: 'Project or issue not found in that snapshot',
  })
  getIssue(
    @Param('id') id: string,
    @Param('entityId') entityId: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): IssueDetailDto {
    return this.entityDetailService.getIssue(id, entityId, snapshot);
  }

  @Get(':id/risks/:entityId')
  @ApiOperation({
    summary: 'Risk detail (Overview + Links + Impact; Links≠Impact)',
  })
  @ApiParam({ name: 'entityId', example: 'RISK-001' })
  @ApiQuery(SNAPSHOT_QUERY)
  @ApiOkResponse({ type: RiskDetailDto })
  @ApiNotFoundResponse({
    description: 'Project or risk not found in that snapshot',
  })
  getRisk(
    @Param('id') id: string,
    @Param('entityId') entityId: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): RiskDetailDto {
    return this.entityDetailService.getRisk(id, entityId, snapshot);
  }

  @Get(':id/milestones/:entityId')
  @ApiOperation({
    summary: 'Milestone detail (Overview + Links + Impact; Links≠Impact)',
  })
  @ApiParam({ name: 'entityId', example: 'MS-PS' })
  @ApiQuery(SNAPSHOT_QUERY)
  @ApiOkResponse({ type: MilestoneDetailDto })
  @ApiNotFoundResponse({
    description: 'Project or milestone not found in that snapshot',
  })
  getMilestone(
    @Param('id') id: string,
    @Param('entityId') entityId: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): MilestoneDetailDto {
    return this.entityDetailService.getMilestone(id, entityId, snapshot);
  }
}
