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
  tableClassName = '',
  columnClassNames,
  layoutHint,
}: {
  caption: string;
  columns: string[];
  children: ReactNode;
  /** Extra table classes (e.g. min-width for inner h-scroll on narrow viewports). */
  tableClassName?: string;
  /** Optional per-column `<th>` classes (width hints for table-fixed layouts). */
  columnClassNames?: string[];
  /** Optional layout marker for tests / browser proofs (e.g. decisions desktop-fit). */
  layoutHint?: string;
}) {
  return (
    <div
      className="min-h-0 flex-1 overflow-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)]"
      data-register-table-scroll="true"
      {...(layoutHint ? { 'data-register-table-layout': layoutHint } : {})}
    >
      <table
        className={`min-w-full border-collapse text-left text-sm ${tableClassName}`.trim()}
      >
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-[var(--surface-sunken)] text-xs uppercase tracking-wide text-[var(--text-muted)] shadow-[inset_0_-1px_0_0_var(--border)]">
          <tr>
            {columns.map((col, i) => (
              <th
                key={col}
                scope="col"
                className={`whitespace-nowrap px-3 py-2 font-semibold ${columnClassNames?.[i] ?? ''}`.trim()}
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
        // Decorative left stripe removed (emphasis kept as data-attr only).
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
  className = 'min-w-[14rem] max-w-[22rem]',
}: {
  href: string;
  title: string;
  id: string;
  /** Override default width constraints (e.g. decisions desktop-fit). */
  className?: string;
}) {
  return (
    <RegisterCell className={className}>
      <Link
        href={href}
        className="break-words font-medium text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
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
    <div
      className="space-y-2 py-2"
      role="status"
      aria-busy="true"
      aria-live="polite"
      data-page-state="loading"
    >
      <div className="h-4 w-48 animate-pulse rounded bg-[var(--border-subtle)]" />
      <div className="h-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--border-subtle)]" />
      <div className="h-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--border-subtle)]" />
      <div className="h-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--border-subtle)]" />
      <span className="sr-only">Загрузка данных снимка…</span>
    </div>
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
