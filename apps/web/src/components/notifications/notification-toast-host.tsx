'use client';

import { DEMO_PORTFOLIO_ID } from '@/lib/demo-portfolio-id';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  fetchNotifications,
  type Notification,
  type NotificationSeverity,
  type NotificationTaxonomy,
} from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { snapshotDisplayLabel } from '@/lib/snapshot/snapshot-id';
import { resolveNotificationHref } from '@/lib/notifications/notification-href';

/** r10 UX: one compact toast; remainder only in bell tray. */
const MAX_TOASTS = 1;
const TOAST_MS = 3500;

type ToastItem = Notification & { key: string };

type Props = {
  settled: boolean;
  active: SnapshotId;
  popupPref: boolean;
  onInteractRead: (id: string) => void;
};

type ToastTone = 'danger' | 'warn' | 'ok' | 'neutral';

/**
 * Map authoritative severity (+ recovery/readiness taxonomy for info)
 * to persistent semantic toast surfaces.
 */
export function toastToneFor(
  severity: NotificationSeverity,
  taxonomy: NotificationTaxonomy,
): ToastTone {
  if (severity === 'critical') return 'danger';
  if (severity === 'attention') return 'warn';
  if (taxonomy === 'recovery' || taxonomy === 'readiness') return 'ok';
  return 'neutral';
}

function toastSurface(tone: ToastTone): string {
  if (tone === 'danger') {
    return 'border-[var(--status-danger-border)] bg-[var(--status-danger-bg)]';
  }
  if (tone === 'warn') {
    return 'border-[var(--status-warn-border)] bg-[var(--status-warn-bg)]';
  }
  if (tone === 'ok') {
    return 'border-[var(--status-ok-border)] bg-[var(--status-ok-bg)]';
  }
  return 'border-[var(--border)] bg-[var(--surface-raised)]';
}

function toastAccent(tone: ToastTone): string {
  if (tone === 'danger') return 'bg-[var(--status-danger-border)]';
  if (tone === 'warn') return 'bg-[var(--status-warn-border)]';
  if (tone === 'ok') return 'bg-[var(--status-ok-border)]';
  return 'bg-[var(--border)]';
}

/**
 * Toasts only after a successful committed snapshot switch (not bootstrap,
 * not loading, not stale/failed). Does not auto-mark read.
 * R2-U1-R5: top-right stack below AppBar + semantic severity surfaces.
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
    void fetchNotifications(DEMO_PORTFOLIO_ID, active)
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
      className="pointer-events-none fixed right-4 z-[60] flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
      style={{ top: 'calc(var(--topbar-height) + 0.75rem)' }}
      data-notification-toasts
      data-toast-placement="top-right"
      aria-live="polite"
    >
      {toasts.map((n) => {
        const href = resolveNotificationHref(n.href, n.entityRefs);
        const tone = toastToneFor(n.severity, n.taxonomy);
        return (
          <div
            key={n.key}
            role="status"
            data-notification-toast={n.id}
            data-toast-severity={n.severity}
            data-toast-tone={tone}
            data-toast-compact="true"
            className={`pointer-events-auto relative overflow-hidden rounded-[var(--radius-md)] border px-2.5 py-2 shadow-[var(--elevation-1)] ${toastSurface(tone)}`}
          >
            <span
              className={`absolute inset-y-0 left-0 w-1 ${toastAccent(tone)}`}
              aria-hidden
            />
            <p className="pl-1.5 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              Снимок {snapshotDisplayLabel(n.snapshotId)}
            </p>
            <p className="pl-1.5 text-sm font-medium leading-snug text-[var(--text)]">
              {n.titleRu}
            </p>
            <p className="mt-0.5 pl-1.5 text-[11px] text-[var(--text-secondary)]">
              Остальные — в центре уведомлений
            </p>
            <div className="mt-1.5 flex items-center gap-3 pl-1.5">
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
