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
import {
  DecisionsRegisterDto,
  EquipmentRegisterDto,
  IssuesRisksRegisterDto,
  MilestonesRegisterDto,
} from './dto/registers.dto';
import { RegistersService } from './registers.service';

@ApiTags('registers')
@Controller('v1/projects')
export class RegistersController {
  constructor(private readonly registersService: RegistersService) {}

  @Get(':id/equipment')
  @ApiOperation({ summary: 'Equipment register read model (Demo v1)' })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: '01' },
  })
  @ApiOkResponse({ type: EquipmentRegisterDto })
  @ApiNotFoundResponse({ description: 'Project not found in that snapshot' })
  listEquipment(
    @Param('id') id: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): EquipmentRegisterDto {
    return this.registersService.listEquipment(id, snapshot);
  }

  @Get(':id/issues-risks')
  @ApiOperation({
    summary:
      'Issues & Risks register read model (single table + Type; BA-OQ-006 resolved)',
  })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: '01' },
  })
  @ApiOkResponse({ type: IssuesRisksRegisterDto })
  @ApiNotFoundResponse({ description: 'Project not found in that snapshot' })
  listIssuesRisks(
    @Param('id') id: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): IssuesRisksRegisterDto {
    return this.registersService.listIssuesRisks(id, snapshot);
  }

  @Get(':id/milestones')
  @ApiOperation({ summary: 'Milestones register read model (Demo v1)' })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: '01' },
  })
  @ApiOkResponse({ type: MilestonesRegisterDto })
  @ApiNotFoundResponse({ description: 'Project not found in that snapshot' })
  listMilestones(
    @Param('id') id: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): MilestonesRegisterDto {
    return this.registersService.listMilestones(id, snapshot);
  }

  @Get(':id/decisions')
  @ApiOperation({
    summary: 'Decisions register read model (Demo v1; no write/edit)',
  })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: '01' },
  })
  @ApiOkResponse({ type: DecisionsRegisterDto })
  @ApiNotFoundResponse({ description: 'Project not found in that snapshot' })
  listDecisions(
    @Param('id') id: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): DecisionsRegisterDto {
    return this.registersService.listDecisions(id, snapshot);
  }
}
