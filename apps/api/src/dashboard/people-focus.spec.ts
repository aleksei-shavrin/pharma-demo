import * as fs from 'node:fs';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import { SNAPSHOT_IDS, type SnapshotId } from '../snapshot/snapshot-id';
import {
  aggregatePeopleFocusSignals,
  buildPeopleFocus,
  buildReasons,
  isActiveIssue,
  isCriticalDelayedEquipment,
  previousSnapshotIdOf,
} from './people-focus';
import type { SnapshotFixture } from '../data/fixtures/types';

const ds = new MockDemoDataSource();

function lookup(id: `PER-${string}`) {
  const p = ds.getPerson(id);
  if (!p) return null;
  return {
    fullNameRu: p.fullNameRu,
    roleTitleRu: p.roleTitleRu,
    primaryWorkstreamId: p.primaryWorkstreamId,
  };
}

function focus(id: SnapshotId) {
  const current = ds.getSnapshot(id);
  const prevId = previousSnapshotIdOf(id);
  const previous = prevId ? ds.getSnapshot(prevId) : null;
  return buildPeopleFocus(current, previous, lookup);
}

describe('people-focus predicates', () => {
  it('active issue excludes Closed', () => {
    expect(isActiveIssue({ status: 'Open' })).toBe(true);
    expect(isActiveIssue({ status: 'Mitigating' })).toBe(true);
    expect(isActiveIssue({ status: 'Closed' })).toBe(false);
  });

  it('critical delayed equipment requires both flags', () => {
    expect(
      isCriticalDelayedEquipment({ critical: true, status: 'Delayed' }),
    ).toBe(true);
    expect(
      isCriticalDelayedEquipment({ critical: true, status: 'OnTrack' }),
    ).toBe(false);
    expect(
      isCriticalDelayedEquipment({ critical: false, status: 'Delayed' }),
    ).toBe(false);
  });

  it('previousSnapshotIdOf follows SNAPSHOT_IDS', () => {
    expect(previousSnapshotIdOf('01')).toBeNull();
    expect(previousSnapshotIdOf('02')).toBe('01');
    expect(previousSnapshotIdOf('03')).toBe('02');
    expect(previousSnapshotIdOf('19')).toBe('18');
  });
});

describe('buildReasons previousKnown', () => {
  it('without previousKnown never emits Новый/+N even when prev undefined', () => {
    const snap = ds.getSnapshot('03');
    const { byPerson } = aggregatePeopleFocusSignals(snap);
    for (const agg of byPerson.values()) {
      if (agg.criticalKeys.size === 0 && agg.otherIssueIds.size === 0) continue;
      const reasons = buildReasons(agg, undefined, false);
      expect(reasons.every((r) => !/Новый|\+\d/.test(r.text))).toBe(true);
    }
  });
});

