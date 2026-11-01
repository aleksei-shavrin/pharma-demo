import { describe, expect, it } from 'vitest';
import type { DashboardOverview, ProjectStub } from '@/lib/api-client';
import { createMonotonicSeq } from './snapshot-seq';
import { runSnapshotLoad } from './run-snapshot-load';
import {
  initialSnapshotState,
  snapshotReducer,
  type SnapshotAction,
  type SnapshotState,
} from './snapshot-state';

function dashboard(
  snapshotId: 'A' | 'B' | 'C',
  forecast: string,
): DashboardOverview {
  return {
    snapshotId,
    scenarioAsOfDate: '2027-02-15',
    project: {
      id: 'PRJ-01',
      name: 'Строительство фармацевтического завода',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: forecast,
      productionStartVariance: {
        subject: 'production_start',
        baselineDate: '2027-09-15',
        forecastDate: forecast,
        deltaDays: forecast === '2027-09-15' ? 0 : 21,
      },
    },
    equipment: {
      id: 'EQ-HVAC-01',
      critical: true,
      status: forecast === '2027-09-15' ? 'OnTrack' : 'Delayed',
      baselineDelivery: '2027-05-15',
      forecastDelivery: forecast === '2027-09-15' ? '2027-05-15' : '2027-06-05',
      deliveryVariance: {
        subject: 'equipment_delivery',
        baselineDate: '2027-05-15',
        forecastDate:
          forecast === '2027-09-15' ? '2027-05-15' : '2027-06-05',
        deltaDays: forecast === '2027-09-15' ? 0 : 21,
      },
    },
    issue: null,
    risk: {
      id: 'RISK-001',
      rag: forecast === '2027-09-15' ? 'Green' : 'Red',
      equipmentId: 'EQ-HVAC-01',
      milestoneId: 'MS-PS',
      issueId: null,
    },
    milestone: {
      id: 'MS-PS',
      name: 'Ready for production',
      rag: forecast === '2027-09-15' ? 'Green' : 'Red',
      baselineDate: '2027-09-15',
      forecastDate: forecast,
    },
    decisionPanelState: 'absent',
    decision: null,
    directEdges: [],
    derivedImpact: {
      rule: 'BR-004',
      equipmentDeliveryDeltaDays: forecast === '2027-09-15' ? 0 : 21,
      productionStartDeltaDays: forecast === '2027-09-15' ? 0 : 21,
      kind: forecast === '2027-09-15' ? 'none' : 'aligned_slip',
    },
    decisionHonesty: null,
  };
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
    expect(initialSnapshotState.active).toBe('A');
    expect(initialSnapshotState.dashboard).toBeNull();
  });

  it('request B does not change active A or dashboard', () => {
    const next = snapshotReducer(
      {
        ...initialSnapshotState,
        active: 'A',
        project: projectFrom(dashboard('A', '2027-09-15')),
        dashboard: dashboard('A', '2027-09-15'),
      },
      { type: 'request', snapshot: 'B', seq: 1 },
    );
    expect(next.active).toBe('A');
    expect(next.dashboard?.snapshotId).toBe('A');
    expect(next.requested).toBe('B');
    expect(next.status).toBe('loading');
  });

  it('success B commits dashboard + project together', () => {
    let state = snapshotReducer(initialSnapshotState, {
      type: 'request',
      snapshot: 'B',
      seq: 1,
    });
    const dash = dashboard('B', '2027-10-06');
    state = snapshotReducer(state, {
      type: 'success',
      snapshot: 'B',
      project: projectFrom(dash),
      dashboard: dash,
      seq: 1,
    });
    expect(state.active).toBe('B');
    expect(state.dashboard?.snapshotId).toBe('B');
    expect(state.project?.forecastProductionStart).toBe('2027-10-06');
  });

  it('failure keeps previous dashboard; stale success ignored', () => {
    let state = snapshotReducer(initialSnapshotState, {
      type: 'request',
      snapshot: 'B',
      seq: 1,
    });
    const dashB = dashboard('B', '2027-10-06');
    state = snapshotReducer(state, {
      type: 'success',
      snapshot: 'B',
      project: projectFrom(dashB),
      dashboard: dashB,
      seq: 1,
    });
    state = snapshotReducer(state, {
      type: 'request',
      snapshot: 'C',
      seq: 2,
    });
    state = snapshotReducer(state, {
      type: 'failure',
      error: 'network',
      seq: 2,
    });
    expect(state.active).toBe('B');
    expect(state.dashboard?.snapshotId).toBe('B');
    expect(state.status).toBe('error');

    state = snapshotReducer(state, {
      type: 'request',
      snapshot: 'C',
      seq: 3,
    });
    state = snapshotReducer(state, {
      type: 'success',
      snapshot: 'B',
      project: projectFrom(dashB),
      dashboard: dashB,
      seq: 1,
    });
    expect(state.active).toBe('B');
    expect(state.requested).toBe('C');
    expect(state.status).toBe('loading');
  });
});

describe('createMonotonicSeq + runSnapshotLoad (dashboard atomic)', () => {
  it('concurrent loads: older dashboard cannot win', async () => {
    const allocateSeq = createMonotonicSeq();
    let state: SnapshotState = initialSnapshotState;
    const dispatch = (action: SnapshotAction) => {
      state = snapshotReducer(state, action);
    };

    let resolveB!: (p: DashboardOverview) => void;
    let resolveC!: (p: DashboardOverview) => void;
    const fetchB = new Promise<DashboardOverview>((r) => {
      resolveB = r;
    });
    const fetchC = new Promise<DashboardOverview>((r) => {
      resolveC = r;
    });

    const loadB = runSnapshotLoad({
      snapshot: 'B',
      projectId: 'PRJ-01',
      allocateSeq,
      dispatch,
      fetchDashboard: async () => fetchB,
    });
    const loadC = runSnapshotLoad({
      snapshot: 'C',
      projectId: 'PRJ-01',
      allocateSeq,
      dispatch,
      fetchDashboard: async () => fetchC,
    });

    expect(state.requestSeq).toBe(2);
    expect(state.requested).toBe('C');

    resolveB(dashboard('B', '2027-10-06'));
    await loadB;
    expect(state.active).toBe('A');
    expect(state.dashboard).toBeNull();

    resolveC(dashboard('C', '2027-10-06'));
    await loadC;
    expect(state.active).toBe('C');
    expect(state.dashboard?.snapshotId).toBe('C');
  });
});
