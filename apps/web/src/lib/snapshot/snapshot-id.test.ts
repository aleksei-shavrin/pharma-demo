import { describe, expect, it } from 'vitest';
import {
  SELECTABLE_SNAPSHOT_IDS,
  SNAPSHOT_IDS,
  isSelectableSnapshotId,
  isSnapshotId,
  previousScenarioSnapshot,
  snapshotDisplayLabel,
} from './snapshot-id';

describe('web SnapshotId contract 01–19', () => {
  it('accepts 01–19; rejects letters and bare digits', () => {
    expect(SNAPSHOT_IDS).toHaveLength(19);
    expect(SNAPSHOT_IDS[0]).toBe('01');
    expect(SNAPSHOT_IDS[18]).toBe('19');
    expect(isSnapshotId('19')).toBe(true);
    expect(isSnapshotId('A')).toBe(false);
    expect(isSnapshotId('C')).toBe(false);
    expect(isSnapshotId('1')).toBe(false);
    expect(isSnapshotId('20')).toBe(false);
  });

  it('selectable UI set is full 01–19', () => {
    expect(SELECTABLE_SNAPSHOT_IDS).toHaveLength(19);
    expect(isSelectableSnapshotId('08')).toBe(true);
    expect(isSelectableSnapshotId('19')).toBe(true);
    expect(isSelectableSnapshotId('A')).toBe(false);
  });

  it('previous scenario: 01 has none; 03→02; 06→05; 19→18', () => {
    expect(previousScenarioSnapshot('01')).toBeNull();
    expect(previousScenarioSnapshot('02')).toBe('01');
    expect(previousScenarioSnapshot('03')).toBe('02');
    expect(previousScenarioSnapshot('06')).toBe('05');
    expect(previousScenarioSnapshot('19')).toBe('18');
  });

  it('display label is identity (canonical id string)', () => {
    expect(snapshotDisplayLabel('01')).toBe('01');
    expect(snapshotDisplayLabel('19')).toBe('19');
    expect(snapshotDisplayLabel('unknown')).toBe('unknown');
    for (const id of SNAPSHOT_IDS) {
      expect(snapshotDisplayLabel(id)).toBe(id);
    }
  });
});
