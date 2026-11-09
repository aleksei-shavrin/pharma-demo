import { mkdirSync, writeFileSync } from 'fs';
import { Test } from '@nestjs/testing';
import { parseAnalystFixture } from './analyst-parser';
import { buildAnalystFsEdges } from './schedule-analyst-import';
import {
  MASTER_SIM_ASSUMPTIONS,
  daysBetween,
  projectWindowFor,
  simulateMasterBaseline,
} from './schedule-master-simulation';
import { DEMO_DATA_SOURCE } from '../../demo-data-source';
import { MockDemoDataSource } from '../../mock-demo-data-source';
import { ScheduleService } from '../../../schedule/schedule.service';
import type {
  ScheduleEquipmentItemDto,
  ScheduleMilestoneItemDto,
  ScheduleWorkItemDto,
} from '../../../schedule/dto/schedule.dto';

const ART = '/tmp/pharma-demo-artifacts/pharma-gantt-clarity-1c199ddd';

/** Early prep WBS called out in screenshot / plan review. */
const FOCUS_WBS = [
  '1.2.1',
  '1.2.2',
  '1.2.3',
  '1.2.4',
  '1.3.1',
  '1.3.2',
  '1.4.1',
  '1.4.2',
  '1.4.3',
  '1.5.1',
  '1.5.2',
  '1.5.3',
  '2.3.1',
  '2.3.2',
] as const;

