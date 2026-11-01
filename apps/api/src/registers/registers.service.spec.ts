import { NotFoundException } from '@nestjs/common';
import { DemoDataSource } from '../data/demo-data-source';
import type { ProjectFixture, SnapshotFixture } from '../data/fixtures/types';
import type { SnapshotId } from '../snapshot/snapshot-id';
import { RegistersService } from './registers.service';

class FakeDataSource extends DemoDataSource {
  constructor(private readonly snapshots: Record<SnapshotId, SnapshotFixture>) {
    super();
  }

  getSnapshot(id: SnapshotId): SnapshotFixture {
    return this.snapshots[id];
  }

  getProject(snapshotId: SnapshotId, projectId: string): ProjectFixture | null {
    const s = this.getSnapshot(snapshotId);
    return s.project.id === projectId ? s.project : null;
  }

  listSnapshotIds(): SnapshotId[] {
    return Object.keys(this.snapshots) as SnapshotId[];
  }

  getDefaultSnapshot(): SnapshotFixture {
    return this.snapshots.A;
  }
}

function snap(
  id: SnapshotId,
  asOf: string,
  eqForecast: string,
  eqStatus: 'OnTrack' | 'Delayed',
  msForecast: string,
  rag: 'Green' | 'Red',
  issue: SnapshotFixture['issue'],
): SnapshotFixture {
  return {
    id,
    scenarioAsOfDate: asOf,
    project: {
      id: 'PRJ-01',
      name: 'Строительство фармацевтического завода',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: msForecast,
    },
    milestone: {
      id: 'MS-PS',
      name: 'Ready for production',
      baselineDate: '2027-09-15',
      forecastDate: msForecast,
      rag,
    },
    equipment: {
      id: 'EQ-HVAC-01',
      projectId: 'PRJ-01',
      critical: true,
      baselineDelivery: '2027-05-15',
      forecastDelivery: eqForecast,
      status: eqStatus,
    },
    risk: {
      id: 'RISK-001',
      rag,
      milestoneId: 'MS-PS',
      equipmentId: 'EQ-HVAC-01',
      issueId: issue?.id ?? null,
    },
    issue,
    decision: null,
  };
}

const A = snap('A', '2027-02-15', '2027-05-15', 'OnTrack', '2027-09-15', 'Green', null);
const B = snap('B', '2027-03-01', '2027-06-05', 'Delayed', '2027-10-06', 'Red', {
  id: 'ISS-001',
  title: 'HVAC long-lead delivery slip',
  status: 'Open',
  owner: 'SH-002',
  equipmentId: 'EQ-HVAC-01',
  milestoneId: 'MS-PS',
});
const C = snap('C', '2027-03-02', '2027-06-05', 'Delayed', '2027-10-06', 'Red', {
  id: 'ISS-001',
  title: 'HVAC long-lead delivery slip',
  status: 'Mitigating',
  owner: 'SH-002',
  equipmentId: 'EQ-HVAC-01',
  milestoneId: 'MS-PS',
});

describe('RegistersService', () => {
  const service = new RegistersService(new FakeDataSource({ A, B, C }));

  describe('equipment', () => {
    it('A: OnTrack delta 0', () => {
      const r = service.listEquipment('PRJ-01', 'A');
      expect(r.snapshotId).toBe('A');
      expect(r.items).toHaveLength(1);
      expect(r.items[0].status).toBe('OnTrack');
      expect(r.items[0].deliveryVariance.deltaDays).toBe(0);
    });

    it('B/C: Delayed +21', () => {
      for (const id of ['B', 'C'] as const) {
        const r = service.listEquipment('PRJ-01', id);
        expect(r.items[0].status).toBe('Delayed');
        expect(r.items[0].forecastDelivery).toBe('2027-06-05');
        expect(r.items[0].deliveryVariance.deltaDays).toBe(21);
      }
    });
  });

  describe('issues-risks', () => {
    it('A: Risk Green, no Issue; no Owner column field', () => {
      const r = service.listIssuesRisks('PRJ-01', 'A');
      expect(r.rows.map((x) => x.type)).toEqual(['Risk']);
      expect(r.rows[0].rag).toBe('Green');
      expect(r.rows[0]).not.toHaveProperty('owner');
    });

    it('B: Issue Open + Risk Red', () => {
      const r = service.listIssuesRisks('PRJ-01', 'B');
      expect(r.rows).toHaveLength(2);
      expect(r.rows[0]).toMatchObject({
        type: 'Issue',
        id: 'ISS-001',
        issueStatus: 'Open',
      });
      expect(r.rows[1]).toMatchObject({ type: 'Risk', rag: 'Red' });
      expect(r.rows.some((x) => x.issueStatus === ('Pending' as never))).toBe(
        false,
      );
    });

    it('C: Issue Mitigating + Risk Red', () => {
      const r = service.listIssuesRisks('PRJ-01', 'C');
      expect(r.rows[0].issueStatus).toBe('Mitigating');
      expect(r.rows[1].rag).toBe('Red');
    });
  });

  describe('milestones', () => {
    it('A: Green zero variance', () => {
      const r = service.listMilestones('PRJ-01', 'A');
      expect(r.items[0].rag).toBe('Green');
      expect(r.items[0].dateVariance.deltaDays).toBe(0);
      expect(r.items[0].baselineDate).toBe('2027-09-15');
    });

    it('B/C: Red +21 on milestone dates', () => {
      for (const id of ['B', 'C'] as const) {
        const r = service.listMilestones('PRJ-01', id);
        expect(r.items[0].rag).toBe('Red');
        expect(r.items[0].forecastDate).toBe('2027-10-06');
        expect(r.items[0].dateVariance.deltaDays).toBe(21);
      }
    });
  });

  it('unknown project → NotFound', () => {
    expect(() => service.listEquipment('NOPE', 'A')).toThrow(NotFoundException);
    expect(() => service.listIssuesRisks('NOPE', 'A')).toThrow(NotFoundException);
    expect(() => service.listMilestones('NOPE', 'A')).toThrow(NotFoundException);
  });
});
