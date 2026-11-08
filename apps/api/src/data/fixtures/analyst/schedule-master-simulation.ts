/**
 * Content-based master-schedule for analyst WBS (Demo v1).
 * certainty: assumption — synthetic demo planning, not real GMP calendars.
 *
 * - sourceWeeks from ⚠️Nн is a **delay mark**, never task duration.
 * - Baseline fitted by reverse/slide to Production Start gate (not flat 14d→2028).
 * - Forecast slips seed on HVAC and propagate through full link graph.
 * - Actuals come from a deterministic **realized timeline** (scenario + constraints).
 *   Raw sourceStatus/emoji is provenance only — never eternal destiny.
 * - Past realized facts are not rewritten when forecast slip changes.
 */
import type { AnalystRow, AnalystSourceStatus } from './analyst-parser';

export const MASTER_SIM_ASSUMPTIONS = {
  sourceWeeksIsDelayMark: true,
  productionStartBaseline: '2027-09-15',
  productionStartForecastC: '2027-10-06',
  productionStartRecoveryS: '2027-09-22',
  /**
   * EQ-HVAC-01 actual delivery (was synthetic 2027-09-20 — after May–Jul install/IQ).
   * Override: baseline catalog 2027-05-15 + crisis +21d = 2027-06-05, before MS-HVAC-IQ 06-15.
   */
  hvacDeliveryFact: '2027-06-05',
  hvacDeliveryFactBefore: '2027-09-20',
  hvacBaselineDelivery: '2027-05-15',
  /** Delivery precedes install/IQ on the actual plane (AHU long-lead is the same unit). */
  hvacDeliveryBeforeIq: true,
  crisisOnsetAsOf: '2027-03-01',
  crisisSlipDays: 21,
  recoveryOnsetAsOf: '2027-09-01',
  /** Post-launch optional works (none in demo — all mandatory gates ≤ PS/S). */
  optionalPostLaunchWbs: [] as readonly string[],
  defaultCheckpointDurationDays: 0,
  /**
   * certainty: assumption — source MD has no calendar dates.
   * UI phase label only: first portfolio construction gate (MS-BLD-EXC ≈ Feb).
   * Not a domain proof that work cannot start then — see ALAP feasibility audit.
   */
  executionPhaseStart: '2027-02-01',
  preprojectPhaseEnd: '2027-01-31',
} as const;

export type ProjectBaselineWindow = {
  projectNo: number;
  start: string;
  end: string;
  /** Typical work duration days for leaves in this project (content-based). */
  workDays: number;
  rationaleRu: string;
};

/**
 * Content windows + typical leaf duration. window.end is a preferred finish
 * (used in reverse/slide fit); workDays replaces flat 14d.
 */
export const PROJECT_BASELINE_WINDOWS: readonly ProjectBaselineWindow[] = [
  {
    projectNo: 1,
    start: '2026-08-01',
    end: '2027-01-31',
    workDays: 7,
    rationaleRu:
      'URS/предпроект — soft preferred window; ALAP не использует start как floor',
  },
  {
    projectNo: 2,
    start: '2026-08-15',
    end: '2027-01-31',
    workDays: 7,
    rationaleRu: 'Изыскания (предпроект); demo workDays assumption',
  },
  {
    projectNo: 3,
    start: '2026-09-15',
    end: '2027-02-28',
    workDays: 8,
    rationaleRu: 'FEED — стык предпроект/исполнение',
  },
  {
    projectNo: 4,
    start: '2026-10-15',
    end: '2027-04-30',
    workDays: 9,
    rationaleRu: 'Детальный дизайн / DQ',
  },
  {
    projectNo: 5,
    start: '2026-10-01',
    end: '2027-05-31',
    workDays: 8,
    rationaleRu: 'Разрешения',
  },
  {
    projectNo: 6,
    start: '2027-02-01',
    end: '2027-04-30',
    workDays: 10,
    rationaleRu: 'Земляные — soft preferred ≥ Feb construction gate',
  },
  {
    projectNo: 7,
    start: '2027-02-01',
    end: '2027-06-30',
    workDays: 10,
    rationaleRu: 'Каркас — phase Исполнение',
  },
  {
    projectNo: 8,
    start: '2027-04-01',
    end: '2027-07-31',
    workDays: 10,
    rationaleRu: 'Чистые помещения',
  },
  {
    projectNo: 9,
    start: '2027-03-15',
    end: '2027-08-31',
    workDays: 10,
    rationaleRu:
      'HVAC install/IQ; AHU delivery fact 2027-06-05 (crisis +21 от baseline 05-15)',
  },
  {
    projectNo: 10,
    start: '2027-02-01',
    end: '2027-07-15',
    workDays: 9,
    rationaleRu: 'PW/WFI',
  },
  {
    projectNo: 11,
    start: '2027-03-01',
    end: '2027-07-31',
    workDays: 9,
    rationaleRu: 'Трубопроводы',
  },
  {
    projectNo: 12,
    start: '2027-02-15',
    end: '2027-07-15',
    workDays: 8,
    rationaleRu: 'Электро',
  },
  {
    projectNo: 13,
    start: '2027-03-01',
    end: '2027-08-15',
    workDays: 10,
    rationaleRu: 'Технологическое оборудование',
  },
  {
    projectNo: 14,
    start: '2027-04-01',
    end: '2027-08-15',
    workDays: 8,
    rationaleRu: 'GMP-склад',
  },
  {
    projectNo: 15,
    start: '2026-12-01',
    end: '2027-06-30',
    workDays: 8,
    rationaleRu: 'ИТ/ЦОД',
  },
  {
    projectNo: 16,
    start: '2027-03-01',
    end: '2027-08-15',
    workDays: 9,
    rationaleRu: 'Автоматизация',
  },
  {
    projectNo: 17,
    start: '2027-04-01',
    end: '2027-08-31',
    workDays: 8,
    rationaleRu: 'MES/ERP/LIMS',
  },
  {
    projectNo: 18,
    start: '2027-05-01',
    end: '2027-09-01',
    workDays: 7,
    rationaleRu: 'CSV',
  },
  {
    projectNo: 19,
    start: '2027-05-15',
    end: '2027-09-05',
    workDays: 7,
    rationaleRu: 'Commissioning — gate до PS',
  },
  {
    projectNo: 20,
    start: '2027-06-01',
    end: '2027-09-10',
    workDays: 7,
    rationaleRu: 'IQ/OQ/PQ — до PS baseline',
  },
  {
    projectNo: 21,
    start: '2027-06-15',
    end: '2027-09-12',
    workDays: 7,
    rationaleRu: 'PPQ — до PS baseline',
  },
  {
    projectNo: 22,
    start: '2027-01-15',
    end: '2027-09-01',
    workDays: 7,
    rationaleRu: 'СМК',
  },
  {
    projectNo: 23,
    start: '2027-02-01',
    end: '2027-09-01',
    workDays: 6,
    rationaleRu: 'Персонал',
  },
  {
    projectNo: 24,
    start: '2026-11-01',
    end: '2027-06-15',
    workDays: 9,
    rationaleRu: 'Внешние сети',
  },
  {
    projectNo: 25,
    start: '2027-06-01',
    end: '2027-09-15',
    workDays: 6,
    rationaleRu:
      'PAI/регуляторика — terminal к PS; S recovery 09-22 на forecast',
  },
];

