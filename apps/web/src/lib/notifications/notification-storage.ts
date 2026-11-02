/**
 * Browser-local notification presentation state (R2-N1).
 * Read/unread → sessionStorage; popup preference → localStorage.
 * Not source of truth; backend has neither.
 */

export const NOTIFICATION_READ_SESSION_KEY = 'ppc.demo.notificationRead';
export const NOTIFICATION_POPUP_PREF_KEY = 'ppc.demo.notificationPopup';
/** Default: show ≤3 toasts after successful atomic snapshot commit. */
export const NOTIFICATION_POPUP_PREF_DEFAULT = true;

type ReadMap = Record<string, true>;

function safeParseReadMap(raw: string | null): ReadMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const out: ReadMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (v === true && typeof k === 'string' && k.startsWith('NTF-')) {
        out[k] = true;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function readNotificationReadMap(): ReadMap {
  try {
    if (typeof sessionStorage === 'undefined') return {};
    return safeParseReadMap(
      sessionStorage.getItem(NOTIFICATION_READ_SESSION_KEY),
    );
  } catch {
    return {};
  }
}

export function isNotificationRead(id: string): boolean {
  return readNotificationReadMap()[id] === true;
}

export function markNotificationRead(id: string): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    const map = readNotificationReadMap();
    map[id] = true;
    sessionStorage.setItem(NOTIFICATION_READ_SESSION_KEY, JSON.stringify(map));
  } catch {
    // best-effort
  }
}

export function markNotificationsRead(ids: readonly string[]): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    const map = readNotificationReadMap();
    for (const id of ids) {
      map[id] = true;
    }
    sessionStorage.setItem(NOTIFICATION_READ_SESSION_KEY, JSON.stringify(map));
  } catch {
    // best-effort
  }
}

export function countUnread(ids: readonly string[]): number {
  const map = readNotificationReadMap();
  return ids.reduce((n, id) => (map[id] ? n : n + 1), 0);
}

export function readPopupPreference(): boolean {
  try {
    if (typeof localStorage === 'undefined') {
      return NOTIFICATION_POPUP_PREF_DEFAULT;
    }
    const raw = localStorage.getItem(NOTIFICATION_POPUP_PREF_KEY);
    if (raw === null) return NOTIFICATION_POPUP_PREF_DEFAULT;
    if (raw === '0' || raw === 'false') return false;
    if (raw === '1' || raw === 'true') return true;
    return NOTIFICATION_POPUP_PREF_DEFAULT;
  } catch {
    return NOTIFICATION_POPUP_PREF_DEFAULT;
  }
}

export function writePopupPreference(enabled: boolean): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      NOTIFICATION_POPUP_PREF_KEY,
      enabled ? 'true' : 'false',
    );
  } catch {
    // best-effort
  }
}
