import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calendarDaysDelta } from '../common/calendar-days-delta';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type { SnapshotFixture } from '../data/fixtures/types';
import type { SnapshotId } from '../snapshot/snapshot-id';
import {
  type DashboardOverviewDto,
  type DecisionPanelState,
  type DirectEdgeDto,
} from './dto/dashboard-overview.dto';

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

    const decisionPanelState = this.decisionPanelState(snapshot);
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
      decisionPanelState,
      decision,
      directEdges: this.buildDirectEdges(snapshot),
      derivedImpact: {
        rule: 'BR-004',
        equipmentDeliveryDeltaDays: deliveryDelta,
        productionStartDeltaDays: psDelta,
        kind: deliveryDelta === 0 ? 'none' : 'aligned_slip',
      },
      decisionHonesty:
        decisionPanelState === 'recorded' ? { recoveryExecuted: false } : null,
    };
  }

  private decisionPanelState(snapshot: SnapshotFixture): DecisionPanelState {
    if (snapshot.decision) {
      return 'recorded';
    }
    if (snapshot.issue && snapshot.equipment.status === 'Delayed') {
      return 'needed';
    }
    return 'absent';
  }

  /** DOC-BA-015 direct edges present in this snapshot only. No EQ—MS. */
  private buildDirectEdges(snapshot: SnapshotFixture): DirectEdgeDto[] {
    const edges: DirectEdgeDto[] = [];
    const eq = snapshot.equipment.id;
    const risk = snapshot.risk.id;
    const ms = snapshot.milestone.id;

    edges.push({
      kind: 'direct',
      fromType: 'equipment',
      fromId: eq,
      toType: 'risk',
      toId: risk,
    });
    edges.push({
      kind: 'direct',
      fromType: 'risk',
      fromId: risk,
      toType: 'milestone',
      toId: ms,
    });

    if (snapshot.issue) {
      const iss = snapshot.issue.id;
      edges.push({
        kind: 'direct',
        fromType: 'equipment',
        fromId: eq,
        toType: 'issue',
        toId: iss,
      });
      edges.push({
        kind: 'direct',
        fromType: 'issue',
        fromId: iss,
        toType: 'risk',
        toId: risk,
      });
      edges.push({
        kind: 'direct',
        fromType: 'issue',
        fromId: iss,
        toType: 'milestone',
        toId: ms,
      });
    }

    return edges;
  }
}
