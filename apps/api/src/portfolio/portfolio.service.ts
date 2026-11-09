import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { calendarDaysDelta } from '../common/calendar-days-delta';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import {
  DETAIL_ABSENT,
  NOT_FOUND_IN_SNAPSHOT,
  OWNER_UNASSIGNED,
  PROGRAM_CATALOG,
  analystProjectStatus,
  milestoneMembership,
  programById,
  programSummariesFor,
  projectById,
  projectsOf,
  worstStatus,
  type AnalystProjectCatalog,
  type AnalystStatus,
  type ProgramId,
} from '../data/analyst-portfolio';
import {
  EQUIPMENT_PRIMARY_PROJECT,
  primaryProjectForEquipment,
  workstreamsForProgram,
} from '../data/ws-program-mapping';
import type { SnapshotFixture } from '../data/fixtures/types';
import { mergeDemoTree } from '../data/schedule/schedule-demo-tree';
import {
  fillToneForProgramProjects,
  fillToneForProjectGroup,
  type ScheduleFillTone,
  type ScheduleWarningItem,
} from '../schedule/schedule-fill-semantics';
import { ScheduleService } from '../schedule/schedule.service';
import type { SnapshotId } from '../snapshot/snapshot-id';

const DEMO_PROJECT = 'PRT-01';

export type ResponsiblePerson = {
  personId: string;
  fullNameRu: string;
  role: string;
};

export type ProgramSummary = {
  id: ProgramId;
  name: string;
  status: AnalystStatus;
  projectCount: number;
  ownerLabel: string;
  ownerPersonId: string | null;
  /** WS leads / authored project owners — not invented program leader. */
  responsiblePeople: ResponsiblePerson[];
  progressLabel: string;
  /** Null when no leaf works+КТ in member projects. */
  progressPct: number | null;
  leafCompleted: number;
  leafTotal: number;
  progressFillTone: ScheduleFillTone;
};

export type AnalystProjectRow = {
  id: string;
  name: string;
  programId: string;
  status: AnalystStatus;
  ownerLabel: string;
  ownerPersonId: string | null;
  progressLabel: string;
  /** Schedule project_group rollup %; null when unavailable / no leaves. */
  progressPct: number | null;
  leafCompleted: number;
  leafTotal: number;
  progressFillTone: ScheduleFillTone;
};

export type ProgramCostSummary = {
  approvedControlBudgetRub: number;
  actualCostRub: number;
  committedCostRub: number;
  etcRub: number;
  eacRub: number;
  vacRub: number;
  /** WS ids summed once via bridge — no reserve inflation. */
  workstreamIds: string[];
};

export type ProgramDetail = {
  snapshotId: SnapshotId;
  id: ProgramId;
  name: string;
  status: AnalystStatus;
  projectCount: number;
  ownerLabel: string;
  ownerPersonId: string | null;
  responsiblePeople: ResponsiblePerson[];
  /** Sum of child project leaf completed/total from same import metrics. */
  progressLabel: string;
  progressPct: number | null;
  leafCompleted: number;
  leafTotal: number;
  progressFillTone: ScheduleFillTone;
  projects: AnalystProjectRow[];
  /** Null when no WS cost allocated to this program (honest absence). */
  cost: ProgramCostSummary | null;
  attention: {
    redRiskCount: number;
    delayedCriticalEquipmentCount: number;
    openOrMitigatingIssueCount: number;
    /** Catalog red milestones in this program — explains Red status when risks/EQ/issues are 0. */
    redMilestoneCount: number;
  };
  issues: {
    id: string;
    title: string;
    status: string;
    projectId: string | null;
  }[];
  milestones: {
    id: string;
    name: string;
    rag: 'Green' | 'Red';
    baselineDate: string;
    forecastDate: string;
    projectId: string | null;
  }[];
  equipment: {
    id: string;
    name: string;
    status: string;
    critical: boolean;
    baselineDelivery: string;
    forecastDelivery: string;
  }[];
  risks: {
    id: string;
    title: string;
    rag: 'Green' | 'Red';
  }[];
  decisions: {
    id: string;
    type: string;
    note: string;
    dueDate: string | null;
    milestoneId: string | null;
  }[];
};

