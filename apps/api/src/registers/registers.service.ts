import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calendarDaysDelta } from '../common/calendar-days-delta';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type { SnapshotId } from '../snapshot/snapshot-id';
import type {
  EquipmentRegisterDto,
  IssuesRisksRegisterDto,
  MilestonesRegisterDto,
} from './dto/registers.dto';

/**
 * Snapshot-aware register read models (collection fixtures).
 * Owner is intentionally omitted from Issues & Risks shared columns.
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
      rows.push({
        type: 'Issue',
        id: issue.id,
        title: issue.title,
        issueStatus: issue.status,
        rag: null,
      });
    }

    for (const risk of snapshot.risks) {
      rows.push({
        type: 'Risk',
        id: risk.id,
        title: risk.title,
        issueStatus: null,
        rag: risk.rag,
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
          rag: ms.rag,
          baselineDate: ms.baselineDate,
          forecastDate: ms.forecastDate,
          dateVariance: {
            baselineDate: ms.baselineDate,
            forecastDate: ms.forecastDate,
            deltaDays,
          },
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
