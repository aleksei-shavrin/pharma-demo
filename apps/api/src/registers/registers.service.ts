import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calendarDaysDelta } from '../common/calendar-days-delta';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type { SnapshotFixture } from '../data/fixtures/types';
import type { SnapshotId } from '../snapshot/snapshot-id';
import type {
  EquipmentRegisterDto,
  IssuesRisksRegisterDto,
  MilestonesRegisterDto,
} from './dto/registers.dto';

/**
 * Snapshot-aware register read models (collection fixtures).
 * Owner is intentionally omitted from Issues & Risks shared columns (BA-OQ-006).
 * Relationship ids are fixture-authored edges only — no FE joins / Domain invent.
 */
@Injectable()
export class RegistersService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  listEquipment(projectId: string, snapshotId: SnapshotId): EquipmentRegisterDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      items: snapshot.equipment.map((eq) => {
        const deltaDays = calendarDaysDelta(
          eq.baselineDelivery,
          eq.forecastDelivery,
        );
        return {
          id: eq.id,
          name: eq.name,
          critical: eq.critical,
          workstream: eq.workstream,
          status: eq.status,
          baselineDelivery: eq.baselineDelivery,
          forecastDelivery: eq.forecastDelivery,
          deliveryVariance: {
            baselineDate: eq.baselineDelivery,
            forecastDate: eq.forecastDelivery,
            deltaDays,
          },
          relatedActiveIssueIds: activeIssuesForEquipment(snapshot, eq.id),
          relatedRedRiskIds: redRisksForEquipment(snapshot, eq.id),
        };
      }),
    };
  }

  listIssuesRisks(
    projectId: string,
    snapshotId: SnapshotId,
  ): IssuesRisksRegisterDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    const rows: IssuesRisksRegisterDto['rows'] = [];

    for (const issue of snapshot.issues) {
      const linkedRisk =
        snapshot.risks.find((r) => r.issueId === issue.id)?.id ?? null;
      rows.push({
        type: 'Issue',
        id: issue.id,
        title: issue.title,
        workstream: issue.workstream,
        issueStatus: issue.status,
        rag: null,
        equipmentId: issue.equipmentId,
        linkedIssueId: null,
        linkedRiskId: linkedRisk,
        milestoneId: issue.milestoneId,
      });
    }

    for (const risk of snapshot.risks) {
      rows.push({
        type: 'Risk',
        id: risk.id,
        title: risk.title,
        workstream: risk.workstream,
        issueStatus: null,
        rag: risk.rag,
        equipmentId: risk.equipmentId,
        linkedIssueId: risk.issueId,
        linkedRiskId: null,
        milestoneId: risk.milestoneId,
      });
    }

    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      rows,
    };
  }

  listMilestones(
    projectId: string,
    snapshotId: SnapshotId,
  ): MilestonesRegisterDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      items: snapshot.milestones.map((ms) => {
        const deltaDays = calendarDaysDelta(ms.baselineDate, ms.forecastDate);
        return {
          id: ms.id,
          name: ms.name,
          workstream: ms.workstream,
          rag: ms.rag,
          baselineDate: ms.baselineDate,
          forecastDate: ms.forecastDate,
          dateVariance: {
            baselineDate: ms.baselineDate,
            forecastDate: ms.forecastDate,
            deltaDays,
          },
          relatedActiveIssueIds: activeIssuesForMilestone(snapshot, ms.id),
          relatedRedRiskIds: redRisksForMilestone(snapshot, ms.id),
        };
      }),
    };
  }

  private requireProjectSnapshot(projectId: string, snapshotId: SnapshotId) {
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    const project = this.dataSource.getProject(snapshot.id, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    return snapshot;
  }
}

function activeIssuesForEquipment(
  snapshot: SnapshotFixture,
  equipmentId: string,
): string[] {
  return snapshot.issues
    .filter(
      (i) =>
        i.equipmentId === equipmentId &&
        (i.status === 'Open' || i.status === 'Mitigating'),
    )
    .map((i) => i.id);
}

function redRisksForEquipment(
  snapshot: SnapshotFixture,
  equipmentId: string,
): string[] {
  return snapshot.risks
    .filter((r) => r.equipmentId === equipmentId && r.rag === 'Red')
    .map((r) => r.id);
}

function activeIssuesForMilestone(
  snapshot: SnapshotFixture,
  milestoneId: string,
): string[] {
  return snapshot.issues
    .filter(
      (i) =>
        i.milestoneId === milestoneId &&
        (i.status === 'Open' || i.status === 'Mitigating'),
    )
    .map((i) => i.id);
}

function redRisksForMilestone(
  snapshot: SnapshotFixture,
  milestoneId: string,
): string[] {
  return snapshot.risks
    .filter((r) => r.milestoneId === milestoneId && r.rag === 'Red')
    .map((r) => r.id);
}
