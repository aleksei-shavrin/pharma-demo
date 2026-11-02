import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DEMO_DATA_SOURCE } from '../data/demo-data-source';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import { EntityDetailService } from './entity-detail.service';

function linkIds(
  links: { targetType: string; targetId: string }[],
  type: string,
): string[] {
  return links.filter((l) => l.targetType === type).map((l) => l.targetId);
}

describe('EntityDetailService', () => {
  let service: EntityDetailService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EntityDetailService,
        MockDemoDataSource,
        { provide: DEMO_DATA_SOURCE, useExisting: MockDemoDataSource },
      ],
    }).compile();
    service = moduleRef.get(EntityDetailService);
  });

  describe('Equipment EQ-HVAC-01', () => {
    it('A: OnTrack, variance 0, Links Risks (no Milestone)', () => {
      const d = service.getEquipment('PRJ-01', 'EQ-HVAC-01', 'A');
      expect(d.entity.status).toBe('OnTrack');
      expect(d.entity.deliveryVariance.deltaDays).toBe(0);
      expect(linkIds(d.links, 'risk')).toEqual(
        expect.arrayContaining(['RISK-001', 'RISK-HVAC-02']),
      );
      expect(linkIds(d.links, 'milestone')).toEqual([]);
      expect(linkIds(d.links, 'issue')).toEqual([]);
      expect(d.impact.kind).toBe('none');
    });

    it('B: still OnTrack (local attention is PKG, not HVAC)', () => {
      const d = service.getEquipment('PRJ-01', 'EQ-HVAC-01', 'B');
      expect(d.entity.status).toBe('OnTrack');
      expect(d.entity.deliveryVariance.deltaDays).toBe(0);
      expect(linkIds(d.links, 'issue')).toEqual([]);
      expect(d.impact.kind).toBe('none');
      expect(d.impact.decisionState).toBe('absent');
    });

    it('C: Delayed +21; Links Issue+Risks; no Milestone; needed; no recovery', () => {
      const d = service.getEquipment('PRJ-01', 'EQ-HVAC-01', 'C');
      expect(d.entity.name).toMatch(/AHU/);
      expect(d.entity.workstream).toBe('WS-HVAC');
      expect(d.entity.status).toBe('Delayed');
      expect(d.entity.deliveryVariance.deltaDays).toBe(21);
      expect(linkIds(d.links, 'issue')).toEqual(['ISS-001']);
      expect(linkIds(d.links, 'risk')).toEqual(
        expect.arrayContaining(['RISK-001', 'RISK-HVAC-02']),
      );
      expect(linkIds(d.links, 'milestone')).toEqual([]);
      expect(d.impact.kind).toBe('aligned_slip');
      expect(d.impact.productionStartDeltaDays).toBe(21);
      expect(d.impact.decisionState).toBe('needed');
      expect(d.impact.recoveryExecuted).toBeNull();
      expect(d.impact.issueStatus).toBe('Open');
    });
  });

  describe('Issue ISS-001', () => {
    it('A: absent → 404', () => {
      expect(() => service.getIssue('PRJ-01', 'ISS-001', 'A')).toThrow(
        NotFoundException,
      );
    });

    it('B: absent → 404', () => {
      expect(() => service.getIssue('PRJ-01', 'ISS-001', 'B')).toThrow(
        NotFoundException,
      );
    });

    it('C: Open; Links Equipment+Risk+Milestone; no Decision', () => {
      const d = service.getIssue('PRJ-01', 'ISS-001', 'C');
      expect(d.entity.status).toBe('Open');
      expect(d.entity.workstream).toBe('WS-HVAC');
      expect(d.entity.ownerPersonId).toBe('PER-02');
      expect(d.entity.ownerFullNameRu).toContain('Морозова');
      expect(linkIds(d.links, 'equipment')).toEqual(['EQ-HVAC-01']);
      expect(linkIds(d.links, 'risk')).toEqual(['RISK-001']);
      expect(linkIds(d.links, 'milestone')).toEqual(['MS-PS']);
      expect(d.links.every((l) => l.targetType !== 'decision' as string)).toBe(
        true,
      );
      expect(d.impact.kind).toBe('aligned_slip');
      expect(d.impact.productionStartDeltaDays).toBe(21);
      expect(d.impact.riskRag).toBe('Red');
      expect(d.impact.milestoneRag).toBe('Red');
    });
  });

  describe('Risk RISK-001', () => {
    it('A/B: Green; Links Equipment+Milestone; no Issue', () => {
      for (const snap of ['A', 'B'] as const) {
        const d = service.getRisk('PRJ-01', 'RISK-001', snap);
        expect(d.entity.rag).toBe('Green');
        expect(linkIds(d.links, 'equipment')).toEqual(['EQ-HVAC-01']);
        expect(linkIds(d.links, 'milestone')).toEqual(['MS-PS']);
        expect(linkIds(d.links, 'issue')).toEqual([]);
      }
    });

    it('C: Red; Links Equipment+Issue+Milestone', () => {
      const d = service.getRisk('PRJ-01', 'RISK-001', 'C');
      expect(d.entity.title.length).toBeGreaterThan(0);
      expect(d.entity.workstream).toBe('WS-HVAC');
      expect(d.entity.rag).toBe('Red');
      expect(linkIds(d.links, 'equipment')).toEqual(['EQ-HVAC-01']);
      expect(linkIds(d.links, 'issue')).toEqual(['ISS-001']);
      expect(linkIds(d.links, 'milestone')).toEqual(['MS-PS']);
    });
  });

  describe('Milestone MS-PS', () => {
    it('A/B: Green; Links Risk only; no Equipment', () => {
      for (const snap of ['A', 'B'] as const) {
        const d = service.getMilestone('PRJ-01', 'MS-PS', snap);
        expect(d.entity.rag).toBe('Green');
        expect(d.entity.workstream).toBeNull();
        expect(d.entity.dateVariance.deltaDays).toBe(0);
        expect(linkIds(d.links, 'risk')).toEqual(['RISK-001']);
        expect(linkIds(d.links, 'equipment')).toEqual([]);
        expect(linkIds(d.links, 'issue')).toEqual([]);
      }
    });

    it('C: Red +21; Links Issue+Risk; no Equipment', () => {
      const d = service.getMilestone('PRJ-01', 'MS-PS', 'C');
      expect(d.entity.rag).toBe('Red');
      expect(d.entity.dateVariance.deltaDays).toBe(21);
      expect(linkIds(d.links, 'issue')).toEqual(['ISS-001']);
      expect(linkIds(d.links, 'risk')).toEqual(['RISK-001']);
      expect(linkIds(d.links, 'equipment')).toEqual([]);
    });

    it('G: residual +14; H residual honesty', () => {
      const g = service.getMilestone('PRJ-01', 'MS-PS', 'G');
      expect(g.entity.dateVariance.deltaDays).toBe(14);
      expect(g.entity.forecastDate).toBe('2027-09-29');
      const h = service.getEquipment('PRJ-01', 'EQ-HVAC-01', 'H');
      expect(h.entity.deliveryVariance.deltaDays).toBe(14);
      expect(h.impact.riskRag).toBe('Red');
    });
  });

  it('unknown ids → 404; unknown project → 404', () => {
    expect(() =>
      service.getEquipment('PRJ-01', 'EQ-UNKNOWN', 'A'),
    ).toThrow(NotFoundException);
    expect(() => service.getIssue('PRJ-01', 'ISS-999', 'C')).toThrow(
      NotFoundException,
    );
    expect(() =>
      service.getEquipment('PRJ-99', 'EQ-HVAC-01', 'A'),
    ).toThrow(NotFoundException);
  });

  it('forbids Decision as Issue/Equipment/Risk link target', () => {
    const issue = service.getIssue('PRJ-01', 'ISS-001', 'C');
    const eq = service.getEquipment('PRJ-01', 'EQ-HVAC-01', 'C');
    const risk = service.getRisk('PRJ-01', 'RISK-001', 'C');
    for (const d of [issue, eq, risk]) {
      expect(
        d.links.some((l) => (l.targetType as string) === 'decision'),
      ).toBe(false);
    }
  });
});
