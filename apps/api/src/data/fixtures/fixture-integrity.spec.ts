/**
 * E2 fixture integrity suite (DOC-PROD-021/022).
 * Prefer focused groups over one giant assertion blob.
 */
import { calendarDaysDelta } from '../../common/calendar-days-delta';
import { buildDirectEdges } from '../../common/direct-edges';
import {
  computeProjectStatus,
  computeWorkstreamRollups,
  workstreamStatus,
} from '../project-status';
import {
  PS_DRIVER_EQUIPMENT_ID,
  PS_ISSUE_ID,
  PS_MILESTONE_ID,
  PS_RISK_ID,
  findEquipment,
  findIssue,
  findMilestone,
  findRisk,
} from '../snapshot-access';
import { WORKSTREAM_IDS } from '../workstream-ids';
import {
  DECISION_CATALOG,
  DECISION_IDS,
  EQUIPMENT_IDS,
  ISSUE_CATALOG,
  ISSUE_IDS,
  MILESTONE_IDS,
  RISK_CATALOG,
  RISK_IDS,
} from './catalog';
import { SNAPSHOTS, SNAPSHOT_A, SNAPSHOT_C, SNAPSHOT_F, SNAPSHOT_G, SNAPSHOT_H } from './index';
import { SNAPSHOT_STATES } from './snapshot-states';
import type { SnapshotFixture, SnapshotId } from './types';

const ALL: SnapshotId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const TRANSITIONS: [SnapshotId, SnapshotId][] = [
  ['A', 'B'],
  ['B', 'C'],
  ['C', 'D'],
  ['D', 'E'],
  ['E', 'F'],
  ['F', 'G'],
  ['G', 'H'],
];

function ids(xs: { id: string }[]): string[] {
  return xs.map((x) => x.id).sort();
}

describe('fixture integrity — inventory / counts', () => {
  it('union of A–H canonical IDs matches DOC-PROD-021 scale', () => {
    const eq = new Set<string>();
    const ms = new Set<string>();
    const iss = new Set<string>();
    const risk = new Set<string>();
    const dec = new Set<string>();
    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      s.equipment.forEach((e) => eq.add(e.id));
      s.milestones.forEach((m) => ms.add(m.id));
      s.issues.forEach((i) => iss.add(i.id));
      s.risks.forEach((r) => risk.add(r.id));
      s.decisions.forEach((d) => dec.add(d.id));
    }
    expect(eq.size).toBe(23);
    expect(ms.size).toBe(14);
    expect(iss.size).toBe(11);
    expect(risk.size).toBe(12);
    expect(dec.size).toBe(6);
    expect([...eq].sort()).toEqual([...EQUIPMENT_IDS].sort());
    expect([...ms].sort()).toEqual([...MILESTONE_IDS].sort());
    expect([...iss].sort()).toEqual([...ISSUE_IDS].sort());
    expect([...risk].sort()).toEqual([...RISK_IDS].sort());
    expect([...dec].sort()).toEqual([...DECISION_IDS].sort());
  });

  it('every snapshot has 23 Equipment and 14 Milestones', () => {
    for (const id of ALL) {
      expect(SNAPSHOTS[id].equipment).toHaveLength(23);
      expect(SNAPSHOTS[id].milestones).toHaveLength(14);
    }
  });

  it('per-snapshot Issue/Risk/Decision counts match state overlays', () => {
    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      const st = SNAPSHOT_STATES[id];
      expect(s.issues).toHaveLength(Object.keys(st.issues).length);
      expect(s.risks).toHaveLength(Object.keys(st.riskRag).length);
      const expectedDec = DECISION_IDS.filter(
        (d) => ALL.indexOf(id) >= ALL.indexOf(DECISION_CATALOG[d].first),
      );
      expect(ids(s.decisions)).toEqual([...expectedDec].sort());
    }
  });
});

