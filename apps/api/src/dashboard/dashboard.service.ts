import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calendarDaysDelta } from '../common/calendar-days-delta';
import {
  computeDerivedImpact,
  decisionPanelState,
  forecastDeviationOf,
} from '../common/derived-impact';
import { buildDirectEdges } from '../common/direct-edges';
import { decisionDueState } from '../contracts/decision-due-state';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import { resolveDecisionExecution } from '../data/decision-execution';
import { milestoneMembership, projectById } from '../data/analyst-portfolio';
import { portfolioMilestoneUniverseIds } from '../data/portfolio-milestone-universe';
import {
  computeProjectStatus,
  computeWorkstreamRollups,
} from '../data/project-status';
import { mergeDemoTree } from '../data/schedule/schedule-demo-tree';
import { PortfolioService } from '../portfolio/portfolio.service';
import { WORKSTREAM_BRIDGES } from '../data/ws-program-mapping';
import type { SnapshotId } from '../snapshot/snapshot-id';
import type { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import type { WorkstreamId } from '../data/workstream-ids';
import { buildPeopleFocus, previousSnapshotIdOf } from './people-focus';
import type { PersonId } from '../contracts/person-id';

function membershipFromCheckpoint(c: {
  wbs: string;
  workstream?: string | null;
}): { programId: string | null; projectId: string | null } {
  const no = Number(String(c.wbs).split('.')[0]);
  if (Number.isFinite(no) && no > 0) {
    const projectId = `AN-${String(no).padStart(2, '0')}`;
    const proj = projectById(projectId);
    if (proj) {
      return { programId: proj.programId, projectId: proj.id };
    }
  }
  if (c.workstream) {
    const bridge = WORKSTREAM_BRIDGES.find(
      (b) => b.workstreamId === c.workstream,
    );
    if (bridge) {
      return {
        programId: bridge.programId,
        projectId: bridge.primaryProjectId,
      };
    }
  }
  return { programId: null, projectId: null };
}

/**
 * Dashboard read model — collection-shaped; BR-004/006; status/rollups derived.
 */
@Injectable()
export class DashboardService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
    private readonly portfolio: PortfolioService,
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
    const forecastDeviation = forecastDeviationOf(snapshot);
    const programRows = this.portfolio.programStatuses(snapshot);
    const milestones = this.buildPortfolioMilestones(snapshotId, {
      milestones: snapshot.milestones,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
    });

    // Stable universe order: baselineDate ASC, id ASC — forecast never reorders.
    const byId = new Map(milestones.map((m) => [m.id, m]));
    const universe = portfolioMilestoneUniverseIds();
    const executiveMilestoneIds = [...universe].sort((a, b) => {
      // byId is filled for every universe id below via buildPortfolioMilestones.
      const da = byId.get(a)!.baselineDate;
      const db = byId.get(b)!.baselineDate;
      if (da !== db) return da < db ? -1 : 1;
      return a.localeCompare(b);
    });

    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectStatus: computeProjectStatus(snapshot),
      executiveMilestoneIds,
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
      milestones,
      programs: programRows.map((row) => ({
        id: row.id,
        name: row.name,
        status: row.status,
        progressPct: row.progressPct,
        leafCompleted: row.leafCompleted,
        leafTotal: row.leafTotal,
        progressFillTone: row.progressFillTone,
      })),
      decisions: snapshot.decisions.map((d) => {
        const exec = resolveDecisionExecution(d.id, snapshot);
        return {
          id: d.id,
          projectId: d.projectId,
          milestoneId: d.milestoneId,
          type: d.type,
          ownerPersonId: d.ownerPersonId,
          ownerFullNameRu: this.dataSource.personFullNameRu(d.ownerPersonId),
          dueDate: d.dueDate,
          note: d.note,
          dueState: decisionDueState(d.dueDate, snapshot.scenarioAsOfDate),
          executionStatus: exec.status,
          execution: exec.execution,
        };
      }),
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
        panelState === 'recorded'
          ? {
              recoveryExecuted: false,
              forecastDeviation,
            }
          : null,
      peopleFocus: this.buildPeopleFocusPanel(snapshotId),
    };
  }

  private buildPeopleFocusPanel(snapshotId: SnapshotId) {
    const current = this.dataSource.getSnapshot(snapshotId);
    const prevId = previousSnapshotIdOf(snapshotId);
    const known = this.dataSource.listSnapshotIds();
    const previous =
      prevId && known.includes(prevId)
        ? this.dataSource.getSnapshot(prevId)
        : null;
    return buildPeopleFocus(current, previous, (id: PersonId) => {
      const p = this.dataSource.getPerson(id);
      if (!p) return null;
      return {
        fullNameRu: p.fullNameRu,
        roleTitleRu: p.roleTitleRu,
        primaryWorkstreamId: p.primaryWorkstreamId,
      };
    });
  }

  /**
   * Catalog MS ∪ imported KT (aliases already MS-*). Stable 189-set for 01–19.
   */
  private buildPortfolioMilestones(
    snapshotId: SnapshotId,
    snapshot: {
      milestones: DashboardMilestoneSource[];
      scenarioAsOfDate: string;
    },
  ) {
    const base = this.dataSource.getScheduleWorks(snapshotId);
    const merged = mergeDemoTree(
      base,
      [],
      snapshot.scenarioAsOfDate,
      snapshotId,
    );
    const byId = new Map<
      string,
      {
        id: string;
        name: string;
        rag: 'Green' | 'Red';
        workstream: WorkstreamId | null;
        baselineDate: string;
        forecastDate: string;
        programId: string | null;
        projectId: string | null;
        portfolioVisible: boolean;
      }
    >();

    for (const ms of snapshot.milestones) {
      const member = milestoneMembership(ms.id);
      byId.set(ms.id, {
        id: ms.id,
        name: ms.name,
        rag: ms.rag,
        workstream: ms.workstream,
        baselineDate: ms.baselineDate,
        forecastDate: ms.forecastDate,
        programId: member.programId,
        projectId: member.projectId,
        portfolioVisible: true,
      });
    }

    const imported = merged.importedCheckpoints
      ? [...merged.importedCheckpoints]
      : [];
    const aliased = merged.aliasedCheckpoints
      ? [...merged.aliasedCheckpoints]
      : [];
    for (const c of [...imported, ...aliased]) {
      const rag: 'Green' | 'Red' = c.status === 'Delayed' ? 'Red' : 'Green';
      const member = membershipFromCheckpoint(c);
      const prev = byId.get(c.id);
      if (prev) {
        byId.set(c.id, {
          ...prev,
          name: c.name.length > 0 ? c.name : prev.name,
          baselineDate: c.baselineDate,
          forecastDate: c.forecastDate,
          programId: prev.programId ?? member.programId,
          projectId: prev.projectId ?? member.projectId,
          portfolioVisible: true,
        });
        continue;
      }
      byId.set(c.id, {
        id: c.id,
        name: c.name,
        rag,
        workstream: (c.workstream as WorkstreamId | null) ?? null,
        baselineDate: c.baselineDate,
        forecastDate: c.forecastDate,
        programId: member.programId,
        projectId: member.projectId,
        portfolioVisible: true,
      });
    }

    // Ensure every universe id is present (Waiting placeholders use baseline).
    for (const id of portfolioMilestoneUniverseIds()) {
      if (byId.has(id)) continue;
      const wbsGuess = id.startsWith('KT-') ? id.slice(3) : id;
      const member = membershipFromCheckpoint({
        wbs: wbsGuess,
        workstream: null,
      });
      byId.set(id, {
        id,
        name: id,
        rag: 'Green',
        workstream: null,
        baselineDate: '2027-09-15',
        forecastDate: '2027-09-15',
        programId: member.programId,
        projectId: member.projectId,
        portfolioVisible: true,
      });
    }

    return [...byId.values()];
  }
}

type DashboardMilestoneSource = {
  id: string;
  name: string;
  rag: 'Green' | 'Red';
  workstream: WorkstreamId | null;
  baselineDate: string;
  forecastDate: string;
};
