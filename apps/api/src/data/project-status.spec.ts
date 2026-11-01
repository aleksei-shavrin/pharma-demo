import { SNAPSHOT_A, SNAPSHOT_B, SNAPSHOT_C } from './fixtures';
import type { SnapshotFixture } from './fixtures/types';
import {
  computeProjectStatus,
  computeWorkstreamRollups,
  workstreamStatus,
} from './project-status';

function cloneA(): SnapshotFixture {
  return structuredClone(SNAPSHOT_A);
}

describe('workstreamStatus', () => {
  it('returns Red when any Risk in WS is Red', () => {
    expect(workstreamStatus(SNAPSHOT_C, 'WS-HVAC')).toBe('Red');
  });

  it('returns Yellow from Delayed critical Equipment without Red Risk', () => {
    expect(workstreamStatus(SNAPSHOT_B, 'WS-PKG')).toBe('Yellow');
  });

  it('returns Yellow from Open or Mitigating Issue without Red Risk', () => {
    const open = cloneA();
    open.issues = [
      {
        id: 'ISS-PKG-OPEN',
        title: 'Open packaging issue',
        status: 'Open',
        owner: 'SH-PKG-01',
        equipmentId: 'EQ-PKG-01',
        milestoneId: 'MS-PKG-SAT',
        workstream: 'WS-PKG',
      },
    ];
    expect(workstreamStatus(open, 'WS-PKG')).toBe('Yellow');

    const mitigating = cloneA();
    mitigating.issues = [
      {
        id: 'ISS-PKG-MIT',
        title: 'Mitigating packaging issue',
        status: 'Mitigating',
        owner: 'SH-PKG-01',
        equipmentId: 'EQ-PKG-01',
        milestoneId: 'MS-PKG-SAT',
        workstream: 'WS-PKG',
      },
    ];
    expect(workstreamStatus(mitigating, 'WS-PKG')).toBe('Yellow');
  });

  it('Closed Issue does not create Yellow attention', () => {
    const snap = cloneA();
    snap.issues = [
      {
        id: 'ISS-PKG-CLOSED',
        title: 'Closed packaging issue',
        status: 'Closed',
        owner: 'SH-PKG-01',
        equipmentId: 'EQ-PKG-01',
        milestoneId: 'MS-PKG-SAT',
        workstream: 'WS-PKG',
      },
    ];
    expect(workstreamStatus(snap, 'WS-PKG')).toBe('Green');
  });

  it('returns Green otherwise', () => {
    expect(workstreamStatus(SNAPSHOT_A, 'WS-HVAC')).toBe('Green');
    expect(workstreamStatus(SNAPSHOT_A, 'WS-PKG')).toBe('Green');
    expect(workstreamStatus(SNAPSHOT_B, 'WS-HVAC')).toBe('Green');
  });
});

describe('computeProjectStatus', () => {
  it('is Green for calm Snapshot A', () => {
    expect(computeProjectStatus(SNAPSHOT_A)).toBe('Green');
  });

  it('is Yellow for Snapshot B local attention without HVAC/PS shift', () => {
    expect(computeProjectStatus(SNAPSHOT_B)).toBe('Yellow');
    expect(SNAPSHOT_B.project.forecastProductionStart).toBe('2027-09-15');
  });

  it('is Red when RISK-001 is Red (Snapshot C)', () => {
    expect(computeProjectStatus(SNAPSHOT_C)).toBe('Red');
  });

  it('is Red when MS-PS is Red', () => {
    const snap = cloneA();
    snap.milestones = snap.milestones.map((m) =>
      m.id === 'MS-PS' ? { ...m, rag: 'Red' } : m,
    );
    expect(computeProjectStatus(snap)).toBe('Red');
  });

  it('is Yellow from Delayed critical without PS Red path', () => {
    const snap = cloneA();
    snap.equipment = snap.equipment.map((e) =>
      e.id === 'EQ-PKG-01'
        ? { ...e, status: 'Delayed', forecastDelivery: '2027-06-30' }
        : e,
    );
    expect(computeProjectStatus(snap)).toBe('Yellow');
  });
});

describe('computeWorkstreamRollups', () => {
  it('returns all eight workstreams', () => {
    const rollups = computeWorkstreamRollups(SNAPSHOT_A);
    expect(rollups).toHaveLength(8);
    expect(rollups.map((r) => r.workstream)).toContain('WS-AUT');
  });
});