const WINDOW_BY_NO = new Map(
  PROJECT_BASELINE_WINDOWS.map((w) => [w.projectNo, w] as const),
);

export function projectWindowFor(projectNo: number): ProjectBaselineWindow {
  const w = WINDOW_BY_NO.get(projectNo);
  if (!w) {
    return {
      projectNo,
      start: '2026-09-01',
      end: '2027-09-15',
      workDays: 8,
      rationaleRu: 'fallback window',
    };
  }
  return w;
}

export function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  const ms =
    new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000);
}

export type LeafDatePlan = {
  wbs: string;
  baselineStart: string;
  baselineEnd: string;
  forecastStart: string;
  forecastEnd: string;
  durationDays: number;
};

export type ScheduleAuditDecision = {
  id: string;
  kind: 'cycle_back_edge' | 'status_vs_pred' | 'lag_absent' | 'fit_slide';
  detail: string;
  decisionRu: string;
};

export type MasterSimFeasibility = {
  method: 'alap_from_gate';
  gate: string;
  floorsUsed: false;
  criticalPath: string[];
  /** Sum of leaf durationDays along criticalPath (synthetic workDays). */
  criticalPathDurationDays: number;
  /** min(LS) after ALAP — earliest calendar day any leaf must start. */
  earliestNecessaryStart: string;
  /** Calendar span gate − earliestNecessaryStart. */
  spanToGateDays: number;
  /** Whether earliestNecessaryStart is before executionPhaseStart (UI label). */
  preprojectBeforeFebLabel: boolean;
  syntheticDurationsNoteRu: string;
};

export type MasterSimResult = {
  byWbs: Map<string, LeafDatePlan>;
  audit: ScheduleAuditDecision[];
  projectRanges: { projectNo: number; min: string; max: string }[];
  terminalBaselineMax: string;
  criticalPathSample: string[];
  feasibility: MasterSimFeasibility;
};

export type LinkType = 'FS' | 'SS' | 'FF' | 'SF';
export type FsEdge = {
  fromWbs: string;
  toWbs: string;
  type?: LinkType;
  lagDays?: number;
};

/**
 * Leaf duration from project typical workDays (demo assumption 6–10d).
 * certainty: assumption — MD has no calendar durations; not a domain fact.
 * Heterogeneous names share the project typical on purpose — do not inflate
 * path length into a fake “May domain bound”.
 */
function durationFor(row: AnalystRow): number {
  if (row.kind === 'checkpoint') {
    return MASTER_SIM_ASSUMPTIONS.defaultCheckpointDurationDays;
  }
  if (row.kind === 'stage') return 0;
  return projectWindowFor(row.projectNo).workDays;
}

function maxIso(a: string, b: string): string {
  return a >= b ? a : b;
}

