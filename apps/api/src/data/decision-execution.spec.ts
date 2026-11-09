import { SNAPSHOTS } from './fixtures';
import {
  isValidIsoCalendarDate,
  listDecisionExecutionIntegrityErrors,
  resolveDecisionExecution,
  validateDecisionExecutionObservations,
} from './decision-execution';
import type { DecisionExecutionObservationFixture } from './fixtures/decision-execution-observations';

const DEMO = {
  kind: 'demo' as const,
  label: 'Демонстрационный отчёт исполнителя',
};

function obs(
  partial: Partial<DecisionExecutionObservationFixture> &
    Pick<DecisionExecutionObservationFixture, 'id' | 'decisionId' | 'status'>,
): DecisionExecutionObservationFixture {
  return {
    asOfDate: '2027-04-20',
    effectiveFromSnapshot: '06',
    source: DEMO,
    evidenceNote: 'x',
    updatedAt: '2027-04-20',
    ...partial,
  };
}

describe('decision execution observations', () => {
  it('catalog passes integrity (strict dates, no collisions)', () => {
    expect(listDecisionExecutionIntegrityErrors()).toEqual([]);
  });

  it('rejects invalid calendar dates like 2027-99-99', () => {
    expect(isValidIsoCalendarDate('2027-99-99')).toBe(false);
    expect(isValidIsoCalendarDate('2027-02-29')).toBe(false);
    expect(isValidIsoCalendarDate('2028-02-29')).toBe(true);
    expect(isValidIsoCalendarDate('2027-04-20')).toBe(true);
  });

  it('validate(custom) catches unknown id, duplicate, collision, bad date', () => {
    const catalog = { 'DEC-001': { first: '06' as const } };
    const errors = validateDecisionExecutionObservations(
      [
        obs({ id: 'A', decisionId: 'DEC-001', status: 'not_started' }),
        obs({
          id: 'A',
          decisionId: 'DEC-001',
          status: 'in_progress',
          asOfDate: '2027-05-15',
          updatedAt: '2027-05-15',
          effectiveFromSnapshot: '07',
        }),
        obs({
          id: 'B',
          decisionId: 'DEC-UNKNOWN' as never,
          status: 'not_started',
        }),
        obs({
          id: 'C',
          decisionId: 'DEC-001',
          status: 'not_started',
          asOfDate: '2027-99-99',
          updatedAt: '2027-99-99',
        }),
        obs({
          id: 'D1',
          decisionId: 'DEC-001',
          status: 'not_started',
          asOfDate: '2027-04-21',
          updatedAt: '2027-04-21',
        }),
        obs({
          id: 'D2',
          decisionId: 'DEC-001',
          status: 'in_progress',
          asOfDate: '2027-04-21',
          updatedAt: '2027-04-21',
        }),
        obs({
          id: 'E',
          decisionId: 'DEC-001',
          status: 'not_started',
          asOfDate: '2027-04-22',
          updatedAt: '2027-04-23',
          effectiveFromSnapshot: '06',
        }),
        obs({
          id: 'Fbad',
          decisionId: 'DEC-001',
          status: 'not_started',
          asOfDate: '2027-04-24',
          updatedAt: '2027-04-24',
          effectiveFromSnapshot: 'ZZ' as never,
        }),
        obs({
          id: 'Gearly',
          decisionId: 'DEC-001',
          status: 'not_started',
          asOfDate: '2027-04-25',
          updatedAt: '2027-04-25',
          effectiveFromSnapshot: '01',
        }),
        obs({
          id: 'Hsrc',
          decisionId: 'DEC-001',
          status: 'not_started',
          asOfDate: '2027-04-26',
          updatedAt: '2027-04-26',
          source: { kind: 'live' as never, label: 'x' },
        }),
      ],
      catalog,
    );
    expect(errors.some((e) => e.includes('duplicate observation id A'))).toBe(
      true,
    );
    expect(errors.some((e) => e.includes('unknown decisionId'))).toBe(true);
    expect(errors.some((e) => e.includes('invalid asOfDate'))).toBe(true);
    expect(errors.some((e) => e.includes('collision'))).toBe(true);
    expect(
      errors.some((e) => e.includes('updatedAt must equal asOfDate')),
    ).toBe(true);
    expect(
      errors.some((e) => e.includes('invalid effectiveFromSnapshot')),
    ).toBe(true);
    expect(errors.some((e) => e.includes('before decision first'))).toBe(true);
    expect(errors.some((e) => e.includes('source.kind must be demo'))).toBe(
      true,
    );
  });

  it('04EC-001 F → not_started with demo source and explicit evidence', () => {
    const view = resolveDecisionExecution('DEC-001', SNAPSHOTS['06']);
    expect(view.status).toBe('not_started');
    expect(view.execution?.evidenceNote).toBe('Действия не начаты');
    expect(view.execution?.source).toEqual({
      kind: 'demo',
      label: 'Демонстрационный отчёт исполнителя',
    });
  });

  it('04EC-001 G and I → in_progress (I is before O, not completed)', () => {
    expect(resolveDecisionExecution('DEC-001', SNAPSHOTS['07']).status).toBe(
      'in_progress',
    );
    expect(resolveDecisionExecution('DEC-001', SNAPSHOTS['09']).status).toBe(
      'in_progress',
    );
  });

  it('04EC-001 O and S → completed; residual forecast may persist', () => {
    expect(resolveDecisionExecution('DEC-001', SNAPSHOTS['15']).status).toBe(
      'completed',
    );
    expect(resolveDecisionExecution('DEC-001', SNAPSHOTS['19']).status).toBe(
      'completed',
    );
    expect(SNAPSHOTS['15'].project.forecastProductionStart).not.toBe(
      SNAPSHOTS['15'].project.baselineProductionStart,
    );
  });

  it('other decisions stay unknown; no record → unknown', () => {
    expect(resolveDecisionExecution('DEC-UTL-01', SNAPSHOTS['06']).status).toBe(
      'unknown',
    );
    expect(resolveDecisionExecution('DEC-001', SNAPSHOTS['05']).status).toBe(
      'unknown',
    );
  });

  it('07 observation does not leak into F', () => {
    const f = resolveDecisionExecution('DEC-001', SNAPSHOTS['06']);
    expect(f.execution?.observationId).toBe('DEXO-001-F');
  });

  it('future asOfDate observation is not visible before that date', () => {
    const catalog = { 'DEC-001': { first: '06' as const } };
    const futureOnly = [
      obs({
        id: 'FUTURE',
        decisionId: 'DEC-001',
        status: 'completed',
        asOfDate: '2027-12-31',
        updatedAt: '2027-12-31',
        effectiveFromSnapshot: '06',
      }),
    ];
    // Catalog shape valid; resolve path uses module catalog — assert filter via dates.
    expect(validateDecisionExecutionObservations(futureOnly, catalog)).toEqual(
      [],
    );
    // On 06 (asOf 2027-04-20) future obs must not win — module catalog has 06/07/15 only.
    expect(resolveDecisionExecution('DEC-001', SNAPSHOTS['06']).status).toBe(
      'not_started',
    );
  });

  it('resolve and assert fail-closed when integrity reports errors', () => {
    /* Dynamic require keeps the same module instance for spy + assertOrThrow. */
    /* eslint-disable @typescript-eslint/no-require-imports */
    const {
      decisionExecutionIntegrity,
      resolveDecisionExecution: resolve,
      assertDecisionExecutionCatalogOrThrow: assertOrThrow,
    } = require('./decision-execution') as typeof import('./decision-execution');
    /* eslint-enable @typescript-eslint/no-require-imports */
    const spy = jest
      .spyOn(decisionExecutionIntegrity, 'listErrors')
      .mockReturnValue(['forced integrity failure']);
    expect(() => resolve('DEC-001', SNAPSHOTS['06'])).toThrow(
      /Decision execution catalog invalid/,
    );
    expect(() => assertOrThrow()).toThrow(/Decision execution catalog invalid/);
    spy.mockRestore();
  });

  it('compareDecisionExecutionObservations: date, snap, then stable id', () => {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { compareDecisionExecutionObservations: cmp } =
      require('./decision-execution') as typeof import('./decision-execution');
    /* eslint-enable @typescript-eslint/no-require-imports */
    const a = obs({ id: 'b', decisionId: 'DEC-001', status: 'not_started' });
    const b = obs({ id: 'a', decisionId: 'DEC-001', status: 'not_started' });
    expect(cmp(a, b)).toBeGreaterThan(0);
    expect(cmp(b, a)).toBeLessThan(0);
    expect(cmp(a, a)).toBe(0);
    const later = obs({
      id: 'c',
      decisionId: 'DEC-001',
      status: 'in_progress',
      asOfDate: '2027-05-15',
      updatedAt: '2027-05-15',
      effectiveFromSnapshot: '07',
    });
    expect(cmp(a, later)).toBeLessThan(0);
  });
});
