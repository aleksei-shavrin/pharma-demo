import { describe, expect, it } from 'vitest';
import type { DashboardOverview, ProjectStub } from '@/lib/api-client';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import type { SnapshotId } from './snapshot-id';
import { createMonotonicSeq } from './snapshot-seq';
import { runSnapshotLoad } from './run-snapshot-load';
import {
  initialSnapshotState,
  snapshotReducer,
  type SnapshotAction,
  type SnapshotState,
} from './snapshot-state';

function dashboard(
  snapshotId: SnapshotId,
  forecast: string,
): DashboardOverview {
  const delayed = forecast !== '2027-09-15';
  return dashboardOverviewFixture(snapshotId, {
    project: {
      id: 'PRT-01',
      name: 'Строительство фармацевтической фабрики (Greenfield)',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: forecast,
      productionStartVariance: {
        subject: 'production_start',
        baselineDate: '2027-09-15',
        forecastDate: forecast,
        deltaDays: delayed ? 21 : 0,
      },
    },
    equipment: [
      {
        id: 'EQ-HVAC-01',
        name: 'Приточная установка AHU (long-lead)',
        critical: true,
        status: delayed ? 'Delayed' : 'OnTrack',
        workstream: 'WS-HVAC',
        baselineDelivery: '2027-05-15',
        forecastDelivery: delayed ? '2027-06-05' : '2027-05-15',
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: '2027-05-15',
          forecastDate: delayed ? '2027-06-05' : '2027-05-15',
          deltaDays: delayed ? 21 : 0,
        },
      },
    ],
    issues: [],
    risks: [
      {
        id: 'RISK-001',
        title: 'Срыв окна монтажа HVAC → сдвиг старта производства',
        rag: delayed ? 'Red' : 'Green',
        workstream: 'WS-HVAC',
        equipmentId: 'EQ-HVAC-01',
        milestoneId: 'MS-PS',
        issueId: null,
      },
    ],
    milestones: [
      {
        id: 'MS-PS',
        name: 'Готовность к старту производства',
        rag: delayed ? 'Red' : 'Green',
        workstream: null,
        baselineDate: '2027-09-15',
        forecastDate: forecast,
      },
    ],
    decisions: [],
    decisionPanelState: 'absent',
    decisionHonesty: null,
    peopleFocus: {
      previousSnapshotId: null,
      summary: {
        peopleWithQuestions: 0,
        criticalQuestionCount: 0,
        newCriticalQuestionCount: null,
        removedCriticalSignalCount: null,
        otherActiveIssueCount: 0,
      },
      people: [],
      unassignedDelayedCriticalEquipmentIds: [],
      totalPeopleInFocus: 0,
    },
  });
}

function projectFrom(d: DashboardOverview): ProjectStub {
  return {
    id: d.project.id,
    name: d.project.name,
    baselineProductionStart: d.project.baselineProductionStart,
    forecastProductionStart: d.project.forecastProductionStart,
    snapshotId: d.snapshotId,
    scenarioAsOfDate: d.scenarioAsOfDate,
  };
}

describe('snapshotReducer (atomic switch + dashboard)', () => {
  it('starts with active A and no dashboard', () => {
    expect(initialSnapshotState.active).toBe('01');
    expect(initialSnapshotState.dashboard).toBeNull();
  });

  it('request B does not change active A or dashboard', () => {
    const next = snapshotReducer(
      {
        ...initialSnapshotState,
        active: '01',
        project: projectFrom(dashboard('01', '2027-09-15')),
        dashboard: dashboard('01', '2027-09-15'),
      },
      { type: 'request', snapshot: '02', seq: 1 },
    );
    expect(next.active).toBe('01');
    expect(next.dashboard?.snapshotId).toBe('01');
    expect(next.requested).toBe('02');
    expect(next.status).toBe('loading');
  });

  it('success B commits dashboard + project together', () => {
    let state = snapshotReducer(initialSnapshotState, {
      type: 'request',
      snapshot: '02',
      seq: 1,
    });
    const dash = dashboard('02', '2027-10-06');
    state = snapshotReducer(state, {
      type: 'success',
      snapshot: '02',
      project: projectFrom(dash),
      dashboard: dash,
      seq: 1,
    });
    expect(state.active).toBe('02');
    expect(state.dashboard?.snapshotId).toBe('02');
    expect(state.project?.forecastProductionStart).toBe('2027-10-06');
  });

  it('failure keeps previous dashboard; stale success ignored', () => {
    let state = snapshotReducer(initialSnapshotState, {
      type: 'request',
      snapshot: '02',
      seq: 1,
    });
    const dashB = dashboard('02', '2027-10-06');
    state = snapshotReducer(state, {
      type: 'success',
      snapshot: '02',
      project: projectFrom(dashB),
      dashboard: dashB,
      seq: 1,
    });
    state = snapshotReducer(state, {
      type: 'request',
      snapshot: '03',
      seq: 2,
    });
    state = snapshotReducer(state, {
      type: 'failure',
      error: 'network',
      seq: 2,
    });
    expect(state.active).toBe('02');
    expect(state.dashboard?.snapshotId).toBe('02');
    expect(state.status).toBe('error');

    state = snapshotReducer(state, {
      type: 'request',
      snapshot: '03',
      seq: 3,
    });
    state = snapshotReducer(state, {
      type: 'success',
      snapshot: '02',
      project: projectFrom(dashB),
      dashboard: dashB,
      seq: 1,
    });
    expect(state.active).toBe('02');
    expect(state.requested).toBe('03');
    expect(state.status).toBe('loading');
  });
});

describe('createMonotonicSeq + runSnapshotLoad (dashboard atomic)', () => {
  it('concurrent loads: older dashboard cannot win; stale skips onCommitted', async () => {
    const allocateSeq = createMonotonicSeq();
    let state: SnapshotState = initialSnapshotState;
    const dispatch = (action: SnapshotAction) => {
      state = snapshotReducer(state, action);
    };
    const committed: string[] = [];

    let resolveB!: (p: DashboardOverview) => void;
    let resolveC!: (p: DashboardOverview) => void;
    const fetchB = new Promise<DashboardOverview>((r) => {
      resolveB = r;
    });
    const fetchC = new Promise<DashboardOverview>((r) => {
      resolveC = r;
    });

    const loadB = runSnapshotLoad({
      snapshot: '02',
      projectId: 'PRT-01',
      allocateSeq,
      dispatch,
      fetchDashboard: async () => fetchB,
      getRequestSeq: () => state.requestSeq,
      onCommitted: (s) => {
        committed.push(s);
      },
    });
    const loadC = runSnapshotLoad({
      snapshot: '03',
      projectId: 'PRT-01',
      allocateSeq,
      dispatch,
      fetchDashboard: async () => fetchC,
      getRequestSeq: () => state.requestSeq,
      onCommitted: (s) => {
        committed.push(s);
      },
    });

    expect(state.requestSeq).toBe(2);
    expect(state.requested).toBe('03');

    resolveB(dashboard('02', '2027-10-06'));
    await loadB;
    expect(state.active).toBe('01');
    expect(state.dashboard).toBeNull();
    expect(committed).toEqual([]);

    resolveC(dashboard('03', '2027-10-06'));
    await loadC;
    expect(state.active).toBe('03');
    expect(state.dashboard?.snapshotId).toBe('03');
    expect(committed).toEqual(['03']);
  });
});
