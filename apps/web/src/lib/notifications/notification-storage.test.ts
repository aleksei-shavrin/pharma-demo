/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  NOTIFICATION_POPUP_PREF_DEFAULT,
  NOTIFICATION_POPUP_PREF_KEY,
  NOTIFICATION_READ_SESSION_KEY,
  countUnread,
  isNotificationRead,
  markNotificationRead,
  markNotificationsRead,
  readPopupPreference,
  writePopupPreference,
} from './notification-storage';

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

afterEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe('notification storage (R2-N1)', () => {
  it('keeps read state in sessionStorage by notification id', () => {
    expect(isNotificationRead('NTF-03-001')).toBe(false);
    markNotificationRead('NTF-03-001');
    expect(isNotificationRead('NTF-03-001')).toBe(true);
    expect(isNotificationRead('NTF-07-001')).toBe(false);
    expect(sessionStorage.getItem(NOTIFICATION_READ_SESSION_KEY)).toContain(
      'NTF-03-001',
    );
  });

  it('mark-all only affects provided ids', () => {
    markNotificationsRead(['NTF-03-001', 'NTF-03-002']);
    expect(countUnread(['NTF-03-001', 'NTF-03-002', 'NTF-03-003'])).toBe(1);
  });

  it('popup preference defaults true and persists in localStorage', () => {
    expect(readPopupPreference()).toBe(NOTIFICATION_POPUP_PREF_DEFAULT);
    writePopupPreference(false);
    expect(localStorage.getItem(NOTIFICATION_POPUP_PREF_KEY)).toBe('false');
    expect(readPopupPreference()).toBe(false);
    writePopupPreference(true);
    expect(readPopupPreference()).toBe(true);
  });

  it('SSR-safe when storage is missing', () => {
    const ss = globalThis.sessionStorage;
    const ls = globalThis.localStorage;
    // @ts-expect-error test isolation
    delete globalThis.sessionStorage;
    // @ts-expect-error test isolation
    delete globalThis.localStorage;
    expect(isNotificationRead('NTF-03-001')).toBe(false);
    expect(() => markNotificationRead('NTF-03-001')).not.toThrow();
    expect(readPopupPreference()).toBe(NOTIFICATION_POPUP_PREF_DEFAULT);
    expect(() => writePopupPreference(false)).not.toThrow();
    globalThis.sessionStorage = ss;
    globalThis.localStorage = ls;
  });
});
