import { buildSnapshot } from './build-snapshot';
import type { SnapshotFixture } from './types';

/**
 * Test-only SnapshotFixture clone: C HVAC Red path + DEC-001 recorded.
 * Production Snapshot C has no DEC-001 (belongs to F).
 * Do not place this on the production SNAPSHOTS map.
 */
export function snapshotWithDec001(
  overrides: Partial<SnapshotFixture> = {},
): SnapshotFixture {
  const base = structuredClone(buildSnapshot('C'));
  return {
    ...base,
    id: 'C',
    issues: base.issues.map((issue) =>
      issue.id === 'ISS-001'
        ? { ...issue, status: 'Mitigating' as const }
        : issue,
    ),
    decisions: [
      {
        id: 'DEC-001',
        projectId: 'PRJ-01',
        milestoneId: 'MS-PS',
        type: 'PrioritizeRecovery',
        ownerRole: 'SH-DIR-01',
        dueDate: '2027-03-20',
        note: 'Утвердить ускоренную логистику AHU и резервный монтажный слот',
      },
    ],
    ...overrides,
  };
}

/** Alternate Decision type for contract coverage (test-only). */
export function snapshotWithAcceptDateSlip(): SnapshotFixture {
  const withDec = snapshotWithDec001();
  return {
    ...withDec,
    decisions: [
      {
        id: 'DEC-001',
        projectId: 'PRJ-01',
        milestoneId: null,
        type: 'AcceptDateSlip',
        ownerRole: 'SH-DIR-01',
        dueDate: null,
        note: 'Принять сдвиг даты старта производства',
      },
    ],
  };
}
