import { NotFoundException } from '@nestjs/common';
import {
  DEMO_WORKSTREAM_CBS_RUB,
  DEMO_WORKSTREAM_BUDGETS_SUM_RUB,
} from '../contracts/money';
import { COST_SNAPSHOTS } from '../data/fixtures/build-costs';
import { SNAPSHOTS } from '../data/fixtures';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import {
  computeWorkstreamRollups,
  workstreamStatus,
} from '../data/project-status';
import { WORKSTREAM_IDS, WORKSTREAM_SORT_ORDER } from '../data/workstream-ids';
import { WorkstreamsService } from './workstreams.service';

describe('WorkstreamsService (R2-W1)', () => {
  const service = new WorkstreamsService(new MockDemoDataSource());

  it('lists exactly 8 Workstreams in stable sortOrder', () => {
    const list = service.list('PRT-01', '01');
    expect(list.items).toHaveLength(8);
    expect(list.items.map((i) => i.id)).toEqual([...WORKSTREAM_IDS]);
    expect(list.items.map((i) => i.sortOrder)).toEqual(
      WORKSTREAM_IDS.map((id) => WORKSTREAM_SORT_ORDER[id]),
    );
    expect(list.snapshotId).toBe('01');
    expect(list.scenarioAsOfDate).toBe(SNAPSHOTS['01'].scenarioAsOfDate);
  });

  it('assigns a resolving leadPersonId for every Workstream (R2-P1)', () => {
    const list = service.list('PRT-01', '03');
    expect(list.items.every((i) => i.leadPersonId?.startsWith('PER-'))).toBe(
      true,
    );
    expect(list.items.find((i) => i.id === 'WS-HVAC')?.leadPersonId).toBe(
      'PER-08',
    );
  });

  it('resolves detail for every Workstream on A', () => {
    for (const id of WORKSTREAM_IDS) {
      const d = service.getDetail('PRT-01', id, '01');
      expect(d.workstream.id).toBe(id);
      expect(d.cost?.workstream).toBe(id);
      expect(d.cost?.approvedControlBudgetRub).toBe(
        DEMO_WORKSTREAM_CBS_RUB[id],
      );
    }
  });

  it('404s unknown project and unknown Workstream', () => {
    expect(() => service.list('PRJ-UNKNOWN', '01')).toThrow(NotFoundException);
    expect(() => service.getDetail('PRT-01', 'WS-NOPE', '01')).toThrow(
      NotFoundException,
    );
    expect(() => service.getDetail('PRJ-UNKNOWN', 'WS-HVAC', '01')).toThrow(
      NotFoundException,
    );
  });

  it('is snapshot-aware for A / O / S', () => {
    const a = service.getDetail('PRT-01', 'WS-HVAC', '01');
    const o = service.getDetail('PRT-01', 'WS-HVAC', '15');
    const s = service.getDetail('PRT-01', 'WS-HVAC', '19');
    expect(a.scenarioAsOfDate).toBe('2027-02-15');
    expect(o.scenarioAsOfDate).toBe(SNAPSHOTS['15'].scenarioAsOfDate);
    expect(s.scenarioAsOfDate).toBe('2027-09-22');
    expect(a.rag).toBe('Green');
    expect(o.rag).toBe(workstreamStatus(SNAPSHOTS['15'], 'WS-HVAC'));
    expect(s.rag).toBe(workstreamStatus(SNAPSHOTS['19'], 'WS-HVAC'));
  });

  it('uses the same RAG semantics as Dashboard workstream rollups', () => {
    for (const id of ['01', '02', '03', '15', '19'] as const) {
      const list = service.list('PRT-01', id);
      const rollups = computeWorkstreamRollups(SNAPSHOTS[id]);
      for (const item of list.items) {
        const rollup = rollups.find((r) => r.workstream === item.id);
        expect(item.rag).toBe(rollup?.status);
        expect(item.rag).toBe(workstreamStatus(SNAPSHOTS[id], item.id));
      }
    }
  });

  it('RAG: Red Risk / Delayed critical / Open Issue / Closed-only Green', () => {
    expect(service.getDetail('PRT-01', 'WS-HVAC', '03').rag).toBe('Red');
    expect(service.getDetail('PRT-01', 'WS-PKG', '02').rag).toBe('Yellow');
    expect(service.getDetail('PRT-01', 'WS-BLD', '02').rag).toBe('Yellow');
    expect(service.getDetail('PRT-01', 'WS-HVAC', '01').rag).toBe('Green');
  });

  it('membership stays inside the Workstream (no cross-WS leakage)', () => {
    const hvac = service.getDetail('PRT-01', 'WS-HVAC', '03');
    expect(hvac.equipmentIds).toContain('EQ-HVAC-01');
    expect(hvac.issueIds).toContain('ISS-001');
    expect(hvac.riskIds).toContain('RISK-001');
    expect(
      hvac.equipment.every(
        (e) => e.id.startsWith('EQ-HVAC') || e.id.startsWith('EQ-'),
      ),
    ).toBe(true);
    for (const eq of hvac.equipment) {
      const cat = SNAPSHOTS['03'].equipment.find((e) => e.id === eq.id);
      expect(cat?.workstream).toBe('WS-HVAC');
    }
    for (const issue of hvac.issues) {
      expect(
        SNAPSHOTS['03'].issues.find((i) => i.id === issue.id)?.workstream,
      ).toBe('WS-HVAC');
    }
    for (const risk of hvac.risks) {
      expect(
        SNAPSHOTS['03'].risks.find((r) => r.id === risk.id)?.workstream,
      ).toBe('WS-HVAC');
    }
    // Decisions with MS-PS (null WS) do not leak into HVAC via project MS.
    expect(hvac.decisionIds).not.toContain('DEC-001');
  });

  it('cost summary matches M1 cost read model; no WS-09 / contingency allocation', () => {
    const listCosts = COST_SNAPSHOTS['01'].workstreams;
    expect(listCosts).toHaveLength(8);
    expect(listCosts.reduce((s, w) => s + w.approvedControlBudgetRub, 0)).toBe(
      DEMO_WORKSTREAM_BUDGETS_SUM_RUB,
    );

    for (const id of WORKSTREAM_IDS) {
      const detail = service.getDetail('PRT-01', id, '01');
      const m1 = listCosts.find((w) => w.workstream === id)!;
      expect(detail.cost).toEqual({
        workstream: m1.workstream,
        approvedControlBudgetRub: m1.approvedControlBudgetRub,
        actualCostRub: m1.actualCostRub,
        committedCostRub: m1.committedCostRub,
        etcRub: m1.etcRub,
        eacRub: m1.eacRub,
        vacRub: m1.vacRub,
      });
    }

    const a = COST_SNAPSHOTS['01'];
    expect(a.reconciliation.workstreamEacSumRub).toBe(5_850_000_000);
    expect(a.reconciliation.projectLevelForecastRub).toBe(350_000_000);
    expect(a.project.eacRub).toBe(
      a.reconciliation.workstreamEacSumRub +
        a.reconciliation.projectLevelForecastRub,
    );
  });
});
