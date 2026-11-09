import { SNAPSHOT_01, SNAPSHOT_02, SNAPSHOT_03 } from './fixtures';
import type { SnapshotFixture } from './fixtures/types';
import {
  computeProjectStatus,
  computeWorkstreamRollups,
  workstreamStatus,
} from './project-status';

function cloneA(): SnapshotFixture {
  return structuredClone(SNAPSHOT_01);
}

describe('workstreamStatus', () => {
  it('returns Red when any Risk in WS is Red', () => {
    expect(workstreamStatus(SNAPSHOT_03, 'WS-HVAC')).toBe('Red');
  });

  it('returns Yellow from Delayed critical Equipment without Red Risk', () => {
    expect(workstreamStatus(SNAPSHOT_02, 'WS-PKG')).toBe('Yellow');
  });

  it('returns Yellow from Open or Mitigating Issue without Red Risk', () => {
    const open = cloneA();
    open.issues = [
      {
        id: 'ISS-PKG-OPEN',
        title: 'Open packaging issue',
        status: 'Open',
        ownerPersonId: 'PER-11',
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
        ownerPersonId: 'PER-11',
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
        ownerPersonId: 'PER-11',
        equipmentId: 'EQ-PKG-01',
        milestoneId: 'MS-PKG-SAT',
        workstream: 'WS-PKG',
      },
    ];
    expect(workstreamStatus(snap, 'WS-PKG')).toBe('Green');
  });

  it('returns Green otherwise', () => {
    expect(workstreamStatus(SNAPSHOT_01, 'WS-HVAC')).toBe('Green');
    expect(workstreamStatus(SNAPSHOT_01, 'WS-PKG')).toBe('Green');
    expect(workstreamStatus(SNAPSHOT_02, 'WS-HVAC')).toBe('Green');
  });
});

describe('computeProjectStatus', () => {
  it('is Green for calm Snapshot 01', () => {
    expect(computeProjectStatus(SNAPSHOT_01)).toBe('Green');
  });

  it('is Yellow for Snapshot 02 local attention without HVAC/PS shift', () => {
    expect(computeProjectStatus(SNAPSHOT_02)).toBe('Yellow');
    expect(SNAPSHOT_02.project.forecastProductionStart).toBe('2027-09-15');
  });

  it('is Red when RISK-001 is Red (Snapshot 03)', () => {
    expect(computeProjectStatus(SNAPSHOT_03)).toBe('Red');
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
    const rollups = computeWorkstreamRollups(SNAPSHOT_01);
    expect(rollups).toHaveLength(8);
    expect(rollups.map((r) => r.workstream)).toContain('WS-AUT');
  });
});