describe('fixture integrity — unique IDs', () => {
  it('IDs unique within each snapshot collection', () => {
    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      for (const coll of [
        s.equipment,
        s.milestones,
        s.issues,
        s.risks,
        s.decisions,
        s.topExceptions,
      ]) {
        const list = ids(coll);
        expect(list).toEqual([...new Set(list)].sort());
      }
    }
  });
});

describe('fixture integrity — referential + relationship matrix', () => {
  it('every referenced ID resolves; no forbidden edges', () => {
    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      const eq = new Set(s.equipment.map((e) => e.id));
      const ms = new Set(s.milestones.map((m) => m.id));
      const iss = new Set(s.issues.map((i) => i.id));
      const risk = new Set(s.risks.map((r) => r.id));

      for (const issue of s.issues) {
        expect(eq.has(issue.equipmentId)).toBe(true);
        if (issue.milestoneId) expect(ms.has(issue.milestoneId)).toBe(true);
      }
      for (const r of s.risks) {
        if (r.equipmentId) expect(eq.has(r.equipmentId)).toBe(true);
        if (r.milestoneId) expect(ms.has(r.milestoneId)).toBe(true);
        if (r.issueId) expect(iss.has(r.issueId)).toBe(true);
      }
      for (const d of s.decisions) {
        expect(d.projectId).toBe(s.project.id);
        if (d.milestoneId) expect(ms.has(d.milestoneId)).toBe(true);
        expect(d).not.toHaveProperty('equipmentId');
        expect(d).not.toHaveProperty('issueId');
        expect(d).not.toHaveProperty('riskId');
      }
      for (const tex of s.topExceptions) {
        for (const link of tex.links) {
          if (link.type === 'equipment') expect(eq.has(link.id)).toBe(true);
          if (link.type === 'issue') expect(iss.has(link.id)).toBe(true);
          if (link.type === 'risk') expect(risk.has(link.id)).toBe(true);
          if (link.type === 'milestone') expect(ms.has(link.id)).toBe(true);
        }
      }

      const edges = buildDirectEdges(s);
      expect(
        edges.some(
          (e) => e.fromType === 'equipment' && e.toType === 'milestone',
        ),
      ).toBe(false);
      expect(
        edges.some(
          (e) =>
            e.fromType === 'decision' &&
            (e.toType === 'equipment' ||
              e.toType === 'issue' ||
              e.toType === 'risk'),
        ),
      ).toBe(false);
    }
  });
});

describe('fixture integrity — chronology / identity', () => {
  it('persistent equipment/milestones keep stable identity fields', () => {
    for (const [from, to] of TRANSITIONS) {
      const a = SNAPSHOTS[from];
      const b = SNAPSHOTS[to];
      for (const eq of a.equipment) {
        const next = findEquipment(b, eq.id)!;
        expect(next.projectId).toBe(eq.projectId);
        expect(next.workstream).toBe(eq.workstream);
        expect(next.name).toBe(eq.name);
        expect(next.critical).toBe(eq.critical);
        expect(next.baselineDelivery).toBe(eq.baselineDelivery);
      }
      for (const ms of a.milestones) {
        const next = findMilestone(b, ms.id)!;
        expect(next.workstream).toBe(ms.workstream);
        expect(next.name).toBe(ms.name);
        expect(next.baselineDate).toBe(ms.baselineDate);
      }
    }
  });

  it('Issue first appearance matches catalog; no regression Closed→Open', () => {
    const order = ALL;
    for (const issueId of ISSUE_IDS) {
      const first = ISSUE_CATALOG[issueId].first;
      for (const snap of order) {
        const present = Boolean(findIssue(SNAPSHOTS[snap], issueId));
        expect(present).toBe(order.indexOf(snap) >= order.indexOf(first));
      }
    }
    for (const [from, to] of TRANSITIONS) {
      for (const issue of SNAPSHOTS[from].issues) {
        const next = findIssue(SNAPSHOTS[to], issue.id);
        if (!next) continue;
        if (issue.status === 'Closed') {
          expect(next.status).toBe('Closed');
        }
        if (issue.status === 'Mitigating') {
          expect(['Mitigating', 'Closed']).toContain(next.status);
        }
      }
    }
  });

  it('Decision first appearance matches catalog', () => {
    for (const decId of DECISION_IDS) {
      const first = DECISION_CATALOG[decId].first;
      for (const snap of ALL) {
        const present = SNAPSHOTS[snap].decisions.some((d) => d.id === decId);
        expect(present).toBe(ALL.indexOf(snap) >= ALL.indexOf(first));
      }
    }
  });
});

