import { NotFoundException } from '@nestjs/common';
import { DemoDataSource } from '../data/demo-data-source';
import { SNAPSHOT_A, SNAPSHOT_B, SNAPSHOT_C } from '../data/fixtures';
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

    it('B: HVAC OnTrack; PKG Delayed', () => {
      const r = service.listEquipment('PRJ-01', 'B');
      const hvac = r.items.find((i) => i.id === 'EQ-HVAC-01');
      const pkg = r.items.find((i) => i.id === 'EQ-PKG-01');
      expect(hvac?.status).toBe('OnTrack');
      expect(pkg?.status).toBe('Delayed');
      expect(pkg?.deliveryVariance.deltaDays).toBe(7);
    });

    it('C: HVAC Delayed +21', () => {
      const r = service.listEquipment('PRJ-01', 'C');
      const hvac = r.items.find((i) => i.id === 'EQ-HVAC-01');
      expect(hvac?.status).toBe('Delayed');
      expect(hvac?.deliveryVariance.deltaDays).toBe(21);
    });
  });

  describe('issues-risks', () => {
    it('A: Risk only', () => {
      const r = service.listIssuesRisks('PRJ-01', 'A');
      expect(r.rows.filter((x) => x.type === 'Issue')).toHaveLength(0);
      expect(r.rows.some((x) => x.type === 'Risk' && x.id === 'RISK-001')).toBe(
        true,
      );
    });

    it('B: Closed PKG issue; no ISS-001; RISK Green', () => {
      const r = service.listIssuesRisks('PRJ-01', 'B');
      expect(r.rows.some((x) => x.id === 'ISS-001')).toBe(false);
      expect(
        r.rows.some((x) => x.type === 'Issue' && x.issueStatus === 'Closed'),
      ).toBe(true);
      expect(
        r.rows.some(
          (x) => x.type === 'Risk' && x.id === 'RISK-001' && x.rag === 'Green',
        ),
      ).toBe(true);
    });

    it('C: Issue Open + Risk Red', () => {
      const r = service.listIssuesRisks('PRJ-01', 'C');
      expect(
        r.rows.some(
          (x) =>
            x.type === 'Issue' &&
            x.id === 'ISS-001' &&
            x.issueStatus === 'Open',
        ),
      ).toBe(true);
      expect(
        r.rows.some((x) => x.type === 'Risk' && x.rag === 'Red'),
      ).toBe(true);
    });
  });

  describe('milestones', () => {
    it('A: Green MS-PS', () => {
      const r = service.listMilestones('PRJ-01', 'A');
      const ms = r.items.find((i) => i.id === 'MS-PS');
      expect(ms?.rag).toBe('Green');
      expect(ms?.dateVariance.deltaDays).toBe(0);
    });

    it('B: MS-PS still Green', () => {
      const r = service.listMilestones('PRJ-01', 'B');
      const ms = r.items.find((i) => i.id === 'MS-PS');
      expect(ms?.rag).toBe('Green');
      expect(ms?.dateVariance.deltaDays).toBe(0);
    });

    it('C: Red +21 on MS-PS', () => {
      const r = service.listMilestones('PRJ-01', 'C');
      const ms = r.items.find((i) => i.id === 'MS-PS');
      expect(ms?.rag).toBe('Red');
      expect(ms?.dateVariance.deltaDays).toBe(21);
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
