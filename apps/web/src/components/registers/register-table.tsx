import type { ReactNode, TdHTMLAttributes } from 'react';
import Link from 'next/link';

import {
  PageContent,
  PageFrame,
  PageHeader,
} from '@/components/shell/page-frame';
import {
  hrefForUiRouteRef,
  type UiRouteRefType,
} from '@/lib/entity-routes';
import { snapshotDisplayLabel } from '@/lib/snapshot/snapshot-id';

export type RegisterColumn =
  | string
  | {
      label: string;
      /** Hover / assistive title (e.g. decisions Status meaning). */
      title?: string;
    };

function columnLabel(col: RegisterColumn): string {
  return typeof col === 'string' ? col : col.label;
}

export function RegisterTable({
  caption,
  columns,
  children,
  tableClassName = '',
  columnClassNames,
  layoutHint,
}: {
  caption: string;
  columns: RegisterColumn[];
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
            {columns.map((col, i) => {
              const label = columnLabel(col);
              const title = typeof col === 'string' ? undefined : col.title;
              return (
                <th
                  key={`${label}-${i}`}
                  scope="col"
                  title={title}
                  className={`whitespace-nowrap px-3 py-2 font-semibold ${columnClassNames?.[i] ?? ''}`.trim()}
                >
                  {label}
                </th>
              );
            })}
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
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-3 py-2 align-middle ${className}`} {...rest}>
      {children}
    </td>
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

export type RegisterIdRef = {
  type: UiRouteRefType;
  id: string;
};

/** Typed related-id links — canonical hrefForUiRouteRef; unresolved stays muted text. */
export function RegisterIdLinks({
  refs,
}: {
  refs: readonly RegisterIdRef[];
}) {
  if (refs.length === 0) {
    return (
      <span className="text-[var(--text-muted)]" data-register-id-links="empty">
        —
      </span>
    );
  }
  return (
    <span
      className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 font-mono text-xs"
      data-register-id-links="true"
    >
      {refs.map((ref, i) => {
        const href = hrefForUiRouteRef(ref.type, ref.id);
        const sep = i > 0 ? <span className="text-[var(--text-muted)]">, </span> : null;
        if (!href) {
          return (
            <span key={`${ref.type}:${ref.id}`}>
              {sep}
              <span
                className="whitespace-nowrap text-[var(--text-muted)]"
                title={unresolvedRefTitle(ref)}
                data-ref-type={ref.type}
                data-ref-id={ref.id}
                data-ref-resolved="false"
              >
                {ref.id || '—'}
              </span>
            </span>
          );
        }
        return (
          <span key={`${ref.type}:${ref.id}`}>
            {sep}
            <Link
              href={href}
              className="whitespace-nowrap text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              data-ref-type={ref.type}
              data-ref-id={ref.id}
              data-ref-resolved="true"
            >
              {ref.id}
            </Link>
          </span>
        );
      })}
    </span>
  );
}

function unresolvedRefTitle(ref: RegisterIdRef): string {
  if (!ref.id?.trim()) {
    return 'Идентификатор не задан';
  }
  if (ref.type === 'decision') {
    return 'Карточка решения в Demo v1 отсутствует; доступен фильтр списка';
  }
  if (ref.type === 'milestone' && ref.id.startsWith('KT-')) {
    return 'Импортированная контрольная точка KT без карточки детали';
  }
  return `Нет маршрута для ${ref.type} ${ref.id}`;
}


export function RegisterShell({
  title,
  asOf,
  snapshot,
  children,
}: {
  title: string;
  asOf: string | null;
  /** Internal snapshot id (01–19); displayed as ordinal 01–19. */
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
          <span className="font-semibold tabular-nums text-[var(--text)]">
            {snapshotDisplayLabel(snapshot)}
          </span>
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
