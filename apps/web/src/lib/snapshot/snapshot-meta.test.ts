import { describe, expect, it } from 'vitest';
import { SELECTABLE_SNAPSHOT_IDS, SNAPSHOT_IDS } from './snapshot-id';
import {
  SNAPSHOT_AS_OF,
  SNAPSHOT_CONTEXT_RU,
  assertSnapshotMetaComplete,
  snapshotAsOfRu,
  snapshotOptionLabel,
} from './snapshot-meta';

/**
 * Locked Demo calendar (DOC-PROD-024).
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
  I: '2027-06-20',
  J: '2027-07-05',
  K: '2027-07-20',
  L: '2027-08-01',
  M: '2027-08-12',
  N: '2027-08-22',
  O: '2027-09-01',
  P: '2027-09-10',
  Q: '2027-09-15',
  R: '2027-09-18',
  S: '2027-09-22',
} as const;

describe('snapshot-meta A–S contract (R2-C1)', () => {
  it('covers every SnapshotId with as-of + RU context', () => {
    expect(() => assertSnapshotMetaComplete()).not.toThrow();
    expect(Object.keys(SNAPSHOT_AS_OF).sort()).toEqual([...SNAPSHOT_IDS].sort());
    expect(Object.keys(SNAPSHOT_CONTEXT_RU).sort()).toEqual(
      [...SNAPSHOT_IDS].sort(),
    );
  });

  it('option as-of dates match approved lifecycle calendar', () => {
    for (const id of SNAPSHOT_IDS) {
      expect(SNAPSHOT_AS_OF[id]).toBe(FIXTURE_AS_OF[id]);
    }
  });

  it('UI selectable set remains A–H until R2-U1', () => {
    expect([...SELECTABLE_SNAPSHOT_IDS]).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
    ]);
  });

  it('formats option labels with date + context', () => {
    expect(snapshotAsOfRu('C')).toBe('01.03.2027');
    expect(snapshotOptionLabel('C')).toContain('Срыв HVAC');
    expect(snapshotOptionLabel('G')).toContain('15.05.2027');
    expect(snapshotOptionLabel('S')).toContain('22.09.2027');
    expect(snapshotOptionLabel('S')).toContain('Production Start achieved');
  });
});
