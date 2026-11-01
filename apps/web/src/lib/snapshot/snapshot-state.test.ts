import { describe, expect, it } from 'vitest';
import type { ProjectStub } from '@/lib/api-client';
import { createMonotonicSeq } from './snapshot-seq';
import { runSnapshotLoad } from './run-snapshot-load';
import {
  initialSnapshotState,
  snapshotReducer,
  type SnapshotAction,
  type SnapshotState,
} from './snapshot-state';

function project(snapshotId: 'A' | 'B' | 'C', forecast: string): ProjectStub {
  return {
    id: 'PRJ-01',
    name: 'Facility Expansion Alpha',
    baselineProductionStart: '2027-09-15',
    forecastProductionStart: forecast,
    snapshotId,
    scenarioAsOfDate: '2027-02-15',
  };
}

describe('snapshotReducer (atomic switch)', () => {
  it('starts with active A and no project', () => {
    expect(initialSnapshotState.active).toBe('A');
    expect(initialSnapshotState.project).toBeNull();
    expect(initialSnapshotState.status).toBe('idle');
  });

  it('request B does not change active A', () => {
    const next = snapshotReducer(initialSnapshotState, {
      type: 'request',
      snapshot: 'B',
      seq: 1,
    });
    expect(next.active).toBe('A');
    expect(next.requested).toBe('B');
    expect(next.status).toBe('loading');
    expect(next.error).toBeNull();
  });

  it('success B activates B with payload', () => {
    let state = snapshotReducer(initialSnapshotState, {
      type: 'request',
      snapshot: 'B',
      seq: 1,
    });
    state = snapshotReducer(state, {
      type: 'success',
      snapshot: 'B',
      project: project('B', '2027-10-06'),
      seq: 1,
    });
    expect(state.active).toBe('B');
    expect(state.requested).toBeNull();
    expect(state.status).toBe('idle');
    expect(state.project?.forecastProductionStart).toBe('2027-10-06');
  });

  it('failure keeps previous active and exposes error + retry path', () => {
    let state = snapshotReducer(initialSnapshotState, {
      type: 'request',
      snapshot: 'B',
      seq: 1,
    });
    state = snapshotReducer(state, {
      type: 'success',
      snapshot: 'B',
      project: project('B', '2027-10-06'),
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
    expect(state.project?.snapshotId).toBe('B');
    expect(state.status).toBe('error');
    expect(state.error).toBe('network');
    expect(state.requested).toBeNull();

    state = snapshotReducer(state, {
      type: 'request',
      snapshot: 'C',
      seq: 3,
    });
    expect(state.active).toBe('B');
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('ignores stale success from older request', () => {
    let state = snapshotReducer(initialSnapshotState, {
      type: 'request',
      snapshot: 'B',
      seq: 1,
    });
    state = snapshotReducer(state, {
      type: 'request',
      snapshot: 'C',
      seq: 2,
    });
    state = snapshotReducer(state, {
      type: 'success',
      snapshot: 'B',
      project: project('B', '2027-10-06'),
      seq: 1,
    });
    expect(state.active).toBe('A');
    expect(state.requested).toBe('C');
    expect(state.status).toBe('loading');
  });
});

describe('createMonotonicSeq + runSnapshotLoad (R1)', () => {
  it('allocates unique increasing seqs without React state', () => {
    const next = createMonotonicSeq();
    const a = next();
    const b = next();
    const c = next();
    expect([a, b, c]).toEqual([1, 2, 3]);
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it('concurrent loads get distinct seqs; older success cannot win', async () => {
    const allocateSeq = createMonotonicSeq();
    let state: SnapshotState = initialSnapshotState;
    const dispatch = (action: SnapshotAction) => {
      state = snapshotReducer(state, action);
    };

    let resolveB!: (p: ProjectStub) => void;
    let resolveC!: (p: ProjectStub) => void;
    const fetchB = new Promise<ProjectStub>((r) => {
      resolveB = r;
    });
    const fetchC = new Promise<ProjectStub>((r) => {
      resolveC = r;
    });

    const loadB = runSnapshotLoad({
      snapshot: 'B',
      projectId: 'PRJ-01',
      allocateSeq,
      dispatch,
      fetchProject: async () => fetchB,
    });
    const loadC = runSnapshotLoad({
      snapshot: 'C',
      projectId: 'PRJ-01',
      allocateSeq,
      dispatch,
      fetchProject: async () => fetchC,
    });

    expect(state.requestSeq).toBe(2);
    expect(state.requested).toBe('C');
    expect(state.active).toBe('A');

    resolveB(project('B', '2027-10-06'));
    await loadB;
    expect(state.active).toBe('A');
    expect(state.requested).toBe('C');
    expect(state.status).toBe('loading');

    resolveC(project('C', '2027-10-06'));
    await loadC;
    expect(state.active).toBe('C');
    expect(state.project?.snapshotId).toBe('C');
    expect(state.status).toBe('idle');
  });
});
