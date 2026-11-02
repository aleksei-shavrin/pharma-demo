import { NotFoundException } from '@nestjs/common';
import type { PersonId } from '../contracts/person-id';
import { DemoDataSource } from '../data/demo-data-source';
import {
  SNAPSHOT_A,
  SNAPSHOT_B,
  SNAPSHOT_C,
  SNAPSHOT_F,
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
import type { ProjectFixture, SnapshotFixture } from '../data/fixtures/types';
import type { WorkstreamId } from '../data/workstream-ids';
import type { SnapshotId } from '../snapshot/snapshot-id';
import { DashboardService } from './dashboard.service';

class FakeDataSource extends DemoDataSource {
  constructor(
    private readonly snapshots: Partial<Record<SnapshotId, SnapshotFixture>>,
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
    return this.snapshots.A!;
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
}

describe('DashboardService (E1-R1 collection contracts)', () => {
  const service = new DashboardService(
    new FakeDataSource({ A: SNAPSHOT_A, B: SNAPSHOT_B, C: SNAPSHOT_C }),
  );

  it('A: Green calm; collection-shaped; empty decisions', () => {
    const dto = service.getOverview('PRJ-01', 'A');
    expect(dto.projectStatus).toBe('Green');
    expect(dto.equipment.length).toBeGreaterThanOrEqual(2);
    expect(dto.milestones.some((m) => m.id === 'MS-PS')).toBe(true);
    expect(dto.workstreamRollups).toHaveLength(8);
    expect(dto.project.forecastProductionStart).toBe('2027-09-15');
    expect(dto.issues).toEqual([]);
    expect(dto.decisions).toEqual([]);
    expect(dto.decisionPanelState).toBe('absent');
  });

  it('B: Yellow local PKG/BLD; HVAC/PS calm; Open local issues; no DEC', () => {
    const dto = service.getOverview('PRJ-01', 'B');
    expect(dto.projectStatus).toBe('Yellow');
    expect(dto.project.forecastProductionStart).toBe('2027-09-15');
    expect(
      dto.equipment.find((e) => e.id === 'EQ-HVAC-01')?.status,
    ).toBe('OnTrack');
    expect(
      dto.equipment.find((e) => e.id === 'EQ-PKG-01')?.status,
    ).toBe('Delayed');
    expect(dto.risks.find((r) => r.id === 'RISK-001')?.rag).toBe('Green');
    expect(dto.milestones.find((m) => m.id === 'MS-PS')?.rag).toBe('Green');
    expect(dto.issues.some((i) => i.id === 'ISS-PKG-01' && i.status === 'Open')).toBe(
      true,
    );
    expect(dto.issues.some((i) => i.id === 'ISS-001')).toBe(false);
    expect(dto.decisions).toEqual([]);
    expect(dto.decisionPanelState).toBe('absent');
    expect(dto.topExceptions[0]?.priority).toBe(1);
  });

  it('A inventory scale and F decisions without heal', () => {
    const a = service.getOverview('PRJ-01', 'A');
    expect(a.equipment).toHaveLength(52);
    expect(a.milestones).toHaveLength(40);
    expect(a.executiveMilestoneIds).toContain('MS-PS');

    const svc = new DashboardService(
      new FakeDataSource({
        A: SNAPSHOT_A,
        B: SNAPSHOT_B,
        C: SNAPSHOT_C,
        F: SNAPSHOT_F,
      }),
    );
    const f = svc.getOverview('PRJ-01', 'F');
    expect(f.decisions.some((d) => d.id === 'DEC-001')).toBe(true);
    expect(f.project.forecastProductionStart).toBe('2027-10-06');
    expect(f.projectStatus).toBe('Red');
    expect(f.decisionHonesty).toEqual({ recoveryExecuted: false });
  });

  it('C: Red HVAC path; ISS Open; DEC absent; panel needed', () => {
    const dto = service.getOverview('PRJ-01', 'C');
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
  });

  it('Decision contract via test-local fixture (not production C)', () => {
    const svc = new DashboardService(
      new FakeDataSource({
        A: SNAPSHOT_A,
        B: SNAPSHOT_B,
        C: snapshotWithDec001(),
      }),
    );
    const dto = svc.getOverview('PRJ-01', 'C');
    expect(dto.decisionPanelState).toBe('recorded');
    expect(dto.decisions[0]).toMatchObject({
      id: 'DEC-001',
      projectId: 'PRJ-01',
      milestoneId: 'MS-PS',
      type: 'PrioritizeRecovery',
    });
    expect(dto.decisions[0]).not.toHaveProperty('equipmentId');
    expect(dto.decisionHonesty).toEqual({ recoveryExecuted: false });
    expect(dto.project.forecastProductionStart).toBe('2027-10-06');
  });

  it('404 for unknown project', () => {
    expect(() => service.getOverview('PRJ-99', 'A')).toThrow(NotFoundException);
  });
});