export type AnalystProjectCard = {
  snapshotId: SnapshotId;
  id: string;
  name: string;
  programId: string;
  programName: string;
  status: AnalystStatus;
  ownerPersonId: string | null;
  ownerLabel: string;
  progressLabel: string;
  datesLabel: string;
  /** Source composition from analyst import (honest counts). */
  composition: {
    stages: number;
    works: number;
    checkpoints: number;
    catalogMilestones: number;
    equipment: number;
  };
  /** Short RU note when dates are demo assumptions. */
  datesNote: string | null;
  issues: { id: string; title: string; status: string }[];
  risks: { id: string; title: string; rag: 'Green' | 'Red' }[];
  decisions: {
    id: string;
    type: string;
    note: string;
    dueDate: string | null;
    milestoneId: string | null;
  }[];
  attention: {
    redRiskCount: number;
    delayedCriticalEquipmentCount: number;
    openOrMitigatingIssueCount: number;
    redMilestoneCount: number;
  };
  equipment: {
    id: string;
    name: string;
    status: string;
    critical: boolean;
    forecastDelivery: string;
    deltaDays: number;
  }[];
  milestones: {
    id: string;
    name: string;
    rag: 'Green' | 'Red';
    baselineDate: string;
    forecastDate: string;
  }[];
  installationLag: string | null;
  deliveryNote: string | null;
};

function projectIdForIssue(issue: {
  milestoneId: string | null;
  equipmentId: string | null;
}): string | null {
  if (issue.milestoneId) {
    const member = milestoneMembership(issue.milestoneId).projectId;
    if (member) return member;
  }
  if (issue.equipmentId) {
    return primaryProjectForEquipment(issue.equipmentId);
  }
  return null;
}

