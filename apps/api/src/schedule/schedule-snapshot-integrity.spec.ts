import { Test } from '@nestjs/testing';
import { DEMO_DATA_SOURCE } from '../data/demo-data-source';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import { EQUIPMENT_CATALOG, MILESTONE_CATALOG } from '../data/fixtures/catalog';
import { SNAPSHOT_IDS } from '../snapshot/snapshot-id';
import {
  EQUIPMENT_DELIVERED_ON,
  MILESTONE_COMPLETED_ON,
  assertControlFactsCatalogueComplete,
} from '../data/schedule/schedule-control-facts';
import { ScheduleService } from './schedule.service';

const SNAPS = [...SNAPSHOT_IDS];

describe('schedule snapshot integrity 01–19', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ScheduleService,
        MockDemoDataSource,
        { provide: DEMO_DATA_SOURCE, useExisting: MockDemoDataSource },
      ],
    }).compile();
    service = moduleRef.get(ScheduleService);
  });

  it('control facts catalogue covers all 52 EQ + 44 MS', () => {
    assertControlFactsCatalogueComplete();
    expect(Object.keys(EQUIPMENT_DELIVERED_ON)).toHaveLength(
      Object.keys(EQUIPMENT_CATALOG).length,
    );
    expect(Object.keys(MILESTONE_COMPLETED_ON)).toHaveLength(
      Object.keys(MILESTONE_CATALOG).length,
    );
    expect(Object.keys(EQUIPMENT_CATALOG)).toHaveLength(52);
    expect(Object.keys(MILESTONE_CATALOG)).toHaveLength(44);
  });

  it('every snapshot has unique WBS, leaf progress, group rollup, links, FS coherence', () => {
    for (const snap of SNAPS) {
      const s = service.getSchedule('PRT-01', snap);
      // 25 projects + 145 stages + analyst leaves + WK showcase + 52 EQ + 44 MS
      expect(s.items.length).toBe(688);
      const wbs = s.items.map((i) => i.wbs);
      expect(wbs.every((w) => typeof w === 'string' && w.length > 0)).toBe(
        true,
      );
      expect(new Set(wbs).size).toBe(wbs.length);

      const leaves = s.items.filter((i) =>
        ['work', 'equipment_delivery', 'milestone'].includes(i.kind),
      );
      for (const leaf of leaves) {
        expect(typeof leaf.progressPct).toBe('number');
      }
      const groups = s.items.filter(
        (i) => i.kind === 'project_group' || i.kind === 'stage_group',
      );
      for (const g of groups) {
        expect(typeof g.progressPct).toBe('number');
      }

      const byKey = new Map(
        s.items.map((i) => [
          `${i.kind === 'equipment_delivery' ? 'equipment_delivery' : i.kind}:${i.id}`,
          i,
        ]),
      );
      // Also index works/milestones by selection-like refs used in links.
      const progressByRef = new Map<string, number | null>();
      for (const item of s.items) {
        if (item.kind === 'work')
          progressByRef.set(`work:${item.id}`, item.progressPct);
        if (item.kind === 'milestone')
          progressByRef.set(`milestone:${item.id}`, item.progressPct);
        if (item.kind === 'equipment_delivery')
          progressByRef.set(`equipment_delivery:${item.id}`, item.progressPct);
      }

      // FS coherence: enforce on curated demo showcase only. Analyst source may
      // contain completed-target vs incomplete-pred contradictions (kept in raw).
      for (const link of s.links) {
        if (link.kind !== 'scheduling' || link.type !== 'FS') continue;
        if (
          !link.id.startsWith('LNK-FS-') &&
          !link.id.startsWith('LNK-SS') &&
          link.id !== 'LNK-FS-01'
        ) {
          continue;
        }
        if (link.id.startsWith('LNK-A')) continue;
        const src = progressByRef.get(link.sourceRef);
        const tgt = progressByRef.get(link.targetRef);
        if (tgt === 100) {
          expect(src).toBe(100);
        }
      }

      // Work facts vs as-of coherence
      for (const item of s.items) {
        if (item.kind !== 'work') continue;
        const work = item as {
          progressPct: number | null;
          actualStart: string | null;
          actualEnd: string | null;
          status: string;
        };
        if (work.actualStart != null) {
          expect(work.actualStart <= s.scenarioAsOfDate).toBe(true);
        }
        if (work.actualEnd != null) {
          expect(work.actualEnd <= s.scenarioAsOfDate).toBe(true);
          expect(work.actualStart).not.toBeNull();
        }
        if ((work.progressPct ?? 0) > 0) {
          expect(work.actualStart).not.toBeNull();
        }
        if (work.progressPct === 100) {
          expect(work.actualEnd).not.toBeNull();
        }
        if (work.status === 'Completed') {
          expect(work.progressPct).toBe(100);
          expect(work.actualEnd).not.toBeNull();
        }
      }

      const hvac = s.items.find((i) => i.id === 'EQ-HVAC-01');
      // deliveredOn 2027-06-05: binary progress from authored date, not S-only.
      if (s.scenarioAsOfDate < '2027-06-05') {
        expect(hvac?.progressPct).toBe(0);
      } else {
        expect(hvac?.progressPct).toBe(100);
      }

      const go = s.items.find((i) => i.id === 'MS-COM-GO');
      const ps = s.items.find((i) => i.id === 'MS-PS');
      if (s.scenarioAsOfDate < '2027-09-18') {
        expect(go?.progressPct).toBe(0);
      } else {
        expect(go?.progressPct).toBe(100);
      }
      if (snap === '19') {
        expect(ps?.progressPct).toBe(100);
      } else {
        expect(ps?.progressPct).toBe(0);
      }

      const workstreams = new Set(
        s.items
          .map((i) => (i as { workstream?: string | null }).workstream)
          .filter(Boolean),
      );
      expect(workstreams.size).toBeGreaterThanOrEqual(8);
      expect(s.links.length).toBeGreaterThanOrEqual(17);
      void byKey;
    }

    const a = service.getSchedule('PRT-01', '01');
    const c = service.getSchedule('PRT-01', '03');
    expect(a.items.find((i) => i.id === 'WK-01')?.progressPct).toBe(0);
    expect(c.items.find((i) => i.id === 'WK-01')?.progressPct).toBe(100);
    expect(c.items.find((i) => i.id === 'WK-04')?.progressPct).toBe(0);
    // Realized timeline: 8.2.1 starts on C asOf; 8.2.2 still waiting.
    expect(c.items.find((i) => i.id === '8.2.1')?.progressPct).toBe(0);
    expect(c.items.find((i) => i.id === '8.2.2')?.progressPct).toBe(0);
    expect(c.items.find((i) => i.id === 'MS-COM-GO')?.progressPct).toBe(0);
    expect(c.items.find((i) => i.id === 'MS-BLD-ENCL')?.progressPct).toBe(0);
  });

  it('does not set EQ-HVAC-01 to 100 on C from forecast alone', () => {
    const c = service.getSchedule('PRT-01', '03');
    const hvac = c.items.find((i) => i.id === 'EQ-HVAC-01');
    expect(hvac?.progressPct).toBe(0);
  });

  it('EQ-HVAC-01 delivery precedes MS-HVAC-IQ completion (no delivery-after-IQ)', () => {
    expect(
      EQUIPMENT_DELIVERED_ON['EQ-HVAC-01'] <
        MILESTONE_COMPLETED_ON['MS-HVAC-IQ'],
    ).toBe(true);
  });
});
