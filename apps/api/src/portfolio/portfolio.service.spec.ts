import { NotFoundException } from '@nestjs/common';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import { NOT_FOUND_IN_SNAPSHOT } from '../data/analyst-portfolio';
import type {
  DecisionFixture,
  IssueFixture,
  RiskFixture,
  SnapshotFixture,
} from '../data/fixtures/types';
import { ScheduleService } from '../schedule/schedule.service';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  const dataSource = new MockDemoDataSource();
  const service = new PortfolioService(
    dataSource,
    new ScheduleService(dataSource),
  );

  it('на C PRG-CON красная, PRG-DSN жёлтая; DSN включает импортированные KT', () => {
    const construction = service.getProgram('PRJ-01', 'PRG-CON', 'C');
    const design = service.getProgram('PRJ-01', 'PRG-DSN', 'C');
    expect(construction.status).toBe('Red');
    expect(construction.milestones.map((ms) => ms.id)).toEqual(
      expect.arrayContaining([
        'MS-BLD-EXC',
        'MS-BLD-ENCL',
        'MS-CLN-RDY',
        'MS-CLN-PANEL',
      ]),
    );
    expect(design.status).toBe('Yellow');
    expect(design.milestones.length).toBeGreaterThan(0);
    expect(design.milestones.some((ms) => ms.id.startsWith('KT-'))).toBe(true);
    expect(design.projects.every((row) => row.status === 'Yellow')).toBe(true);
  });

  it('на C панель и энергоснабжение видны и в портфеле, и в программе', () => {
    const overviewIds = new Set(
      service
        .getProgram('PRJ-01', 'PRG-CON', 'C')
        .milestones.map((ms) => ms.id),
    );
    expect(overviewIds.has('MS-CLN-PANEL')).toBe(true);
    const power = service
      .getProgram('PRJ-01', 'PRG-ENG', 'C')
      .milestones.find((ms) => ms.id === 'MS-UTL-PWR');
    expect(power?.rag).toBe('Red');
  });

  it('на D карточка AN-08 отделяет поставку от монтажа', () => {
    const card = service.getProject('PRJ-01', 'AN-08', 'D');
    expect(card.ownerLabel).toContain('Лебедева');
    expect(card.installationLag).toContain('Отставание монтажа');
    expect(card.deliveryNote).toContain('не причина');
    expect(card.equipment.map((item) => item.id)).toEqual(
      expect.arrayContaining(['EQ-CLN-01']),
    );
    expect(card.equipment.length).toBeGreaterThanOrEqual(1);
    expect(card.issues.map((issue) => issue.id)).toContain('ISS-CLN-01');
    expect(card.milestones.map((ms) => ms.id)).toEqual(
      expect.arrayContaining(['MS-CLN-PANEL', 'MS-CLN-RDY']),
    );
  });

  it('PRG-DIG на фильтре прячет зелёный AN-15 и возвращает его без фильтра', () => {
    const program = service.getProgram('PRJ-01', 'PRG-DIG', 'C');
    const attention = program.projects.filter((row) => row.status !== 'Green');
    expect(attention.map((row) => row.id)).toEqual(['AN-16', 'AN-17', 'AN-18']);
    expect(program.projects.map((row) => row.id)).toContain('AN-15');
  });

  it('PRG-CON cost aggregates WS-BLD+WS-CLN without reserve; has registers', () => {
    const d = service.getProgram('PRJ-01', 'PRG-CON', 'C');
    expect(d.cost).not.toBeNull();
    expect(d.cost!.workstreamIds.sort()).toEqual(['WS-BLD', 'WS-CLN']);
    expect(d.cost!.approvedControlBudgetRub).toBeGreaterThan(0);
    expect(d.attention.openOrMitigatingIssueCount).toBeGreaterThanOrEqual(0);
    expect(d.equipment.length + d.milestones.length).toBeGreaterThan(0);
    expect(Array.isArray(d.risks)).toBe(true);
    expect(Array.isArray(d.decisions)).toBe(true);
  });

  it('PRG-CON C: Red status explained by redMilestoneCount when risks/EQ/issues are 0', () => {
    const d = service.getProgram('PRJ-01', 'PRG-CON', 'C');
    expect(d.status).toBe('Red');
    expect(d.attention.redRiskCount).toBe(0);
    expect(d.attention.delayedCriticalEquipmentCount).toBe(0);
    expect(d.attention.openOrMitigatingIssueCount).toBe(0);
    expect(d.attention.redMilestoneCount).toBeGreaterThan(0);
    expect(d.milestones.some((m) => m.rag === 'Red')).toBe(true);
  });

  it('неизвестный ID — не найден', () => {
    expect(() => service.getProgram('PRJ-01', 'PRG-NOPE', 'C')).toThrow(
      NotFoundException,
    );
    try {
      service.getProject('PRJ-01', 'AN-99', 'C');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect((error as NotFoundException).message).toBe(NOT_FOUND_IN_SNAPSHOT);
    }
  });
});

