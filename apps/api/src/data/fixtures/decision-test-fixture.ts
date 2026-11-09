import { buildSnapshot } from './build-snapshot';
import type { SnapshotFixture } from './types';

/**
 * Test-only SnapshotFixture clone: C HVAC Red path + DEC-001 recorded.
 * Production Snapshot 03 has no DEC-001 (belongs to 06).
 * Do not place this on the production SNAPSHOTS map.
 */
export function snapshotWithDec001(
  overrides: Partial<SnapshotFixture> = {},
): SnapshotFixture {
  const base = structuredClone(buildSnapshot('03'));
  return {
    ...base,
    id: '03',
    issues: base.issues.map((issue) =>
      issue.id === 'ISS-001'
        ? { ...issue, status: 'Mitigating' as const }
        : issue,
    ),
    decisions: [
      {
        id: 'DEC-001',
        projectId: 'PRT-01',
        milestoneId: 'MS-PS',
        type: 'PrioritizeRecovery',
        ownerPersonId: 'PER-01',
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
        projectId: 'PRT-01',
        milestoneId: null,
        type: 'AcceptDateSlip',
        ownerPersonId: 'PER-01',
        dueDate: null,
        note: 'Принять сдвиг даты старта производства',
      },
    ],
  };
}