describe('fixture integrity — date / delta arithmetic', () => {
  it('equipment and milestone deltas match forecast−baseline; PS matches HVAC driver', () => {
    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      const st = SNAPSHOT_STATES[id];
      for (const eq of s.equipment) {
        const delta = calendarDaysDelta(eq.baselineDelivery, eq.forecastDelivery);
        expect(delta).toBe(st.eqDelta[eq.id as keyof typeof st.eqDelta] ?? 0);
        expect(eq.status).toBe(delta > 0 ? 'Delayed' : 'OnTrack');
      }
      for (const ms of s.milestones) {
        const delta = calendarDaysDelta(ms.baselineDate, ms.forecastDate);
        expect(delta).toBe(st.msDelta[ms.id as keyof typeof st.msDelta] ?? 0);
      }
      expect(
        calendarDaysDelta(
          s.project.baselineProductionStart,
          s.project.forecastProductionStart,
        ),
      ).toBe(
        calendarDaysDelta(
          findEquipment(s, PS_DRIVER_EQUIPMENT_ID)!.baselineDelivery,
          findEquipment(s, PS_DRIVER_EQUIPMENT_ID)!.forecastDelivery,
        ),
      );
      expect(s.project.forecastProductionStart).toBe(st.psForecast);
    }
  });

  it('approved HVAC / PS residual dates', () => {
    expect(findEquipment(SNAPSHOT_C, 'EQ-HVAC-01')!.forecastDelivery).toBe(
      '2027-06-05',
    );
    expect(SNAPSHOT_C.project.forecastProductionStart).toBe('2027-10-06');
    expect(findEquipment(SNAPSHOT_G, 'EQ-HVAC-01')!.forecastDelivery).toBe(
      '2027-05-29',
    );
    expect(SNAPSHOT_G.project.forecastProductionStart).toBe('2027-09-29');
    expect(SNAPSHOT_H.project.forecastProductionStart).toBe('2027-09-29');
  });
});

describe('fixture integrity — BR-004 sole PS driver', () => {
  it('only EQ-HVAC-01 delta equals PS delta; other delayed WS do not move PS alone', () => {
    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      const psDelta = calendarDaysDelta(
        s.project.baselineProductionStart,
        s.project.forecastProductionStart,
      );
      const hvacDelta = calendarDaysDelta(
        findEquipment(s, PS_DRIVER_EQUIPMENT_ID)!.baselineDelivery,
        findEquipment(s, PS_DRIVER_EQUIPMENT_ID)!.forecastDelivery,
      );
      expect(psDelta).toBe(hvacDelta);

      // If HVAC is calm, PS must be baseline even when other WS are delayed.
      if (hvacDelta === 0) {
        expect(s.project.forecastProductionStart).toBe(
          s.project.baselineProductionStart,
        );
      }
    }
    // Explicit B: PKG delayed, PS baseline.
    expect(findEquipment(SNAPSHOTS.B, 'EQ-PKG-01')!.status).toBe('Delayed');
    expect(SNAPSHOTS.B.project.forecastProductionStart).toBe('2027-09-15');
    // Explicit E: WFI delayed heavily, PS still HVAC +21.
    expect(
      calendarDaysDelta(
        findEquipment(SNAPSHOTS.E, 'EQ-UTL-02')!.baselineDelivery,
        findEquipment(SNAPSHOTS.E, 'EQ-UTL-02')!.forecastDelivery,
      ),
    ).toBe(18);
    expect(SNAPSHOTS.E.project.forecastProductionStart).toBe('2027-10-06');
  });
});