describe('portfolio canonical 7+25 (re-pass)', () => {
  const dataSource = new MockDemoDataSource();
  const service = new PortfolioService(
    dataSource,
    new ScheduleService(dataSource),
  );

  it('lists 7 programs and 25 projects with shared list/detail progress+responsibles', () => {
    const programs = service.listPrograms('PRJ-01', 'C');
    expect(programs.items).toHaveLength(7);
    const projects = service.listProjects('PRJ-01', 'C');
    expect(projects.items).toHaveLength(25);
    for (const p of programs.items) {
      const detail = service.getProgram('PRJ-01', p.id, 'C');
      expect(detail.ownerLabel).toBe(p.ownerLabel);
      expect(detail.ownerPersonId).toBe(p.ownerPersonId);
      expect(detail.projects.length).toBe(p.projectCount);
      expect(detail.projects.length).toBeGreaterThan(0);
      expect(detail.responsiblePeople).toEqual(p.responsiblePeople);
      expect(detail.progressLabel).toMatch(/%|Нет листовых/);
      expect(detail.progressPct).toBe(p.progressPct);
      expect(detail.progressFillTone).toBe(p.progressFillTone);
      expect(detail.leafTotal).toBe(
        detail.projects.reduce((sum, row) => sum + row.leafTotal, 0),
      );
      expect(detail.leafCompleted).toBe(
        detail.projects.reduce((sum, row) => sum + row.leafCompleted, 0),
      );
      for (const person of p.responsiblePeople) {
        expect(person.personId).toMatch(/^PER-/);
        expect(person.fullNameRu.length).toBeGreaterThan(0);
      }
    }
    const withPeople = programs.items.filter((p) => p.responsiblePeople.length);
    expect(withPeople.length).toBeGreaterThanOrEqual(5);
    for (const row of projects.items) {
      const card = service.getProject('PRJ-01', row.id, 'C');
      expect(card.ownerLabel).toBe(row.ownerLabel);
      expect(card.ownerPersonId).toBe(row.ownerPersonId);
      expect(card.progressLabel).toBe(row.progressLabel);
      expect(card.progressLabel).not.toMatch(
        /якор|источник|depth|thin|supplementary/i,
      );
      expect(card.datesLabel).not.toMatch(/supplementary/i);
      expect(card.composition.works + card.composition.checkpoints).toBe(
        row.leafTotal,
      );
      expect(card.programId).toBe(row.programId);
      expect(row).not.toHaveProperty('depth');
    }
  });

  it('AN-08 composition counts KT without double-counting alias MS', () => {
    const card = service.getProject('PRJ-01', 'AN-08', 'C');
    expect(card.composition.checkpoints).toBeGreaterThanOrEqual(6);
    // alias MS-CLN-PANEL counted in checkpoints, not catalogMilestones
    expect(card.composition.catalogMilestones).toBeLessThanOrEqual(2);
    expect(card.progressLabel).toMatch(/\d+% · \d+\/\d+ завершено/);
    expect(card.datesNote).toBe('Демо-даты');
  });

  it('AN-01 Yellow status can have danger fill from schedule lag (not blind RAG)', () => {
    const row = service
      .listProjects('PRJ-01', 'C')
      .items.find((item) => item.id === 'AN-01');
    expect(row?.status).toBe('Yellow');
    expect(row?.progressFillTone).toBe('danger');
    expect(typeof row?.progressPct).toBe('number');
    expect(row?.leafTotal).toBeGreaterThan(0);
  });

  it('program progressPct is sum-based not mean of project percents', () => {
    const program = service
      .listPrograms('PRJ-01', 'C')
      .items.find((item) => item.id === 'PRG-DSN');
    expect(program).toBeTruthy();
    const expected =
      program!.leafTotal === 0
        ? null
        : Math.round((program!.leafCompleted / program!.leafTotal) * 100);
    expect(program!.progressPct).toBe(expected);
  });

  it('rejects non-plant project and unknown program/project filters', () => {
    expect(() => service.listPrograms('PRJ-NOPE', 'C')).toThrow(
      NotFoundException,
    );
    expect(() => service.listProjects('PRJ-99', 'C')).toThrow(
      NotFoundException,
    );
    const programs = service.listPrograms('PRJ-01', 'C');
    const org = programs.items.find((p) => p.id === 'PRG-ORG');
    expect(org).toBeTruthy();
    // Honest empty when no WS leads / authored owners / linked persons.
    expect(Array.isArray(org!.responsiblePeople)).toBe(true);
  });

  it('null cost for PRG-DSN/PRG-ORG; allocated cost for PRG-CON; F decisions membership', () => {
    expect(service.getProgram('PRJ-01', 'PRG-DSN', 'C').cost).toBeNull();
    expect(service.getProgram('PRJ-01', 'PRG-ORG', 'C').cost).toBeNull();
    expect(service.getProgram('PRJ-01', 'PRG-CON', 'C').cost).not.toBeNull();
    const fCon = service.getProgram('PRJ-01', 'PRG-CON', 'F');
    expect(fCon.decisions.map((d) => d.id)).toContain('DEC-CLN-01');
    const f08 = service.getProject('PRJ-01', 'AN-08', 'F');
    expect(f08.decisions.map((d) => d.id)).toContain('DEC-CLN-01');
    expect(f08.deliveryNote).toMatch(/Сдвиг поставки/);
    // C: EQ-CLN-01 deltaDays=0 → honest null deliveryNote
    expect(service.getProject('PRJ-01', 'AN-08', 'C').deliveryNote).toBeNull();
    const statuses = service.programStatuses(
      new MockDemoDataSource().getSnapshot('C'),
    );
    expect(statuses).toHaveLength(7);
  });
});

