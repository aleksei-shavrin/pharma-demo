import {
  POPULATED_SNAPSHOT_IDS,
  SNAPSHOT_IDS,
  isPopulatedSnapshotId,
  isSnapshotId,
} from './snapshot-id';

describe('SnapshotId contract A–S (R2-C1)', () => {
  it('accepts A–S and rejects T / lowercase / multi-char', () => {
    expect(SNAPSHOT_IDS).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
    ]);
    expect(isSnapshotId('S')).toBe(true);
    expect(isSnapshotId('I')).toBe(true);
    expect(isSnapshotId('T')).toBe(false);
    expect(isSnapshotId('a')).toBe(false);
    expect(isSnapshotId('AB')).toBe(false);
  });

  it('populated fixtures remain A–H only until R2-L1', () => {
    expect([...POPULATED_SNAPSHOT_IDS]).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
    ]);
    expect(isPopulatedSnapshotId('H')).toBe(true);
    expect(isPopulatedSnapshotId('S')).toBe(false);
  });
});
