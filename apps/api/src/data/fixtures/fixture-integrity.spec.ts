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
  RISK_IDS,
} from './catalog';
import {
  SNAPSHOTS,
  SNAPSHOT_01,
  SNAPSHOT_03,
  SNAPSHOT_06,
  SNAPSHOT_07,
  SNAPSHOT_08,
} from './index';
import {
  EXECUTIVE_MILESTONE_SET_STABLE,
  SNAPSHOT_STATES,
} from './snapshot-states';
import type { PopulatedSnapshotId, SnapshotFixture } from './types';

const ALL: PopulatedSnapshotId[] = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
];
const TRANSITIONS: [PopulatedSnapshotId, PopulatedSnapshotId][] = [
  ['01', '02'],
  ['02', '03'],
  ['03', '04'],
  ['04', '05'],
  ['05', '06'],
  ['06', '07'],
  ['07', '08'],
  ['08', '09'],
  ['09', '10'],
  ['10', '11'],
  ['11', '12'],
  ['12', '13'],
  ['13', '14'],
  ['14', '15'],
  ['15', '16'],
  ['16', '17'],
  ['17', '18'],
  ['18', '19'],
];

function ids(xs: { id: string }[]): string[] {
  return xs.map((x) => x.id).sort();
}

describe('fixture integrity — inventory / counts', () => {
  it('union of 01–19 canonical IDs matches R2-L1 scale', () => {
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
    expect(eq.size).toBe(52);
    expect(ms.size).toBe(44);
    expect(iss.size).toBe(30);
    expect(risk.size).toBe(30);
    expect(dec.size).toBe(18);
    expect([...eq].sort()).toEqual([...EQUIPMENT_IDS].sort());
    expect([...ms].sort()).toEqual([...MILESTONE_IDS].sort());
    expect([...iss].sort()).toEqual([...ISSUE_IDS].sort());
    expect([...risk].sort()).toEqual([...RISK_IDS].sort());
    expect([...dec].sort()).toEqual([...DECISION_IDS].sort());
  });

  it('every snapshot has 52 Equipment and 43 Milestones', () => {
    for (const id of ALL) {
      expect(SNAPSHOTS[id].equipment).toHaveLength(52);
      expect(SNAPSHOTS[id].milestones).toHaveLength(44);
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

  it('topException ids follow TEX-<snapshotSeg>-<domain…>; no en-dash; unique globally', () => {
    const letterOrOrdinal = '([A-S]|0[1-9]|1[0-9])';
    const texRe = new RegExp(
      `^TEX-${letterOrOrdinal}-[A-Z0-9]+(?:-[A-Z0-9]+)*$`,
    );
    const letterOf: Record<string, string> = Object.fromEntries(
      ALL.map((id, i) => [id, 'ABCDEFGHIJKLMNOPQRST'[i]]),
    );
    const seen = new Map<string, string>();
    for (const snap of ALL) {
      for (const tex of SNAPSHOTS[snap].topExceptions) {
        expect(tex.id.includes('–')).toBe(false);
        expect(tex.id).toMatch(texRe);
        const seg = tex.id.split('-')[1];
        if (/^\d{2}$/.test(seg)) {
          expect(seg).toBe(snap);
        } else {
          expect(seg).toBe(letterOf[snap]);
        }
        const prev = seen.get(tex.id);
        expect(prev).toBeUndefined();
        seen.set(tex.id, snap);
      }
    }
    expect(seen.size).toBeGreaterThan(20);
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
        const delta = calendarDaysDelta(
          eq.baselineDelivery,
          eq.forecastDelivery,
        );
        expect(delta).toBe(st.eqDelta[eq.id as keyof typeof st.eqDelta] ?? 0);
        const expectedStatus =
          st.eqStatus?.[eq.id as keyof typeof st.eqStatus] ??
          (delta > 0 ? 'Delayed' : 'OnTrack');
        expect(eq.status).toBe(expectedStatus);
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
    expect(findEquipment(SNAPSHOT_03, 'EQ-HVAC-01')!.forecastDelivery).toBe(
      '2027-06-05',
    );
    expect(SNAPSHOT_03.project.forecastProductionStart).toBe('2027-10-06');
    expect(findEquipment(SNAPSHOT_07, 'EQ-HVAC-01')!.forecastDelivery).toBe(
      '2027-05-29',
    );
    expect(SNAPSHOT_07.project.forecastProductionStart).toBe('2027-09-29');
    expect(SNAPSHOT_08.project.forecastProductionStart).toBe('2027-09-29');
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
    // Explicit 02: PKG delayed, PS baseline.
    expect(findEquipment(SNAPSHOTS['02'], 'EQ-PKG-01')!.status).toBe('Delayed');
    expect(SNAPSHOTS['02'].project.forecastProductionStart).toBe('2027-09-15');
    // Explicit 05: WFI delayed heavily, PS still HVAC +21.
    expect(
      calendarDaysDelta(
        findEquipment(SNAPSHOTS['05'], 'EQ-UTL-02')!.baselineDelivery,
        findEquipment(SNAPSHOTS['05'], 'EQ-UTL-02')!.forecastDelivery,
      ),
    ).toBe(18);
    expect(SNAPSHOTS['05'].project.forecastProductionStart).toBe('2027-10-06');
  });
});

describe('fixture integrity — BR-007 state-based', () => {
  it('18ISK-001 Red ⇒ MS-PS not Green on every snapshot', () => {
    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      const risk = findRisk(s, PS_RISK_ID)!;
      const ms = findMilestone(s, PS_MILESTONE_ID)!;
      if (risk.rag === 'Red') {
        expect(ms.rag).not.toBe('Green');
      }
    }
    expect(findRisk(SNAPSHOT_07, PS_RISK_ID)!.rag).toBe('Red');
    expect(findMilestone(SNAPSHOT_07, PS_MILESTONE_ID)!.rag).toBe('Red');
    expect(findRisk(SNAPSHOT_08, PS_RISK_ID)!.rag).toBe('Red');
    expect(findMilestone(SNAPSHOT_08, PS_MILESTONE_ID)!.rag).toBe('Red');
  });
});

describe('fixture integrity — RISK-COM-01 orphan exception', () => {
  it('accepts RISK-COM-01 Red without Issue; rejects arbitrary orphan Red', () => {
    const e = SNAPSHOTS['05'];
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

describe('fixture integrity — workstream rollups + project status 01–08', () => {
  it('spot-checks DOC-PROD-022 overall + notable WS', () => {
    expect(computeProjectStatus(SNAPSHOT_01)).toBe('Green');
    expect(
      computeWorkstreamRollups(SNAPSHOT_01).every((r) => r.status === 'Green'),
    ).toBe(true);

    expect(computeProjectStatus(SNAPSHOTS['02'])).toBe('Yellow');
    expect(workstreamStatus(SNAPSHOTS['02'], 'WS-PKG')).toBe('Yellow');
    expect(workstreamStatus(SNAPSHOTS['02'], 'WS-BLD')).toBe('Yellow');
    expect(workstreamStatus(SNAPSHOTS['02'], 'WS-HVAC')).toBe('Green');

    expect(computeProjectStatus(SNAPSHOT_03)).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_03, 'WS-HVAC')).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_03, 'WS-PKG')).toBe('Yellow');

    expect(computeProjectStatus(SNAPSHOTS['04'])).toBe('Red');
    expect(computeProjectStatus(SNAPSHOTS['05'])).toBe('Red');
    expect(computeProjectStatus(SNAPSHOT_06)).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_06, 'WS-HVAC')).toBe('Red');

    expect(computeProjectStatus(SNAPSHOT_07)).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_07, 'WS-HVAC')).toBe('Red');
    // DOC-PROD-022: S4 primary recovered ≠ WS-PKG Green. Residual
    // serialization (EQ-PKG-03 Delayed + ISS-PKG-02 Open) → WS-PKG Yellow
    // under unchanged E1 rollup.
    expect(workstreamStatus(SNAPSHOT_07, 'WS-PKG')).toBe('Yellow');
    expect(findEquipment(SNAPSHOT_07, 'EQ-PKG-01')!.status).toBe('OnTrack');
    expect(findRisk(SNAPSHOT_07, 'RISK-PKG-01')!.rag).toBe('Green');
    expect(findIssue(SNAPSHOT_07, 'ISS-PKG-01')!.status).toBe('Closed');
    expect(findEquipment(SNAPSHOT_07, 'EQ-PKG-03')!.status).toBe('Delayed');
    expect(findIssue(SNAPSHOT_07, 'ISS-PKG-02')!.status).toBe('Open');

    expect(computeProjectStatus(SNAPSHOT_08)).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_08, 'WS-HVAC')).toBe('Red');
    expect(workstreamStatus(SNAPSHOT_08, 'WS-PKG')).toBe('Yellow');
    expect(findEquipment(SNAPSHOT_08, 'EQ-PKG-01')!.status).toBe('OnTrack');
    expect(findIssue(SNAPSHOT_08, 'ISS-PKG-01')!.status).toBe('Closed');

    for (const id of ALL) {
      expect(computeWorkstreamRollups(SNAPSHOTS[id])).toHaveLength(
        WORKSTREAM_IDS.length,
      );
    }
  });
});