/** Earliest start implied by one predecessor constraint. */
export function earliestStartFromPred(
  type: LinkType,
  predStart: string,
  predEnd: string,
  succDuration: number,
  lagDays = 0,
): string {
  if (type === 'FS') {
    return addDaysIso(predEnd, lagDays);
  }
  if (type === 'SS') {
    return addDaysIso(predStart, lagDays);
  }
  if (type === 'FF') {
    // succEnd >= predEnd + lag ⇒ succStart >= predEnd + lag - dur
    return addDaysIso(predEnd, lagDays - succDuration);
  }
  // SF: succEnd >= predStart + lag ⇒ succStart >= predStart + lag - dur
  return addDaysIso(predStart, lagDays - succDuration);
}

function buildTopo(
  byWbs: Map<string, AnalystRow>,
  edges: readonly FsEdge[],
  audit: ScheduleAuditDecision[],
): {
  order: string[];
  preds: Map<string, { from: string; type: LinkType; lagDays: number }[]>;
  succs: Map<string, { to: string; type: LinkType; lagDays: number }[]>;
} {
  const preds = new Map<
    string,
    { from: string; type: LinkType; lagDays: number }[]
  >();
  const succs = new Map<
    string,
    { to: string; type: LinkType; lagDays: number }[]
  >();
  for (const e of edges) {
    if (!byWbs.has(e.toWbs) || !byWbs.has(e.fromWbs)) continue;
    const type = e.type ?? 'FS';
    const lagDays = e.lagDays ?? 0;
    const pl = preds.get(e.toWbs) ?? [];
    pl.push({ from: e.fromWbs, type, lagDays });
    preds.set(e.toWbs, pl);
    const sl = succs.get(e.fromWbs) ?? [];
    sl.push({ to: e.toWbs, type, lagDays });
    succs.set(e.fromWbs, sl);
  }

  const indeg = new Map<string, number>();
  for (const wbs of byWbs.keys()) indeg.set(wbs, 0);
  for (const [to, list] of preds) indeg.set(to, list.length);

  const queue = [...byWbs.keys()].filter((w) => (indeg.get(w) ?? 0) === 0);
  const order: string[] = [];
  const indegWork = new Map(indeg);
  while (queue.length) {
    const n = queue.shift()!;
    order.push(n);
    for (const s of succs.get(n) ?? []) {
      const next = (indegWork.get(s.to) ?? 1) - 1;
      indegWork.set(s.to, next);
      if (next === 0) queue.push(s.to);
    }
  }
  if (order.length < byWbs.size) {
    const leftover = [...byWbs.keys()].filter((w) => !order.includes(w));
    for (const w of leftover) {
      audit.push({
        id: `cycle:${w}`,
        kind: 'cycle_back_edge',
        detail: `WBS ${w} in cycle or unmet preds`,
        decisionRu:
          'Связь сохранена; dating игнорирует back-edge, старт = max(окно, известные preds)',
      });
      order.push(w);
    }
  }
  return { order, preds, succs };
}

function forwardPass(
  order: string[],
  byWbs: Map<string, AnalystRow>,
  preds: Map<string, { from: string; type: LinkType; lagDays: number }[]>,
  startFloorByWbs: Map<string, string>,
): Map<string, LeafDatePlan> {
  const plans = new Map<string, LeafDatePlan>();
  for (const wbs of order) {
    const row = byWbs.get(wbs)!;
    const dur = durationFor(row);
    let es = startFloorByWbs.get(wbs) ?? projectWindowFor(row.projectNo).start;
    for (const p of preds.get(wbs) ?? []) {
      const pred = plans.get(p.from);
      if (!pred) continue;
      es = maxIso(
        es,
        earliestStartFromPred(
          p.type,
          pred.baselineStart,
          pred.baselineEnd,
          dur,
          p.lagDays,
        ),
      );
    }
    const ef = addDaysIso(es, Math.max(dur, 0));
    plans.set(wbs, {
      wbs,
      baselineStart: es,
      baselineEnd: ef,
      forecastStart: es,
      forecastEnd: ef,
      durationDays: dur,
    });
  }
  return plans;
}

/** Kept for narrative overlays that slide leaf plans by delta days. */
export function slidePlans(
  plans: Map<string, LeafDatePlan>,
  deltaDays: number,
): Map<string, LeafDatePlan> {
  if (deltaDays === 0) return plans;
  const next = new Map<string, LeafDatePlan>();
  for (const [wbs, p] of plans) {
    next.set(wbs, {
      ...p,
      baselineStart: addDaysIso(p.baselineStart, deltaDays),
      baselineEnd: addDaysIso(p.baselineEnd, deltaDays),
      forecastStart: addDaysIso(p.forecastStart, deltaDays),
      forecastEnd: addDaysIso(p.forecastEnd, deltaDays),
    });
  }
  return next;
}

/**
 * Latest-start (ALAP) CPM from Production Start gate — no artificial project
 * start floors. Parallel branches keep float; schedule begins as late as
 * FS/SS/FF/SF + durations allow while terminals finish ≤ gate.
 */
