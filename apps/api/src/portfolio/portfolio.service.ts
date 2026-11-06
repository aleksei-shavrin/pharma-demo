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
} from '../data/fixtures/analyst-portfolio';
import type { SnapshotFixture } from '../data/fixtures/types';
import type { SnapshotId } from '../snapshot/snapshot-id';

const DEMO_PROJECT = 'PRJ-01';

const EQUIPMENT_PROJECT: Record<string, string> = {
  'EQ-CLN-01': 'AN-08',
  'EQ-HVAC-01': 'AN-09',
};

export type ProgramSummary = {
  id: ProgramId;
  name: string;
  status: AnalystStatus;
};

export type AnalystProjectRow = {
  id: string;
  name: string;
  programId: string;
  status: AnalystStatus;
  ownerLabel: string;
  progressLabel: string;
  depth: 'deep' | 'thin';
};

export type ProgramDetail = {
  snapshotId: SnapshotId;
  id: ProgramId;
  name: string;
  status: AnalystStatus;
  projects: AnalystProjectRow[];
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
  issues: { id: string; title: string; status: string }[];
  equipment: {
    id: string;
    name: string;
    status: string;
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
  if (issue.equipmentId && EQUIPMENT_PROJECT[issue.equipmentId]) {
    return EQUIPMENT_PROJECT[issue.equipmentId];
  }
  return null;
}

@Injectable()
export class PortfolioService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  listPrograms(
    projectId: string,
    snapshotId: SnapshotId,
  ): { snapshotId: SnapshotId; items: ProgramSummary[] } {
    this.requirePlant(projectId, snapshotId);
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    return {
      snapshotId: snapshot.id,
      items: PROGRAM_CATALOG.map((program) => ({
        id: program.id,
        name: program.name,
        status: this.statusOf(program.id, snapshot),
      })),
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
    return {
      snapshotId: snapshot.id,
      id: program.id,
      name: program.name,
      status: worstStatus(projects.map((row) => row.status)),
      projects,
      issues: snapshot.issues
        .filter((issue) => issue.status === 'Open' || issue.status === 'Mitigating')
        .map((issue) => ({
          id: issue.id,
          title: issue.title,
          status: issue.status,
          projectId: projectIdForIssue(issue),
        }))
        .filter((issue) =>
          projects.some((row) => row.id === issue.projectId),
        ),
      milestones: snapshot.milestones
        .filter((ms) => milestoneMembership(ms.id).programId === program.id)
        .map((ms) => ({
          id: ms.id,
          name: ms.name,
          rag: ms.rag,
          baselineDate: ms.baselineDate,
          forecastDate: ms.forecastDate,
          projectId: milestoneMembership(ms.id).projectId,
        })),
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
      items: PROGRAM_CATALOG.flatMap((program) => this.rows(program.id, snapshot)),
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
    const milestones = snapshot.milestones
      .filter((ms) => milestoneMembership(ms.id).projectId === project.id)
      .map((ms) => ({
        id: ms.id,
        name: ms.name,
        rag: ms.rag,
        baselineDate: ms.baselineDate,
        forecastDate: ms.forecastDate,
      }));
    const equipment = snapshot.equipment
      .filter((item) => EQUIPMENT_PROJECT[item.id] === project.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        forecastDelivery: item.forecastDelivery,
        deltaDays: calendarDaysDelta(item.baselineDelivery, item.forecastDelivery),
      }));
    const issues = snapshot.issues
      .filter((issue) => projectIdForIssue(issue) === project.id)
      .map((issue) => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
      }));
    const installation = issues.find((issue) => issue.id === 'ISS-CLN-01');
    const delivery = equipment.find((item) => item.id === 'EQ-CLN-01');
    return {
      snapshotId: snapshot.id,
      id: project.id,
      name: project.name,
      programId: program.id,
      programName: program.name,
      status,
      ownerPersonId: project.ownerPersonId,
      ownerLabel: project.ownerPersonId
        ? this.dataSource.personFullNameRu(project.ownerPersonId as never)
        : OWNER_UNASSIGNED,
      progressLabel: project.progressLabel,
      datesLabel:
        project.depth === 'thin' || milestones.length === 0
          ? DETAIL_ABSENT
          : milestones
              .map((ms) => `${ms.name}: ${ms.forecastDate}`)
              .join('; '),
      issues,
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
    return programSummariesFor(this.signals(snapshot));
  }

  private requirePlant(projectId: string, snapshotId: SnapshotId): void {
    const project = this.dataSource.getProject(snapshotId, projectId);
    if (!project || project.id !== DEMO_PROJECT) {
      throw new NotFoundException(NOT_FOUND_IN_SNAPSHOT);
    }
  }

  private rows(programId: ProgramId, snapshot: SnapshotFixture): AnalystProjectRow[] {
    return projectsOf(programId).map((project) => ({
      id: project.id,
      name: project.name,
      programId: project.programId,
      status: this.statusOfProject(project, snapshot),
      ownerLabel: project.ownerPersonId
        ? this.dataSource.personFullNameRu(project.ownerPersonId as never)
        : OWNER_UNASSIGNED,
      progressLabel: project.progressLabel,
      depth: project.depth,
    }));
  }

  private statusOf(programId: ProgramId, snapshot: SnapshotFixture): AnalystStatus {
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
