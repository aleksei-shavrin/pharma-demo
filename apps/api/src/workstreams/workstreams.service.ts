import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  WorkstreamCatalogItemDto,
  WorkstreamDetailDto,
  WorkstreamListDto,
} from '../contracts/dto/workstream.dto';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import { workstreamStatus } from '../data/project-status';
import {
  WORKSTREAM_IDS,
  WORKSTREAM_NAME_RU,
  WORKSTREAM_SORT_ORDER,
  type WorkstreamId,
} from '../data/workstream-ids';
import type { SnapshotId } from '../snapshot/snapshot-id';
import {
  decisionsInWorkstream,
  equipmentInWorkstream,
  issuesInWorkstream,
  milestonesInWorkstream,
  risksInWorkstream,
} from './workstream-membership';

function isWorkstreamId(id: string): id is WorkstreamId {
  return (WORKSTREAM_IDS as readonly string[]).includes(id);
}

function catalogItem(id: WorkstreamId): WorkstreamCatalogItemDto {
  return {
    id,
    nameRu: WORKSTREAM_NAME_RU[id],
    leadPersonId: null,
    sortOrder: WORKSTREAM_SORT_ORDER[id],
  };
}

@Injectable()
export class WorkstreamsService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  list(projectId: string, snapshotId: SnapshotId): WorkstreamListDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    const items = WORKSTREAM_IDS.map((id) => ({
      ...catalogItem(id),
      rag: workstreamStatus(snapshot, id),
    }));
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      items,
    };
  }

  getDetail(
    projectId: string,
    workstreamId: string,
    snapshotId: SnapshotId,
  ): WorkstreamDetailDto {
    if (!isWorkstreamId(workstreamId)) {
      throw new NotFoundException(`Workstream ${workstreamId} not found`);
    }
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    const equipment = equipmentInWorkstream(snapshot, workstreamId);
    const milestones = milestonesInWorkstream(snapshot, workstreamId);
    const issues = issuesInWorkstream(snapshot, workstreamId);
    const risks = risksInWorkstream(snapshot, workstreamId);
    const decisions = decisionsInWorkstream(snapshot, workstreamId);
    const costs = this.dataSource.getCosts(snapshotId);
    const cost =
      costs.workstreams.find((w) => w.workstream === workstreamId) ?? null;

    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      workstream: catalogItem(workstreamId),
      rag: workstreamStatus(snapshot, workstreamId),
      attention: {
        redRiskCount: risks.filter((r) => r.rag === 'Red').length,
        delayedCriticalEquipmentCount: equipment.filter(
          (e) => e.critical && e.status === 'Delayed',
        ).length,
        openOrMitigatingIssueCount: issues.filter(
          (i) => i.status === 'Open' || i.status === 'Mitigating',
        ).length,
      },
      equipmentIds: equipment.map((e) => e.id),
      milestoneIds: milestones.map((m) => m.id),
      issueIds: issues.map((i) => i.id),
      riskIds: risks.map((r) => r.id),
      decisionIds: decisions.map((d) => d.id),
      equipment: equipment.map((e) => ({
        id: e.id,
        name: e.name,
        critical: e.critical,
        status: e.status,
        baselineDelivery: e.baselineDelivery,
        forecastDelivery: e.forecastDelivery,
      })),
      milestones: milestones.map((m) => ({
        id: m.id,
        name: m.name,
        rag: m.rag,
        baselineDate: m.baselineDate,
        forecastDate: m.forecastDate,
      })),
      issues: issues.map((i) => ({
        id: i.id,
        title: i.title,
        status: i.status,
      })),
      risks: risks.map((r) => ({
        id: r.id,
        title: r.title,
        rag: r.rag,
      })),
      decisions: decisions.map((d) => ({
        id: d.id,
        type: d.type,
        note: d.note,
        dueDate: d.dueDate,
        milestoneId: d.milestoneId,
      })),
      cost: cost
        ? {
            workstream: cost.workstream,
            approvedControlBudgetRub: cost.approvedControlBudgetRub,
            actualCostRub: cost.actualCostRub,
            committedCostRub: cost.committedCostRub,
            etcRub: cost.etcRub,
            eacRub: cost.eacRub,
            vacRub: cost.vacRub,
          }
        : null,
    };
  }

  private requireProjectSnapshot(projectId: string, snapshotId: SnapshotId) {
    const project = this.dataSource.getProject(snapshotId, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    return this.dataSource.getSnapshot(snapshotId);
  }
}
