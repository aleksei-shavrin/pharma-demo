import { NotFoundException } from '@nestjs/common';
import { DemoDataSource } from '../data/demo-data-source';
import {
  SNAPSHOT_A,
  SNAPSHOT_B,
  SNAPSHOT_C,
  SNAPSHOT_E,
} from '../data/fixtures';
import type { ProjectFixture, SnapshotFixture } from '../data/fixtures/types';
import type { SnapshotId } from '../snapshot/snapshot-id';
import { RegistersService } from './registers.service';

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
    throw new Error('getCosts not used by RegistersService');
  }

  listPeople(): never {
    throw new Error('listPeople not used by RegistersService');
  }
  getPerson(): never {
    throw new Error('getPerson not used by RegistersService');
  }
  personFullNameRu(): never {
    throw new Error('personFullNameRu not used by RegistersService');
  }
  leadPersonIdForWorkstream(): never {
    throw new Error('leadPersonIdForWorkstream not used by RegistersService');
  }
  leadWorkstreamIdsForPerson(): never {
    throw new Error('leadWorkstreamIdsForPerson not used by RegistersService');
  }
}

describe('RegistersService', () => {
  const service = new RegistersService(
    new FakeDataSource({ A: SNAPSHOT_A, B: SNAPSHOT_B, C: SNAPSHOT_C }),
  );

  describe('equipment', () => {
    it('A: multi-item OnTrack', () => {
      const r = service.listEquipment('PRJ-01', 'A');
      expect(r.items.length).toBeGreaterThanOrEqual(2);
      expect(r.items.every((i) => i.status === 'OnTrack')).toBe(true);
      expect(r.items[0].name).toBeTruthy();
      expect(r.items[0].workstream).toBeTruthy();
    });

    it('B: HVAC OnTrack; PKG Delayed +10', () => {
      const r = service.listEquipment('PRJ-01', 'B');
      const hvac = r.items.find((i) => i.id === 'EQ-HVAC-01');
      const pkg = r.items.find((i) => i.id === 'EQ-PKG-01');
      expect(r.items).toHaveLength(52);
      expect(hvac?.status).toBe('OnTrack');
      expect(pkg?.status).toBe('Delayed');
      expect(pkg?.deliveryVariance.deltaDays).toBe(10);
    });

    it('C: HVAC Delayed +21 with related active Issue/Risk', () => {
      const r = service.listEquipment('PRJ-01', 'C');
      const hvac = r.items.find((i) => i.id === 'EQ-HVAC-01');
      expect(hvac?.status).toBe('Delayed');
      expect(hvac?.deliveryVariance.deltaDays).toBe(21);
      expect(hvac?.relatedActiveIssueIds).toContain('ISS-001');
      expect(hvac?.relatedRedRiskIds).toContain('RISK-001');
    });
  });

  describe('issues-risks', () => {
    it('A: Risk only; RISK-COM-01 may omit Issue', () => {
      const r = service.listIssuesRisks('PRJ-01', 'A');
      expect(r.rows.filter((x) => x.type === 'Issue')).toHaveLength(0);
      const risk001 = r.rows.find(
        (x) => x.type === 'Risk' && x.id === 'RISK-001',
      );
      expect(risk001?.workstream).toBeTruthy();
      expect(risk001?.rag).toBe('Green');
    });

    it('B: Open PKG/BLD issues; no ISS-001; RISK Green', () => {
      const r = service.listIssuesRisks('PRJ-01', 'B');
      expect(r.rows.some((x) => x.id === 'ISS-001')).toBe(false);
      expect(
        r.rows.some(
          (x) =>
            x.type === 'Issue' &&
            x.id === 'ISS-PKG-01' &&
            x.issueStatus === 'Open',
        ),
      ).toBe(true);
      expect(
        r.rows.some(
          (x) => x.type === 'Risk' && x.id === 'RISK-001' && x.rag === 'Green',
        ),
      ).toBe(true);
    });

    it('C: Issue Open + Risk Red with BA-015 links', () => {
      const r = service.listIssuesRisks('PRJ-01', 'C');
      const iss = r.rows.find((x) => x.type === 'Issue' && x.id === 'ISS-001');
      expect(iss?.issueStatus).toBe('Open');
      expect(iss?.equipmentId).toBe('EQ-HVAC-01');
      expect(iss?.milestoneId).toBe('MS-PS');
      expect(iss?.linkedRiskId).toBe('RISK-001');
      expect(iss?.workstream).toBe('WS-HVAC');
      const risk = r.rows.find((x) => x.type === 'Risk' && x.id === 'RISK-001');
      expect(risk?.rag).toBe('Red');
      expect(risk?.linkedIssueId).toBe('ISS-001');
      expect(risk?.milestoneId).toBe('MS-PS');
    });

    it('E: RISK-COM-01 Red without Issue is allowed', () => {
      const svc = new RegistersService(
        new FakeDataSource({
          A: SNAPSHOT_A,
          B: SNAPSHOT_B,
          C: SNAPSHOT_C,
          E: SNAPSHOT_E,
        }),
      );
      const r = svc.listIssuesRisks('PRJ-01', 'E');
      const com = r.rows.find((x) => x.id === 'RISK-COM-01');
      expect(com?.type).toBe('Risk');
      expect(com?.rag).toBe('Red');
      expect(com?.linkedIssueId).toBeNull();
    });
  });

  describe('milestones', () => {
    it('A: Green MS-PS; workstream null', () => {
      const r = service.listMilestones('PRJ-01', 'A');
      const ms = r.items.find((i) => i.id === 'MS-PS');
      expect(ms?.rag).toBe('Green');
      expect(ms?.dateVariance.deltaDays).toBe(0);
      expect(ms?.workstream).toBeNull();
      expect(r.items).toHaveLength(43);
    });

    it('B: MS-PS still Green', () => {
      const r = service.listMilestones('PRJ-01', 'B');
      const ms = r.items.find((i) => i.id === 'MS-PS');
      expect(ms?.rag).toBe('Green');
      expect(ms?.dateVariance.deltaDays).toBe(0);
    });

    it('C: Red +21 on MS-PS with related RISK-001', () => {
      const r = service.listMilestones('PRJ-01', 'C');
      const ms = r.items.find((i) => i.id === 'MS-PS');
      expect(ms?.rag).toBe('Red');
      expect(ms?.dateVariance.deltaDays).toBe(21);
      expect(ms?.relatedRedRiskIds).toContain('RISK-001');
      expect(ms?.relatedActiveIssueIds).toContain('ISS-001');
    });
  });

  it('404 unknown project for equipment, issues-risks, milestones', () => {
    expect(() => service.listEquipment('PRJ-99', 'A')).toThrow(
      NotFoundException,
    );
    expect(() => service.listIssuesRisks('PRJ-99', 'A')).toThrow(
      NotFoundException,
    );
    expect(() => service.listMilestones('PRJ-99', 'A')).toThrow(
      NotFoundException,
    );
  });
});
