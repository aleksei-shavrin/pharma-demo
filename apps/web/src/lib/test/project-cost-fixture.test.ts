import { describe, expect, it } from 'vitest';
import {
  DEMO_PROJECT_BAC_RUB,
  DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
} from '@/lib/api-client';
import {
  PROJECT_COST_FIXTURE_IDS,
  projectCostFixture,
} from './project-cost-fixture';

describe('projectCostFixture DOC-PROD-026 parity (R2-U1-R1)', () => {
  it('A/B/C/M/O/Q/S match frozen checkpoints', () => {
    const a = projectCostFixture('01');
    expect(a.eacRub).toBe(DEMO_PROJECT_BAC_RUB);
    expect(a.vacRub).toBe(0);
    expect(a.actualCostRub).toBe(120_000_000);
    expect(a.etcRub).toBe(6_080_000_000);

    const b = projectCostFixture('02');
    expect(b.actualCostRub).toBe(180_000_000);
    expect(b.committedCostRub).toBe(1_050_000_000);
    expect(b.etcRub).toBe(6_030_000_000);
    expect(b.eacRub).toBe(6_210_000_000);
    expect(b.vacRub).toBe(-10_000_000);
    expect(b.contingencyConsumedRub).toBe(0);
    expect(b.contingencyRemainingRub).toBe(350_000_000);

    const c = projectCostFixture('03');
    expect(c.actualCostRub).toBe(210_000_000);
    expect(c.committedCostRub).toBe(1_120_000_000);
    expect(c.etcRub).toBe(6_060_000_000);
    expect(c.eacRub).toBe(6_270_000_000);
    expect(c.vacRub).toBe(-70_000_000);
    expect(c.contingencyConsumedRub).toBe(40_000_000);
    expect(c.contingencyRemainingRub).toBe(310_000_000);

    const m = projectCostFixture('13');
    expect(m.actualCostRub).toBe(1_520_000_000);
    expect(m.etcRub).toBe(4_900_000_000);
    expect(m.eacRub).toBe(6_420_000_000);
    expect(m.vacRub).toBe(-220_000_000);
    expect(m.contingencyConsumedRub).toBe(230_000_000);
    expect(m.contingencyRemainingRub).toBe(120_000_000);

    const o = projectCostFixture('15');
    expect(o.actualCostRub).toBe(1_820_000_000);
    expect(o.etcRub).toBe(4_560_000_000);
    expect(o.eacRub).toBe(6_380_000_000);
    expect(o.vacRub).toBe(-180_000_000);
    expect(o.contingencyConsumedRub).toBe(250_000_000);
    expect(o.contingencyRemainingRub).toBe(100_000_000);

    const q = projectCostFixture('17');
    expect(q.actualCostRub).toBe(2_360_000_000);
    expect(q.etcRub).toBe(3_980_000_000);
    expect(q.eacRub).toBe(6_340_000_000);
    expect(q.vacRub).toBe(-140_000_000);
    expect(q.contingencyConsumedRub).toBe(280_000_000);
    expect(q.contingencyRemainingRub).toBe(70_000_000);

    const s = projectCostFixture('19');
    expect(s.actualCostRub).toBe(6_280_000_000);
    expect(s.etcRub).toBe(0);
    expect(s.eacRub).toBe(6_280_000_000);
    expect(s.vacRub).toBe(-80_000_000);
    expect(s.contingencyConsumedRub).toBe(320_000_000);
    expect(s.contingencyRemainingRub).toBe(30_000_000);
  });

  it('invariants hold for every 01–19 fixture', () => {
    expect(PROJECT_COST_FIXTURE_IDS).toHaveLength(19);
    for (const id of PROJECT_COST_FIXTURE_IDS) {
      const p = projectCostFixture(id);
      expect(p.approvedBudgetRub).toBe(DEMO_PROJECT_BAC_RUB);
      expect(p.contingencyTotalRub).toBe(DEMO_PROJECT_CONTINGENCY_TOTAL_RUB);
      expect(p.eacRub).toBe(p.actualCostRub + p.etcRub);
      expect(p.vacRub).toBe(p.approvedBudgetRub - p.eacRub);
      expect(p.contingencyRemainingRub).toBe(
        p.contingencyTotalRub - p.contingencyConsumedRub,
      );
    }
  });
});
