'use client';

import type { RefObject } from 'react';
import { Menu, X } from 'lucide-react';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Breadcrumbs } from './breadcrumbs';

export type ShellMenuControl = {
  expanded: boolean;
  controlsId: string;
  onToggle: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
};

export function TopAppBar({ menu }: { menu?: ShellMenuControl }) {
  const menuLabel = menu?.expanded ? 'Закрыть меню' : 'Открыть меню';

  return (
    <header
      className="relative z-30 flex h-[var(--topbar-height)] shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-raised)] px-4"
      aria-label="Панель приложения"
      data-top-app-bar
    >
      {menu ? (
        <button
          ref={menu.buttonRef}
          type="button"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text)] outline-none hover:bg-[var(--interactive)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          aria-expanded={menu.expanded}
          aria-controls={menu.controlsId}
          aria-label={menuLabel}
          onClick={menu.onToggle}
          data-shell-menu-button
        >
          {menu.expanded ? (
            <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          ) : (
            <Menu className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          )}
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>
      <div
        className="flex shrink-0 items-center gap-2 sm:gap-3"
        data-top-app-bar-controls
      >
        <NotificationBell />
        <ThemeToggle />
        <SnapshotSelector />
      </div>
    </header>
  );
}
