'use client';

import { DEMO_PORTFOLIO_ID } from '@/lib/demo-portfolio-id';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import {
  fetchNotifications,
  type Notification,
} from '@/lib/api-client';
import {
  countUnread,
  markNotificationRead,
  markNotificationsRead,
  readPopupPreference,
  writePopupPreference,
} from '@/lib/notifications/notification-storage';
import { NotificationPopover } from './notification-popover';
import { NotificationToastHost } from './notification-toast-host';


export function NotificationBell() {
  const { active, status, dashboard } = useSnapshot();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [popupPref, setPopupPref] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [tick, setTick] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const settled =
    status === 'idle' && dashboard !== null && dashboard.snapshotId === active;

  useEffect(() => {
    setHydrated(true);
    setPopupPref(readPopupPreference());
  }, []);

  useEffect(() => {
    if (!settled) return;
    let cancelled = false;
    void fetchNotifications(DEMO_PORTFOLIO_ID, active)
      .then((list) => {
        if (cancelled) return;
        if (list.snapshotId !== active) return;
        setItems(list.items);
        setUnread(countUnread(list.items.map((n) => n.id)));
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setUnread(0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [active, settled, tick]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const refreshUnread = useCallback((next: Notification[]) => {
    setUnread(countUnread(next.map((n) => n.id)));
    setTick((t) => t + 1);
  }, []);

  const onToggle = () => setOpen((v) => !v);

  const onBellKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  const onMarkRead = (id: string) => {
    markNotificationRead(id);
    refreshUnread(items);
  };

  const onMarkAll = () => {
    markNotificationsRead(items.map((n) => n.id));
    refreshUnread(items);
  };

  const onPopupPrefChange = (enabled: boolean) => {
    writePopupPreference(enabled);
    setPopupPref(enabled);
  };

  const label =
    unread > 0
      ? `Уведомления, непрочитанных: ${unread}`
      : 'Уведомления';

  return (
    <div ref={rootRef} className="relative" data-notification-bell-root>
      <button
        type="button"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] outline-none hover:bg-[var(--surface-raised)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        onKeyDown={onBellKey}
        data-notification-bell
        data-unread-count={hydrated ? unread : 0}
      >
        <BellIcon />
        {hydrated && unread > 0 ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--status-danger-border)] px-1 text-[10px] font-semibold leading-none text-[var(--text-inverse)]"
            aria-hidden
            data-unread-badge
          >
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <NotificationPopover
          id={panelId}
          snapshotId={active}
          items={items}
          popupPref={popupPref}
          onPopupPrefChange={onPopupPrefChange}
          onMarkRead={onMarkRead}
          onMarkAll={onMarkAll}
          onClose={() => setOpen(false)}
        />
      ) : null}
      <NotificationToastHost
        settled={settled}
        active={active}
        popupPref={hydrated ? popupPref : false}
        onInteractRead={onMarkRead}
      />
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
