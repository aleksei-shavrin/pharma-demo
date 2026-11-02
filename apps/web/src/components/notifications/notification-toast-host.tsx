'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  fetchNotifications,
  type Notification,
} from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { resolveNotificationHref } from '@/lib/notifications/notification-href';

const DEMO_PROJECT_ID = 'PRJ-01';
const MAX_TOASTS = 3;
const TOAST_MS = 8000;

type ToastItem = Notification & { key: string };

type Props = {
  settled: boolean;
  active: SnapshotId;
  popupPref: boolean;
  onInteractRead: (id: string) => void;
};

/**
 * Toasts only after a successful committed snapshot switch (not bootstrap,
 * not loading, not stale/failed). Does not auto-mark read.
 */
export function NotificationToastHost({
  settled,
  active,
  popupPref,
  onInteractRead,
}: Props) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const bootstrappedRef = useRef(false);
  const lastCommittedRef = useRef<SnapshotId | null>(null);
  const dismissTimers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      for (const t of dismissTimers.current) window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!settled) return;

    if (!bootstrappedRef.current) {
      bootstrappedRef.current = true;
      lastCommittedRef.current = active;
      return;
    }

    if (lastCommittedRef.current === active) return;
    lastCommittedRef.current = active;

    if (!popupPref) {
      setToasts([]);
      return;
    }

    let cancelled = false;
    void fetchNotifications(DEMO_PROJECT_ID, active)
      .then((list) => {
        if (cancelled) return;
        if (list.snapshotId !== active) return;
        if (lastCommittedRef.current !== active) return;
        const top = list.items.slice(0, MAX_TOASTS).map((n, i) => ({
          ...n,
          key: `${n.id}-${i}-${active}`,
        }));
        setToasts(top);
        for (const t of dismissTimers.current) window.clearTimeout(t);
        dismissTimers.current = top.map((toast) =>
          window.setTimeout(() => {
            setToasts((prev) => prev.filter((p) => p.key !== toast.key));
          }, TOAST_MS),
        );
      })
      .catch(() => {
        if (!cancelled) setToasts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [settled, active, popupPref]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
      data-notification-toasts
      aria-live="polite"
    >
      {toasts.map((n) => {
        const href = resolveNotificationHref(n.href, n.entityRefs);
        return (
          <div
            key={n.key}
            role="status"
            data-notification-toast={n.id}
            className="pointer-events-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2.5 shadow-[var(--elevation-1)]"
          >
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              Снимок {n.snapshotId}
            </p>
            <p className="text-sm font-medium text-[var(--text)]">{n.titleRu}</p>
            {n.bodyRu ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]">
                {n.bodyRu}
              </p>
            ) : null}
            <div className="mt-2 flex items-center gap-3">
              {href ? (
                <Link
                  href={href}
                  className="text-xs text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                  onClick={() => onInteractRead(n.id)}
                >
                  Открыть
                </Link>
              ) : null}
              <button
                type="button"
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                onClick={() =>
                  setToasts((prev) => prev.filter((p) => p.key !== n.key))
                }
              >
                Скрыть
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
