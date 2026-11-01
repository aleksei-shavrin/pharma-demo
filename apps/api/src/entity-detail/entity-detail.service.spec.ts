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
    it('A: OnTrack, variance 0, Links Risk only (no Milestone)', () => {
      const d = service.getEquipment('PRJ-01', 'EQ-HVAC-01', 'A');
      expect(d.entity.status).toBe('OnTrack');
      expect(d.entity.deliveryVariance.deltaDays).toBe(0);
      expect(linkIds(d.links, 'risk')).toEqual(['RISK-001']);
      expect(linkIds(d.links, 'milestone')).toEqual([]);
      expect(linkIds(d.links, 'issue')).toEqual([]);
      expect(d.impact.kind).toBe('none');
      expect(d.links).not.toEqual(expect.objectContaining({ kind: 'derived' }));
    });

    it('B: Delayed +21, Links Issue+Risk, no Milestone', () => {
      const d = service.getEquipment('PRJ-01', 'EQ-HVAC-01', 'B');
      expect(d.entity.status).toBe('Delayed');
      expect(d.entity.deliveryVariance.deltaDays).toBe(21);
      expect(linkIds(d.links, 'issue')).toEqual(['ISS-001']);
      expect(linkIds(d.links, 'risk')).toEqual(['RISK-001']);
      expect(linkIds(d.links, 'milestone')).toEqual([]);
      expect(d.impact.kind).toBe('aligned_slip');
      expect(d.impact.productionStartDeltaDays).toBe(21);
    });

    it('C: same links/slip; recovery not executed', () => {
      const d = service.getEquipment('PRJ-01', 'EQ-HVAC-01', 'C');
      expect(d.entity.deliveryVariance.deltaDays).toBe(21);
      expect(linkIds(d.links, 'milestone')).toEqual([]);
      expect(d.impact.decisionState).toBe('recorded');
      expect(d.impact.recoveryExecuted).toBe(false);
      expect(d.impact.issueStatus).toBe('Mitigating');
    });
  });

  describe('Issue ISS-001', () => {
    it('A: absent → 404', () => {
      expect(() => service.getIssue('PRJ-01', 'ISS-001', 'A')).toThrow(
        NotFoundException,
      );
    });

    it('B: Open; Links Equipment+Risk+Milestone; no Decision', () => {
      const d = service.getIssue('PRJ-01', 'ISS-001', 'B');
      expect(d.entity.status).toBe('Open');
      expect(d.entity.owner).toBe('SH-002');
      expect(linkIds(d.links, 'equipment')).toEqual(['EQ-HVAC-01']);
      expect(linkIds(d.links, 'risk')).toEqual(['RISK-001']);
      expect(linkIds(d.links, 'milestone')).toEqual(['MS-PS']);
      expect(d.links.every((l) => l.targetType !== 'decision' as string)).toBe(
        true,
      );
      expect(d.impact.kind).toBe('aligned_slip');
    });

    it('C: Mitigating; same Links; +21 / Red honesty', () => {
      const d = service.getIssue('PRJ-01', 'ISS-001', 'C');
      expect(d.entity.status).toBe('Mitigating');
      expect(linkIds(d.links, 'equipment')).toEqual(['EQ-HVAC-01']);
      expect(d.impact.productionStartDeltaDays).toBe(21);
      expect(d.impact.riskRag).toBe('Red');
      expect(d.impact.milestoneRag).toBe('Red');
      expect(d.impact.recoveryExecuted).toBe(false);
    });
  });

  describe('Risk RISK-001', () => {
    it('A: Green; Links Equipment+Milestone; no Issue', () => {
      const d = service.getRisk('PRJ-01', 'RISK-001', 'A');
      expect(d.entity.rag).toBe('Green');
      expect(linkIds(d.links, 'equipment')).toEqual(['EQ-HVAC-01']);
      expect(linkIds(d.links, 'milestone')).toEqual(['MS-PS']);
      expect(linkIds(d.links, 'issue')).toEqual([]);
    });

    it('B/C: Red; Links Equipment+Issue+Milestone', () => {
      for (const snap of ['B', 'C'] as const) {
        const d = service.getRisk('PRJ-01', 'RISK-001', snap);
        expect(d.entity.rag).toBe('Red');
        expect(linkIds(d.links, 'equipment')).toEqual(['EQ-HVAC-01']);
        expect(linkIds(d.links, 'issue')).toEqual(['ISS-001']);
        expect(linkIds(d.links, 'milestone')).toEqual(['MS-PS']);
      }
    });
  });

  describe('Milestone MS-PS', () => {
    it('A: Green; Links Risk only; no Equipment', () => {
      const d = service.getMilestone('PRJ-01', 'MS-PS', 'A');
      expect(d.entity.rag).toBe('Green');
      expect(d.entity.dateVariance.deltaDays).toBe(0);
      expect(linkIds(d.links, 'risk')).toEqual(['RISK-001']);
      expect(linkIds(d.links, 'equipment')).toEqual([]);
      expect(linkIds(d.links, 'issue')).toEqual([]);
    });

    it('B/C: Red +21; Links Issue+Risk; no Equipment', () => {
      for (const snap of ['B', 'C'] as const) {
        const d = service.getMilestone('PRJ-01', 'MS-PS', snap);
        expect(d.entity.rag).toBe('Red');
        expect(d.entity.dateVariance.deltaDays).toBe(21);
        expect(linkIds(d.links, 'issue')).toEqual(['ISS-001']);
        expect(linkIds(d.links, 'risk')).toEqual(['RISK-001']);
        expect(linkIds(d.links, 'equipment')).toEqual([]);
      }
    });
  });

  it('unknown ids → 404; unknown project → 404', () => {
    expect(() =>
      service.getEquipment('PRJ-01', 'EQ-UNKNOWN', 'A'),
    ).toThrow(NotFoundException);
    expect(() => service.getIssue('PRJ-01', 'ISS-999', 'B')).toThrow(
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
