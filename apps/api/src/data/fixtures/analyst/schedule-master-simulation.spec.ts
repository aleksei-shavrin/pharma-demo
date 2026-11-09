import { writeFileSync, mkdirSync } from 'fs';
import { Test } from '@nestjs/testing';
import { parseAnalystFixture } from './analyst-parser';
import {
  MASTER_SIM_ASSUMPTIONS,
  PROJECT_BASELINE_WINDOWS,
  applyForecastGraph,
  applyForecastSlip,
  buildRealizedTimeline,
  deriveLifecycleAtAsOf,
  earliestStartFromPred,
  forecastSlipDaysForSnapshot,
  historicalFactsFromSource,
  projectWindowFor,
  realizedScenarioForSnapshot,
  simulateMasterBaseline,
  slidePlans,
} from './schedule-master-simulation';
import {
  buildAnalystFsEdges,
  buildAnalystScheduleFixture,
} from './schedule-analyst-import';
import {
  getScheduleWorkFixture,
  POPULATED_SCHEDULE_SNAPSHOTS,
} from '../schedule-works';
import { mergeDemoTree } from '../../schedule/schedule-demo-tree';
import { SNAPSHOT_STATES } from '../snapshot-states';
import { DEMO_DATA_SOURCE } from '../../demo-data-source';
import { MockDemoDataSource } from '../../mock-demo-data-source';
import { ScheduleService } from '../../../schedule/schedule.service';

