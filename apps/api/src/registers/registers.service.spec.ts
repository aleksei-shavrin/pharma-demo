import { NotFoundException } from '@nestjs/common';
import { DemoDataSource } from '../data/demo-data-source';
import {
  SNAPSHOT_01,
  SNAPSHOT_02,
  SNAPSHOT_03,
  SNAPSHOT_05,
  SNAPSHOT_06,
  SNAPSHOT_19,
} from '../data/fixtures';
import { personFullNameRu } from '../data/fixtures/person-catalog';
import type { ProjectFixture, SnapshotFixture } from '../data/fixtures/types';
import type { PersonId } from '../contracts/person-id';
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
    return this.snapshots['01']!;
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
  personFullNameRu(id: PersonId): string {
    return personFullNameRu(id);
  }
  leadPersonIdForWorkstream(): never {
    throw new Error('leadPersonIdForWorkstream not used by RegistersService');
  }
  leadWorkstreamIdsForPerson(): never {
    throw new Error('leadWorkstreamIdsForPerson not used by RegistersService');
  }

  getScheduleWorks(): never {
    throw new Error('getScheduleWorks not used by RegistersService');
  }

  listNotifications(): never {
    throw new Error('listNotifications not used by RegistersService');
  }
}

describe('RegistersService', () => {
  const service = new RegistersService(
    new FakeDataSource({
      '01': SNAPSHOT_01,
      '02': SNAPSHOT_02,
      '03': SNAPSHOT_03,
    }),
  );

  describe('equipment', () => {
    it('A: multi-item OnTrack', () => {
      const r = service.listEquipment('PRT-01', '01');
      expect(r.items.length).toBeGreaterThanOrEqual(2);
      expect(r.items.every((i) => i.status === 'OnTrack')).toBe(true);
      expect(r.items[0].name).toBeTruthy();
      expect(r.items[0].workstream).toBeTruthy();
    });

    it('B: HVAC OnTrack; PKG Delayed +10', () => {
      const r = service.listEquipment('PRT-01', '02');
      const hvac = r.items.find((i) => i.id === 'EQ-HVAC-01');
      const pkg = r.items.find((i) => i.id === 'EQ-PKG-01');
      expect(r.items).toHaveLength(52);
      expect(hvac?.status).toBe('OnTrack');
      expect(pkg?.status).toBe('Delayed');
      expect(pkg?.deliveryVariance.deltaDays).toBe(10);
    });

    it('C: HVAC Delayed +21 with related active Issue/Risk', () => {
      const r = service.listEquipment('PRT-01', '03');
      const hvac = r.items.find((i) => i.id === 'EQ-HVAC-01');
      expect(hvac?.status).toBe('Delayed');
      expect(hvac?.deliveryVariance.deltaDays).toBe(21);
      expect(hvac?.relatedActiveIssueIds).toContain('ISS-001');
      expect(hvac?.relatedRedRiskIds).toContain('RISK-001');
    });
  });

  describe('issues-risks', () => {
    it('A: Risk only; RISK-COM-01 may omit Issue', () => {
      const r = service.listIssuesRisks('PRT-01', '01');
      expect(r.rows.filter((x) => x.type === 'Issue')).toHaveLength(0);
      const risk001 = r.rows.find(
        (x) => x.type === 'Risk' && x.id === 'RISK-001',
      );
      expect(risk001?.workstream).toBeTruthy();
      expect(risk001?.rag).toBe('Green');
    });

    it('B: Open PKG/BLD issues; no ISS-001; RISK Green', () => {
      const r = service.listIssuesRisks('PRT-01', '02');
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
      const r = service.listIssuesRisks('PRT-01', '03');
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
          '01': SNAPSHOT_01,
          '02': SNAPSHOT_02,
          '03': SNAPSHOT_03,
          '05': SNAPSHOT_05,
        }),
      );
      const r = svc.listIssuesRisks('PRT-01', '05');
      const com = r.rows.find((x) => x.id === 'RISK-COM-01');
      expect(com?.type).toBe('Risk');
      expect(com?.rag).toBe('Red');
      expect(com?.linkedIssueId).toBeNull();
    });
  });

  describe('milestones', () => {
    it('A: Green MS-PS; workstream null', () => {
      const r = service.listMilestones('PRT-01', '01');
      const ms = r.items.find((i) => i.id === 'MS-PS');
      expect(ms?.rag).toBe('Green');
      expect(ms?.dateVariance.deltaDays).toBe(0);
      expect(ms?.workstream).toBeNull();
      expect(r.items).toHaveLength(44);
    });

    it('B: MS-PS still Green', () => {
      const r = service.listMilestones('PRT-01', '02');
      const ms = r.items.find((i) => i.id === 'MS-PS');
      expect(ms?.rag).toBe('Green');
      expect(ms?.dateVariance.deltaDays).toBe(0);
    });

    it('C: Red +21 on MS-PS with related RISK-001', () => {
      const r = service.listMilestones('PRT-01', '03');
      const ms = r.items.find((i) => i.id === 'MS-PS');
      expect(ms?.rag).toBe('Red');
      expect(ms?.dateVariance.deltaDays).toBe(21);
      expect(ms?.relatedRedRiskIds).toContain('RISK-001');
      expect(ms?.relatedActiveIssueIds).toContain('ISS-001');
    });
  });

  describe('decisions', () => {
    it('A: empty decisions register', () => {
      const r = service.listDecisions('PRT-01', '01');
      expect(r.items).toEqual([]);
      expect(r.snapshotId).toBe('01');
      expect(r.projectId).toBe('PRT-01');
    });

    it('F: lists DEC-001 with owner name, dueState, MS-PS without fake AN', () => {
      const svc = new RegistersService(
        new FakeDataSource({
          '01': SNAPSHOT_01,
          '06': SNAPSHOT_06,
        }),
      );
      const r = svc.listDecisions('PRT-01', '06');
      expect(r.items.some((d) => d.id === 'DEC-001')).toBe(true);
      const dec = r.items.find((d) => d.id === 'DEC-001')!;
      expect(dec.type).toBe('PrioritizeRecovery');
      expect(dec.ownerPersonId).toBe('PER-01');
      expect(dec.ownerFullNameRu.length).toBeGreaterThan(0);
      // F asOf 2027-04-20 < due 2027-05-15 → upcoming (not passed)
      expect(dec.dueState).toBe('upcoming');
      expect(dec.programId).toBeNull();
      expect(dec.analystProjectId).toBeNull();
      expect(dec.analystProjectName).toBeNull();
      expect(dec.milestoneName).toBeTruthy();
      expect(dec.milestoneName).not.toBe(dec.milestoneId);
      expect(dec.executionStatus).toBe('not_started');
      expect(dec.execution?.source.kind).toBe('demo');
      expect(dec.execution?.evidenceNote).toBe('Действия не начаты');
    });

    it('S: DEC-001 dueState passed vs later asOf; still no fake MS-PS membership', () => {
      const svc = new RegistersService(
        new FakeDataSource({
          '01': SNAPSHOT_01,
          '19': SNAPSHOT_19,
        }),
      );
      const r = svc.listDecisions('PRT-01', '19');
      const dec = r.items.find((d) => d.id === 'DEC-001')!;
      expect(dec.dueState).toBe('passed');
      expect(dec.executionStatus).toBe('completed');
      expect(dec.programId).toBeNull();
      expect(dec.analystProjectId).toBeNull();
      expect(dec.milestoneName?.length).toBeGreaterThan(0);
      const withAn = r.items.find((d) => d.analystProjectId);
      if (withAn) {
        expect(withAn.analystProjectName).toBeTruthy();
      }
    });
  });

  it('404 unknown project for equipment, issues-risks, milestones, decisions', () => {
    expect(() => service.listEquipment('PRJ-99', '01')).toThrow(
      NotFoundException,
    );
    expect(() => service.listIssuesRisks('PRJ-99', '01')).toThrow(
      NotFoundException,
    );
    expect(() => service.listMilestones('PRJ-99', '01')).toThrow(
      NotFoundException,
    );
    expect(() => service.listDecisions('PRJ-99', '01')).toThrow(
      NotFoundException,
    );
  });
});
