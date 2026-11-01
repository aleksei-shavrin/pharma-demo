import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type { SnapshotId } from '../snapshot/snapshot-id';
import { ProjectStubDto } from './dto/project-stub.dto';

/**
 * Application use case: project stub for Demo narrative.
 * Depends on DemoDataSource — does not import fixture constants.
 */
@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  getProjectStub(projectId: string, snapshotId: SnapshotId): ProjectStubDto {
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    const project = this.dataSource.getProject(snapshot.id, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    const dto = new ProjectStubDto();
    dto.id = project.id;
    dto.name = project.name;
    dto.baselineProductionStart = project.baselineProductionStart;
    dto.forecastProductionStart = project.forecastProductionStart;
    dto.snapshotId = snapshot.id;
    dto.scenarioAsOfDate = snapshot.scenarioAsOfDate;
    return dto;
  }
}
