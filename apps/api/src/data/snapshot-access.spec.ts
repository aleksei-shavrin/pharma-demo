import { SNAPSHOT_A } from './fixtures/snapshot-a';
import { snapshotWithDec001 } from './fixtures/decision-test-fixture';
import type { SnapshotFixture } from './fixtures/types';
import {
  primaryDecision,
  productionStartMilestone,
  productionStartRisk,
  psDriverEquipment,
} from './snapshot-access';

function cloneA(): SnapshotFixture {
  return structuredClone(SNAPSHOT_A);
}

describe('canonical spine access (no silent substitution)', () => {
  it('primaryDecision is DEC-001 or null — never another Decision', () => {
    const otherOnly = cloneA();
    otherOnly.decisions = [
      {
        id: 'DEC-OTHER',
        projectId: 'PRJ-01',
        milestoneId: null,
        type: 'AcceptDateSlip',
        ownerRole: 'SH-DIR-01',
        dueDate: null,
        note: 'Other',
      },
    ];
    expect(primaryDecision(otherOnly)).toBeNull();

    const withDec = snapshotWithDec001();
    expect(primaryDecision(withDec)?.id).toBe('DEC-001');

    const both = snapshotWithDec001({
      decisions: [
        {
          id: 'DEC-OTHER',
          projectId: 'PRJ-01',
          milestoneId: null,
          type: 'AcceptDateSlip',
          ownerRole: 'SH-DIR-01',
          dueDate: null,
          note: 'First in array',
        },
        ...snapshotWithDec001().decisions,
      ],
    });
    expect(primaryDecision(both)?.id).toBe('DEC-001');
  });

  it('missing EQ-HVAC-01 / RISK-001 / MS-PS throws (no array[0] substitute)', () => {
    const noEq = cloneA();
    noEq.equipment = noEq.equipment.filter((e) => e.id !== 'EQ-HVAC-01');
    expect(() => psDriverEquipment(noEq)).toThrow(/EQ-HVAC-01/);

    const noRisk = cloneA();
    noRisk.risks = [];
    expect(() => productionStartRisk(noRisk)).toThrow(/RISK-001/);

    const noMs = cloneA();
    noMs.milestones = noMs.milestones.filter((m) => m.id !== 'MS-PS');
    expect(() => productionStartMilestone(noMs)).toThrow(/MS-PS/);
  });

  it('unrelated first array entries do not replace canonical Equipment', () => {
    const snap = cloneA();
    snap.equipment = [
      {
        id: 'EQ-OTHER',
        projectId: 'PRJ-01',
        name: 'Other',
        critical: true,
        baselineDelivery: '2027-01-01',
        forecastDelivery: '2027-01-01',
        status: 'Delayed',
        workstream: 'WS-BLD',
      },
      ...snap.equipment,
    ];
    expect(psDriverEquipment(snap).id).toBe('EQ-HVAC-01');
    expect(psDriverEquipment(snap).status).toBe('OnTrack');
  });
});
