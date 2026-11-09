import {
  POPULATED_SNAPSHOT_IDS,
  SNAPSHOT_IDS,
  isPopulatedSnapshotId,
  isSnapshotId,
} from './snapshot-id';

describe('SnapshotId contract 01–19 (R2-C1)', () => {
  it('accepts 01–19 and rejects T / lowercase / multi-char', () => {
    expect(SNAPSHOT_IDS).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
    ]);
    expect(isSnapshotId('19')).toBe(true);
    expect(isSnapshotId('09')).toBe(true);
    expect(isSnapshotId('20')).toBe(false);
    expect(isSnapshotId('a')).toBe(false);
    expect(isSnapshotId('AB')).toBe(false);
  });

  it('populated fixtures cover full 01–19 after R2-L1', () => {
    expect([...POPULATED_SNAPSHOT_IDS]).toEqual([...SNAPSHOT_IDS]);
    expect(isPopulatedSnapshotId('08')).toBe(true);
    expect(isPopulatedSnapshotId('19')).toBe(true);
    expect(isPopulatedSnapshotId('20')).toBe(false);
  });
});
