import {
  DEMO_PROJECT_BAC_RUB,
  DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
  DEMO_WORKSTREAM_BUDGETS_SUM_RUB,
  assertFrozenDemoBacCbs,
  assertIntegerRub,
  assertProjectCostInvariants,
  assertWorkstreamCostInvariants,
  computeContingencyRemainingRub,
  computeEacRub,
  computeVacRub,
  isIntegerRub,
} from './money';

describe('R2-C1 money contract', () => {
  it('freezes Demo BAC CBS: BAC = Σ WS + contingency', () => {
    expect(DEMO_PROJECT_BAC_RUB).toBe(6_200_000_000);
    expect(DEMO_WORKSTREAM_BUDGETS_SUM_RUB).toBe(5_850_000_000);
    expect(DEMO_PROJECT_CONTINGENCY_TOTAL_RUB).toBe(350_000_000);
    expect(() => assertFrozenDemoBacCbs()).not.toThrow();
  });

  it('accepts only integer RUB values', () => {
    expect(isIntegerRub(0)).toBe(true);
    expect(isIntegerRub(6_200_000_000)).toBe(true);
    expect(isIntegerRub(1.5)).toBe(false);
    expect(isIntegerRub('100')).toBe(false);
    expect(() => assertIntegerRub(1.5, 'x')).toThrow(/integer RUB/);
  });

  it('computes EAC = Actual + ETC (never +Committed)', () => {
    expect(computeEacRub(100, 50)).toBe(150);
    const snapshotA = {
      approvedBudgetRub: DEMO_PROJECT_BAC_RUB,
      actualCostRub: 0,
      committedCostRub: 980_000_000,
      etcRub: DEMO_PROJECT_BAC_RUB,
      eacRub: DEMO_PROJECT_BAC_RUB,
      vacRub: 0,
      contingencyTotalRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
      contingencyConsumedRub: 0,
      contingencyRemainingRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
    };
    expect(() => assertProjectCostInvariants(snapshotA)).not.toThrow();
    expect(snapshotA.eacRub).toBe(snapshotA.actualCostRub + snapshotA.etcRub);
    // Double-count formula must differ when committed > 0.
    expect(
      snapshotA.actualCostRub +
        snapshotA.committedCostRub +
        snapshotA.etcRub,
    ).toBeGreaterThan(snapshotA.eacRub);
  });

  it('VAC = BAC − EAC; contingency remaining = total − consumed', () => {
    expect(computeVacRub(DEMO_PROJECT_BAC_RUB, DEMO_PROJECT_BAC_RUB)).toBe(0);
    expect(computeContingencyRemainingRub(350_000_000, 40_000_000)).toBe(
      310_000_000,
    );
  });

  it('rejects broken project/workstream invariants', () => {
    expect(() =>
      assertProjectCostInvariants({
        approvedBudgetRub: DEMO_PROJECT_BAC_RUB,
        actualCostRub: 100,
        committedCostRub: 0,
        etcRub: 50,
        eacRub: 999,
        vacRub: 0,
        contingencyTotalRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
        contingencyConsumedRub: 0,
        contingencyRemainingRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
      }),
    ).toThrow(/eacRub/);

    expect(() =>
      assertWorkstreamCostInvariants({
        approvedControlBudgetRub: 100,
        actualCostRub: 10,
        committedCostRub: 0,
        etcRub: 90,
        eacRub: 100,
        vacRub: 5,
      }),
    ).toThrow(/vacRub/);
  });
});
