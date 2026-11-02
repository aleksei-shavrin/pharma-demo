import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calendarDaysDelta } from '../common/calendar-days-delta';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type { SnapshotId } from '../snapshot/snapshot-id';
import type {
  ScheduleDto,
  ScheduleEquipmentItemDto,
  ScheduleMilestoneItemDto,
} from './dto/schedule.dto';

/**
 * Schedule control-point read model (D11): Milestone + Equipment delivery only.
 * Collection fixtures. No Activity/WBS/CPM/dependencies.
 */
@Injectable()
export class ScheduleService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  getSchedule(projectId: string, snapshotId: SnapshotId): ScheduleDto {
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    const project = this.dataSource.getProject(snapshot.id, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const equipmentItems: ScheduleEquipmentItemDto[] = snapshot.equipment.map(
      (eq) => {
        const eqDelta = calendarDaysDelta(
          eq.baselineDelivery,
          eq.forecastDelivery,
        );
        return {
          kind: 'equipment_delivery',
          id: eq.id,
          name: eq.name,
          workstream: eq.workstream,
          critical: eq.critical,
          status: eq.status,
          baselineDate: eq.baselineDelivery,
          forecastDate: eq.forecastDelivery,
          dateVariance: {
            baselineDate: eq.baselineDelivery,
            forecastDate: eq.forecastDelivery,
            deltaDays: eqDelta,
          },
        };
      },
    );

    const milestoneItems: ScheduleMilestoneItemDto[] =
      snapshot.milestones.map((ms) => {
        const msDelta = calendarDaysDelta(ms.baselineDate, ms.forecastDate);
        return {
          kind: 'milestone',
          id: ms.id,
          name: ms.name,
          workstream: ms.workstream,
          rag: ms.rag,
          baselineDate: ms.baselineDate,
          forecastDate: ms.forecastDate,
          dateVariance: {
            baselineDate: ms.baselineDate,
            forecastDate: ms.forecastDate,
            deltaDays: msDelta,
          },
        };
      });

    const items = [...equipmentItems, ...milestoneItems].sort(compareScheduleItems);

    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: project.id,
      items,
    };
  }
}

/** Canonical schedule order — forecastDate → kind → id (not fixture array order). */
export function compareScheduleItems(
  a: { forecastDate: string; kind: string; id: string },
  b: { forecastDate: string; kind: string; id: string },
): number {
  if (a.forecastDate !== b.forecastDate) {
    return a.forecastDate.localeCompare(b.forecastDate);
  }
  if (a.kind !== b.kind) {
    return a.kind === 'equipment_delivery' ? -1 : 1;
  }
  return a.id.localeCompare(b.id);
}
