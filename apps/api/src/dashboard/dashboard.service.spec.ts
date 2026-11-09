import { NotFoundException } from '@nestjs/common';
import type { PersonId } from '../contracts/person-id';
import { DemoDataSource } from '../data/demo-data-source';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import {
  SNAPSHOT_01,
  SNAPSHOT_02,
  SNAPSHOT_03,
  SNAPSHOT_06,
} from '../data/fixtures';
import { snapshotWithDec001 } from '../data/fixtures/decision-test-fixture';
import {
  leadPersonIdForWorkstream,
  leadWorkstreamIdsForPerson,
  PERSON_BY_ID,
  PERSON_CATALOG,
  personFullNameRu,
  type PersonFixture,
} from '../data/fixtures/person-catalog';
import type {
  ScheduleImportedCheckpointFixture,
  ScheduleWorkSnapshotFixture,
} from '../data/fixtures/schedule-works';
import { getScheduleWorkFixture } from '../data/fixtures/schedule-works';
import type { ProjectFixture, SnapshotFixture } from '../data/fixtures/types';
import type { WorkstreamId } from '../data/workstream-ids';
import { SNAPSHOT_IDS, type SnapshotId } from '../snapshot/snapshot-id';
import { ScheduleService } from '../schedule/schedule.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { DashboardService } from './dashboard.service';

class FakeDataSource extends DemoDataSource {
  constructor(
    private readonly snapshots: Partial<Record<SnapshotId, SnapshotFixture>>,
    private readonly scheduleOverride?: ScheduleWorkSnapshotFixture | null,
  ) {
    super();
  }

  getSnapshot(id: SnapshotId): SnapshotFixture {
    const s = this.snapshots[id];
    if (!s) throw new NotFoundException(`Unknown snapshot: ${id}`);
    return s;
  }

  getProject(snapshotId: SnapshotId, projectId: string): ProjectFixture | null {
    const s = this.getSnapshot(snapshotId);
    return s.project.id === projectId ? s.project : null;
  }

  listSnapshotIds(): SnapshotId[] {
    return Object.keys(this.snapshots) as SnapshotId[];
  }

  getDefaultSnapshot(): SnapshotFixture {
    return this.snapshots['01']!;
  }

  getCosts(): never {
    throw new Error('getCosts not used by DashboardService');
  }

  listPeople(): readonly PersonFixture[] {
    return PERSON_CATALOG;
  }

  getPerson(id: PersonId): PersonFixture | null {
    return PERSON_BY_ID.get(id) ?? null;
  }

  personFullNameRu(id: PersonId): string {
    return personFullNameRu(id);
  }

  leadPersonIdForWorkstream(ws: WorkstreamId): PersonId {
    return leadPersonIdForWorkstream(ws);
  }

  leadWorkstreamIdsForPerson(id: PersonId): WorkstreamId[] {
    return leadWorkstreamIdsForPerson(id);
  }

  getScheduleWorks(snapshotId: SnapshotId): ScheduleWorkSnapshotFixture {
    if (this.scheduleOverride !== undefined) {
      return (
        this.scheduleOverride ?? {
          works: [],
          links: [],
          groups: [],
          milestoneAttachments: [],
          importedCheckpoints: [],
          aliasedCheckpoints: [],
        }
      );
    }
    // Real schedule fixture required for PortfolioService program progress parity.
    return getScheduleWorkFixture(snapshotId);
  }

  listNotifications(): never {
    throw new Error('listNotifications not used by DashboardService');
  }
}

function checkpoint(
  partial: Partial<ScheduleImportedCheckpointFixture> &
    Pick<ScheduleImportedCheckpointFixture, 'id' | 'wbs'>,
): ScheduleImportedCheckpointFixture {
  return {
    name: partial.name ?? partial.id,
    parentKey: 'AN-09',
    siblingOrder: 0,
    workstream: null,
    sourceStatus: 'OnSchedule',
    sourceWeeks: null,
    status: 'OnSchedule',
    baselineDate: '2027-06-01',
    forecastDate: '2027-06-01',
    progressPct: 0,
    rag: 'Green',
    ...partial,
  };
}

function makeDashboard(ds: FakeDataSource): DashboardService {
  return new DashboardService(
    ds,
    new PortfolioService(ds, new ScheduleService(ds)),
  );
}

