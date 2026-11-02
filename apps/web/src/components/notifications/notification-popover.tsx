'use client';

import Link from 'next/link';
import type { Notification } from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { isNotificationRead } from '@/lib/notifications/notification-storage';
import { resolveNotificationHref } from '@/lib/notifications/notification-href';

export const TAXONOMY_RU: Record<Notification['taxonomy'], string> = {
  critical_risk: 'Критический риск',
  issue: 'Проблема',
  milestone: 'Веха',
  cost: 'Стоимость',
  decision: 'Решение',
  recovery: 'Восстановление',
  readiness: 'Готовность',
};

export const SEVERITY_RU: Record<Notification['severity'], string> = {
  critical: 'Критично',
  attention: 'Внимание',
  info: 'Информация',
};

type Props = {
  id: string;
  snapshotId: SnapshotId;
  items: Notification[];
  popupPref: boolean;
  onPopupPrefChange: (enabled: boolean) => void;
  onMarkRead: (id: string) => void;
  onMarkAll: () => void;
  onClose: () => void;
};

export function NotificationPopover({
  id,
  snapshotId,
  items,
  popupPref,
  onPopupPrefChange,
  onMarkRead,
  onMarkAll,
  onClose,
}: Props) {
  return (
    <div
      id={id}
      role="dialog"
      aria-label="Уведомления"
      data-notification-popover
      className="absolute right-0 z-50 mt-2 flex w-[min(100vw-2rem,22rem)] max-h-[min(70vh,28rem)] flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] shadow-[var(--elevation-1)]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-3 py-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text)]">Уведомления</p>
          <p className="text-xs text-[var(--text-muted)]">Снимок {snapshotId}</p>
        </div>
        {items.length > 0 ? (
          <button
            type="button"
            className="shrink-0 text-xs text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            onClick={onMarkAll}
          >
            Отметить все прочитанными
          </button>
        ) : null}
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto"
        data-notification-list-scroll
      >
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">
            Нет уведомлений для этого снимка
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {items.map((n) => {
              const read = isNotificationRead(n.id);
              const href = resolveNotificationHref(n.href, n.entityRefs);
              return (
                <li
                  key={n.id}
                  data-notification-id={n.id}
                  data-notification-read={read ? 'true' : 'false'}
                  data-notification-severity={n.severity}
                  className={`px-3 py-2.5 ${read ? 'opacity-70' : 'bg-[var(--surface)]'}`}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                        n.severity === 'critical'
                          ? 'bg-[var(--status-danger-border)]'
                          : n.severity === 'attention'
                            ? 'bg-[var(--status-warn-border)]'
                            : 'bg-[var(--text-muted)]'
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                        {SEVERITY_RU[n.severity]} · {TAXONOMY_RU[n.taxonomy]}
                        {!read ? ' · новое' : ''}
                      </p>
                      <p className="text-sm font-medium text-[var(--text)]">
                        {n.titleRu}
                      </p>
                      {n.bodyRu ? (
                        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                          {n.bodyRu}
                        </p>
                      ) : null}
                      {href ? (
                        <Link
                          href={href}
                          className="mt-1 inline-block text-xs text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                          onClick={() => {
                            onMarkRead(n.id);
                            onClose();
                          }}
                        >
                          Открыть
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="mt-1 text-xs text-[var(--text-muted)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                          onClick={() => onMarkRead(n.id)}
                        >
                          Отметить прочитанным
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-2 border-t border-[var(--border-subtle)] px-3 py-2.5 text-xs text-[var(--text-secondary)]">
        <input
          type="checkbox"
          className="mt-0.5 accent-[var(--link)]"
          checked={popupPref}
          onChange={(e) => onPopupPrefChange(e.target.checked)}
          data-notification-popup-pref
        />
        <span>Показывать уведомления при смене снимка</span>
      </label>
    </div>
  );
}