export function simulateMasterBaseline(
  rows: readonly AnalystRow[],
  edges: readonly FsEdge[],
): MasterSimResult {
  const leaves = rows.filter(
    (r) => r.kind === 'work' || r.kind === 'checkpoint',
  );
  const byWbs = new Map(leaves.map((r) => [r.wbs, r] as const));
  const audit: ScheduleAuditDecision[] = [];
  const { order, preds, succs } = buildTopo(byWbs, edges, audit);
  const gate = MASTER_SIM_ASSUMPTIONS.productionStartBaseline;

  const plans = alapPass(order, byWbs, succs, gate);

  audit.push({
    id: 'alap_from_gate',
    kind: 'fit_slide',
    detail: `ALAP from gate ${gate}; floorsUsed=false; leafCount=${plans.size}`,
    decisionRu:
      'Обратный (latest-start) расчёт от PS без project-start floors — ветки с float не тянут весь предпроект раньше нужного',
  });

  const projectRanges: MasterSimResult['projectRanges'] = [];
  let terminalBaselineMax = '0001-01-01';
  let earliestNecessaryStart = '9999-12-31';
  for (const w of PROJECT_BASELINE_WINDOWS) {
    const inProj = leaves.filter((r) => r.projectNo === w.projectNo);
    if (inProj.length === 0) continue;
    let min = '9999-12-31';
    let max = '0001-01-01';
    for (const r of inProj) {
      const p = plans.get(r.wbs);
      if (!p) continue;
      if (p.baselineStart < min) min = p.baselineStart;
      if (p.baselineEnd > max) max = p.baselineEnd;
      if (p.baselineStart < earliestNecessaryStart) {
        earliestNecessaryStart = p.baselineStart;
      }
    }
    projectRanges.push({ projectNo: w.projectNo, min, max });
    if (max > terminalBaselineMax) terminalBaselineMax = max;
  }
  for (const p of plans.values()) {
    if (p.baselineStart < earliestNecessaryStart) {
      earliestNecessaryStart = p.baselineStart;
    }
  }

  // Critical path via unconstrained ASAP (epoch floor) — not "any leaf at gate".
  const epoch = '2000-01-01';
  const asapFloors = new Map<string, string>();
  for (const wbs of byWbs.keys()) asapFloors.set(wbs, epoch);
  const asap = forwardPass(order, byWbs, preds, asapFloors);
  let asapTip = '';
  let asapMaxEnd = '0001-01-01';
  for (const [wbs, p] of asap) {
    if (p.baselineEnd >= asapMaxEnd) {
      asapMaxEnd = p.baselineEnd;
      asapTip = wbs;
    }
  }
  const criticalPathSample: string[] = [];
  let cursor: string | undefined = asapTip || undefined;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    criticalPathSample.unshift(cursor);
    const list = preds.get(cursor) ?? [];
    let best: string | null = null;
    let bestEnd = '0001-01-01';
    for (const p of list) {
      const pred = asap.get(p.from);
      if (pred && pred.baselineEnd >= bestEnd) {
        bestEnd = pred.baselineEnd;
        best = p.from;
      }
    }
    cursor = best ?? undefined;
  }

  let criticalPathDurationDays = 0;
  for (const wbs of criticalPathSample) {
    criticalPathDurationDays += asap.get(wbs)?.durationDays ?? 0;
  }
  const criticalTip = asapTip;

  const feasibility: MasterSimFeasibility = {
    method: 'alap_from_gate',
    gate,
    floorsUsed: false,
    criticalPath: criticalPathSample,
    criticalPathDurationDays,
    earliestNecessaryStart,
    spanToGateDays: daysBetween(earliestNecessaryStart, gate),
    preprojectBeforeFebLabel:
      earliestNecessaryStart < MASTER_SIM_ASSUMPTIONS.executionPhaseStart,
    syntheticDurationsNoteRu:
      'Длительности листьев = PROJECT_BASELINE_WINDOWS.workDays (демо-assumption 6–10д по AN). Исходник MD даёт топологию/статусы, не календарные длительности. preferred window.start/end — soft в ALAP (later-only, relax), не hard floors.',
  };

  audit.push({
    id: 'phase_feasibility',
    kind: 'lag_absent',
    detail: `method=alap_from_gate; earliestNecessaryStart=${earliestNecessaryStart}; criticalPathDurationDays=${criticalPathDurationDays}; pathLen=${criticalPathSample.length}; tip=${criticalTip}; floorsUsed=false`,
    decisionRu: feasibility.preprojectBeforeFebLabel
      ? `После ALAP без floors план необходимо начинаетcя ${earliestNecessaryStart} (сумма duration на critical path ${criticalPathDurationDays}д, synthetic workDays). Feb — UI-метка construction gate, не доказанный доменный запрет старта.`
      : `ALAP earliestNecessaryStart=${earliestNecessaryStart} ≥ Feb label; Feb остаётся UI-меткой construction gate.`,
  });

  return {
    byWbs: plans,
    audit,
    projectRanges,
    terminalBaselineMax,
    criticalPathSample,
    feasibility,
  };
}

