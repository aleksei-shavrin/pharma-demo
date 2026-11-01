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
 * Snapshot-aware register read models. Does not import fixture constants.
 * Owner is intentionally omitted from Issues & Risks shared columns.
 */
@Injectable()
export class RegistersService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  listEquipment(projectId: string, snapshotId: SnapshotId): EquipmentRegisterDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    const eq = snapshot.equipment;
    const deltaDays = calendarDaysDelta(
      eq.baselineDelivery,
      eq.forecastDelivery,
    );
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      items: [
        {
          id: eq.id,
          critical: eq.critical,
          status: eq.status,
          baselineDelivery: eq.baselineDelivery,
          forecastDelivery: eq.forecastDelivery,
          deliveryVariance: {
            baselineDate: eq.baselineDelivery,
            forecastDate: eq.forecastDelivery,
            deltaDays,
          },
        },
      ],
    };
  }

  listIssuesRisks(
    projectId: string,
    snapshotId: SnapshotId,
  ): IssuesRisksRegisterDto {
    const snapshot = this.requireProjectSnapshot(projectId, snapshotId);
    const rows: IssuesRisksRegisterDto['rows'] = [];

    if (snapshot.issue) {
      rows.push({
        type: 'Issue',
        id: snapshot.issue.id,
        title: snapshot.issue.title,
        issueStatus: snapshot.issue.status,
        rag: null,
      });
    }

    rows.push({
      type: 'Risk',
      id: snapshot.risk.id,
      title: snapshot.risk.id,
      issueStatus: null,
      rag: snapshot.risk.rag,
    });

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
    const ms = snapshot.milestone;
    const deltaDays = calendarDaysDelta(ms.baselineDate, ms.forecastDate);
    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: snapshot.project.id,
      items: [
        {
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
        },
      ],
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
