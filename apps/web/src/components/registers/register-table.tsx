import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  PageContent,
  PageFrame,
  PageHeader,
} from '@/components/shell/page-frame';

export function RegisterTable({
  caption,
  columns,
  children,
}: {
  caption: string;
  columns: string[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)]">
      <table className="min-w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-[var(--surface-sunken)] text-xs uppercase tracking-wide text-[var(--text-muted)] shadow-[inset_0_-1px_0_0_var(--border)]">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                scope="col"
                className="whitespace-nowrap px-3 py-2 font-semibold"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[var(--text-secondary)]">{children}</tbody>
      </table>
    </div>
  );
}

export function RegisterRow({
  children,
  selected = false,
  onSelect,
  rowRef,
  emphasis = false,
}: {
  children: ReactNode;
  selected?: boolean;
  /** Row-body selection (not used for link navigation). */
  onSelect?: () => void;
  rowRef?: (el: HTMLTableRowElement | null) => void;
  /** Subtle critical / MS-PS emphasis — not dashboard styling. */
  emphasis?: boolean;
}) {
  return (
    <tr
      ref={rowRef}
      aria-selected={selected || undefined}
      data-selected={selected ? 'true' : undefined}
      data-emphasis={emphasis ? 'true' : undefined}
      onClick={onSelect}
      className={[
        'border-b border-[var(--border-subtle)] last:border-b-0',
        onSelect ? 'cursor-pointer' : '',
        selected
          ? 'bg-[var(--selected)]'
          : 'hover:bg-[var(--interactive)]',
        emphasis ? 'border-l-2 border-l-[var(--border-strong,var(--border))]' : '',
      ].join(' ')}
    >
      {children}
    </tr>
  );
}

export function RegisterCell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-2 align-middle ${className}`}>{children}</td>
  );
}

/** Primary human title link + muted technical id (no dual clickable row). */
export function RegisterEntityCell({
  href,
  title,
  id,
}: {
  href: string;
  title: string;
  id: string;
}) {
  return (
    <RegisterCell className="min-w-[14rem] max-w-[22rem]">
      <Link
        href={href}
        className="font-medium text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        {title}
      </Link>
      <div className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">
        {id}
      </div>
    </RegisterCell>
  );
}

export function RegisterMutedIds({ ids }: { ids: string[] }) {
  if (ids.length === 0) {
    return <span className="text-[var(--text-muted)]">—</span>;
  }
  return (
    <span className="font-mono text-xs text-[var(--text-muted)]">
      {ids.join(', ')}
    </span>
  );
}

export function RegisterShell({
  title,
  asOf,
  snapshot,
  children,
}: {
  title: string;
  asOf: string | null;
  snapshot: string;
  children: ReactNode;
}) {
  return (
    <PageFrame className="gap-4 p-6">
      <PageHeader className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">
          {title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {asOf ? `На дату ${asOf} · ` : null}
          снимок{' '}
          <span className="font-semibold text-[var(--text)]">{snapshot}</span>
        </p>
      </PageHeader>
      {/* Workspace: Schedule / registers own internal scroll; no page-level scroll. */}
      <PageContent mode="workspace" className="gap-4">
        {children}
      </PageContent>
    </PageFrame>
  );
}

export function RegisterLoading() {
  return (
    <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
      Загрузка данных снимка…
    </p>
  );
}

export function RegisterError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="space-y-2 text-sm">
      <p className="text-[var(--status-danger-fg)]">
        Не удалось загрузить данные. {message}
      </p>
      <button
        type="button"
        className="font-medium text-[var(--link)] underline outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        onClick={onRetry}
      >
        Повторить
      </button>
    </div>
  );
}

export function RegisterEmpty() {
  return (
    <p className="text-sm text-[var(--text-muted)]">
      Нет записей в этом снимке.
    </p>
  );
}

export function RegisterFilteredEmpty({ onReset }: { onReset: () => void }) {
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-6 text-sm"
      role="status"
      data-register-filtered-empty="true"
    >
      <p className="text-[var(--text-secondary)]">
        Нет записей, соответствующих текущим фильтрам.
      </p>
      <button
        type="button"
        className="mt-3 font-medium text-[var(--link)] underline outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        onClick={onReset}
      >
        Сбросить фильтры
      </button>
    </div>
  );
}
