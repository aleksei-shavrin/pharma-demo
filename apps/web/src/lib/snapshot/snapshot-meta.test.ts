import { describe, expect, it } from 'vitest';
import { SNAPSHOT_IDS } from './snapshot-id';
import {
  SNAPSHOT_AS_OF,
  SNAPSHOT_CONTEXT_RU,
  assertSnapshotMetaComplete,
  snapshotAsOfRu,
  snapshotOptionLabel,
} from './snapshot-meta';

/**
 * Locked Demo calendar (DOC-PROD-022 / backend fixture asOf).
 * Prevents silent drift between selector option dates and fixtures.
 */
const FIXTURE_AS_OF = {
  A: '2027-02-15',
  B: '2027-02-28',
  C: '2027-03-01',
  D: '2027-03-20',
  E: '2027-04-10',
  F: '2027-04-20',
  G: '2027-05-15',
  H: '2027-06-01',
} as const;

describe('snapshot-meta A–H contract', () => {
  it('covers every SnapshotId with as-of + RU context', () => {
    expect(() => assertSnapshotMetaComplete()).not.toThrow();
    expect(Object.keys(SNAPSHOT_AS_OF).sort()).toEqual([...SNAPSHOT_IDS].sort());
    expect(Object.keys(SNAPSHOT_CONTEXT_RU).sort()).toEqual(
      [...SNAPSHOT_IDS].sort(),
    );
  });

  it('option as-of dates match approved fixture calendar', () => {
    for (const id of SNAPSHOT_IDS) {
      expect(SNAPSHOT_AS_OF[id]).toBe(FIXTURE_AS_OF[id]);
    }
  });

  it('formats option labels with date + context', () => {
    expect(snapshotAsOfRu('C')).toBe('01.03.2027');
    expect(snapshotOptionLabel('C')).toContain('Срыв HVAC');
    expect(snapshotOptionLabel('G')).toContain('15.05.2027');
  });
});