describe('buildPeopleFocus on Demo snapshots', () => {
  it('A is quiet with null previous and no new/removed counts', () => {
    const panel = focus('01');
    expect(panel.previousSnapshotId).toBeNull();
    expect(panel.summary.peopleWithQuestions).toBe(0);
    expect(panel.summary.criticalQuestionCount).toBe(0);
    expect(panel.summary.newCriticalQuestionCount).toBeNull();
    expect(panel.summary.removedCriticalSignalCount).toBeNull();
    expect(panel.people).toEqual([]);
  });

  it('first snapshot with active cases: null deltas and no Новый/+N reasons', () => {
    const c = ds.getSnapshot('03');
    const panel = buildPeopleFocus(c, null, lookup);
    expect(panel.previousSnapshotId).toBeNull();
    expect(panel.summary.newCriticalQuestionCount).toBeNull();
    expect(panel.summary.removedCriticalSignalCount).toBeNull();
    expect(panel.totalPeopleInFocus).toBeGreaterThan(0);
    for (const p of panel.people) {
      expect(p.hasNewCritical).toBe(false);
      expect(p.incidentGrowth).toBe(0);
      expect(p.criticalSignalsRemoved).toBe(0);
      expect(p.reasons.every((r) => !/Новый|\+\d/.test(r.text))).toBe(true);
    }
  });

  it('does not rank people on decisions alone', () => {
    const base = ds.getSnapshot('06');
    const decisionsOnly: SnapshotFixture = {
      ...base,
      issues: [],
      equipment: base.equipment.map((e) => ({
        ...e,
        status: 'OnTrack' as const,
        critical: false,
      })),
      decisions: base.decisions,
    };
    const panel = buildPeopleFocus(decisionsOnly, null, lookup);
    expect(panel.people).toEqual([]);
    expect(panel.summary.peopleWithQuestions).toBe(0);
  });

  it('C surfaces PER-02; person critical sum may exceed global unique', () => {
    const panel = focus('03');
    expect(panel.previousSnapshotId).toBe('02');
    expect(panel.summary.newCriticalQuestionCount).not.toBeNull();
    expect(panel.summary.removedCriticalSignalCount).not.toBeNull();
    const per02 = panel.people.find((p) => p.personId === 'PER-02');
    if (per02) {
      expect(per02.activeIssueIds).toContain('ISS-001');
      expect(per02.reasons.length).toBeGreaterThan(0);
      expect(
        per02.reasons.every((r) => !/score|algorithm|fixture/i.test(r.text)),
      ).toBe(true);
    }
    const personCriticalSum = panel.people.reduce(
      (n, p) => n + p.criticalIncidentCount,
      0,
    );
    expect(personCriticalSum).toBeGreaterThanOrEqual(
      panel.summary.criticalQuestionCount,
    );
    // '03': 3 people each with 1 critical, global unique 2
    expect(panel.people.length).toBe(3);
    expect(panel.summary.criticalQuestionCount).toBe(2);
    expect(personCriticalSum).toBe(3);

    for (let i = 1; i < panel.people.length; i++) {
      const a = panel.people[i - 1];
      const b = panel.people[i];
      if (
        a.criticalIncidentCount === b.criticalIncidentCount &&
        a.hasNewCritical === b.hasNewCritical &&
        a.otherActiveIssueCount === b.otherActiveIssueCount &&
        a.incidentGrowth === b.incidentGrowth
      ) {
        expect(a.personId < b.personId).toBe(true);
      }
    }
    expect(panel.people.map((p) => p.personId).length).toBe(
      new Set(panel.people.map((p) => p.personId)).size,
    );
  });

  it('same-person issue+equipment dedupes to one critical key', () => {
    const snap = ds.getSnapshot('03');
    const { byPerson } = aggregatePeopleFocusSignals(snap);
    for (const agg of byPerson.values()) {
      for (const key of agg.criticalKeys) {
        expect(key.startsWith('eq:')).toBe(true);
        const links = agg.criticalLinks.get(key) ?? [];
        const types = links.map((l) => l.type);
        expect(types.filter((t) => t === 'issue').length).toBeLessThanOrEqual(
          1,
        );
        expect(
          types.filter((t) => t === 'equipment').length,
        ).toBeLessThanOrEqual(1);
      }
    }
  });

  it('S quiet with removedCritical from R and Closed clears ISS-001', () => {
    const panel = focus('19');
    const r = focus('18');
    expect(panel.people).toEqual([]);
    expect(panel.summary.peopleWithQuestions).toBe(0);
    expect(panel.summary.removedCriticalSignalCount).toBe(
      r.summary.criticalQuestionCount,
    );
    expect(panel.summary.removedCriticalSignalCount).toBeGreaterThan(0);
    const per02 = panel.people.find((p) => p.personId === 'PER-02');
    expect(per02).toBeUndefined();
  });

  it('19-snapshot audit: reconcile, null first, removed, catalog owners', () => {
    const rows: {
      id: SnapshotId;
      people: number;
      critical: number;
      newCritical: number | null;
      removedCritical: number | null;
      previousSnapshotId: SnapshotId | null;
      personCriticalSum: number;
      top5: {
        personId: string;
        fullNameRu: string;
        critical: number;
        other: number;
        hasNewCritical: boolean;
        growth: number;
        removed: number;
      }[];
    }[] = [];
    for (const id of SNAPSHOT_IDS) {
      const panel = focus(id);
      for (const p of panel.people) {
        expect(p.personId.startsWith('PER-')).toBe(true);
        expect(lookup(p.personId)).toBeTruthy();
      }
      const keys = new Set<string>();
      let personCriticalSum = 0;
      for (const p of panel.people) {
        personCriticalSum += p.criticalIncidentCount;
        for (const k of p.criticalIncidentKeys) keys.add(k);
      }
      expect(panel.summary.criticalQuestionCount).toBe(keys.size);
      expect(personCriticalSum).toBeGreaterThanOrEqual(keys.size);
      expect(panel.summary.peopleWithQuestions).toBe(panel.totalPeopleInFocus);
      expect(panel.people.length).toBe(panel.totalPeopleInFocus);
      if (id === '01') {
        expect(panel.summary.newCriticalQuestionCount).toBeNull();
        expect(panel.summary.removedCriticalSignalCount).toBeNull();
      } else {
        expect(panel.summary.newCriticalQuestionCount).not.toBeNull();
        expect(panel.summary.removedCriticalSignalCount).not.toBeNull();
      }
      rows.push({
        id,
        people: panel.summary.peopleWithQuestions,
        critical: panel.summary.criticalQuestionCount,
        newCritical: panel.summary.newCriticalQuestionCount,
        removedCritical: panel.summary.removedCriticalSignalCount,
        previousSnapshotId: panel.previousSnapshotId,
        personCriticalSum,
        top5: panel.people.slice(0, 5).map((p) => ({
          personId: p.personId,
          fullNameRu: p.fullNameRu,
          critical: p.criticalIncidentCount,
          other: p.otherActiveIssueCount,
          hasNewCritical: p.hasNewCritical,
          growth: p.incidentGrowth,
          removed: p.criticalSignalsRemoved,
        })),
      });
    }
    expect(rows[0].people).toBe(0);
    expect(rows[0].newCritical).toBeNull();
    expect(rows.find((r) => r.id === '03')?.top5[0]?.personId).toBe('PER-02');
    expect(rows.find((r) => r.id === '19')?.people).toBe(0);
    expect((rows.find((r) => r.id === '19')?.removedCritical ?? 0) > 0).toBe(
      true,
    );
    const e = rows.find((r) => r.id === '05');
    expect(e?.people).toBe(8);

    const art = '/tmp/pharma-demo-artifacts/pharma-people-signals-1c199ddd';
    fs.mkdirSync(art, { recursive: true });
    fs.writeFileSync(
      `${art}/snap-audit-r2.json`,
      JSON.stringify(rows, null, 2),
    );
    const movers = rows.filter((r) =>
      ['01', '03', '05', '11', '19'].includes(r.id),
    );
    fs.writeFileSync(
      `${art}/snap-rank-moves-r2.json`,
      JSON.stringify(movers, null, 2),
    );
  });
});