describe('fixture integrity — BR-007 state-based', () => {
  it('RISK-001 Red ⇒ MS-PS not Green on every snapshot', () => {
    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      const risk = findRisk(s, PS_RISK_ID)!;
      const ms = findMilestone(s, PS_MILESTONE_ID)!;
      if (risk.rag === 'Red') {
        expect(ms.rag).not.toBe('Green');
      }
    }
    expect(findRisk(SNAPSHOT_G, PS_RISK_ID)!.rag).toBe('Red');
    expect(findMilestone(SNAPSHOT_G, PS_MILESTONE_ID)!.rag).toBe('Red');
    expect(findRisk(SNAPSHOT_H, PS_RISK_ID)!.rag).toBe('Red');
    expect(findMilestone(SNAPSHOT_H, PS_MILESTONE_ID)!.rag).toBe('Red');
  });
});

describe('fixture integrity — RISK-COM-01 orphan exception', () => {
  it('accepts RISK-COM-01 Red without Issue; rejects arbitrary orphan Red', () => {
    const e = SNAPSHOTS.E;
    const com = findRisk(e, 'RISK-COM-01')!;
    expect(com.rag).toBe('Red');
    expect(com.issueId).toBeNull();

    const redWithoutIssue = e.risks.filter(
      (r) => r.rag === 'Red' && !r.issueId,
    );
    expect(redWithoutIssue.map((r) => r.id)).toEqual(['RISK-COM-01']);

    // Focused expectation: inventing another orphan Red would fail this check.
    const forged: SnapshotFixture = {
      ...e,
      risks: [
        ...e.risks,
        {
          id: 'RISK-ORPHAN-FAKE',
          title: 'Fake orphan',
          rag: 'Red',
          milestoneId: 'MS-PS',
          equipmentId: null,
          issueId: null,
          workstream: 'WS-BLD',
        },
      ],
    };
    const orphans = forged.risks.filter((r) => r.rag === 'Red' && !r.issueId);
    expect(orphans.map((r) => r.id).sort()).toEqual([
      'RISK-COM-01',
      'RISK-ORPHAN-FAKE',
    ]);
    expect(orphans).toHaveLength(2);
  });
});

describe('fixture integrity — workstream rollups + project status A–H', () => {
  it('spot-checks DOC-PROD-022 overall + notable WS', () => {
    expect(computeProjectStatus(SNAPSHOT_A)).toBe('Green');
    expect(
      computeWorkstreamRollups(SNAPSHOT_A).every((r) => r.status === 'Green'),
    ).toBe(true);

    expect(computeProjectStatus(SNAPSHOTS.B)).toBe('Yellow');
    expect(workstreamStatus(SNAPSHOTS.B, 'WS-PKG')).toBe('Yellow');
    expect(workstreamStatus(SNAPSHOTS.B, 'WS-BLD')).toBe('Yellow');
    expect(workstreamStatus(SNAPSHOTS.B, 'WS-HVAC')).toBe('Green');

    expect(computeProjectStatus(SNAPSHOT_C)).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_C, 'WS-HVAC')).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_C, 'WS-PKG')).toBe('Yellow');

    expect(computeProjectStatus(SNAPSHOTS.D)).toBe('Red');
    expect(computeProjectStatus(SNAPSHOTS.E)).toBe('Red');
    expect(computeProjectStatus(SNAPSHOT_F)).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_F, 'WS-HVAC')).toBe('Red');

    expect(computeProjectStatus(SNAPSHOT_G)).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_G, 'WS-HVAC')).toBe('Red');
    // DOC-PROD-022: S4 primary recovered ≠ WS-PKG Green. Residual
    // serialization (EQ-PKG-03 Delayed + ISS-PKG-02 Open) → WS-PKG Yellow
    // under unchanged E1 rollup.
    expect(workstreamStatus(SNAPSHOT_G, 'WS-PKG')).toBe('Yellow');
    expect(findEquipment(SNAPSHOT_G, 'EQ-PKG-01')!.status).toBe('OnTrack');
    expect(findRisk(SNAPSHOT_G, 'RISK-PKG-01')!.rag).toBe('Green');
    expect(findIssue(SNAPSHOT_G, 'ISS-PKG-01')!.status).toBe('Closed');
    expect(findEquipment(SNAPSHOT_G, 'EQ-PKG-03')!.status).toBe('Delayed');
    expect(findIssue(SNAPSHOT_G, 'ISS-PKG-02')!.status).toBe('Open');

    expect(computeProjectStatus(SNAPSHOT_H)).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_H, 'WS-HVAC')).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_H, 'WS-PKG')).toBe('Yellow');
    expect(findEquipment(SNAPSHOT_H, 'EQ-PKG-01')!.status).toBe('OnTrack');
    expect(findIssue(SNAPSHOT_H, 'ISS-PKG-01')!.status).toBe('Closed');

    for (const id of ALL) {
      expect(computeWorkstreamRollups(SNAPSHOTS[id])).toHaveLength(
        WORKSTREAM_IDS.length,
      );
    }
  });
});