/**
 * Latest finish/start from gate. Soft preferred window.end is NOT a hard
 * constraint (would re-introduce early push); only gate + link semantics.
 */
function alapPass(
  order: string[],
  byWbs: Map<string, AnalystRow>,
  succs: Map<string, { to: string; type: LinkType; lagDays: number }[]>,
  gate: string,
): Map<string, LeafDatePlan> {
  const plans = new Map<string, LeafDatePlan>();
  const reverse = [...order].reverse();
  for (const wbs of reverse) {
    const row = byWbs.get(wbs)!;
    const dur = Math.max(durationFor(row), 0);
    const outs = succs.get(wbs) ?? [];
    let lf = gate;
    if (outs.length > 0) {
      lf = '9999-12-31';
      for (const s of outs) {
        const succ = plans.get(s.to);
        if (!succ) continue;
        // Pred must finish so succ can meet its latest dates.
        let predLf: string;
        if (s.type === 'FS') {
          // succ.LS >= pred.LF + lag ⇒ pred.LF <= succ.LS - lag
          predLf = addDaysIso(succ.baselineStart, -s.lagDays);
        } else if (s.type === 'SS') {
          // succ.LS >= pred.LS + lag ⇒ pred.LS <= succ.LS - lag
          // ⇒ pred.LF = pred.LS + dur <= succ.LS - lag + dur
          predLf = addDaysIso(succ.baselineStart, -s.lagDays + dur);
        } else if (s.type === 'FF') {
          // succ.LF >= pred.LF + lag ⇒ pred.LF <= succ.LF - lag
          predLf = addDaysIso(succ.baselineEnd, -s.lagDays);
        } else {
          // SF: succ.LF >= pred.LS + lag ⇒ pred.LS <= succ.LF - lag
          // ⇒ pred.LF <= succ.LF - lag + dur
          predLf = addDaysIso(succ.baselineEnd, -s.lagDays + dur);
        }
        if (predLf < lf) lf = predLf;
      }
      if (lf === '9999-12-31') lf = gate;
    }
    // Never finish after gate.
    if (lf > gate) lf = gate;
    let ls = addDaysIso(lf, -dur);
    // Guard zero/negative duration checkpoints: start == end.
    if (dur === 0) ls = lf;
    // Soft preferred window.start: pull later (never earlier) when float allows.
    // Relaxed when successor LF cannot absorb preferred+dur — not a hard floor.
    const preferredStart = projectWindowFor(row.projectNo).start;
    if (dur > 0 && preferredStart && ls < preferredStart) {
      const preferredEnd = addDaysIso(preferredStart, dur);
      if (preferredEnd <= lf) {
        ls = preferredStart;
        lf = preferredEnd;
      }
    }
    plans.set(wbs, {
      wbs,
      baselineStart: ls,
      baselineEnd: lf,
      forecastStart: ls,
      forecastEnd: lf,
      durationDays: dur,
    });
  }
  return plans;
}

export type DisplayLifecycle = {
  status: 'Waiting' | 'OnSchedule' | 'Delayed' | 'Completed';
  progressPct: number;
  actualStart: string | null;
  actualEnd: string | null;
  /** True when display status/progress differs from raw source emoji mapping. */
  normalizedFromSource: boolean;
};

export type RealizedLeaf = {
  wbs: string;
  realizedStart: string;
  realizedEnd: string;
};

/** @deprecated One immutable timeline — kept for call-site compat. */
export type RealizedScenarioKey = 'calm' | 'crisis' | 'recovery';

export function realizedScenarioForSnapshot(
  snapshotId: string,
): RealizedScenarioKey {
  if (snapshotId === 'S') return 'recovery';
  if (snapshotId === 'A' || snapshotId === 'B') return 'calm';
  return 'crisis';
}

function isFrozenCompleted(baselineEnd: string, eventAsOf: string): boolean {
  return baselineEnd <= eventAsOf;
}

/**
 * ONE immutable realized timeline for the whole demo history.
 * sourceStatus/emoji is provenance only.
 *
 * Events (in order):
 * 1) Start from baseline CPM dates.
 * 2) Crisis at crisisOnsetAsOf: slip unfinished HVAC seeds (+crisisSlipDays), then
 *    topo-forward FS/SS/FF/SF on the actual plane. Leaves already completed by
 *    crisis onset stay frozen.
 * 3) Recovery from recoveryOnsetAsOf: pull only still-open mandatory work so tips
 *    end ≤ productionStartRecoveryS (09-22). Completed facts before recovery stay.
 *
 * Forecast C 10-06 remains on the forecast plane (applyForecastGraph), not here.
 */
