/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  SNAPSHOT_SESSION_KEY,
  readSessionSnapshot,
  resolveBootstrapSnapshot,
  writeSessionSnapshot,
} from './snapshot-session';

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  sessionStorage.clear();
});

describe('snapshot-session', () => {
  it('empty storage → read null; resolve A', () => {
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('A');
  });

  it('writes and reads A/B/C', () => {
    writeSessionSnapshot('B');
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('B');
    expect(readSessionSnapshot()).toBe('B');
    expect(resolveBootstrapSnapshot()).toBe('B');

    writeSessionSnapshot('C');
    expect(readSessionSnapshot()).toBe('C');
    expect(resolveBootstrapSnapshot()).toBe('C');

    writeSessionSnapshot('A');
    expect(resolveBootstrapSnapshot()).toBe('A');
  });

  it('invalid / malformed → null / A (never treated as SnapshotId)', () => {
    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, 'Z');
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('A');

    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, 'ab');
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('A');

    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, '');
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('A');
  });
});
