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

describe('snapshot-session A–H', () => {
  it('empty storage → read null; resolve A', () => {
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('A');
  });

  it('writes and reads A/B/C/G/H', () => {
    writeSessionSnapshot('B');
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('B');
    expect(readSessionSnapshot()).toBe('B');
    expect(resolveBootstrapSnapshot()).toBe('B');

    writeSessionSnapshot('G');
    expect(readSessionSnapshot()).toBe('G');
    expect(resolveBootstrapSnapshot()).toBe('G');

    writeSessionSnapshot('H');
    expect(readSessionSnapshot()).toBe('H');
    expect(resolveBootstrapSnapshot()).toBe('H');
  });

  it('invalid / malformed / not-yet-selectable → null / A', () => {
    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, 'Z');
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('A');

    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, 'ab');
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('A');

    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, '');
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('A');

    // Contract accepts S, but UI session stays on populated A–H until L1/U1.
    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, 'S');
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('A');
  });
});
