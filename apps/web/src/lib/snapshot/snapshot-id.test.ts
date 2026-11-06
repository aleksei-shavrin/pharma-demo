import { describe, expect, it } from 'vitest';
import {
  SELECTABLE_SNAPSHOT_IDS,
  SNAPSHOT_IDS,
  isSelectableSnapshotId,
  isSnapshotId,
  previousScenarioSnapshot,
} from './snapshot-id';

describe('web SnapshotId contract A–S (R2-C1)', () => {
  it('accepts A–S; rejects T', () => {
    expect(SNAPSHOT_IDS).toHaveLength(19);
    expect(isSnapshotId('S')).toBe(true);
    expect(isSnapshotId('T')).toBe(false);
  });

  it('selectable UI set is full A–S (R2-U1)', () => {
    expect(SELECTABLE_SNAPSHOT_IDS).toHaveLength(19);
    expect(isSelectableSnapshotId('H')).toBe(true);
    expect(isSelectableSnapshotId('S')).toBe(true);
    expect(isSelectableSnapshotId('T')).toBe(false);
  });

  it('предыдущая буква сценария: у A нет, у C это B, у F это E', () => {
    expect(previousScenarioSnapshot('A')).toBeNull();
    expect(previousScenarioSnapshot('B')).toBe('A');
    expect(previousScenarioSnapshot('C')).toBe('B');
    expect(previousScenarioSnapshot('F')).toBe('E');
    expect(previousScenarioSnapshot('S')).toBe('R');
  });
});