describe('fixture integrity — Top Exceptions + Trend', () => {
  it('A empty exceptions; priorities unique and sorted; trends authored', () => {
    expect(SNAPSHOT_A.topExceptions).toEqual([]);
    expect(SNAPSHOT_A.trend).toEqual({
      better: [],
      worse: [],
      unchangedCritical: [],
    });

    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      const priorities = s.topExceptions.map((t) => t.priority);
      expect(priorities).toEqual([...priorities].sort((a, b) => a - b));
      expect(new Set(priorities).size).toBe(priorities.length);
    }

    expect(SNAPSHOTS.B.trend.worse).toEqual(
      expect.arrayContaining([
        'Упаковка: прогноз срыва FAT',
        'Оболочка: замечания по дверям',
      ]),
    );
    expect(SNAPSHOT_C.trend.worse).toContain('HVAC / старт производства: +21');
    expect(SNAPSHOT_F.trend.unchangedCritical).toContain(
      'HVAC / PS без изменения прогноза',
    );
    expect(SNAPSHOT_G.trend.better).toEqual(
      expect.arrayContaining([
        'Упаковка стабилизирована',
        'HVAC Δ снижен до +14',
      ]),
    );
    expect(SNAPSHOT_H.trend.better).toContain(
      'Зафиксирована заморозка точек BMS/EMS',
    );
  });
});

describe('fixture integrity — A–H retrievable; narrative spine', () => {
  it('all eight snapshots exist with expected PS / DEC / ISS spine', () => {
    expect(Object.keys(SNAPSHOTS).sort()).toEqual(ALL);
    expect(findIssue(SNAPSHOT_A, PS_ISSUE_ID)).toBeUndefined();
    expect(findIssue(SNAPSHOT_C, PS_ISSUE_ID)?.status).toBe('Open');
    expect(SNAPSHOT_F.decisions.some((d) => d.id === 'DEC-001')).toBe(true);
    expect(SNAPSHOT_C.decisions).toEqual([]);
    expect(findIssue(SNAPSHOT_G, PS_ISSUE_ID)?.status).toBe('Mitigating');
    expect(findEquipment(SNAPSHOT_G, PS_DRIVER_EQUIPMENT_ID)!.status).toBe(
      'Delayed',
    );
  });
});

describe('fixture integrity — entity detail resolvability', () => {
  it('every register entity id resolves via snapshot-access finders', () => {
    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      for (const eq of s.equipment) {
        expect(findEquipment(s, eq.id)?.id).toBe(eq.id);
      }
      for (const ms of s.milestones) {
        expect(findMilestone(s, ms.id)?.id).toBe(ms.id);
      }
      for (const issue of s.issues) {
        expect(findIssue(s, issue.id)?.id).toBe(issue.id);
      }
      for (const risk of s.risks) {
        expect(findRisk(s, risk.id)?.id).toBe(risk.id);
      }
    }
  });
});
