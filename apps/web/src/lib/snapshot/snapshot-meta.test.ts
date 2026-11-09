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
  '01': '2027-02-15',
  '02': '2027-02-28',
  '03': '2027-03-01',
  '04': '2027-03-20',
  '05': '2027-04-10',
  '06': '2027-04-20',
  '07': '2027-05-15',
  '08': '2027-06-01',
  '09': '2027-06-20',
  '10': '2027-07-05',
  '11': '2027-07-20',
  '12': '2027-08-01',
  '13': '2027-08-12',
  '14': '2027-08-22',
  '15': '2027-09-01',
  '16': '2027-09-10',
  '17': '2027-09-15',
  '18': '2027-09-18',
  '19': '2027-09-22',
} as const;

describe('snapshot-meta 01–19 contract (R2-C1)', () => {
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

  it('UI selectable set is full 01–19 after R2-U1', () => {
    expect([...SELECTABLE_SNAPSHOT_IDS]).toEqual([...SNAPSHOT_IDS]);
  });

  it('formats option labels with date + context', () => {
    expect(snapshotAsOfRu('03')).toBe('01.03.2027');
    expect(snapshotOptionLabel('03')).toMatch(/^03 —/);
    expect(snapshotOptionLabel('03')).toContain('Срыв HVAC');
    expect(snapshotOptionLabel('07')).toMatch(/^07 —/);
    expect(snapshotOptionLabel('07')).toContain('15.05.2027');
    expect(snapshotOptionLabel('19')).toMatch(/^19 —/);
    expect(snapshotOptionLabel('19')).toContain('22.09.2027');
    expect(snapshotOptionLabel('19')).toContain('Production Start достигнут');
  });
});