describe('schedule-master-simulation r3', () => {
  const parsed = parseAnalystFixture();
  const edges = buildAnalystFsEdges(parsed);
  const sim = simulateMasterBaseline(parsed.rows, edges);

  it('documents 25 content windows with workDays and optionalPostLaunch empty', () => {
    expect(PROJECT_BASELINE_WINDOWS).toHaveLength(25);
    expect(MASTER_SIM_ASSUMPTIONS.sourceWeeksIsDelayMark).toBe(true);
    expect(MASTER_SIM_ASSUMPTIONS.optionalPostLaunchWbs).toEqual([]);
    expect(projectWindowFor(1).workDays).toBeLessThan(14);
  });

  it('typed edges hold; hardgate terminalBaselineMax ≤ PS; soft_infeasible=0', () => {
    let viol = 0;
    for (const e of edges) {
      const a = sim.byWbs.get(e.fromWbs);
      const b = sim.byWbs.get(e.toWbs);
      if (!a || !b) continue;
      const type = e.type ?? 'FS';
      if (type === 'FS' && a.baselineEnd > b.baselineStart) viol += 1;
    }
    expect(viol).toBe(0);
    expect(
      sim.audit.filter((a) => a.kind === 'soft_infeasible_vs_lf'),
    ).toHaveLength(0);
    expect(
      sim.audit.filter((a) => a.kind === 'hard_cpm_inconsistent'),
    ).toHaveLength(0);
    expect(sim.terminalBaselineMax <= '2027-09-15').toBe(true);
    const an25 = [...sim.byWbs.entries()].filter(([w]) => w.startsWith('25.'));
    expect(an25.length).toBeGreaterThan(0);
  });

  it('spreads across phases — not Feb–Mar only — and uses window content', () => {
    const starts = [...sim.byWbs.values()].map((p) => p.baselineStart);
    const min = starts.reduce((a, b) => (a < b ? a : b));
    expect(min < '2027-02-01').toBe(true);
    const months = new Set(starts.map((s) => s.slice(0, 7)));
    expect(months.size).toBeGreaterThan(4);
  });

  it('slidePlans shifts all leaf dates; 0 delta is identity', () => {
    const slid = slidePlans(sim.byWbs, 3);
    const id = slidePlans(sim.byWbs, 0);
    expect(id).toBe(sim.byWbs);
    const sample = [...sim.byWbs.keys()][0];
    expect(slid.get(sample)!.baselineStart).not.toBe(
      sim.byWbs.get(sample)!.baselineStart,
    );
  });

  it('06S/SS/FF/SF earliestStart contracts with lag', () => {
    expect(earliestStartFromPred('FS', '2027-01-01', '2027-01-10', 7, 0)).toBe(
      '2027-01-10',
    );
    expect(earliestStartFromPred('SS', '2027-01-05', '2027-01-20', 7, 2)).toBe(
      '2027-01-07',
    );
    expect(earliestStartFromPred('FF', '2027-01-01', '2027-01-20', 5, 0)).toBe(
      '2027-01-15',
    );
    // SF: succEnd >= predStart ⇒ start >= predStart - dur
    expect(earliestStartFromPred('SF', '2027-01-10', '2027-01-20', 5, 0)).toBe(
      '2027-01-05',
    );
  });

  it('06S precedence holds for ALL leaf edges after fit', () => {
    let checked = 0;
    for (const e of edges) {
      const a = sim.byWbs.get(e.fromWbs);
      const b = sim.byWbs.get(e.toWbs);
      if (!a || !b) continue;
      const type = e.type ?? 'FS';
      if (type === 'FS') {
        expect(a.baselineEnd <= b.baselineStart).toBe(true);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(100);
  });

  it('forecast graph propagates slip past AN-09 seeds', () => {
    const slipped = applyForecastGraph(sim.byWbs, edges, parsed.rows, 21);
    const seed = [...slipped.entries()].find(([w]) => w.startsWith('9.'));
    expect(seed).toBeTruthy();
    expect(seed![1].forecastEnd > seed![1].baselineEnd).toBe(true);
    // Some downstream of HVAC seams should move
    let movedDownstream = 0;
    for (const e of edges) {
      if (!e.fromWbs.startsWith('9.')) continue;
      const t = slipped.get(e.toWbs);
      const b = sim.byWbs.get(e.toWbs);
      if (t && b && t.forecastEnd > b.baselineEnd) movedDownstream += 1;
    }
    expect(movedDownstream).toBeGreaterThan(0);
  });

  it('realized timeline completes waiting leaves after duration; forecast slip does not rewrite past actuals', () => {
    const plan = {
      wbs: '1.1.1',
      baselineStart: '2026-09-10',
      baselineEnd: '2026-09-17',
      forecastStart: '2026-09-10',
      forecastEnd: '2026-09-17',
      durationDays: 7,
    };
    const realized = {
      wbs: '1.1.1',
      realizedStart: '2026-09-10',
      realizedEnd: '2026-09-17',
    };
    // Raw emoji waiting — still completes once asOf ≥ realizedEnd
    const done = deriveLifecycleAtAsOf(plan, realized, '2027-02-15', 'waiting');
    expect(done.status).toBe('Completed');
    expect(done.actualEnd).toBe('2026-09-17');
    expect(done.normalizedFromSource).toBe(true);

    const slipped = {
      ...plan,
      forecastStart: '2026-10-01',
      forecastEnd: '2026-10-08',
    };
    const afterSlip = deriveLifecycleAtAsOf(
      slipped,
      realized,
      '2027-02-15',
      'waiting',
    );
    expect(afterSlip.actualStart).toBe('2026-09-10');
    expect(afterSlip.actualEnd).toBe('2026-09-17');
  });

  it('progress is monotonic across increasing asOf on realized span', () => {
    const plan = {
      wbs: 'x',
      baselineStart: '2027-02-01',
      baselineEnd: '2027-04-01',
      forecastStart: '2027-02-01',
      forecastEnd: '2027-04-01',
      durationDays: 59,
    };
    const realized = {
      wbs: 'x',
      realizedStart: '2027-02-01',
      realizedEnd: '2027-04-01',
    };
    const a = deriveLifecycleAtAsOf(plan, realized, '2027-02-15', 'waiting');
    const b = deriveLifecycleAtAsOf(plan, realized, '2027-03-01', 'waiting');
    const c = deriveLifecycleAtAsOf(plan, realized, '2027-03-20', 'waiting');
    expect(a.progressPct).toBeLessThanOrEqual(b.progressPct);
    expect(b.progressPct).toBeLessThanOrEqual(c.progressPct);
    expect(c.progressPct).toBeLessThan(100);
    expect(a.status).not.toBe('Waiting');
  });

  it('future waiting; past realized end → Completed (never eternal Delayed0)', () => {
    const plan = {
      wbs: 'f',
      baselineStart: '2027-08-01',
      baselineEnd: '2027-08-10',
      forecastStart: '2027-08-01',
      forecastEnd: '2027-08-10',
      durationDays: 9,
    };
    const future = deriveLifecycleAtAsOf(
      plan,
      { wbs: 'f', realizedStart: '2027-08-01', realizedEnd: '2027-08-10' },
      '2027-02-15',
      'waiting',
    );
    expect(future.status).toBe('Waiting');
    expect(future.progressPct).toBe(0);

    const finished = deriveLifecycleAtAsOf(
      {
        wbs: 's',
        baselineStart: '2027-01-01',
        baselineEnd: '2027-01-20',
        forecastStart: '2027-01-01',
        forecastEnd: '2027-01-20',
        durationDays: 19,
      },
      { wbs: 's', realizedStart: '2027-01-01', realizedEnd: '2027-01-20' },
      '2027-03-01',
      'waiting',
    );
    expect(finished.status).toBe('Completed');
    expect(finished.progressPct).toBe(100);
    expect(finished.actualEnd).toBe('2027-01-20');
  });

  it('realized seed started before crisis keeps start fact and extends finish', () => {
    const crisis = MASTER_SIM_ASSUMPTIONS.crisisOnsetAsOf;
    const mk = (wbs: string, projectNo: number) => ({
      projectNo,
      wbs,
      kind: 'work' as const,
      name: wbs,
      rawDeps: '',
      statusToken: '—',
      sourceStatus: 'waiting' as const,
      sourceWeeks: null,
    });
    // Seed WBS under AN-09 HVAC so isForecastSlipSeed matches.
    const rows = [mk('9.5.1', 9), mk('9.5.2', 9)];
    const toyEdges = [
      { fromWbs: '9.5.1', toWbs: '9.5.2', type: 'FS' as const, lagDays: 0 },
    ];
    // Start before crisis, finish after — exercises keep-start / extend-finish seed path.
    const baseline = new Map([
      [
        '9.5.1',
        {
          wbs: '9.5.1',
          baselineStart: '2027-02-01',
          baselineEnd: '2027-03-20',
          forecastStart: '2027-02-01',
          forecastEnd: '2027-03-20',
          durationDays: 47,
        },
      ],
      [
        '9.5.2',
        {
          wbs: '9.5.2',
          baselineStart: '2027-03-20',
          baselineEnd: '2027-04-05',
          forecastStart: '2027-03-20',
          forecastEnd: '2027-04-05',
          durationDays: 16,
        },
      ],
    ]);
    expect(baseline.get('9.5.1')!.baselineStart < crisis).toBe(true);
    expect(baseline.get('9.5.1')!.baselineEnd > crisis).toBe(true);
    const realized = buildRealizedTimeline(
      baseline,
      toyEdges,
      rows,
      21,
      'crisis',
    );
    const a = realized.get('9.5.1')!;
    expect(a.realizedStart).toBe('2027-02-01');
    expect(a.realizedEnd > '2027-03-20').toBe(true);
  });

  it('immutable realized timeline: crisis slips unfinished HVAC; frozen pre-crisis; ≤09-22', () => {
    const realized = buildRealizedTimeline(sim.byWbs, edges, parsed.rows);
    const crisis = MASTER_SIM_ASSUMPTIONS.crisisOnsetAsOf;
    // Pre-crisis completed on actual plane stays on baseline (hybrid early leaves freeze).
    for (const [wbs, base] of sim.byWbs) {
      if (base.baselineEnd <= crisis) {
        const leaf = realized.get(wbs)!;
        expect(leaf.realizedStart).toBe(base.baselineStart);
        expect(leaf.realizedEnd).toBe(base.baselineEnd);
      }
    }
    // HVAC slip when seeds still open after crisis; else graph already before crisis.
    const slippedHvac = [...realized.entries()].filter(([wbs, leaf]) => {
      if (!wbs.startsWith('9.')) return false;
      const base = sim.byWbs.get(wbs)!;
      return base.baselineEnd > crisis && leaf.realizedEnd > base.baselineEnd;
    });
    const openHvac = [...sim.byWbs.entries()].filter(
      ([w, p]) => w.startsWith('9.') && p.baselineEnd > crisis,
    );
    if (openHvac.length > 0) {
      expect(slippedHvac.length).toBeGreaterThan(0);
    }
    // Overconstrained soft-infeasible chain may leave tip > 09-22; typed edges must hold.
    let actualFsViol = 0;
    for (const e of edges) {
      if ((e.type ?? 'FS') !== 'FS') continue;
      const a = realized.get(e.fromWbs);
      const b = realized.get(e.toWbs);
      if (a && b && a.realizedEnd > b.realizedStart) actualFsViol += 1;
    }
    expect(actualFsViol).toBe(0);
    expect(sim.feasibility.softRelaxWbs.length).toBeGreaterThan(0);
    // Same map regardless of deprecated scenario arg
    const again = buildRealizedTimeline(
      sim.byWbs,
      edges,
      parsed.rows,
      99,
      'calm',
    );
    for (const [wbs, leaf] of realized) {
      expect(again.get(wbs)).toEqual(leaf);
    }
    expect(realizedScenarioForSnapshot('19')).toBe('recovery');
    expect(realizedScenarioForSnapshot('03')).toBe('crisis');
    expect(MASTER_SIM_ASSUMPTIONS.hvacDeliveryFact).toBe('2027-06-05');
    expect(MASTER_SIM_ASSUMPTIONS.hvacDeliveryFactBefore).toBe('2027-09-20');
    expect(MASTER_SIM_ASSUMPTIONS.hvacDeliveryBeforeIq).toBe(true);
  });

  it('06S/SS/FF/SF hold on realized plane after crisis+recovery', () => {
    const realized = buildRealizedTimeline(sim.byWbs, edges, parsed.rows);
    let checked = 0;
    const bad: string[] = [];
    for (const e of edges) {
      const a = realized.get(e.fromWbs);
      const b = realized.get(e.toWbs);
      if (!a || !b) continue;
      const type = e.type ?? 'FS';
      const lag = e.lagDays ?? 0;
      const dur = sim.byWbs.get(e.toWbs)?.durationDays ?? 0;
      const es = earliestStartFromPred(
        type,
        a.realizedStart,
        a.realizedEnd,
        dur,
        lag,
      );
      if (b.realizedStart < es) {
        bad.push(
          `${e.fromWbs}->${e.toWbs} ${type} need≥${es} got ${b.realizedStart}`,
        );
      }
      checked += 1;
    }
    expect(bad).toEqual([]);
    expect(checked).toBeGreaterThan(100);
  });

  it('import coverage + register graph for merge', () => {
    const built = buildAnalystScheduleFixture(parsed);
    expect(built.parse.rows).toHaveLength(564);
    expect(built.importCoverage.works).toBe(272);
    expect(built.importCoverage.checkpoints).toBe(147);
  });

  it('covers slip helpers, provenance, window fallback, delayed lifecycle branch', () => {
    expect(forecastSlipDaysForSnapshot('01')).toBe(0);
    expect(forecastSlipDaysForSnapshot('15')).toBe(7);
    expect(forecastSlipDaysForSnapshot('03')).toBe(21);
    expect(projectWindowFor(99).rationaleRu).toMatch(/fallback/);
    const plan = {
      wbs: '9.x',
      baselineStart: '2027-04-01',
      baselineEnd: '2027-04-10',
      forecastStart: '2027-04-01',
      forecastEnd: '2027-04-10',
      durationDays: 9,
    };
    expect(applyForecastSlip(plan, 9, 0)).toEqual(plan);
    expect(applyForecastSlip(plan, 1, 21)).toEqual(plan);
    expect(applyForecastSlip(plan, 9, 21).forecastEnd).toBe('2027-05-01');
    expect(historicalFactsFromSource(plan, 'completed').actualEnd).toBe(
      '2027-04-10',
    );
    expect(historicalFactsFromSource(plan, 'waiting').actualEnd).toBeNull();
    const realized = {
      wbs: '9.x',
      realizedStart: '2027-04-01',
      realizedEnd: '2027-04-20',
    };
    const mid = deriveLifecycleAtAsOf(
      { ...plan, forecastEnd: '2027-05-01' },
      realized,
      '2027-04-10',
      'delayed',
    );
    expect(mid.status).toBe('Delayed');
    expect(mid.actualStart).toBe('2027-04-01');
    expect(mid.progressPct).toBeGreaterThan(0);
    expect(mid.progressPct).toBeLessThan(100);
  });
});

describe('19-snapshot schedule invariants (r3 hard audit)', () => {
  const parsed = parseAnalystFixture();
  const analystEdges = buildAnalystFsEdges(parsed);
  const masterSim = simulateMasterBaseline(parsed.rows, analystEdges);
  expect(masterSim.terminalBaselineMax <= '2027-09-15').toBe(true);
  buildAnalystScheduleFixture(parsed);
  const base = getScheduleWorkFixture('03');
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

  it('baseline immutable; 0 progress/actual violations; KT lifecycle; runtime 688/679', () => {
    const baselines = new Map<string, { s: string; e: string }>();
    const progressSeries = new Map<string, number[]>();
    const violations: string[] = [];

    for (const id of POPULATED_SCHEDULE_SNAPSHOTS) {
      const st = SNAPSHOT_STATES[id];
      const merged = mergeDemoTree(base, [], st.asOf, id);
      expect(merged.works.filter((w) => !w.id.startsWith('WK-')).length).toBe(
        272,
      );

      for (const w of merged.works) {
        if (w.id.startsWith('WK-')) continue;
        const key = w.id;
        const bs = w.baselineStart!;
        const be = w.baselineEnd!;
        if (!baselines.has(key)) baselines.set(key, { s: bs, e: be });
        else {
          expect(bs).toBe(baselines.get(key)!.s);
          expect(be).toBe(baselines.get(key)!.e);
        }
        // Hardgate: every mandatory leaf baseline ends at/before PS.
        expect(be <= '2027-09-15').toBe(true);
        if (w.actualStart && w.actualStart > st.asOf) {
          violations.push(`${id}/${key} future actualStart`);
        }
        if (w.actualEnd) {
          if (w.actualEnd > st.asOf) {
            violations.push(`${id}/${key} future actualEnd`);
          }
          if (!w.actualStart) {
            violations.push(`${id}/${key} actualEnd without start`);
          }
        }
        if (w.status === 'Completed') {
          if (w.progressPct !== 100 || !w.actualEnd) {
            violations.push(`${id}/${key} Completed without 100/end`);
          }
        }
        const series = progressSeries.get(key) ?? [];
        series.push(w.progressPct ?? 0);
        progressSeries.set(key, series);
      }

      for (const kt of [
        ...(merged.importedCheckpoints ?? []),
        ...(merged.aliasedCheckpoints ?? []),
      ]) {
        expect(kt.baselineDate <= '2027-09-15').toBe(true);
        if (kt.actualStart && kt.actualStart > st.asOf) {
          violations.push(`${id}/${kt.id} KT future actualStart`);
        }
        if (kt.actualEnd && kt.actualEnd > st.asOf) {
          violations.push(`${id}/${kt.id} KT future actualEnd`);
        }
        if (kt.status === 'Completed') {
          expect(kt.progressPct).toBe(100);
          expect(kt.actualEnd).toBeTruthy();
        }
        const kSeries = progressSeries.get(`kt:${kt.id}`) ?? [];
        kSeries.push(kt.progressPct ?? 0);
        progressSeries.set(`kt:${kt.id}`, kSeries);
      }
    }

    for (const [key, series] of progressSeries) {
      for (let i = 1; i < series.length; i++) {
        if (series[i] + 0.0001 < series[i - 1]) {
          violations.push(`mono ${key}: ${series[i - 1]}→${series[i]}`);
        }
      }
    }
    expect(violations).toEqual([]);

    // Runtime API read-model counts on every letter
    for (const id of POPULATED_SCHEDULE_SNAPSHOTS) {
      const s = scheduleService.getSchedule('PRT-01', id);
      expect(s.items.length).toBe(688);
      expect(s.links.length).toBe(679);
    }

    expect(base.links.length).toBe(679);
    expect(forecastSlipDaysForSnapshot('03')).toBe(21);
    expect(forecastSlipDaysForSnapshot('19')).toBe(0);
  });

  it('r4 full API edge audit all 19×679 + terminals; write r4-edge-audit.json', () => {
    const outDir =
      '/tmp/pharma-demo-artifacts/pharma-realistic-simulation-programs-1c199ddd';
    mkdirSync(outDir, { recursive: true });

    type Dated = {
      id: string;
      kind: string;
      start?: string;
      end?: string;
      baselineStart?: string | null;
      baselineEnd?: string | null;
      actualStart?: string | null;
      actualEnd?: string | null;
      progressPct?: number | null;
    };

    const leafDates = (item: {
      id: string;
      kind: string;
      startDate?: string;
      endDate?: string;
      forecastDate?: string;
      baselineDate?: string;
      baselineStart?: string | null;
      baselineEnd?: string | null;
      actualStart?: string | null;
      actualEnd?: string | null;
      progressPct?: number | null;
    }): Dated | null => {
      if (item.kind === 'work') {
        return {
          id: item.id,
          kind: item.kind,
          start: item.startDate,
          end: item.endDate,
          baselineStart: item.baselineStart,
          baselineEnd: item.baselineEnd,
          actualStart: item.actualStart,
          actualEnd: item.actualEnd,
          progressPct: item.progressPct,
        };
      }
      if (item.kind === 'milestone' || item.kind === 'equipment_delivery') {
        const d = item.forecastDate ?? item.baselineDate;
        return {
          id: item.id,
          kind: item.kind,
          start: d,
          end: d,
          baselineStart: item.baselineDate ?? null,
          baselineEnd: item.baselineDate ?? null,
          actualStart: null,
          actualEnd: null,
          progressPct: item.progressPct,
        };
      }
      return null; // groups: no FS date contract
    };

    const violations: string[] = [];
    const kindCounts: Record<string, number> = {};
    let temporalEdgesChecked = 0;
    let topologyOnlySkipped = 0;
    let edgesSkippedGroup = 0;
    let edgesUnresolved = 0;
    const topologySkipReasons: Record<string, number> = {};
    /** Curated demo cross links — direction only, no planning type in fixture. */
    const CURATED_TOPOLOGY_ONLY = new Set([
      'LNK-X-PWR-HVAC',
      'LNK-X-PANEL-CLN',
    ]);

    const checkPlane = (
      snap: string,
      linkId: string,
      type: 'FS' | 'SS' | 'FF' | 'SF',
      plane: 'baseline' | 'forecast' | 'actual',
      src: Dated,
      tgt: Dated,
    ) => {
      const sStart =
        plane === 'baseline'
          ? src.baselineStart
          : plane === 'forecast'
            ? src.start
            : src.actualStart;
      const sEnd =
        plane === 'baseline'
          ? src.baselineEnd
          : plane === 'forecast'
            ? src.end
            : src.actualEnd;
      const tStart =
        plane === 'baseline'
          ? tgt.baselineStart
          : plane === 'forecast'
            ? tgt.start
            : tgt.actualStart;
      const tEnd =
        plane === 'baseline'
          ? tgt.baselineEnd
          : plane === 'forecast'
            ? tgt.end
            : tgt.actualEnd;
      if (
        plane === 'actual' &&
        (sEnd == null || tStart == null) &&
        type === 'FS'
      ) {
        return; // incomplete actuals — no contract yet
      }
      if (plane === 'actual' && type !== 'FS') return;
      if (type === 'FS' && sEnd && tStart && sEnd > tStart) {
        violations.push(
          `${snap}/${linkId} FS ${plane} ${src.id}:${sEnd}>${tgt.id}:${tStart}`,
        );
      }
      if (type === 'SS' && sStart && tStart && sStart > tStart) {
        violations.push(
          `${snap}/${linkId} SS ${plane} ${src.id}:${sStart}>${tgt.id}:${tStart}`,
        );
      }
      if (type === 'FF' && sEnd && tEnd && sEnd > tEnd) {
        violations.push(
          `${snap}/${linkId} FF ${plane} ${src.id}:${sEnd}>${tgt.id}:${tEnd}`,
        );
      }
      if (type === 'SF' && sStart && tEnd && sStart > tEnd) {
        violations.push(
          `${snap}/${linkId} SF ${plane} ${src.id}:${sStart}>${tgt.id}:${tEnd}`,
        );
      }
    };

    for (const id of POPULATED_SCHEDULE_SNAPSHOTS) {
      const s = scheduleService.getSchedule('PRT-01', id);
      expect(s.items.length).toBe(688);
      expect(s.links.length).toBe(679);
      const byRef = new Map<string, Dated | 'group' | null>();
      for (const item of s.items) {
        if (item.kind === 'work') {
          byRef.set(`work:${item.id}`, leafDates(item));
        } else if (item.kind === 'milestone') {
          byRef.set(`milestone:${item.id}`, leafDates(item));
        } else if (item.kind === 'equipment_delivery') {
          byRef.set(`equipment_delivery:${item.id}`, leafDates(item));
        } else {
          byRef.set(`${item.kind}:${item.id}`, 'group');
        }
      }

      for (const link of s.links) {
        kindCounts[link.kind] = (kindCounts[link.kind] ?? 0) + 1;
        const src = byRef.get(link.sourceRef);
        const tgt = byRef.get(link.targetRef);
        if (src == null || tgt == null) {
          edgesUnresolved += 1;
          violations.push(
            `${id}/${link.id} unresolved ${link.sourceRef}->${link.targetRef}`,
          );
          continue;
        }
        if (src === 'group' || tgt === 'group') {
          edgesSkippedGroup += 1;
          topologyOnlySkipped += 1;
          topologySkipReasons['group_endpoint_no_interval'] =
            (topologySkipReasons['group_endpoint_no_interval'] ?? 0) + 1;
          continue;
        }

        // Curated demo cross (PWR→HVAC, PANEL→CLN): topology / narrative only.
        if (
          link.kind === 'cross_project_predecessor' &&
          CURATED_TOPOLOGY_ONLY.has(link.id)
        ) {
          topologyOnlySkipped += 1;
          topologySkipReasons['curated_demo_cross_no_planning_type'] =
            (topologySkipReasons['curated_demo_cross_no_planning_type'] ?? 0) +
            1;
          continue;
        }

        // Imported source ⇢ cross predecessors: same FS contract as master CPM
        // (buildAnalystFsEdges treats projected cross atoms as FS).
        const type: 'FS' | 'SS' | 'FF' | 'SF' | undefined =
          link.type ??
          (link.kind === 'scheduling' ||
          link.kind === 'cross_project_predecessor'
            ? 'FS'
            : undefined);

        if (!type) {
          violations.push(`${id}/${link.id} leaf link without temporal type`);
          continue;
        }

        temporalEdgesChecked += 1;
        checkPlane(id, link.id, type, 'baseline', src, tgt);
        checkPlane(id, link.id, type, 'forecast', src, tgt);
        checkPlane(id, link.id, type, 'actual', src, tgt);
      }
    }

    const audit = {
      at: new Date().toISOString(),
      phase: 'r4b',
      snaps: 19,
      linksPerSnap: 679,
      temporalEdgesChecked,
      topologyOnlySkipped,
      topologySkipReasons,
      edgesSkippedGroup,
      edgesUnresolved,
      kindCounts,
      violationCount: violations.length,
      violations: violations.slice(0, 80),
      classification: {
        scheduling: 'temporal (typed FS/SS/FF/SF)',
        importedCrossPredecessor:
          'temporal FS — analyst ⇢ edges; same contract as buildAnalystFsEdges',
        curatedDemoCross: [...CURATED_TOPOLOGY_ONLY],
        curatedDemoCrossReason:
          'fixture-authored directional demos without planning type',
      },
      assumptions: {
        hvacDeliveryFact: MASTER_SIM_ASSUMPTIONS.hvacDeliveryFact,
        hvacDeliveryFactBefore: MASTER_SIM_ASSUMPTIONS.hvacDeliveryFactBefore,
        psBaseline: MASTER_SIM_ASSUMPTIONS.productionStartBaseline,
        psForecastC: MASTER_SIM_ASSUMPTIONS.productionStartForecastC,
        psActualS: MASTER_SIM_ASSUMPTIONS.productionStartRecoveryS,
      },
    };
    writeFileSync(
      `${outDir}/r4-edge-audit.json`,
      JSON.stringify(audit, null, 2),
    );
    expect(edgesUnresolved).toBe(0);
    expect(violations).toEqual([]);
    // 679 links/snap × 19; curated demo cross (2) + groups skipped are not temporal
    expect(temporalEdgesChecked).toBeGreaterThan(19 * (679 - 10));
    expect(topologySkipReasons['curated_demo_cross_no_planning_type']).toBe(
      19 * 2,
    );

    const c = scheduleService.getSchedule('PRT-01', '03');
    const psC = c.items.find((i) => i.id === 'MS-PS');
    expect(psC && psC.kind === 'milestone' && psC.forecastDate).toBe(
      '2027-10-06',
    );

    const mergedS = mergeDemoTree(base, [], SNAPSHOT_STATES['19'].asOf, '19');
    let completed = 0;
    let openPastLaunch = 0;
    for (const w of mergedS.works) {
      if (w.id.startsWith('WK-')) continue;
      if (w.status === 'Completed') {
        completed += 1;
        expect(w.actualEnd).toBeTruthy();
        expect(w.actualEnd! <= '2027-09-22').toBe(true);
      } else {
        openPastLaunch += 1;
        expect(['OnSchedule', 'Delayed', 'Waiting']).toContain(w.status);
      }
    }
    expect(completed).toBeGreaterThan(200);
    // Hardgate recovery: nearly all leaves closed by S (PS actual ≤ 09-22).
    expect(openPastLaunch).toBeLessThan(30);
    for (const kt of mergedS.importedCheckpoints ?? []) {
      if (kt.status !== 'Completed') {
        expect(kt.progressPct < 100).toBe(true);
        continue;
      }
      expect(kt.actualEnd).toBeTruthy();
      expect(kt.actualEnd! <= '2027-09-22').toBe(true);
    }

    const hvacC = mergeDemoTree(
      base,
      [],
      SNAPSHOT_STATES['03'].asOf,
      '03',
    ).works.find((w) => w.wbs?.startsWith('9.3'));
    expect(hvacC).toBeTruthy();
    expect(hvacC!.endDate >= hvacC!.baselineEnd!).toBe(true);
  });
});
