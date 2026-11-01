import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectStubDto } from './dto/project-stub.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('v1/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'I1 project stub (Snapshot A default; full A/B/C switch is I2)',
  })
  @ApiOkResponse({
    type: ProjectStubDto,
    description: 'Project stub from Demo mock data (default Snapshot A)',
  })
  @ApiNotFoundResponse({ description: 'Project not found in default snapshot' })
  getProject(@Param('id') id: string): ProjectStubDto {
    return this.projectsService.getProjectStub(id);
  }
}
