import { describe, expect, it } from 'vitest';
import {
  SELECTABLE_SNAPSHOT_IDS,
  SNAPSHOT_IDS,
  isSelectableSnapshotId,
  isSnapshotId,
} from './snapshot-id';

describe('web SnapshotId contract A–S (R2-C1)', () => {
  it('accepts A–S; rejects T', () => {
    expect(SNAPSHOT_IDS).toHaveLength(19);
    expect(isSnapshotId('S')).toBe(true);
    expect(isSnapshotId('T')).toBe(false);
  });

  it('keeps selectable UI set at A–H', () => {
    expect(SELECTABLE_SNAPSHOT_IDS).toHaveLength(8);
    expect(isSelectableSnapshotId('H')).toBe(true);
    expect(isSelectableSnapshotId('S')).toBe(false);
  });
});