export function buildRealizedTimeline(
  baselinePlans: Map<string, LeafDatePlan>,
  edges: readonly FsEdge[],
  rows: readonly AnalystRow[],
  _slipDays = 0,
  _scenario: RealizedScenarioKey = 'crisis',
): Map<string, RealizedLeaf> {
  void _slipDays;
  void _scenario;
  const leaves = rows.filter(
    (r) => r.kind === 'work' || r.kind === 'checkpoint',
  );
  const byWbs = new Map(leaves.map((r) => [r.wbs, r] as const));
  const audit: ScheduleAuditDecision[] = [];
  const { order, preds } = buildTopo(byWbs, edges, audit);

  const crisis = MASTER_SIM_ASSUMPTIONS.crisisOnsetAsOf;
  const slip = MASTER_SIM_ASSUMPTIONS.crisisSlipDays;
  const recovery = MASTER_SIM_ASSUMPTIONS.recoveryOnsetAsOf;
  const launch = MASTER_SIM_ASSUMPTIONS.productionStartRecoveryS;

  const out = new Map<string, RealizedLeaf>();

  // --- Crisis pass: frozen completed + HVAC slip + graph propagate ---
  for (const wbs of order) {
    const base = baselinePlans.get(wbs);
    if (!base) continue;
    const row = byWbs.get(wbs);
    const dur = base.durationDays;
    const projectNo = row?.projectNo ?? 0;

    if (isFrozenCompleted(base.baselineEnd, crisis)) {
      out.set(wbs, {
        wbs,
        realizedStart: base.baselineStart,
        realizedEnd: base.baselineEnd,
      });
      continue;
    }

    const seed = isForecastSlipSeed(wbs, projectNo);
    let seedStart = base.baselineStart;
    let seedEnd = base.baselineEnd;
    if (seed) {
      if (base.baselineStart >= crisis) {
        seedStart = addDaysIso(base.baselineStart, slip);
        seedEnd = addDaysIso(base.baselineEnd, slip);
      } else {
        // Already started before crisis: keep start fact, extend finish.
        seedStart = base.baselineStart;
        seedEnd = addDaysIso(base.baselineEnd, slip);
      }
    }

    let es = seedStart;
    for (const p of preds.get(wbs) ?? []) {
      const pred = out.get(p.from);
      if (!pred) continue;
      es = maxIso(
        es,
        earliestStartFromPred(
          p.type,
          pred.realizedStart,
          pred.realizedEnd,
          dur,
          p.lagDays,
        ),
      );
    }
    // Started-before-crisis: do not push start later than the historical start fact
    // unless predecessors force it (then predecessors win).
    if (seed && base.baselineStart < crisis) {
      es = maxIso(base.baselineStart, es);
    }

    let ef = addDaysIso(es, Math.max(dur, 0));
    if (seed) {
      ef = maxIso(ef, seedEnd);
    }
    out.set(wbs, { wbs, realizedStart: es, realizedEnd: ef });
  }

  for (const [wbs, base] of baselinePlans) {
    if (!out.has(wbs)) {
      out.set(wbs, {
        wbs,
        realizedStart: base.baselineStart,
        realizedEnd: base.baselineEnd,
      });
    }
  }

  // --- Recovery pass: slide only leaves still open at recovery onset ---
  let openMax = '0001-01-01';
  for (const [wbs, leaf] of out) {
    if (MASTER_SIM_ASSUMPTIONS.optionalPostLaunchWbs.includes(wbs)) continue;
    if (leaf.realizedEnd <= recovery) continue;
    if (leaf.realizedEnd > openMax) openMax = leaf.realizedEnd;
  }
  if (openMax > launch) {
    const delta = -daysBetween(launch, openMax);
    for (const [wbs, leaf] of out) {
      if (MASTER_SIM_ASSUMPTIONS.optionalPostLaunchWbs.includes(wbs)) continue;
      if (leaf.realizedEnd <= recovery) continue;
      out.set(wbs, {
        wbs,
        realizedStart: addDaysIso(leaf.realizedStart, delta),
        realizedEnd: addDaysIso(leaf.realizedEnd, delta),
      });
    }
  }

  // Final topo repair on non-frozen leaves: enforce pred types/lag after slides.
  // Do NOT per-leaf clamp to launch (breaks FS); re-slide open chain if needed.
  for (let pass = 0; pass < 3; pass++) {
    for (const wbs of order) {
      const base = baselinePlans.get(wbs);
      const leaf = out.get(wbs);
      if (!base || !leaf) continue;
      if (isFrozenCompleted(base.baselineEnd, crisis)) {
        out.set(wbs, {
          wbs,
          realizedStart: base.baselineStart,
          realizedEnd: base.baselineEnd,
        });
        continue;
      }
      const dur = base.durationDays;
      let es = leaf.realizedStart;
      for (const p of preds.get(wbs) ?? []) {
        const pred = out.get(p.from);
        if (!pred) continue;
        es = maxIso(
          es,
          earliestStartFromPred(
            p.type,
            pred.realizedStart,
            pred.realizedEnd,
            dur,
            p.lagDays,
          ),
        );
      }
      const ef = addDaysIso(es, Math.max(dur, 0));
      out.set(wbs, {
        wbs,
        realizedStart: es,
        realizedEnd: maxIso(ef, leaf.realizedEnd),
      });
    }
    let tip = '0001-01-01';
    for (const [wbs, leaf] of out) {
      if (MASTER_SIM_ASSUMPTIONS.optionalPostLaunchWbs.includes(wbs)) continue;
      if (leaf.realizedEnd > tip) tip = leaf.realizedEnd;
    }
    if (tip <= launch) break;
    const delta = -daysBetween(launch, tip);
    for (const [wbs, leaf] of out) {
      if (MASTER_SIM_ASSUMPTIONS.optionalPostLaunchWbs.includes(wbs)) continue;
      if (
        isFrozenCompleted(
          baselinePlans.get(wbs)?.baselineEnd ?? leaf.realizedEnd,
          crisis,
        )
      ) {
        continue;
      }
      out.set(wbs, {
        wbs,
        realizedStart: addDaysIso(leaf.realizedStart, delta),
        realizedEnd: addDaysIso(leaf.realizedEnd, delta),
      });
    }
  }

  void audit;
  return out;
}

