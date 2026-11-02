import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  PersonDetailDto,
  PersonListDto,
} from '../contracts/dto/person.dto';
import { SNAPSHOT_IDS, type SnapshotId } from '../snapshot/snapshot-id';
import { SnapshotQueryPipe } from '../snapshot/snapshot-query.pipe';
import { PeopleService } from './people.service';

@ApiTags('people')
@Controller('v1/projects')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get(':id/people')
  @ApiOperation({
    summary: 'Person catalogue for project (Demo v1 R2-P1)',
  })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: 'A' },
  })
  @ApiOkResponse({ type: PersonListDto })
  @ApiNotFoundResponse({ description: 'Project not found in that snapshot' })
  list(
    @Param('id') id: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): PersonListDto {
    return this.peopleService.list(id, snapshot);
  }

  @Get(':id/people/:personId')
  @ApiOperation({
    summary:
      'Person detail with responsibility projections (Demo v1 R2-P1)',
  })
  @ApiQuery({
    name: 'snapshot',
    required: false,
    enum: SNAPSHOT_IDS,
    description:
      'Discrete Demo snapshot context. Omitted defaults to A. Invalid → 400.',
    schema: { default: 'A' },
  })
  @ApiOkResponse({ type: PersonDetailDto })
  @ApiNotFoundResponse({
    description: 'Project or Person not found in that snapshot',
  })
  getDetail(
    @Param('id') id: string,
    @Param('personId') personId: string,
    @Query('snapshot', SnapshotQueryPipe) snapshot: SnapshotId,
  ): PersonDetailDto {
    return this.peopleService.getDetail(id, personId, snapshot);
  }
}
