import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calendarDaysDelta } from '../common/calendar-days-delta';
import {
  computeDerivedImpact,
  decisionPanelState,
} from '../common/derived-impact';
import { buildDirectEdges } from '../common/direct-edges';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type { SnapshotId } from '../snapshot/snapshot-id';
import type { DashboardOverviewDto } from './dto/dashboard-overview.dto';

/**
 * Dashboard read model — BR-004 deltas derived here; BR-006 honesty in response.
 * Does not import fixture constants.
 */
@Injectable()
export class DashboardService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  getOverview(projectId: string, snapshotId: SnapshotId): DashboardOverviewDto {
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    const project = this.dataSource.getProject(snapshot.id, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const deliveryDelta = calendarDaysDelta(
      snapshot.equipment.baselineDelivery,
      snapshot.equipment.forecastDelivery,
    );
    const psDelta = calendarDaysDelta(
      project.baselineProductionStart,
      project.forecastProductionStart,
    );

    const panelState = decisionPanelState(snapshot);
    const impact = computeDerivedImpact(snapshot);
    const decision =
      snapshot.decision === null
        ? null
        : {
            id: snapshot.decision.id,
            type: snapshot.decision.type,
            ownerRole: snapshot.decision.ownerRole,
            dueDate: snapshot.decision.dueDate,
            note: snapshot.decision.note,
          };

    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      project: {
        id: project.id,
        name: project.name,
        baselineProductionStart: project.baselineProductionStart,
        forecastProductionStart: project.forecastProductionStart,
        productionStartVariance: {
          subject: 'production_start',
          baselineDate: project.baselineProductionStart,
          forecastDate: project.forecastProductionStart,
          deltaDays: psDelta,
        },
      },
      equipment: {
        id: snapshot.equipment.id,
        critical: snapshot.equipment.critical,
        status: snapshot.equipment.status,
        baselineDelivery: snapshot.equipment.baselineDelivery,
        forecastDelivery: snapshot.equipment.forecastDelivery,
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: snapshot.equipment.baselineDelivery,
          forecastDate: snapshot.equipment.forecastDelivery,
          deltaDays: deliveryDelta,
        },
      },
      issue: snapshot.issue
        ? {
            id: snapshot.issue.id,
            title: snapshot.issue.title,
            status: snapshot.issue.status,
            equipmentId: snapshot.issue.equipmentId,
            milestoneId: snapshot.issue.milestoneId,
          }
        : null,
      risk: {
        id: snapshot.risk.id,
        rag: snapshot.risk.rag,
        equipmentId: snapshot.risk.equipmentId,
        milestoneId: snapshot.risk.milestoneId,
        issueId: snapshot.risk.issueId,
      },
      milestone: {
        id: snapshot.milestone.id,
        name: snapshot.milestone.name,
        rag: snapshot.milestone.rag,
        baselineDate: snapshot.milestone.baselineDate,
        forecastDate: snapshot.milestone.forecastDate,
      },
      decisionPanelState: panelState,
      decision,
      directEdges: buildDirectEdges(snapshot),
      derivedImpact: {
        rule: 'BR-004',
        equipmentDeliveryDeltaDays: impact.equipmentDeliveryDeltaDays,
        productionStartDeltaDays: impact.productionStartDeltaDays,
        kind: impact.kind,
      },
      decisionHonesty:
        panelState === 'recorded' ? { recoveryExecuted: false } : null,
    };
  }
}