/**
 * asOf view of a realized leaf. Forecast dates on `plan` affect Delayed vs OnSchedule
 * only while in progress; they never rewrite realized actuals.
 */
export function deriveLifecycleAtAsOf(
  plan: LeafDatePlan,
  realized: RealizedLeaf,
  asOf: string,
  sourceStatus: AnalystSourceStatus = 'waiting',
): DisplayLifecycle {
  const rs = realized.realizedStart;
  const re = realized.realizedEnd;

  if (asOf < rs) {
    return {
      status: 'Waiting',
      progressPct: 0,
      actualStart: null,
      actualEnd: null,
      normalizedFromSource: sourceStatus !== 'waiting',
    };
  }

  if (asOf >= re) {
    return {
      status: 'Completed',
      progressPct: 100,
      actualStart: rs,
      actualEnd: re,
      normalizedFromSource: sourceStatus !== 'completed',
    };
  }

  // In progress: started, not finished.
  const span = Math.max(daysBetween(rs, re), 1);
  const done = Math.min(Math.max(daysBetween(rs, asOf), 0), span);
  const progressPct = Math.max(
    5,
    Math.min(95, Math.round((done / span) * 100)),
  );
  const delayed =
    plan.baselineEnd < asOf ||
    plan.forecastEnd > plan.baselineEnd ||
    sourceStatus === 'delayed' ||
    sourceStatus === 'missed';
  return {
    status: delayed ? 'Delayed' : 'OnSchedule',
    progressPct,
    actualStart: rs,
    actualEnd: null,
    normalizedFromSource:
      sourceStatus === 'waiting' || sourceStatus === 'completed',
  };
}

/**
 * @deprecated Prefer buildRealizedTimeline + deriveLifecycleAtAsOf.
 * Kept for narrow unit checks of completed provenance mapping.
 */
export function historicalFactsFromSource(
  plan: LeafDatePlan,
  sourceStatus: AnalystSourceStatus,
): { actualStart: string | null; actualEnd: string | null } {
  // Provenance helper only — not used by runtime lifecycle.
  if (sourceStatus === 'completed') {
    return {
      actualStart: plan.baselineStart,
      actualEnd: plan.baselineEnd,
    };
  }
  return { actualStart: null, actualEnd: null };
}

export function forecastSlipDaysForSnapshot(snapshotId: string): number {
  if (snapshotId === 'A' || snapshotId === 'B') return 0;
  if (snapshotId === 'S') return 0;
  if (
    snapshotId === 'O' ||
    snapshotId === 'P' ||
    snapshotId === 'Q' ||
    snapshotId === 'R'
  ) {
    return 7;
  }
  return 21;
}

/** Seed WBS that receive initial HVAC crisis slip (then propagate). */
export function isForecastSlipSeed(wbs: string, projectNo: number): boolean {
  return projectNo === 9 || wbs.startsWith('9.');
}

/**
 * Propagate forecast dates: seed slip on HVAC, then forward through full edge graph.
 */
export function applyForecastGraph(
  baselinePlans: Map<string, LeafDatePlan>,
  edges: readonly FsEdge[],
  rows: readonly AnalystRow[],
  slipDays: number,
): Map<string, LeafDatePlan> {
  const leaves = rows.filter(
    (r) => r.kind === 'work' || r.kind === 'checkpoint',
  );
  const byWbs = new Map(leaves.map((r) => [r.wbs, r] as const));
  const audit: ScheduleAuditDecision[] = [];
  const { order, preds } = buildTopo(byWbs, edges, audit);

  const out = new Map<string, LeafDatePlan>();
  for (const wbs of order) {
    const base = baselinePlans.get(wbs);
    if (!base) continue;
    const row = byWbs.get(wbs)!;
    const dur = base.durationDays;
    let seedStart = base.baselineStart;
    let seedEnd = base.baselineEnd;
    if (slipDays !== 0 && isForecastSlipSeed(wbs, row.projectNo)) {
      seedStart = addDaysIso(base.baselineStart, slipDays);
      seedEnd = addDaysIso(base.baselineEnd, slipDays);
    }

    let es = seedStart;
    for (const p of preds.get(wbs) ?? []) {
      const pred = out.get(p.from) ?? baselinePlans.get(p.from);
      if (!pred) continue;
      es = maxIso(
        es,
        earliestStartFromPred(
          p.type,
          pred.forecastStart,
          pred.forecastEnd,
          dur,
          p.lagDays,
        ),
      );
    }
    // Seeded nodes keep at least their slipped start.
    if (slipDays !== 0 && isForecastSlipSeed(wbs, row.projectNo)) {
      es = maxIso(es, seedStart);
    }
    const ef =
      slipDays !== 0 && isForecastSlipSeed(wbs, row.projectNo)
        ? maxIso(addDaysIso(es, dur), seedEnd)
        : addDaysIso(es, Math.max(dur, 0));
    out.set(wbs, {
      ...base,
      forecastStart: es,
      forecastEnd: ef,
    });
  }

  // Copy any missing
  for (const [wbs, base] of baselinePlans) {
    if (!out.has(wbs)) out.set(wbs, { ...base });
  }
  return out;
}

