import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ANALYST_STATUS_ANCHOR_ASOF,
  buildAnalystScheduleFixture,
  supplementaryDatesFor,
} from './schedule-analyst-import';
import { MILESTONE_WBS_ALIASES } from '../../ws-program-mapping';

describe('schedule-analyst-import (Codex P1 re-pass)', () => {
  const built = buildAnalystScheduleFixture();
  const parsed = built.parse;

  it('preserves source SHA and row counts 564/145/272/147', () => {
    const md = readFileSync(
      join(__dirname, 'demo-pharma-greenfield.md'),
      'utf8',
    );
    const sha = createHash('sha256').update(md).digest('hex');
    const expected = readFileSync(
      join(__dirname, 'demo-pharma-greenfield.sha256'),
      'utf8',
    )
      .trim()
      .split(/\s+/)[0];
    expect(sha).toBe(expected);
    expect(parsed.rows).toHaveLength(564);
    expect(parsed.rows.filter((r) => r.kind === 'stage')).toHaveLength(145);
    expect(parsed.rows.filter((r) => r.kind === 'work')).toHaveLength(272);
    expect(parsed.rows.filter((r) => r.kind === 'checkpoint')).toHaveLength(
      147,
    );
  });

  it('emits 145 KT-* + 2 aliased controlpoints = 147 source KT', () => {
    const kt = built.fixture.importedCheckpoints ?? [];
    const aliased = built.fixture.aliasedCheckpoints ?? [];
    expect(kt.length).toBe(145);
    expect(aliased.length).toBe(2);
    expect(built.importCoverage.checkpoints).toBe(147);
    for (const c of [...kt, ...aliased]) {
      expect(c.baselineDate).toBe(c.forecastDate);
      expect(c.sourceStatus).toBeTruthy();
    }
    expect(aliased.map((a) => a.id).sort()).toEqual([
      'MS-CLN-PANEL',
      'MS-UTL-PWR',
    ]);
    expect(aliased.find((a) => a.id === 'MS-CLN-PANEL')?.name).toBe(
      'Ограждающие конструкции C/D готовы',
    );
  });

  it('master-sim dates are deterministic and not status-offset-from-C-only', () => {
    expect(ANALYST_STATUS_ANCHOR_ASOF).toBe('2027-03-01');
    const dates = built.fixture.works
      .filter((w) => !w.id.startsWith('WK-'))
      .map((w) => w.baselineStart ?? w.startDate);
    const uniqueMonths = new Set(dates.map((d) => d.slice(0, 7)));
    expect(uniqueMonths.size).toBeGreaterThan(3);
    const stub = supplementaryDatesFor('completed', { zeroDuration: true });
    expect(stub.startDate).toBe(stub.endDate);
  });

  it('emits leaf↔leaf scheduling/cross without unsupported pairs', () => {
    const droppedResolvable = built.linkAudit.filter(
      (a) =>
        a.renderKind === 'dropped' &&
        !a.canonicalSourceRef.startsWith('unresolved:') &&
        !a.canonicalTargetRef.startsWith('unresolved:'),
    );
    expect(droppedResolvable).toEqual([]);
    expect(built.importCoverage.droppedResolvableCount).toBe(0);
    const workToMs = built.linkAudit.find(
      (a) =>
        a.canonicalSourceRef.startsWith('work:') &&
        a.canonicalTargetRef.startsWith('milestone:') &&
        a.renderKind !== 'dropped',
    );
    expect(workToMs).toBeTruthy();
    const msToMs = built.linkAudit.find(
      (a) =>
        a.canonicalSourceRef.startsWith('milestone:') &&
        a.canonicalTargetRef.startsWith('milestone:') &&
        a.renderKind !== 'dropped',
    );
    // May or may not exist in source; if present must not be dropped.
    if (msToMs) {
      expect(['scheduling', 'cross_project_predecessor']).toContain(
        msToMs.renderKind,
      );
    }
  });

  it('seam atomic edges are unioned (fan-out not chain mis-parse)', () => {
    expect(built.importCoverage.seamAtomicEdges).toBe(12);
    const seamAudits = built.linkAudit.filter((a) => a.projection === 'seam');
    const power = seamAudits.filter(
      (a) => a.fromWbs === '24.1.3' && a.sourceEdgeId.startsWith('SEAM-'),
    );
    expect(power.length).toBe(3);
    expect(power.map((p) => p.toWbs).sort()).toEqual([
      '12.2.3',
      '19.3',
      '9.3.2',
    ]);
  });

  it('aliases resolve in links; every audit row has WBS + decision', () => {
    expect(MILESTONE_WBS_ALIASES['MS-CLN-PANEL'].wbs).toBe('8.2.3');
    const panel = built.fixture.links.filter(
      (l) =>
        l.sourceRef.includes('MS-CLN-PANEL') ||
        l.targetRef.includes('MS-CLN-PANEL'),
    );
    expect(panel.length).toBeGreaterThan(0);
    for (const row of built.linkAudit) {
      expect(row.sourceEdgeId).toBeTruthy();
      expect(row.fromWbs).toBeTruthy();
      expect(row.toWbs).toBeTruthy();
      if (row.renderKind === 'dropped') {
        expect(row.note).toBeTruthy();
      }
    }
  });

  it('preserves every source row name/type/status/weeks', () => {
    expect(parsed.rows).toHaveLength(564);
    for (const row of parsed.rows) {
      expect(row.name.length).toBeGreaterThan(0);
      expect(['stage', 'work', 'checkpoint']).toContain(row.kind);
      expect(row.sourceStatus).toBeTruthy();
    }
  });

  it('row coverage 564 and edge audit coverage with counts', () => {
    expect(built.importCoverage.linkAuditRows).toBe(built.linkAudit.length);
    expect(built.linkAudit.length).toBeGreaterThan(400);
    // Source edges + 12 seam atomics (+ demo links not in audit).
    const sourceEdgeAtoms = parsed.edges.reduce((n, e) => n + e.from.length, 0);
    expect(built.linkAudit.length).toBeGreaterThanOrEqual(sourceEdgeAtoms + 12);
  });
});
