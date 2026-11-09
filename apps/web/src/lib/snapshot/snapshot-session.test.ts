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

describe('snapshot-session 01–19', () => {
  it('empty storage → read null; resolve 01', () => {
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('01');
  });

  it('writes and reads numeric ids', () => {
    writeSessionSnapshot('02');
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('02');
    expect(readSessionSnapshot()).toBe('02');
    expect(resolveBootstrapSnapshot()).toBe('02');

    writeSessionSnapshot('07');
    expect(readSessionSnapshot()).toBe('07');

    writeSessionSnapshot('19');
    expect(readSessionSnapshot()).toBe('19');
    expect(resolveBootstrapSnapshot()).toBe('19');
  });

  it('legacy letters and malformed → clear + bootstrap 01', () => {
    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, 'C');
    expect(readSessionSnapshot()).toBeNull();
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('01');

    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, 'A');
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('01');

    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, '1');
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('01');

    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, 'Z');
    expect(readSessionSnapshot()).toBeNull();
    expect(resolveBootstrapSnapshot()).toBe('01');
  });
});
