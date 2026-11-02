'use client';

import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Breadcrumbs } from './breadcrumbs';

export function TopAppBar() {
  const { project, active, dashboard, status, requested } = useSnapshot();
  const settled = dashboard !== null;
  const projectLabel = project
    ? `${project.id} · ${project.name}`
    : 'PRJ-01';
  const snapshotLabel = settled
    ? `Снимок ${active}`
    : status === 'loading' && requested
      ? `Загрузка снимка ${requested}…`
      : 'Загрузка снимка…';

  return (
    <header
      className="flex min-h-[var(--topbar-height)] flex-wrap items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2"
      aria-label="Панель приложения"
    >
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <SnapshotSelector />
        <NotificationBell />
        <ThemeToggle />
        <div
          className="hidden items-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text-muted)] sm:flex"
          title="Контекст демо-проекта"
        >
          <span className="font-medium text-[var(--text-secondary)]">
            {projectLabel}
          </span>
          <span className="mx-1.5 text-[var(--border)]">·</span>
          <span>{snapshotLabel}</span>
        </div>
      </div>
    </header>
  );
}