describe('DashboardService (E1-R1 collection contracts)', () => {
  const service = makeDashboard(
    new FakeDataSource({
      '01': SNAPSHOT_01,
      '02': SNAPSHOT_02,
      '03': SNAPSHOT_03,
    }),
  );

  it('A: Green calm; collection-shaped; empty decisions', () => {
    const dto = service.getOverview('PRT-01', '01');
    expect(dto.projectStatus).toBe('Green');
    expect(dto.equipment.length).toBeGreaterThanOrEqual(2);
    expect(dto.milestones.some((m) => m.id === 'MS-PS')).toBe(true);
    expect(dto.workstreamRollups).toHaveLength(8);
    expect(dto.project.forecastProductionStart).toBe('2027-09-15');
    expect(dto.issues).toEqual([]);
    expect(dto.decisions).toEqual([]);
    expect(dto.decisionPanelState).toBe('absent');
    expect(dto.peopleFocus.previousSnapshotId).toBeNull();
    expect(dto.peopleFocus.totalPeopleInFocus).toBe(0);
    expect(dto.peopleFocus.summary.newCriticalQuestionCount).toBeNull();
  });

  it('B: Yellow local PKG/BLD; HVAC/PS calm; Open local issues; no DEC', () => {
    const dto = service.getOverview('PRT-01', '02');
    expect(dto.projectStatus).toBe('Yellow');
    expect(dto.project.forecastProductionStart).toBe('2027-09-15');
    expect(dto.equipment.find((e) => e.id === 'EQ-HVAC-01')?.status).toBe(
      'OnTrack',
    );
    expect(dto.equipment.find((e) => e.id === 'EQ-PKG-01')?.status).toBe(
      'Delayed',
    );
    expect(dto.risks.find((r) => r.id === 'RISK-001')?.rag).toBe('Green');
    expect(dto.milestones.find((m) => m.id === 'MS-PS')?.rag).toBe('Green');
    expect(
      dto.issues.some((i) => i.id === 'ISS-PKG-01' && i.status === 'Open'),
    ).toBe(true);
    expect(dto.issues.some((i) => i.id === 'ISS-001')).toBe(false);
    expect(dto.decisions).toEqual([]);
    expect(dto.decisionPanelState).toBe('absent');
    expect(dto.topExceptions[0]?.priority).toBe(1);
  });

  it('throws when plant project missing', () => {
    expect(() => service.getOverview('PRJ-MISSING', '01')).toThrow(
      /PRJ-MISSING/,
    );
  });

  it('A inventory scale and F decisions without heal', () => {
    const a = service.getOverview('PRT-01', '01');
    expect(a.equipment).toHaveLength(52);
    expect(a.milestones.length).toBeGreaterThanOrEqual(44);
    expect(a.executiveMilestoneIds).toHaveLength(189);
    expect(a.executiveMilestoneIds).toContain('MS-PS');
    // Stable baseline order: consecutive ids non-decreasing by baselineDate.
    for (let i = 1; i < a.executiveMilestoneIds.length; i += 1) {
      const prev = a.milestones.find(
        (m) => m.id === a.executiveMilestoneIds[i - 1],
      )!;
      const cur = a.milestones.find(
        (m) => m.id === a.executiveMilestoneIds[i],
      )!;
      expect(prev.baselineDate <= cur.baselineDate).toBe(true);
    }

    const svc = makeDashboard(
      new FakeDataSource({
        '01': SNAPSHOT_01,
        '02': SNAPSHOT_02,
        '03': SNAPSHOT_03,
        '06': SNAPSHOT_06,
      }),
    );
    const f = svc.getOverview('PRT-01', '06');
    expect(f.decisions.some((d) => d.id === 'DEC-001')).toBe(true);
    expect(f.project.forecastProductionStart).toBe('2027-10-06');
    expect(f.projectStatus).toBe('Red');
    expect(f.decisionHonesty).toEqual({
      recoveryExecuted: false,
      forecastDeviation: 'deviation_persists',
    });
    const dec001 = f.decisions.find((d) => d.id === 'DEC-001');
    expect(dec001?.executionStatus).toBe('not_started');
    expect(dec001?.execution?.source.kind).toBe('demo');
  });

  it('C: Red HVAC path; ISS Open; DEC absent; panel needed', () => {
    const dto = service.getOverview('PRT-01', '03');
    expect(dto.projectStatus).toBe('Red');
    expect(dto.project.forecastProductionStart).toBe('2027-10-06');
    expect(
      dto.equipment.find((e) => e.id === 'EQ-HVAC-01')?.deliveryVariance
        .deltaDays,
    ).toBe(21);
    expect(dto.issues.find((i) => i.id === 'ISS-001')?.status).toBe('Open');
    expect(dto.risks.find((r) => r.id === 'RISK-001')?.rag).toBe('Red');
    expect(dto.milestones.find((m) => m.id === 'MS-PS')?.rag).toBe('Red');
    expect(dto.decisions).toEqual([]);
    expect(dto.decisionPanelState).toBe('needed');
    expect(dto.decisionHonesty).toBeNull();
    expect(dto.peopleFocus.previousSnapshotId).toBe('02');
    expect(dto.peopleFocus.people.map((p) => p.personId).slice(0, 3)).toEqual([
      'PER-02',
      'PER-08',
      'PER-11',
    ]);
  });

  it('Decision contract via test-local fixture (not production C)', () => {
    const svc = makeDashboard(
      new FakeDataSource({
        '01': SNAPSHOT_01,
        '02': SNAPSHOT_02,
        '03': snapshotWithDec001(),
      }),
    );
    const dto = svc.getOverview('PRT-01', '03');
    expect(dto.decisionPanelState).toBe('recorded');
    expect(dto.decisions[0]).toMatchObject({
      id: 'DEC-001',
      projectId: 'PRT-01',
      milestoneId: 'MS-PS',
      type: 'PrioritizeRecovery',
    });
    expect(dto.decisions[0]).not.toHaveProperty('equipmentId');
    expect(dto.decisionHonesty).toEqual({
      recoveryExecuted: false,
      forecastDeviation: 'deviation_persists',
    });
    expect(dto.project.forecastProductionStart).toBe('2027-10-06');
  });

  it('programs progress/status parity vs portfolio list for all 19 snapshots', () => {
    // Live mock source — covers 01–19 including known 0/100/null progress edges.
    const ds = new MockDemoDataSource();
    const dash = new DashboardService(
      ds,
      new PortfolioService(ds, new ScheduleService(ds)),
    );
    const portfolio = new PortfolioService(ds, new ScheduleService(ds));
    for (const id of SNAPSHOT_IDS) {
      const overview = dash.getOverview('PRT-01', id);
      const list = portfolio.listPrograms('PRT-01', id).items;
      expect(overview.programs).toHaveLength(list.length);
      for (const row of overview.programs) {
        const match = list.find((p) => p.id === row.id);
        expect(match).toBeDefined();
        expect(row.status).toBe(match!.status);
        expect(row.progressPct).toBe(match!.progressPct);
        expect(row.leafCompleted).toBe(match!.leafCompleted);
        expect(row.leafTotal).toBe(match!.leafTotal);
        expect(row.progressFillTone).toBe(match!.progressFillTone);
      }
    }
  });

  it('404 for unknown project', () => {
    expect(() => service.getOverview('PRJ-99', '01')).toThrow(
      NotFoundException,
    );
  });

  it('program enrichment fields are present and match portfolio tones', () => {
    const dto = service.getOverview('PRT-01', '03');
    expect(dto.programs.length).toBeGreaterThan(0);
    for (const row of dto.programs) {
      expect(typeof row.id).toBe('string');
      expect(row.id.length).toBeGreaterThan(0);
      expect(typeof row.name).toBe('string');
      expect(row.name.length).toBeGreaterThan(0);
      expect(['Green', 'Yellow', 'Red']).toContain(row.status);
      expect(Object.prototype.hasOwnProperty.call(row, 'progressPct')).toBe(
        true,
      );
      expect(Object.prototype.hasOwnProperty.call(row, 'leafCompleted')).toBe(
        true,
      );
      expect(Object.prototype.hasOwnProperty.call(row, 'leafTotal')).toBe(true);
      expect(
        Object.prototype.hasOwnProperty.call(row, 'progressFillTone'),
      ).toBe(true);
    }
  });

  it('DEC-001 execution arc 06→07→09→15→19 and honesty axes', () => {
    const ds = new MockDemoDataSource();
    const dash = new DashboardService(
      ds,
      new PortfolioService(ds, new ScheduleService(ds)),
    );
    expect(
      dash.getOverview('PRT-01', '06').decisions.find((d) => d.id === 'DEC-001')
        ?.executionStatus,
    ).toBe('not_started');
    expect(
      dash.getOverview('PRT-01', '07').decisions.find((d) => d.id === 'DEC-001')
        ?.executionStatus,
    ).toBe('in_progress');
    expect(
      dash.getOverview('PRT-01', '09').decisions.find((d) => d.id === 'DEC-001')
        ?.executionStatus,
    ).toBe('in_progress');
    const o = dash.getOverview('PRT-01', '15');
    expect(o.decisions.find((d) => d.id === 'DEC-001')?.executionStatus).toBe(
      'completed',
    );
    expect(o.decisionPanelState).toBe('recorded');
    expect(o.decisionHonesty?.forecastDeviation).toBe('deviation_persists');
    const s = dash.getOverview('PRT-01', '19');
    expect(s.decisions.find((d) => d.id === 'DEC-001')?.executionStatus).toBe(
      'completed',
    );
    // Non-primary decisions stay unknown and must not mask panel.
    const other = s.decisions.find((d) => d.id !== 'DEC-001');
    if (other) {
      expect(other.executionStatus).toBe('unknown');
      expect(other.execution).toBeNull();
    }
  });

  it('recorded + PS delta 0 → forecastDeviation within_baseline', () => {
    const snap = snapshotWithDec001({
      project: {
        ...SNAPSHOT_03.project,
        forecastProductionStart: SNAPSHOT_03.project.baselineProductionStart,
      },
    });
    const svc = makeDashboard(
      new FakeDataSource({
        '01': SNAPSHOT_01,
        '03': snap,
      }),
    );
    const dto = svc.getOverview('PRT-01', '03');
    expect(dto.decisionPanelState).toBe('recorded');
    expect(dto.project.productionStartVariance.deltaDays).toBe(0);
    expect(dto.decisionHonesty).toEqual({
      recoveryExecuted: false,
      forecastDeviation: 'within_baseline',
    });
  });

  it('absent panel keeps decisionHonesty null even on calm 01', () => {
    const dto = service.getOverview('PRT-01', '01');
    expect(dto.decisionPanelState).toBe('absent');
    expect(dto.decisionHonesty).toBeNull();
    expect(dto.decisions).toEqual([]);
  });

  it('membership bridge / unknown workstream and universe placeholders', () => {
    // Valid schedule tree for portfolio. Drop one catalog-only MS → universe placeholder.
    // Synthetic rows hit membershipFromCheckpoint bridge / null / AN-00 paths.
    const snap: SnapshotFixture = {
      ...SNAPSHOT_01,
      milestones: SNAPSHOT_01.milestones.filter((m) => m.id !== 'MS-PKG-FAT'),
    };
    const base = getScheduleWorkFixture('01');
    const existingParent =
      base.importedCheckpoints?.[0]?.parentKey ?? 'stage_group:1.1';
    const aliasParent =
      base.aliasedCheckpoints?.[0]?.parentKey ?? 'stage_group:8.2';
    // Keep full KT set (links require them); append synthetics for membership edges.
    const schedule: ScheduleWorkSnapshotFixture = {
      ...base,
      importedCheckpoints: [
        ...(base.importedCheckpoints ?? []),
        checkpoint({
          id: 'KT-BRIDGE-1',
          wbs: 'X.9',
          workstream: 'WS-HVAC',
          name: 'bridge',
          status: 'Delayed',
          parentKey: existingParent,
        }),
        checkpoint({
          id: 'KT-ORPHAN-1',
          wbs: 'ZZ',
          workstream: 'WS-NOT-A-BRIDGE',
          status: 'OnSchedule',
          parentKey: existingParent,
        }),
        // AN-99 missing in catalog → projectById null, then workstream bridge.
        checkpoint({
          id: 'KT-MISS-PROJ',
          wbs: '99.1',
          workstream: 'WS-BLD',
          status: 'OnSchedule',
          parentKey: existingParent,
        }),
      ],
      aliasedCheckpoints: [
        ...(base.aliasedCheckpoints ?? []).map((c) =>
          c.id === 'MS-PS' ? { ...c, name: '', status: 'Delayed' as const } : c,
        ),
        checkpoint({
          id: 'KT-ALIAS-0',
          wbs: '0.1',
          workstream: 'WS-CLN',
          status: 'OnSchedule',
          parentKey: aliasParent,
        }),
      ],
    };
    const svc = makeDashboard(new FakeDataSource({ '01': snap }, schedule));
    const dto = svc.getOverview('PRT-01', '01');
    const bridge = dto.milestones.find((m) => m.id === 'KT-BRIDGE-1');
    expect(bridge).toBeDefined();
    // Delayed→Red when merge preserves status; otherwise still bridged to HVAC program.
    expect(bridge!.programId).toBe('PRG-ENG');
    expect(bridge!.projectId).toBe('AN-09');
    expect(
      dto.milestones.find((m) => m.id === 'KT-ORPHAN-1')?.programId,
    ).toBeNull();
    expect(dto.milestones.find((m) => m.id === 'KT-MISS-PROJ')?.programId).toBe(
      'PRG-CON',
    );
    expect(dto.milestones.find((m) => m.id === 'KT-MISS-PROJ')?.projectId).toBe(
      'AN-06',
    );
    expect(dto.milestones.find((m) => m.id === 'KT-ALIAS-0')?.programId).toBe(
      'PRG-CON',
    );
    const placeholder = dto.milestones.find((m) => m.id === 'MS-PKG-FAT');
    expect(placeholder).toBeDefined();
    expect(placeholder!.name).toBe('MS-PKG-FAT');
    expect(placeholder!.rag).toBe('Green');
    expect(placeholder!.programId).toBeNull();
    expect(placeholder!.portfolioVisible).toBe(true);
  });

  it('peopleFocus uses null previous when prev id absent from known list', () => {
    // Only 03 present → previousSnapshotIdOf(03)=02 not in known → previous null.
    const svc = makeDashboard(new FakeDataSource({ '03': SNAPSHOT_03 }));
    const dto = svc.getOverview('PRT-01', '03');
    expect(dto.peopleFocus.previousSnapshotId).toBeNull();
  });
});