describe('gantt-clarity hybrid dating', () => {
  const parsed = parseAnalystFixture();
  const edges = buildAnalystFsEdges(parsed);
  const sim = simulateMasterBaseline(parsed.rows, edges);
  const byRow = new Map(parsed.rows.map((r) => [r.wbs, r]));

  const predMap = new Map<string, string[]>();
  const succMap = new Map<string, string[]>();
  for (const e of edges) {
    const pl = predMap.get(e.toWbs) ?? [];
    pl.push(`${e.fromWbs}:${e.type ?? 'FS'}`);
    predMap.set(e.toWbs, pl);
    const sl = succMap.get(e.fromWbs) ?? [];
    sl.push(`${e.toWbs}:${e.type ?? 'FS'}`);
    succMap.set(e.fromWbs, sl);
  }

  function inventoryRows(projectPrefix?: string) {
    const rows = [];
    for (const [wbs, p] of sim.byWbs) {
      if (projectPrefix && !wbs.startsWith(projectPrefix)) continue;
      const row = byRow.get(wbs);
      const win = row ? projectWindowFor(row.projectNo) : null;
      rows.push({
        wbs,
        name: row?.name ?? null,
        kind: row?.kind ?? null,
        projectNo: row?.projectNo ?? null,
        baselineStart: p.baselineStart,
        baselineEnd: p.baselineEnd,
        durationDays: p.durationDays,
        phaseStart: win?.start ?? null,
        phaseEnd: win?.end ?? null,
        preds: predMap.get(wbs) ?? [],
        succs: succMap.get(wbs) ?? [],
        nearGate:
          daysBetween(
            p.baselineEnd,
            MASTER_SIM_ASSUMPTIONS.productionStartBaseline,
          ) <= 14,
      });
    }
    return rows.sort((a, b) => a.wbs.localeCompare(b.wbs, 'en'));
  }

  it('writes after inventory + metrics artifact', () => {
    mkdirSync(ART, { recursive: true });
    const focus = FOCUS_WBS.map((wbs) => {
      const p = sim.byWbs.get(wbs);
      const row = byRow.get(wbs);
      return {
        wbs,
        name: row?.name ?? null,
        baselineStart: p?.baselineStart ?? null,
        baselineEnd: p?.baselineEnd ?? null,
        phaseStart: row ? projectWindowFor(row.projectNo).start : null,
        preds: predMap.get(wbs) ?? [],
      };
    });
    const an01 = inventoryRows('1.');
    const an02 = inventoryRows('2.');
    const an03 = inventoryRows('3.');
    const nearGate = [...sim.byWbs.values()].filter(
      (p) =>
        daysBetween(
          p.baselineEnd,
          MASTER_SIM_ASSUMPTIONS.productionStartBaseline,
        ) <= 14,
    ).length;
    const longFs = edges.filter((e) => {
      const a = sim.byWbs.get(e.fromWbs);
      const b = sim.byWbs.get(e.toWbs);
      if (!a || !b) return false;
      return daysBetween(a.baselineEnd, b.baselineStart) >= 120;
    }).length;
    const summary = {
      at: new Date().toISOString(),
      method: sim.feasibility.method,
      earliestNecessaryStart: sim.feasibility.earliestNecessaryStart,
      criticalLeafCount: sim.feasibility.criticalLeafCount,
      earlyLeafCount: sim.feasibility.earlyLeafCount,
      softRelaxCount: sim.feasibility.softRelaxCount,
      edgeCount: edges.length,
      leafCount: sim.byWbs.size,
      nearGateLeafCount: nearGate,
      longFsGap120d: longFs,
      focus,
      an01Sample: an01.slice(0, 40),
      an02Sample: an02.slice(0, 40),
      an03Sample: an03.slice(0, 30),
    };
    writeFileSync(
      `${ART}/inventory-after.json`,
      JSON.stringify(summary, null, 2),
    );
    expect(sim.feasibility.method).toBe('hybrid_earliest_in_float');
    expect(edges.length).toBeGreaterThanOrEqual(600);
  });

  it('Briefing / Make-or-buy / master-plan are not parked at PS gate', () => {
    const briefing = sim.byWbs.get('1.3.1')!;
    const makeOrBuy = sim.byWbs.get('1.5.1')!;
    const masterPlan = sim.byWbs.get('1.4.1')!;
    const win = projectWindowFor(1);
    expect(briefing.baselineEnd < '2027-08-01').toBe(true);
    expect(makeOrBuy.baselineEnd < '2027-08-01').toBe(true);
    expect(masterPlan.baselineStart < '2027-06-01').toBe(true);
    // Prefer phase window when float allows
    expect(briefing.baselineStart >= win.start).toBe(true);
    expect(makeOrBuy.baselineStart >= win.start).toBe(true);
  });

  it('01LL link types remain satisfied after hybrid', () => {
    let checked = 0;
    for (const e of edges) {
      const a = sim.byWbs.get(e.fromWbs);
      const b = sim.byWbs.get(e.toWbs);
      if (!a || !b) continue;
      const type = e.type ?? 'FS';
      const lag = e.lagDays ?? 0;
      if (type === 'FS') {
        expect(a.baselineEnd <= addLag(b.baselineStart, -lag)).toBe(true);
        checked += 1;
      } else if (type === 'SS') {
        expect(a.baselineStart <= addLag(b.baselineStart, -lag)).toBe(true);
        checked += 1;
      } else if (type === 'FF') {
        expect(a.baselineEnd <= addLag(b.baselineEnd, -lag)).toBe(true);
        checked += 1;
      } else if (type === 'SF') {
        expect(a.baselineStart <= addLag(b.baselineEnd, -lag)).toBe(true);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(100);
  });

  it('hardgate: terminal ≤ PS; soft_infeasible=0; planEarliest ≠ forced critical', () => {
    expect(sim.feasibility.floorsUsed).toBe(true);
    expect(sim.feasibility.earlyLeafCount).toBeGreaterThan(0);
    expect(sim.feasibility.planEarliestStart).toBe(
      sim.feasibility.earliestNecessaryStart,
    );
    expect(
      sim.feasibility.criticalEarliestStart >=
        sim.feasibility.planEarliestStart,
    ).toBe(true);
    expect(
      sim.audit.filter((a) => a.kind === 'soft_infeasible_vs_lf'),
    ).toHaveLength(0);
    expect(
      sim.audit.filter((a) => a.kind === 'hard_cpm_inconsistent'),
    ).toHaveLength(0);
    expect(sim.terminalBaselineMax <= '2027-09-15').toBe(true);
  });

  it('toy hardgate: late soft floor + FS/SS/FF/SF±lag; parallel roots; terminal ≤ PS', () => {
    const mk = (
      wbs: string,
      projectNo: number,
      kind: 'work' | 'checkpoint' = 'work',
    ) => ({
      projectNo,
      wbs,
      kind,
      name: wbs,
      rawDeps: '',
      statusToken: '—',
      sourceStatus: 'waiting' as const,
      sourceWeeks: null,
    });
    // Project 25 = late preferred window; project 1 = early. Parallel roots.
    const rows = [
      mk('92.1.1', 25),
      mk('92.1.2', 25),
      mk('92.1.3', 25),
      mk('92.1.4', 25),
      mk('92.1.5', 25),
      mk('92.2.1', 1),
      mk('92.2.2', 1),
    ];
    const edges = [
      { fromWbs: '92.1.1', toWbs: '92.1.2', type: 'FS' as const, lagDays: 0 },
      { fromWbs: '92.1.2', toWbs: '92.1.3', type: 'SS' as const, lagDays: 2 },
      { fromWbs: '92.1.3', toWbs: '92.1.4', type: 'FF' as const, lagDays: -1 },
      { fromWbs: '92.1.4', toWbs: '92.1.5', type: 'SF' as const, lagDays: 1 },
      { fromWbs: '92.2.1', toWbs: '92.2.2', type: 'FS' as const, lagDays: 3 },
    ];
    const mini = simulateMasterBaseline(rows, edges);
    expect(mini.terminalBaselineMax <= '2027-09-15').toBe(true);
    expect(
      mini.audit.filter((a) => a.kind === 'soft_infeasible_vs_lf'),
    ).toHaveLength(0);
    expect(
      mini.audit.filter((a) => a.kind === 'hard_cpm_inconsistent'),
    ).toHaveLength(0);
    for (const e of edges) {
      const a = mini.byWbs.get(e.fromWbs)!;
      const b = mini.byWbs.get(e.toWbs)!;
      const type = e.type;
      const lag = e.lagDays;
      if (type === 'FS') {
        expect(a.baselineEnd <= addLag(b.baselineStart, -lag)).toBe(true);
      } else if (type === 'SS') {
        expect(a.baselineStart <= addLag(b.baselineStart, -lag)).toBe(true);
      } else if (type === 'FF') {
        expect(a.baselineEnd <= addLag(b.baselineEnd, -lag)).toBe(true);
      } else {
        expect(a.baselineStart <= addLag(b.baselineEnd, -lag)).toBe(true);
      }
    }
    // Late preferred may soft-relax earlier than window; never after gate.
    for (const p of mini.byWbs.values()) {
      expect(p.baselineEnd <= '2027-09-15').toBe(true);
    }
  });

  it('cycle back-edge is audited and still produces a plan', () => {
    const mk = (wbs: string) => ({
      projectNo: 1,
      wbs,
      kind: 'work' as const,
      name: wbs,
      rawDeps: '',
      statusToken: '—',
      sourceStatus: 'waiting' as const,
      sourceWeeks: null,
    });
    const rows = [mk('91.1.1'), mk('91.1.2')];
    const cyclic = [
      { fromWbs: '91.1.1', toWbs: '91.1.2', type: 'FS' as const, lagDays: 0 },
      { fromWbs: '91.1.2', toWbs: '91.1.1', type: 'FS' as const, lagDays: 0 },
    ];
    const mini = simulateMasterBaseline(rows, cyclic);
    expect(mini.byWbs.size).toBe(2);
    expect(mini.audit.some((a) => a.kind === 'cycle_back_edge')).toBe(true);
  });

  it('synthetic SS/FF/SF + lag stay feasible under hybrid', () => {
    const mk = (
      wbs: string,
      projectNo: number,
      kind: 'work' | 'checkpoint' = 'work',
    ) => ({
      projectNo,
      wbs,
      kind,
      name: wbs,
      rawDeps: '',
      statusToken: '—',
      sourceStatus: 'waiting' as const,
      sourceWeeks: null,
    });
    // Project 25 window is late execution — large float vs gate unless chained.
    const rows = [
      mk('90.1.1', 1),
      mk('90.1.2', 1),
      mk('90.1.3', 1),
      mk('90.1.4', 1),
      mk('90.1.5', 1, 'checkpoint'),
    ];
    const synth = [
      { fromWbs: '90.1.1', toWbs: '90.1.2', type: 'SS' as const, lagDays: 1 },
      { fromWbs: '90.1.2', toWbs: '90.1.3', type: 'FF' as const, lagDays: 0 },
      { fromWbs: '90.1.3', toWbs: '90.1.4', type: 'SF' as const, lagDays: 2 },
      { fromWbs: '90.1.4', toWbs: '90.1.5', type: 'FS' as const, lagDays: 0 },
    ];
    const mini = simulateMasterBaseline(rows, synth);
    expect(mini.feasibility.method).toBe('hybrid_earliest_in_float');
    const a = mini.byWbs.get('90.1.1')!;
    const b = mini.byWbs.get('90.1.2')!;
    const c = mini.byWbs.get('90.1.3')!;
    const d = mini.byWbs.get('90.1.4')!;
    const e = mini.byWbs.get('90.1.5')!;
    // SS+lag: succ start >= pred start + lag
    expect(b.baselineStart >= addLag(a.baselineStart, 1)).toBe(true);
    // FF: succ end >= pred end
    expect(c.baselineEnd >= b.baselineEnd).toBe(true);
    // SF+lag: succ end >= pred start + lag
    expect(d.baselineEnd >= addLag(c.baselineStart, 2)).toBe(true);
    // FS
    expect(e.baselineStart >= d.baselineEnd).toBe(true);
    expect(e.baselineEnd <= '2027-09-15').toBe(true);
  });
});

function addLag(iso: string, lagDays: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + lagDays);
  return d.toISOString().slice(0, 10);
}

describe('r3 tone + terminal probe (hardgate)', () => {
  let scheduleService: ScheduleService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ScheduleService,
        MockDemoDataSource,
        { provide: DEMO_DATA_SOURCE, useExisting: MockDemoDataSource },
      ],
    }).compile();
    scheduleService = moduleRef.get(ScheduleService);
  });

  it('work 1.2.2 + KT-1.2.4 + HVAC/PS runtime tone; S actual ≤09-22; C PS 10-06', () => {
    mkdirSync(`${ART}/r3`, { recursive: true });
    const rows = (['01', '03', '19'] as const).map((id) => {
      const s = scheduleService.getSchedule('PRT-01', id);
      const w122 = s.items.find(
        (i): i is ScheduleWorkItemDto => i.kind === 'work' && i.id === '1.2.2',
      );
      const kt = s.items.find(
        (i): i is ScheduleMilestoneItemDto =>
          i.kind === 'milestone' && i.id === 'KT-1.2.4',
      );
      const hvac = s.items.find(
        (i): i is ScheduleEquipmentItemDto =>
          i.kind === 'equipment_delivery' && i.id === 'EQ-HVAC-01',
      );
      const ps = s.items.find(
        (i): i is ScheduleMilestoneItemDto =>
          i.kind === 'milestone' && i.id === 'MS-PS',
      );
      return {
        id,
        items: s.items.length,
        links: s.links.length,
        w122: w122 && {
          status: w122.status,
          progressPct: w122.progressPct,
          baselineEnd: w122.baselineEnd,
          endDate: w122.endDate,
          actualEnd: w122.actualEnd,
        },
        kt: kt && {
          rag: kt.rag,
          progressPct: kt.progressPct,
          sourceStatus: kt.sourceStatus,
          baselineDate: kt.baselineDate,
        },
        hvac: hvac && { status: hvac.status, progressPct: hvac.progressPct },
        ps: ps && {
          rag: ps.rag,
          baselineDate: ps.baselineDate,
          forecastDate: ps.forecastDate,
        },
      };
    });
    writeFileSync(`${ART}/r3/tone-probe.json`, JSON.stringify(rows, null, 2));
    expect(rows.every((r) => r.items === 688 && r.links === 679)).toBe(true);
    const c = rows.find((r) => r.id === '03')!;
    expect(c.ps?.forecastDate).toBe('2027-10-06');
    expect(c.ps?.rag).toBe('Red');
    expect(c.hvac?.status).toBe('Delayed');
    // Completed lifecycle → Green bar even if source emoji was missed/red.
    const sRow = rows.find((r) => r.id === '19')!;
    expect(sRow.w122?.status).toBe('Completed');
    expect(sRow.w122?.progressPct).toBe(100);
    expect(sRow.w122?.actualEnd).toBeTruthy();
    expect((sRow.w122?.actualEnd ?? '') <= '2027-09-22').toBe(true);
    expect((sRow.w122?.baselineEnd ?? '') <= '2027-09-15').toBe(true);
    expect(sRow.kt).toBeTruthy();
    expect(sRow.kt!.sourceStatus).toBe('missed');
    expect(sRow.kt!.rag).toBe('Green');
    expect(sRow.kt!.progressPct).toBe(100);
    // On C early AN-01 works completed (green fill 100), not eternal red bar.
    expect(c.w122).toBeTruthy();
    expect(c.w122!.status).toBe('Completed');
    expect(c.w122!.progressPct).toBe(100);
    expect(c.kt).toBeTruthy();
    expect(c.kt!.sourceStatus).toBe('missed');
    expect(c.kt!.rag).toBe('Green');
    expect(c.kt!.progressPct).toBe(100);
  });
});
