import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calendarDaysDelta } from '../common/calendar-days-delta';
import {
  computeDerivedImpact,
  decisionPanelState,
} from '../common/derived-impact';
import { buildDirectEdges } from '../common/direct-edges';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import { milestoneMembership, programSummariesFor } from '../data/fixtures/analyst-portfolio';
import {
  computeProjectStatus,
  computeWorkstreamRollups,
} from '../data/project-status';
import type { SnapshotId } from '../snapshot/snapshot-id';
import type { DashboardOverviewDto } from './dto/dashboard-overview.dto';

/**
 * Dashboard read model — collection-shaped; BR-004/006; status/rollups derived.
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

    const psDelta = calendarDaysDelta(
      project.baselineProductionStart,
      project.forecastProductionStart,
    );

    const panelState = decisionPanelState(snapshot);
    const impact = computeDerivedImpact(snapshot);

    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectStatus: computeProjectStatus(snapshot),
      executiveMilestoneIds: [...snapshot.executiveMilestoneIds],
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
      equipment: snapshot.equipment.map((eq) => {
        const deliveryDelta = calendarDaysDelta(
          eq.baselineDelivery,
          eq.forecastDelivery,
        );
        return {
          id: eq.id,
          name: eq.name,
          critical: eq.critical,
          status: eq.status,
          workstream: eq.workstream,
          baselineDelivery: eq.baselineDelivery,
          forecastDelivery: eq.forecastDelivery,
          deliveryVariance: {
            subject: 'equipment_delivery' as const,
            baselineDate: eq.baselineDelivery,
            forecastDate: eq.forecastDelivery,
            deltaDays: deliveryDelta,
          },
        };
      }),
      issues: snapshot.issues.map((issue) => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        workstream: issue.workstream,
        equipmentId: issue.equipmentId,
        milestoneId: issue.milestoneId,
      })),
      risks: snapshot.risks.map((risk) => ({
        id: risk.id,
        title: risk.title,
        rag: risk.rag,
        workstream: risk.workstream,
        equipmentId: risk.equipmentId,
        milestoneId: risk.milestoneId,
        issueId: risk.issueId,
      })),
      milestones: snapshot.milestones.map((ms) => {
        const member = milestoneMembership(ms.id);
        return {
          id: ms.id,
          name: ms.name,
          rag: ms.rag,
          workstream: ms.workstream,
          baselineDate: ms.baselineDate,
          forecastDate: ms.forecastDate,
          programId: member.programId,
          projectId: member.projectId,
          portfolioVisible: member.portfolioVisible,
        };
      }),
      programs: programSummariesFor({
        panelRed:
          snapshot.milestones.find((ms) => ms.id === 'MS-CLN-PANEL')?.rag ===
          'Red',
        powerRed:
          snapshot.milestones.find((ms) => ms.id === 'MS-UTL-PWR')?.rag ===
          'Red',
        hvacDelayed:
          snapshot.equipment.find((item) => item.id === 'EQ-HVAC-01')
            ?.status === 'Delayed',
      }),
      decisions: snapshot.decisions.map((d) => ({
        id: d.id,
        projectId: d.projectId,
        milestoneId: d.milestoneId,
        type: d.type,
        ownerPersonId: d.ownerPersonId,
        ownerFullNameRu: this.dataSource.personFullNameRu(d.ownerPersonId),
        dueDate: d.dueDate,
        note: d.note,
      })),
      workstreamRollups: computeWorkstreamRollups(snapshot),
      topExceptions: [...snapshot.topExceptions]
        .sort((a, b) => a.priority - b.priority)
        .map((t) => ({
          id: t.id,
          title: t.title,
          causeImpact: t.causeImpact,
          links: t.links,
          priority: t.priority,
        })),
      trend: {
        better: [...snapshot.trend.better],
        worse: [...snapshot.trend.worse],
        unchangedCritical: [...snapshot.trend.unchangedCritical],
      },
      decisionPanelState: panelState,
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
