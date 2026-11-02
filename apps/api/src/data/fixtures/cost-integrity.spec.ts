import {
  DEMO_PROJECT_BAC_RUB,
  DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
  DEMO_WORKSTREAM_BUDGETS_SUM_RUB,
  DEMO_WORKSTREAM_CBS_RUB,
  assertFrozenDemoBacCbs,
  assertIntegerRub,
  computeEacRub,
  isIntegerRub,
  sumWorkstreamCbsRub,
} from '../../contracts/money';
import { WORKSTREAM_IDS } from '../workstream-ids';
import { EQUIPMENT_CATALOG } from './catalog';
import {
  COST_SNAPSHOTS,
  computeProjectLevelForecastRub,
} from './build-costs';
import {
  COST_BEARING_EQUIPMENT,
  COST_BEARING_EQUIPMENT_IDS,
} from './cost-equipment';
import { PROJECT_COST_STORY } from './cost-project-story';
import type { PopulatedSnapshotId } from './types';

const ALL = Object.keys(PROJECT_COST_STORY) as PopulatedSnapshotId[];

describe('R2-M1 / R1 cost integrity (DOC-PROD-026)', () => {
  it('freezes BAC / Σ WS / contingency CBS', () => {
    expect(DEMO_PROJECT_BAC_RUB).toBe(6_200_000_000);
    expect(DEMO_WORKSTREAM_BUDGETS_SUM_RUB).toBe(5_850_000_000);
    expect(DEMO_PROJECT_CONTINGENCY_TOTAL_RUB).toBe(350_000_000);
    expect(sumWorkstreamCbsRub()).toBe(5_850_000_000);
    expect(
      DEMO_WORKSTREAM_BUDGETS_SUM_RUB + DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
    ).toBe(DEMO_PROJECT_BAC_RUB);
    expect(() => assertFrozenDemoBacCbs()).not.toThrow();
    expect(DEMO_WORKSTREAM_CBS_RUB['WS-HVAC']).toBe(880_000_000);
  });

  it('matches DOC-PROD-026 project A–S totals exactly', () => {
    for (const id of ALL) {
      const authored = PROJECT_COST_STORY[id];
      const p = COST_SNAPSHOTS[id].project;
      expect(p.approvedBudgetRub).toBe(DEMO_PROJECT_BAC_RUB);
      expect(p.actualCostRub).toBe(authored.actualCostRub);
      expect(p.committedCostRub).toBe(authored.committedCostRub);
      expect(p.etcRub).toBe(authored.etcRub);
      expect(p.contingencyConsumedRub).toBe(authored.contingencyConsumedRub);
      expect(p.eacRub).toBe(authored.actualCostRub + authored.etcRub);
      expect(p.vacRub).toBe(DEMO_PROJECT_BAC_RUB - p.eacRub);
      expect(p.contingencyRemainingRub).toBe(
        DEMO_PROJECT_CONTINGENCY_TOTAL_RUB - authored.contingencyConsumedRub,
      );
    }
  });

  it('enforces Project EAC/VAC/contingency formulas on every snapshot', () => {
    for (const id of ALL) {
      const p = COST_SNAPSHOTS[id].project;
      expect(p.eacRub).toBe(computeEacRub(p.actualCostRub, p.etcRub));
      expect(p.vacRub).toBe(p.approvedBudgetRub - p.eacRub);
      expect(p.contingencyRemainingRub).toBe(
        p.contingencyTotalRub - p.contingencyConsumedRub,
      );
      expect(p.contingencyConsumedRub).toBeGreaterThanOrEqual(0);
      expect(p.contingencyConsumedRub).toBeLessThanOrEqual(
        p.contingencyTotalRub,
      );
    }
  });

  it('enforces WS EAC/VAC formulas and frozen CBS per Workstream', () => {
    for (const id of ALL) {
      const c = COST_SNAPSHOTS[id];
      expect(c.workstreams).toHaveLength(WORKSTREAM_IDS.length);
      for (const ws of c.workstreams) {
        expect(ws.approvedControlBudgetRub).toBe(
          DEMO_WORKSTREAM_CBS_RUB[ws.workstream],
        );
        expect(ws.eacRub).toBe(ws.actualCostRub + ws.etcRub);
        expect(ws.vacRub).toBe(ws.approvedControlBudgetRub - ws.eacRub);
      }
      expect(
        c.workstreams.reduce((s, w) => s + w.approvedControlBudgetRub, 0),
      ).toBe(DEMO_WORKSTREAM_BUDGETS_SUM_RUB);
    }
  });

  it('reconciles Project EAC = Σ WS EAC + projectLevelForecastRub', () => {
    for (const id of ALL) {
      const c = COST_SNAPSHOTS[id];
      const sum = (pick: (w: (typeof c.workstreams)[number]) => number) =>
        c.workstreams.reduce((s, w) => s + pick(w), 0);

      expect(sum((w) => w.actualCostRub)).toBe(c.project.actualCostRub);
      expect(sum((w) => w.committedCostRub)).toBe(c.project.committedCostRub);

      const expectedResidual = computeProjectLevelForecastRub(
        c.project.contingencyRemainingRub,
        c.project.etcRub,
      );
      expect(c.reconciliation.projectLevelForecastRub).toBe(expectedResidual);
      expect(c.reconciliation.workstreamEacSumRub).toBe(sum((w) => w.eacRub));
      expect(c.project.eacRub).toBe(
        c.reconciliation.workstreamEacSumRub +
          c.reconciliation.projectLevelForecastRub,
      );
      expect(sum((w) => w.etcRub)).toBe(
        c.project.etcRub - c.reconciliation.projectLevelForecastRub,
      );

      // Contingency is not silently poured into WS EAC as if it were WS-09.
      if (c.reconciliation.projectLevelForecastRub > 0) {
        expect(sum((w) => w.eacRub)).toBeLessThan(c.project.eacRub);
      }
    }
  });

  it('Snapshot A: unused contingency does not create false WS overrun', () => {
    const a = COST_SNAPSHOTS.A;
    expect(a.project.approvedBudgetRub).toBe(6_200_000_000);
    expect(a.project.eacRub).toBe(6_200_000_000);
    expect(a.project.vacRub).toBe(0);
    expect(a.project.contingencyConsumedRub).toBe(0);
    expect(a.project.contingencyRemainingRub).toBe(350_000_000);

    const wsBac = a.workstreams.reduce(
      (s, w) => s + w.approvedControlBudgetRub,
      0,
    );
    const wsEac = a.workstreams.reduce((s, w) => s + w.eacRub, 0);
    expect(wsBac).toBe(5_850_000_000);
    expect(a.reconciliation.projectLevelForecastRub).toBe(350_000_000);
    expect(wsEac).toBe(5_850_000_000);
    expect(wsEac).not.toBe(a.project.eacRub);
    // No artificial +350M WS overrun vs control budgets from unused reserve.
    expect(wsEac - wsBac).toBe(0);
    expect(a.project.eacRub).toBe(wsEac + a.reconciliation.projectLevelForecastRub);
  });

  it('requires all money fields to be safe integers (no float/NaN)', () => {
    for (const id of ALL) {
      const c = COST_SNAPSHOTS[id];
      for (const [k, v] of Object.entries(c.project)) {
        expect(isIntegerRub(v)).toBe(true);
        expect(() => assertIntegerRub(v, `${id}.project.${k}`)).not.toThrow();
      }
      for (const [k, v] of Object.entries(c.reconciliation)) {
        expect(isIntegerRub(v)).toBe(true);
        expect(() =>
          assertIntegerRub(v, `${id}.reconciliation.${k}`),
        ).not.toThrow();
      }
      for (const ws of c.workstreams) {
        for (const [k, v] of Object.entries(ws)) {
          if (k === 'workstream') continue;
          expect(isIntegerRub(v)).toBe(true);
        }
      }
      for (const eq of c.equipment) {
        for (const [k, v] of Object.entries(eq)) {
          if (k === 'equipmentId' || v === undefined) continue;
          expect(isIntegerRub(v)).toBe(true);
        }
      }
    }
  });

  it('guards Committed double-count: EAC !== Actual + Committed + ETC when committed > 0', () => {
    for (const id of ALL) {
      const p = COST_SNAPSHOTS[id].project;
      expect(p.eacRub).toBe(p.actualCostRub + p.etcRub);
      if (p.committedCostRub > 0) {
        expect(p.actualCostRub + p.committedCostRub + p.etcRub).toBeGreaterThan(
          p.eacRub,
        );
      }
      for (const ws of COST_SNAPSHOTS[id].workstreams) {
        expect(ws.eacRub).toBe(ws.actualCostRub + ws.etcRub);
        if (ws.committedCostRub > 0) {
          expect(
            ws.actualCostRub + ws.committedCostRub + ws.etcRub,
          ).toBeGreaterThan(ws.eacRub);
        }
      }
    }
  });

  it('keeps F EAC flat vs E and N EAC flat vs M (Decision non-auto money)', () => {
    expect(COST_SNAPSHOTS.F.project.eacRub).toBe(
      COST_SNAPSHOTS.E.project.eacRub,
    );
    expect(COST_SNAPSHOTS.F.project.vacRub).toBe(
      COST_SNAPSHOTS.E.project.vacRub,
    );
    expect(COST_SNAPSHOTS.N.project.eacRub).toBe(
      COST_SNAPSHOTS.M.project.eacRub,
    );
    expect(COST_SNAPSHOTS.F.project.actualCostRub).toBeGreaterThan(
      COST_SNAPSHOTS.E.project.actualCostRub,
    );
  });

  it('selective Equipment resolves, belongs to WS, and does not force Σ EQ = WS BAC', () => {
    expect(COST_BEARING_EQUIPMENT.length).toBeLessThan(52);
    expect(COST_BEARING_EQUIPMENT.length).toBeGreaterThanOrEqual(8);
    for (const id of ALL) {
      const c = COST_SNAPSHOTS[id];
      expect(c.equipment.map((e) => e.equipmentId).sort()).toEqual(
        [...COST_BEARING_EQUIPMENT_IDS].sort(),
      );
      for (const eq of c.equipment) {
        const cat =
          EQUIPMENT_CATALOG[eq.equipmentId as keyof typeof EQUIPMENT_CATALOG];
        expect(cat).toBeDefined();
        const def = COST_BEARING_EQUIPMENT.find(
          (d) => d.equipmentId === eq.equipmentId,
        )!;
        expect(cat.workstream).toBe(def.workstream);
      }
      const hvacEqApproved = c.equipment
        .filter((e) => {
          const cat =
            EQUIPMENT_CATALOG[e.equipmentId as keyof typeof EQUIPMENT_CATALOG];
          return cat.workstream === 'WS-HVAC';
        })
        .reduce((s, e) => s + (e.approvedCostRub ?? 0), 0);
      const hvacWs = c.workstreams.find((w) => w.workstream === 'WS-HVAC')!;
      expect(hvacWs.approvedControlBudgetRub).toBeGreaterThan(hvacEqApproved);
    }
  });

  it('Snapshot S closeout: residual 0 while unused contingencyRemaining remains outside EAC', () => {
    const s = COST_SNAPSHOTS.S;
    expect(s.project.actualCostRub).toBe(6_280_000_000);
    expect(s.project.etcRub).toBe(0);
    expect(s.project.eacRub).toBe(6_280_000_000);
    expect(s.project.vacRub).toBe(-80_000_000);
    expect(s.project.contingencyConsumedRub).toBe(320_000_000);
    expect(s.project.contingencyRemainingRub).toBe(30_000_000);
    expect(s.reconciliation.projectLevelForecastRub).toBe(0);
    expect(s.reconciliation.workstreamEacSumRub).toBe(s.project.eacRub);
  });
});