export type WorkLikeForLifecycle = {
  id: string;
  wbs?: string | null;
  startDate: string;
  endDate: string;
  baselineStart?: string | null;
  baselineEnd?: string | null;
  status: 'Waiting' | 'OnSchedule' | 'Delayed' | 'Completed';
  progressPct?: number | null;
  actualStart?: string | null;
  actualEnd?: string | null;
  sourceStatus?: string | null;
};

export type LifecycleGraphContext = {
  edges: readonly FsEdge[];
  rows: readonly AnalystRow[];
  /** Baseline plans keyed by WBS (from simulateMasterBaseline). */
  baselineByWbs: Map<string, LeafDatePlan>;
};

/**
 * Apply forecast graph + realized lifecycle. WK-* skipped (showcase overlays).
 * sourceStatus is provenance only; completion comes from realized timeline.
 */
export function applyMasterLifecycleToWorks<T extends WorkLikeForLifecycle>(
  works: readonly T[],
  asOf: string,
  snapshotId: string,
  graph?: LifecycleGraphContext,
): T[] {
  const slip = forecastSlipDaysForSnapshot(snapshotId);
  let forecastByWbs: Map<string, LeafDatePlan> | null = null;
  let realizedByWbs: Map<string, RealizedLeaf> | null = null;
  if (graph && graph.baselineByWbs.size > 0) {
    forecastByWbs = applyForecastGraph(
      graph.baselineByWbs,
      graph.edges,
      graph.rows,
      slip,
    );
    // One immutable history — same realized map for every snapshot letter.
    realizedByWbs = buildRealizedTimeline(
      graph.baselineByWbs,
      graph.edges,
      graph.rows,
    );
  }

  return works.map((work) => {
    if (work.id.startsWith('WK-')) return work;
    const wbs = work.wbs ?? work.id;
    const baselineStart = work.baselineStart ?? work.startDate;
    const baselineEnd = work.baselineEnd ?? work.endDate;
    const fromGraph = forecastByWbs?.get(wbs);
    const plan: LeafDatePlan = fromGraph ?? {
      wbs,
      baselineStart,
      baselineEnd,
      forecastStart: baselineStart,
      forecastEnd: baselineEnd,
      durationDays: Math.max(0, daysBetween(baselineStart, baselineEnd)),
    };
    const locked: LeafDatePlan = {
      ...plan,
      baselineStart,
      baselineEnd,
      forecastStart: fromGraph?.forecastStart ?? plan.forecastStart,
      forecastEnd: fromGraph?.forecastEnd ?? plan.forecastEnd,
    };
    const realized = realizedByWbs?.get(wbs) ?? {
      wbs,
      realizedStart: baselineStart,
      realizedEnd: baselineEnd,
    };
    const source = (work.sourceStatus ?? 'waiting') as AnalystSourceStatus;
    const life = deriveLifecycleAtAsOf(locked, realized, asOf, source);
    return {
      ...work,
      startDate: locked.forecastStart,
      endDate: locked.forecastEnd,
      baselineStart: locked.baselineStart,
      baselineEnd: locked.baselineEnd,
      status: life.status,
      progressPct: life.progressPct,
      actualStart: life.actualStart,
      actualEnd: life.actualEnd,
    };
  });
}

/** @deprecated Prefer applyForecastGraph. Kept for narrow unit checks. */
export function applyForecastSlip(
  plan: LeafDatePlan,
  projectNo: number,
  slipDays: number,
): LeafDatePlan {
  if (slipDays === 0) return plan;
  if (projectNo !== 9) return plan;
  return {
    ...plan,
    forecastStart: addDaysIso(plan.baselineStart, slipDays),
    forecastEnd: addDaysIso(plan.baselineEnd, slipDays),
  };
}

let registeredLifecycleGraph: LifecycleGraphContext | null = null;

export function registerLifecycleGraph(graph: LifecycleGraphContext): void {
  registeredLifecycleGraph = graph;
}

export function getRegisteredLifecycleGraph(): LifecycleGraphContext | null {
  return registeredLifecycleGraph;
}