describe('portfolio branch edges via patched snapshot', () => {
  class PatchedSource extends MockDemoDataSource {
    override getSnapshot(
      id: Parameters<MockDemoDataSource['getSnapshot']>[0],
    ): SnapshotFixture {
      const base = super.getSnapshot(id);
      const nullDecision: DecisionFixture = {
        id: 'DEC-NULL-MS',
        projectId: 'PRJ-01',
        type: 'PrioritizeRecovery',
        note: 'no ms',
        dueDate: '2027-01-01',
        milestoneId: null,
        ownerPersonId: 'PER-01',
      };
      const bareRisk: RiskFixture = {
        id: 'RISK-BARE',
        title: 'bare',
        rag: 'Green',
        workstream: 'WS-CLN',
        milestoneId: null,
        equipmentId: null,
        issueId: null,
      };
      const eqIssue: IssueFixture = {
        id: 'ISS-EQ-ONLY',
        title: 'eq only',
        status: 'Open',
        milestoneId: null,
        equipmentId: 'EQ-CLN-01',
        ownerPersonId: 'PER-01',
        workstream: 'WS-CLN',
      };
      const bareIssue: IssueFixture = {
        id: 'ISS-BARE',
        title: 'bare',
        status: 'Open',
        milestoneId: null,
        // Empty id → no EQ membership mapping.
        equipmentId: '',
        ownerPersonId: 'PER-01',
        workstream: 'WS-CLN',
      };
      return {
        ...base,
        decisions: [...base.decisions, nullDecision],
        risks: [...base.risks, bareRisk],
        issues: [...base.issues, eqIssue, bareIssue],
      };
    }
  }

  it('maps eq-only issue; ignores bare risk/issue/null-ms decision', () => {
    const patched = new PatchedSource();
    const svc = new PortfolioService(patched, new ScheduleService(patched));
    const program = svc.getProgram('PRJ-01', 'PRG-CON', 'C');
    expect(program.issues.map((i) => i.id)).toContain('ISS-EQ-ONLY');
    expect(program.issues.map((i) => i.id)).not.toContain('ISS-BARE');
    expect(program.decisions.map((d) => d.id)).not.toContain('DEC-NULL-MS');
    const card = svc.getProject('PRJ-01', 'AN-08', 'C');
    expect(card.risks.map((r) => r.id)).not.toContain('RISK-BARE');
    expect(card.issues.map((i) => i.id)).toContain('ISS-EQ-ONLY');
  });
});
