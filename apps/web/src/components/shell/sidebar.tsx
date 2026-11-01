'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/navigation';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex w-[var(--sidebar-width)] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-raised)]"
      aria-label="Основная навигация"
    >
      <div className="flex h-[var(--topbar-height)] items-center border-b border-[var(--border)] px-4">
        <span className="text-sm font-semibold tracking-tight text-[var(--text)]">
          Pharma Project Control
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Разделы">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-raised)]',
                active
                  ? 'bg-[var(--selected)] font-medium text-[var(--text)] shadow-[inset_3px_0_0_0_var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--interactive)] hover:text-[var(--text)]',
              ].join(' ')}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                strokeWidth={1.75}
                aria-hidden
              />
              <span>{item.label}</span>
              {active ? (
                <span className="sr-only">(текущий раздел)</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