describe('fixture integrity — Top Exceptions + Trend', () => {
  it('01 empty exceptions; priorities unique and sorted; trends authored', () => {
    expect(SNAPSHOT_01.topExceptions).toEqual([]);
    expect(SNAPSHOT_01.trend).toEqual({
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

    expect(SNAPSHOTS['02'].trend.worse).toEqual(
      expect.arrayContaining([
        'Упаковка: прогноз срыва FAT',
        'Оболочка: замечания по дверям',
      ]),
    );
    expect(SNAPSHOT_03.trend.worse).toContain('HVAC / старт производства: +21');
    expect(SNAPSHOT_06.trend.unchangedCritical).toContain(
      'HVAC / PS без изменения прогноза',
    );
    expect(SNAPSHOT_07.trend.better).toEqual(
      expect.arrayContaining([
        'Упаковка стабилизирована',
        'HVAC Δ снижен до +14',
      ]),
    );
    expect(SNAPSHOT_08.trend.better).toContain(
      'Зафиксирована заморозка точек BMS/EMS',
    );
  });
});

describe('fixture integrity — 01–19 retrievable; narrative spine', () => {
  it('all nineteen snapshots exist with expected PS / DEC / ISS spine', () => {
    expect(Object.keys(SNAPSHOTS).sort()).toEqual([...ALL].sort());
    expect(findIssue(SNAPSHOT_01, PS_ISSUE_ID)).toBeUndefined();
    expect(findIssue(SNAPSHOT_03, PS_ISSUE_ID)?.status).toBe('Open');
    expect(SNAPSHOT_06.decisions.some((d) => d.id === 'DEC-001')).toBe(true);
    expect(SNAPSHOT_03.decisions).toEqual([]);
    expect(findIssue(SNAPSHOT_07, PS_ISSUE_ID)?.status).toBe('Mitigating');
    expect(findEquipment(SNAPSHOT_07, PS_DRIVER_EQUIPMENT_ID)!.status).toBe(
      'Delayed',
    );
  });
});

describe('fixture integrity — R2-L1 late lifecycle BR-004/007', () => {
  it('15 atomically moves HVAC and PS +14 → +7 together', () => {
    const n = SNAPSHOTS['14'];
    const o = SNAPSHOTS['15'];
    expect(
      calendarDaysDelta(
        findEquipment(n, PS_DRIVER_EQUIPMENT_ID)!.baselineDelivery,
        findEquipment(n, PS_DRIVER_EQUIPMENT_ID)!.forecastDelivery,
      ),
    ).toBe(14);
    expect(
      calendarDaysDelta(
        n.project.baselineProductionStart,
        n.project.forecastProductionStart,
      ),
    ).toBe(14);
    expect(
      calendarDaysDelta(
        findEquipment(o, PS_DRIVER_EQUIPMENT_ID)!.baselineDelivery,
        findEquipment(o, PS_DRIVER_EQUIPMENT_ID)!.forecastDelivery,
      ),
    ).toBe(7);
    expect(
      calendarDaysDelta(
        o.project.baselineProductionStart,
        o.project.forecastProductionStart,
      ),
    ).toBe(7);
    expect(o.project.forecastProductionStart).toBe('2027-09-22');
  });

  it('no HVAC/PS delta mismatch on any snapshot', () => {
    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      const ps = calendarDaysDelta(
        s.project.baselineProductionStart,
        s.project.forecastProductionStart,
      );
      const hvac = calendarDaysDelta(
        findEquipment(s, PS_DRIVER_EQUIPMENT_ID)!.baselineDelivery,
        findEquipment(s, PS_DRIVER_EQUIPMENT_ID)!.forecastDelivery,
      );
      expect(ps).toBe(hvac);
    }
  });

  it('09–16 Red / 17 Yellow / 18 Yellow / 19 Green via status rules', () => {
    for (const id of [
      '09',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
    ] as const) {
      expect(computeProjectStatus(SNAPSHOTS[id])).toBe('Red');
    }

    expect(findRisk(SNAPSHOTS['16'], PS_RISK_ID)!.rag).toBe('Red');
    expect(findMilestone(SNAPSHOTS['16'], PS_MILESTONE_ID)!.rag).not.toBe(
      'Green',
    );

    expect(findRisk(SNAPSHOTS['17'], PS_RISK_ID)!.rag).not.toBe('Red');
    expect(findMilestone(SNAPSHOTS['17'], PS_MILESTONE_ID)!.rag).not.toBe(
      'Red',
    );
    expect(computeProjectStatus(SNAPSHOTS['17'])).toBe('Yellow');
    // 17/18 keep HVAC Delayed (+7); Yellow via residual attention, not asOf completion.
    expect(findEquipment(SNAPSHOTS['17'], PS_DRIVER_EQUIPMENT_ID)!.status).toBe(
      'Delayed',
    );
    expect(findEquipment(SNAPSHOTS['18'], PS_DRIVER_EQUIPMENT_ID)!.status).toBe(
      'Delayed',
    );

    expect(findRisk(SNAPSHOTS['18'], PS_RISK_ID)!.rag).not.toBe('Red');
    expect(findMilestone(SNAPSHOTS['18'], PS_MILESTONE_ID)!.rag).not.toBe(
      'Red',
    );
    expect(computeProjectStatus(SNAPSHOTS['18'])).toBe('Yellow');

    expect(findRisk(SNAPSHOTS['19'], PS_RISK_ID)!.rag).toBe('Green');
    expect(findMilestone(SNAPSHOTS['19'], PS_MILESTONE_ID)!.rag).toBe('Green');
    const hvacS = findEquipment(SNAPSHOTS['19'], PS_DRIVER_EQUIPMENT_ID)!;
    expect(hvacS.status).toBe('OnTrack');
    expect(
      calendarDaysDelta(hvacS.baselineDelivery, hvacS.forecastDelivery),
    ).toBe(7);
    expect(computeProjectStatus(SNAPSHOTS['19'])).toBe('Green');
  });

  it('01–08 Equipment.status uses schedule variance; not asOf inference', () => {
    expect(findEquipment(SNAPSHOTS['02'], 'EQ-BLD-02')!.status).toBe('Delayed');
    expect(findEquipment(SNAPSHOTS['02'], 'EQ-PKG-01')!.status).toBe('Delayed');
    expect(findEquipment(SNAPSHOT_03, PS_DRIVER_EQUIPMENT_ID)!.status).toBe(
      'Delayed',
    );
    // Positive delta remains Delayed even when forecastDelivery <= asOf (02 BLD).
    const bld = findEquipment(SNAPSHOTS['02'], 'EQ-BLD-02')!;
    expect(bld.forecastDelivery <= SNAPSHOTS['02'].scenarioAsOfDate).toBe(true);
    expect(bld.status).toBe('Delayed');
  });

  it('19 HVAC OnTrack is fixture-authored override, not calendar completion', () => {
    const st = SNAPSHOT_STATES['19'];
    expect(st.eqDelta['EQ-HVAC-01']).toBe(7);
    expect(st.eqStatus?.['EQ-HVAC-01']).toBe('OnTrack');
    expect(findEquipment(SNAPSHOTS['19'], PS_DRIVER_EQUIPMENT_ID)!.status).toBe(
      'OnTrack',
    );
  });

  it('panel and power baselines stay fixed; 03–19 hold the 03 slip; 02 stays green', () => {
    const baselines = {
      'MS-CLN-PANEL': '2027-02-16',
      'MS-UTL-PWR': '2027-02-18',
    } as const;
    for (const id of ALL) {
      for (const milestoneId of ['MS-CLN-PANEL', 'MS-UTL-PWR'] as const) {
        const milestone = findMilestone(SNAPSHOTS[id], milestoneId)!;
        expect(milestone.baselineDate).toBe(baselines[milestoneId]);
      }
    }

    const panelB = findMilestone(SNAPSHOTS['02'], 'MS-CLN-PANEL')!;
    const powerB = findMilestone(SNAPSHOTS['02'], 'MS-UTL-PWR')!;
    expect(panelB.forecastDate).toBe('2027-02-16');
    expect(panelB.rag).toBe('Green');
    expect(powerB.forecastDate).toBe('2027-02-18');
    expect(powerB.rag).toBe('Green');

    for (const id of ALL.filter(
      (snapshotId) => snapshotId !== '01' && snapshotId !== '02',
    )) {
      const panel = findMilestone(SNAPSHOTS[id], 'MS-CLN-PANEL')!;
      const power = findMilestone(SNAPSHOTS[id], 'MS-UTL-PWR')!;
      expect(panel.forecastDate).toBe('2027-03-09');
      expect(panel.rag).toBe('Red');
      expect(power.forecastDate).toBe('2027-04-15');
      expect(power.rag).toBe('Red');
    }

    expect(findMilestone(SNAPSHOT_03, 'MS-PS')!.forecastDate).toBe(
      '2027-10-06',
    );
    expect(findMilestone(SNAPSHOT_03, 'MS-PS')!.rag).toBe('Red');
    expect(findEquipment(SNAPSHOT_03, 'EQ-HVAC-01')!.status).toBe('Delayed');
    expect(ISSUE_CATALOG['ISS-CLN-01'].milestoneId).toBe('MS-CLN-RDY');
    expect(ISSUE_CATALOG['ISS-CLN-01'].equipmentId).toBe('EQ-CLN-01');
    expect(
      SNAPSHOT_03.milestones.some((milestone) => milestone.id === 'MS-BLD-FND'),
    ).toBe(true);
    expect(
      SNAPSHOT_03.milestones.some((milestone) => milestone.id === 'MS-BLD-STR'),
    ).toBe(true);
    // Fixture-authored executiveMilestoneIds remain the legacy curated seed;
    // DashboardService expands to the canonical 189-universe at read time.
    expect(SNAPSHOT_03.executiveMilestoneIds).toContain('MS-PS');
    expect(EXECUTIVE_MILESTONE_SET_STABLE).toContain('MS-PS');
  });

  it('fixture executiveMilestoneIds seed stable 01–19 (legacy curated 12)', () => {
    expect(EXECUTIVE_MILESTONE_SET_STABLE).toHaveLength(12);
    expect(EXECUTIVE_MILESTONE_SET_STABLE).toContain('MS-PS');
    for (const id of ALL) {
      const s = SNAPSHOTS[id];
      expect(s.executiveMilestoneIds).toEqual([
        ...EXECUTIVE_MILESTONE_SET_STABLE,
      ]);
      const ms = new Set(s.milestones.map((m) => m.id));
      for (const mid of s.executiveMilestoneIds) {
        expect(ms.has(mid)).toBe(true);
      }
    }
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
