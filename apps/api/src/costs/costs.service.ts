import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ProjectCostsOverviewDto } from '../contracts/dto/cost.dto';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type { SnapshotId } from '../snapshot/snapshot-id';

/** Project Controls cost read model (DOC-PROD-026 / R2-M1). */
@Injectable()
export class CostsService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  getOverview(projectId: string, snapshotId: SnapshotId): ProjectCostsOverviewDto {
    const project = this.dataSource.getProject(snapshotId, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    const costs = this.dataSource.getCosts(snapshotId);
    return {
      snapshotId: costs.snapshotId,
      scenarioAsOfDate: costs.scenarioAsOfDate,
      projectId: costs.projectId,
      project: { ...costs.project },
      workstreams: costs.workstreams.map((ws) => ({ ...ws })),
      equipment: costs.equipment.map((eq) => ({ ...eq })),
      reconciliation: { ...costs.reconciliation },
    };
  }
}
