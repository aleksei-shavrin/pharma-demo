import { SNAPSHOT_02, SNAPSHOT_03 } from '../data/fixtures';
import {
  snapshotWithAcceptDateSlip,
  snapshotWithDec001,
} from '../data/fixtures/decision-test-fixture';
import { buildDirectEdges, linksForEntity } from './direct-edges';
import { computeDerivedImpact } from './derived-impact';

/** Spec files may import fixture constants; production code under data/ only. */

describe('buildDirectEdges', () => {
  it('allows Issue→Milestone and forbids Equipment→Milestone', () => {
    const edges = buildDirectEdges(SNAPSHOT_03);
    expect(
      edges.some(
        (e) =>
          e.fromType === 'issue' &&
          e.fromId === 'ISS-001' &&
          e.toType === 'milestone' &&
          e.toId === 'MS-PS',
      ),
    ).toBe(true);
    expect(
      edges.some((e) => e.fromType === 'equipment' && e.toType === 'milestone'),
    ).toBe(false);
  });

  it('Decision→Milestone via test fixture; never Decision→EQ/ISS/RISK', () => {
    const withDec = snapshotWithDec001();
    const edges = buildDirectEdges(withDec);
    expect(
      edges.some(
        (e) =>
          e.fromType === 'decision' &&
          e.fromId === 'DEC-001' &&
          e.toType === 'milestone' &&
          e.toId === 'MS-PS',
      ),
    ).toBe(true);
    expect(
      edges.some(
        (e) =>
          e.fromType === 'decision' &&
          (e.toType === 'equipment' ||
            e.toType === 'issue' ||
            e.toType === 'risk'),
      ),
    ).toBe(false);
  });

  it('production Snapshot C has no Decision edges', () => {
    const edges = buildDirectEdges(SNAPSHOT_03);
    expect(edges.some((e) => e.fromType === 'decision')).toBe(false);
  });
});

describe('Decision fixture contract (test-local DEC-001)', () => {
  it('requires projectId and optional milestoneId without EQ/ISS/RISK ids', () => {
    const d = snapshotWithDec001().decisions[0];
    expect(d.projectId).toBe('PRT-01');
    expect(d.milestoneId).toBe('MS-PS');
    expect(d).not.toHaveProperty('equipmentId');
    expect(d).not.toHaveProperty('issueId');
    expect(d).not.toHaveProperty('riskId');
  });

  it('AcceptDateSlip may omit milestoneId', () => {
    const d = snapshotWithAcceptDateSlip().decisions[0];
    expect(d.type).toBe('AcceptDateSlip');
    expect(d.projectId).toBe('PRT-01');
    expect(d.milestoneId).toBeNull();
  });

  it('Decision alone does not imply forecast recovery', () => {
    const withDec = snapshotWithDec001();
    const impact = computeDerivedImpact(withDec);
    expect(impact.decisionState).toBe('recorded');
    expect(impact.recoveryExecuted).toBe(false);
    expect(impact.productionStartDeltaDays).toBe(21);
    expect(withDec.project.forecastProductionStart).toBe('2027-10-06');
  });
});

describe('linksForEntity', () => {
  it('exposes Issue→Milestone reciprocal on MS-PS (Snapshot C)', () => {
    const links = linksForEntity(SNAPSHOT_03, 'milestone', 'MS-PS');
    expect(
      links.some((l) => l.targetType === 'issue' && l.targetId === 'ISS-001'),
    ).toBe(true);
  });

  it('Snapshot B has no ISS-001 links on MS-PS', () => {
    const links = linksForEntity(SNAPSHOT_02, 'milestone', 'MS-PS');
    expect(links.some((l) => l.targetType === 'issue')).toBe(false);
  });
});