@Injectable()
export class PortfolioService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
    private readonly scheduleService: ScheduleService,
  ) {}

  private scheduleWarningItems(snapshotId: SnapshotId): ScheduleWarningItem[] {
    return this.scheduleService
      .getSchedule(DEMO_PROJECT, snapshotId)
      .items.map((item) => ({
        kind: item.kind,
        id: item.id,
        status: 'status' in item ? (item.status as string | null) : null,
        sourceWeeks:
          'sourceWeeks' in item
            ? ((item as { sourceWeeks?: number | null }).sourceWeeks ?? null)
            : null,
        baselineStart:
          'baselineStart' in item
            ? ((item as { baselineStart?: string | null }).baselineStart ??
              null)
            : null,
        baselineEnd:
          'baselineEnd' in item
            ? ((item as { baselineEnd?: string | null }).baselineEnd ?? null)
            : null,
        startDate:
          'startDate' in item
            ? ((item as { startDate?: string | null }).startDate ?? null)
            : null,
        endDate:
          'endDate' in item
            ? ((item as { endDate?: string | null }).endDate ?? null)
            : null,
        rag:
          'rag' in item
            ? ((item as { rag?: string | null }).rag ?? null)
            : null,
        parentKey: item.parentKey ?? null,
        progressPct:
          'progressPct' in item
            ? ((item as { progressPct?: number | null }).progressPct ?? null)
            : null,
      }));
  }

  listPrograms(
    projectId: string,
    snapshotId: SnapshotId,
  ): { snapshotId: SnapshotId; items: ProgramSummary[] } {
    this.requirePlant(projectId, snapshotId);
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    return {
      snapshotId: snapshot.id,
      items: PROGRAM_CATALOG.map((program) =>
        this.programSummary(program.id, snapshot),
      ),
    };
  }

  getProgram(
    projectId: string,
    programId: string,
    snapshotId: SnapshotId,
  ): ProgramDetail {
    this.requirePlant(projectId, snapshotId);
    const program = programById(programId);
    if (!program) throw new NotFoundException(NOT_FOUND_IN_SNAPSHOT);
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    const projects = this.rows(program.id, snapshot);
    const summary = this.programSummary(program.id, snapshot);
    const leafCompleted = summary.leafCompleted;
    const leafTotal = summary.leafTotal;
    const progressPct = summary.progressPct;
    const wsIds = [...new Set(workstreamsForProgram(program.id))];
    const costs = this.dataSource.getCosts(snapshotId);
    const wsCostRows = costs.workstreams.filter((w) =>
      wsIds.includes(w.workstream),
    );
    const cost: ProgramCostSummary | null =
      wsCostRows.length === 0
        ? null
        : {
            approvedControlBudgetRub: wsCostRows.reduce(
              (s, w) => s + w.approvedControlBudgetRub,
              0,
            ),
            actualCostRub: wsCostRows.reduce((s, w) => s + w.actualCostRub, 0),
            committedCostRub: wsCostRows.reduce(
              (s, w) => s + w.committedCostRub,
              0,
            ),
            etcRub: wsCostRows.reduce((s, w) => s + w.etcRub, 0),
            eacRub: wsCostRows.reduce((s, w) => s + w.eacRub, 0),
            vacRub: wsCostRows.reduce((s, w) => s + w.vacRub, 0),
            workstreamIds: wsCostRows.map((w) => w.workstream),
          };

    const projectIdSet = new Set(projects.map((p) => p.id));
    const equipment = snapshot.equipment
      .filter((item) => {
        const primary = EQUIPMENT_PRIMARY_PROJECT[item.id];
        return primary != null && projectIdSet.has(primary);
      })
      .map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        critical: item.critical,
        baselineDelivery: item.baselineDelivery,
        forecastDelivery: item.forecastDelivery,
      }));
    const risks = snapshot.risks
      .filter((r) => wsIds.includes(r.workstream as never))
      .map((r) => ({ id: r.id, title: r.title, rag: r.rag }));
    const byMs = new Map(snapshot.milestones.map((m) => [m.id, m]));
    const decisions = snapshot.decisions
      .filter((d) => {
        if (!d.milestoneId) return false;
        const ms = byMs.get(d.milestoneId);
        return (
          ms != null && milestoneMembership(ms.id).programId === program.id
        );
      })
      .map((d) => ({
        id: d.id,
        type: d.type,
        note: d.note,
        dueDate: d.dueDate,
        milestoneId: d.milestoneId,
      }));
    const issues = snapshot.issues
      .filter(
        (issue) => issue.status === 'Open' || issue.status === 'Mitigating',
      )
      .map((issue) => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        projectId: projectIdForIssue(issue),
      }))
      .filter((issue) => projects.some((row) => row.id === issue.projectId));

    const catalogMs = snapshot.milestones
      .filter((ms) => milestoneMembership(ms.id).programId === program.id)
      .map((ms) => ({
        id: ms.id,
        name: ms.name,
        rag: ms.rag,
        baselineDate: ms.baselineDate,
        forecastDate: ms.forecastDate,
        projectId: milestoneMembership(ms.id).projectId,
      }));
    const milestones = this.mergeProgramMilestones(
      catalogMs,
      program.id,
      snapshotId,
    );

    return {
      snapshotId: snapshot.id,
      id: program.id,
      name: program.name,
      status: worstStatus(projects.map((row) => row.status)),
      projectCount: summary.projectCount,
      ownerLabel: summary.ownerLabel,
      ownerPersonId: summary.ownerPersonId,
      responsiblePeople: this.responsibleForProgram(program.id, snapshot),
      progressLabel: summary.progressLabel,
      progressPct,
      leafCompleted,
      leafTotal,
      progressFillTone: summary.progressFillTone,
      projects,
      cost,
      attention: {
        redRiskCount: risks.filter((r) => r.rag === 'Red').length,
        delayedCriticalEquipmentCount: equipment.filter(
          (e) => e.critical && e.status === 'Delayed',
        ).length,
        openOrMitigatingIssueCount: issues.length,
        redMilestoneCount: milestones.filter((m) => m.rag === 'Red').length,
      },
      issues,
      milestones,
      equipment,
      risks,
      decisions,
    };
  }

  listProjects(
    projectId: string,
    snapshotId: SnapshotId,
  ): { snapshotId: SnapshotId; items: AnalystProjectRow[] } {
    this.requirePlant(projectId, snapshotId);
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    return {
      snapshotId: snapshot.id,
      items: PROGRAM_CATALOG.flatMap((program) =>
        this.rows(program.id, snapshot),
      ),
    };
  }

  getProject(
    projectId: string,
    analystProjectId: string,
    snapshotId: SnapshotId,
  ): AnalystProjectCard {
    this.requirePlant(projectId, snapshotId);
    const project = projectById(analystProjectId);
    if (!project) throw new NotFoundException(NOT_FOUND_IN_SNAPSHOT);
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    const program = programById(project.programId);
    if (!program) throw new NotFoundException(NOT_FOUND_IN_SNAPSHOT);
    const status = this.statusOfProject(project, snapshot);
    const catalogMs = snapshot.milestones
      .filter((ms) => milestoneMembership(ms.id).projectId === project.id)
      .map((ms) => ({
        id: ms.id,
        name: ms.name,
        rag: ms.rag,
        baselineDate: ms.baselineDate,
        forecastDate: ms.forecastDate,
      }));
    const milestones = this.mergeProjectMilestones(
      catalogMs,
      project.id,
      snapshotId,
    );
    const equipment = snapshot.equipment
      .filter((item) => EQUIPMENT_PRIMARY_PROJECT[item.id] === project.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        critical: item.critical,
        forecastDelivery: item.forecastDelivery,
        deltaDays: calendarDaysDelta(
          item.baselineDelivery,
          item.forecastDelivery,
        ),
      }));
    const issues = snapshot.issues
      .filter((issue) => projectIdForIssue(issue) === project.id)
      .map((issue) => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
      }));
    const risks = snapshot.risks
      .filter((risk) => {
        if (risk.milestoneId) {
          return milestoneMembership(risk.milestoneId).projectId === project.id;
        }
        if (risk.equipmentId) {
          return EQUIPMENT_PRIMARY_PROJECT[risk.equipmentId] === project.id;
        }
        return false;
      })
      .map((risk) => ({
        id: risk.id,
        title: risk.title,
        rag: risk.rag,
      }));
    const msIds = new Set(milestones.map((m) => m.id));
    const decisions = snapshot.decisions
      .filter((d) => d.milestoneId != null && msIds.has(d.milestoneId))
      .map((d) => ({
        id: d.id,
        type: d.type,
        note: d.note,
        dueDate: d.dueDate,
        milestoneId: d.milestoneId,
      }));
    const installation = issues.find((issue) => issue.id === 'ISS-CLN-01');
    const delivery = equipment.find((item) => item.id === 'EQ-CLN-01');
    // Composition catalog count uses snapshot catalog only (not merged KT rows).
    const metrics = this.projectImportMetrics(
      project.id,
      snapshotId,
      catalogMs,
    );
    return {
      snapshotId: snapshot.id,
      id: project.id,
      name: project.name,
      programId: program.id,
      programName: program.name,
      status,
      ownerPersonId: project.ownerPersonId,
      ownerLabel: this.ownerLabelForProject(project),
      progressLabel: metrics.progressLabel,
      datesLabel: metrics.datesLabel,
      composition: {
        ...metrics.composition,
        equipment: equipment.length,
      },
      datesNote: metrics.datesNote,
      issues,
      risks,
      decisions,
      attention: {
        redRiskCount: risks.filter((r) => r.rag === 'Red').length,
        delayedCriticalEquipmentCount: equipment.filter(
          (e) => e.critical && e.status === 'Delayed',
        ).length,
        openOrMitigatingIssueCount: issues.filter(
          (i) => i.status === 'Open' || i.status === 'Mitigating',
        ).length,
        redMilestoneCount: milestones.filter((m) => m.rag === 'Red').length,
      },
      equipment,
      milestones,
      installationLag: installation?.title ?? null,
      deliveryNote:
        delivery && delivery.deltaDays !== 0
          ? `Сдвиг поставки панелей на ${delivery.deltaDays} дн. — отдельное демосостояние, не причина отставания монтажа.`
          : null,
    };
  }

  programStatuses(snapshot: SnapshotFixture): ProgramSummary[] {
    return PROGRAM_CATALOG.map((program) =>
      this.programSummary(program.id, snapshot),
    );
  }

  private requirePlant(projectId: string, snapshotId: SnapshotId): void {
    const project = this.dataSource.getProject(snapshotId, projectId);
    if (!project || project.id !== DEMO_PROJECT) {
      throw new NotFoundException(NOT_FOUND_IN_SNAPSHOT);
    }
  }

  private rows(
    programId: ProgramId,
    snapshot: SnapshotFixture,
  ): AnalystProjectRow[] {
    const scheduleItems = this.scheduleWarningItems(snapshot.id);
    return projectsOf(programId).map((project) => {
      const metrics = this.projectImportMetrics(project.id, snapshot.id, []);
      const scheduleProgress = fillToneForProjectGroup(
        scheduleItems,
        project.id,
      );
      const progressPct =
        metrics.leafTotal === 0
          ? null
          : (scheduleProgress.progressPct ??
            Math.round((metrics.leafCompleted / metrics.leafTotal) * 100));
      return {
        id: project.id,
        name: project.name,
        programId: project.programId,
        status: this.statusOfProject(project, snapshot),
        ownerLabel: this.ownerLabelForProject(project),
        ownerPersonId: project.ownerPersonId,
        progressLabel: metrics.progressLabel,
        progressPct,
        leafCompleted: metrics.leafCompleted,
        leafTotal: metrics.leafTotal,
        progressFillTone: scheduleProgress.progressFillTone,
      };
    });
  }

  /** Schedule topology + asOf lifecycle (same plane as ScheduleService). */
  private scheduleForSnapshot(snapshotId: SnapshotId) {
    const base = this.dataSource.getScheduleWorks(snapshotId);
    const asOf = this.dataSource.getSnapshot(snapshotId).scenarioAsOfDate;
    return mergeDemoTree(base, [], asOf, snapshotId);
  }

  private inAnalystProject(
    wbs: string | null | undefined,
    analystProjectId: string,
  ): boolean {
    const projectPrefix = `${Number(analystProjectId.replace('AN-', ''))}.`;
    const projectWbs = String(Number(analystProjectId.replace('AN-', '')));
    const w = wbs ?? '';
    return w === projectWbs || w.startsWith(projectPrefix);
  }

  private ragFromCheckpointStatus(status: string): 'Green' | 'Red' {
    return status === 'Delayed' ? 'Red' : 'Green';
  }

  /** Catalog MS ∪ imported/aliased KT for a program (dedupe by id). */
  private mergeProgramMilestones(
    catalog: {
      id: string;
      name: string;
      rag: 'Green' | 'Red';
      baselineDate: string;
      forecastDate: string;
      projectId: string | null;
    }[],
    programId: ProgramId,
    snapshotId: SnapshotId,
  ) {
    const schedule = this.scheduleForSnapshot(snapshotId);
    const projectIds = new Set(projectsOf(programId).map((p) => p.id));
    const byId = new Map(catalog.map((m) => [m.id, m]));
    for (const c of [
      ...(schedule.importedCheckpoints ?? []),
      ...(schedule.aliasedCheckpoints ?? []),
    ]) {
      const project = projectsOf(programId).find((p) =>
        this.inAnalystProject(c.wbs, p.id),
      );
      if (!project || !projectIds.has(project.id)) continue;
      if (byId.has(c.id)) {
        // Catalog/alias MS: keep authored snapshot RAG; refresh dates from lifecycle.
        const prev = byId.get(c.id)!;
        byId.set(c.id, {
          ...prev,
          name: c.name || prev.name,
          baselineDate: c.baselineDate,
          forecastDate: c.forecastDate,
          projectId: project.id,
        });
        continue;
      }
      byId.set(c.id, {
        id: c.id,
        name: c.name,
        rag: this.ragFromCheckpointStatus(c.status),
        baselineDate: c.baselineDate,
        forecastDate: c.forecastDate,
        projectId: project.id,
      });
    }
    return [...byId.values()];
  }

  private mergeProjectMilestones(
    catalog: {
      id: string;
      name: string;
      rag: 'Green' | 'Red';
      baselineDate: string;
      forecastDate: string;
    }[],
    analystProjectId: string,
    snapshotId: SnapshotId,
  ) {
    const schedule = this.scheduleForSnapshot(snapshotId);
    const byId = new Map(catalog.map((m) => [m.id, m]));
    for (const c of [
      ...(schedule.importedCheckpoints ?? []),
      ...(schedule.aliasedCheckpoints ?? []),
    ]) {
      if (!this.inAnalystProject(c.wbs, analystProjectId)) continue;
      if (byId.has(c.id)) {
        const prev = byId.get(c.id)!;
        byId.set(c.id, {
          ...prev,
          name: c.name || prev.name,
          baselineDate: c.baselineDate,
          forecastDate: c.forecastDate,
        });
        continue;
      }
      byId.set(c.id, {
        id: c.id,
        name: c.name,
        rag: this.ragFromCheckpointStatus(c.status),
        baselineDate: c.baselineDate,
        forecastDate: c.forecastDate,
      });
    }
    return [...byId.values()];
  }

  /**
   * Shared list+detail read model: progress = completed / (works+KT) from schedule import.
   * Not a mean of leaf % progress fields.
   */
  private projectImportMetrics(
    analystProjectId: string,
    snapshotId: SnapshotId,
    catalogMilestones: { id: string; name: string; forecastDate: string }[],
  ): {
    progressLabel: string;
    leafCompleted: number;
    leafTotal: number;
    composition: {
      stages: number;
      works: number;
      checkpoints: number;
      catalogMilestones: number;
    };
    datesLabel: string;
    datesNote: string | null;
  } {
    const schedule = this.scheduleForSnapshot(snapshotId);
    const stages = (schedule.groups ?? []).filter(
      (g) =>
        g.kind === 'stage_group' &&
        this.inAnalystProject(g.wbs, analystProjectId),
    ).length;
    const works = schedule.works.filter((w) =>
      this.inAnalystProject(w.wbs, analystProjectId),
    );
    const ktImported = (schedule.importedCheckpoints ?? []).filter((c) =>
      this.inAnalystProject(c.wbs, analystProjectId),
    );
    const ktAliased = (schedule.aliasedCheckpoints ?? []).filter((c) =>
      this.inAnalystProject(c.wbs, analystProjectId),
    );
    const checkpoints = [...ktImported, ...ktAliased];
    const aliasMsIds = new Set(ktAliased.map((c) => c.id));
    const catalogOnly = catalogMilestones.filter(
      (ms) => !aliasMsIds.has(ms.id),
    );
    const leafCompleted = [
      ...works.filter((w) => w.status === 'Completed'),
      ...checkpoints.filter((c) => c.status === 'Completed'),
    ].length;
    const leafTotal = works.length + checkpoints.length;
    const progressPct =
      leafTotal === 0 ? 0 : Math.round((leafCompleted / leafTotal) * 100);
    const progressLabel =
      leafTotal === 0
        ? 'Нет листовых работ в импорте'
        : `${progressPct}% · ${leafCompleted}/${leafTotal} завершено`;
    const dateBits: string[] = [];
    for (const c of checkpoints.slice(0, 3)) {
      dateBits.push(`${c.name}: ${c.forecastDate}`);
    }
    for (const ms of catalogOnly.slice(0, 3)) {
      dateBits.push(`${ms.name}: ${ms.forecastDate}`);
    }
    const hasDemoDates = checkpoints.length > 0;
    return {
      progressLabel,
      leafCompleted,
      leafTotal,
      composition: {
        stages,
        works: works.length,
        checkpoints: checkpoints.length,
        catalogMilestones: catalogOnly.length,
      },
      datesLabel: dateBits.length === 0 ? DETAIL_ABSENT : dateBits.join('; '),
      datesNote: hasDemoDates ? 'Демо-даты' : null,
    };
  }

  private programSummary(
    programId: ProgramId,
    snapshot: SnapshotFixture,
  ): ProgramSummary {
    const program = programById(programId)!;
    const projects = projectsOf(programId);
    const responsiblePeople = this.responsibleForProgram(programId, snapshot);
    const rows = this.rows(programId, snapshot);
    const leafCompleted = rows.reduce((sum, row) => sum + row.leafCompleted, 0);
    const leafTotal = rows.reduce((sum, row) => sum + row.leafTotal, 0);
    const progressPct =
      leafTotal === 0 ? null : Math.round((leafCompleted / leafTotal) * 100);
    const progressLabel =
      leafTotal === 0
        ? 'Нет листовых работ в импорте'
        : `${progressPct}% · ${leafCompleted}/${leafTotal} завершено`;
    const scheduleItems = this.scheduleWarningItems(snapshot.id);
    const progressFillTone = fillToneForProgramProjects(
      scheduleItems,
      projects.map((p) => p.id),
    );
    // No invented program leader — owner stays unassigned; table shows responsibles.
    return {
      id: program.id,
      name: program.name,
      status: this.statusOf(programId, snapshot),
      projectCount: projects.length,
      ownerPersonId: null,
      ownerLabel: OWNER_UNASSIGNED,
      responsiblePeople,
      progressLabel,
      progressPct,
      leafCompleted,
      leafTotal,
      progressFillTone,
    };
  }

  private ownerLabelForProject(project: AnalystProjectCatalog): string {
    if (project.ownerPersonId) {
      return this.dataSource.personFullNameRu(project.ownerPersonId as never);
    }
    return OWNER_UNASSIGNED;
  }

  private responsibleForProgram(
    programId: ProgramId,
    snapshot: SnapshotFixture,
  ): ResponsiblePerson[] {
    const seen = new Set<string>();
    const out: ResponsiblePerson[] = [];
    const push = (personId: string, role: string) => {
      if (!personId || seen.has(personId)) return;
      seen.add(personId);
      out.push({
        personId,
        fullNameRu: this.dataSource.personFullNameRu(personId as never),
        role,
      });
    };
    for (const project of projectsOf(programId)) {
      if (project.ownerPersonId) {
        push(project.ownerPersonId, `Владелец ${project.id}`);
      }
    }
    for (const ws of workstreamsForProgram(programId)) {
      push(
        this.dataSource.leadPersonIdForWorkstream(ws),
        'Ответственный за проектный контур',
      );
    }
    const projectIds = new Set(projectsOf(programId).map((p) => p.id));
    for (const issue of snapshot.issues) {
      const pid = projectIdForIssue(issue);
      if (pid && projectIds.has(pid as never)) {
        push(issue.ownerPersonId, `По проблеме ${issue.id}`);
      }
    }
    for (const item of snapshot.equipment) {
      const pid = primaryProjectForEquipment(item.id);
      if (pid && projectIds.has(pid) && item.responsiblePersonId) {
        push(item.responsiblePersonId, `По оборудованию ${item.id}`);
      }
    }
    return out;
  }

  private statusOf(
    programId: ProgramId,
    snapshot: SnapshotFixture,
  ): AnalystStatus {
    return (
      programSummariesFor(this.signals(snapshot)).find(
        (program) => program.id === programId,
      )?.status ?? 'Green'
    );
  }

  private signals(snapshot: SnapshotFixture) {
    const panel = snapshot.milestones.find((ms) => ms.id === 'MS-CLN-PANEL');
    const power = snapshot.milestones.find((ms) => ms.id === 'MS-UTL-PWR');
    const hvac = snapshot.equipment.find((item) => item.id === 'EQ-HVAC-01');
    return {
      panelRed: panel?.rag === 'Red',
      powerRed: power?.rag === 'Red',
      hvacDelayed: hvac?.status === 'Delayed',
    };
  }

  private statusOfProject(
    project: AnalystProjectCatalog,
    snapshot: SnapshotFixture,
  ): AnalystStatus {
    const panel = snapshot.milestones.find((ms) => ms.id === 'MS-CLN-PANEL');
    const power = snapshot.milestones.find((ms) => ms.id === 'MS-UTL-PWR');
    const hvac = snapshot.equipment.find((item) => item.id === 'EQ-HVAC-01');
    return analystProjectStatus({
      project,
      panelRed: panel?.rag === 'Red',
      powerRed: power?.rag === 'Red',
      hvacDelayed: hvac?.status === 'Delayed',
    });
  }
}
