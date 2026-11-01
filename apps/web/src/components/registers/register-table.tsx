import type { ReactNode } from 'react';

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
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)]">
      <table className="min-w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[var(--surface-sunken)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                scope="col"
                className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold"
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
}: {
  children: ReactNode;
  selected?: boolean;
  /** Row-body selection (not used for link navigation). */
  onSelect?: () => void;
  rowRef?: (el: HTMLTableRowElement | null) => void;
}) {
  return (
    <tr
      ref={rowRef}
      aria-selected={selected || undefined}
      data-selected={selected ? 'true' : undefined}
      onClick={onSelect}
      className={[
        'border-b border-[var(--border-subtle)] last:border-b-0',
        onSelect ? 'cursor-pointer' : '',
        selected
          ? 'bg-[var(--selected)]'
          : 'hover:bg-[var(--interactive)]',
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
    <td className={`whitespace-nowrap px-3 py-2 align-middle ${className}`}>
      {children}
    </td>
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
    <div className="flex flex-1 flex-col gap-4 p-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">
          {title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {asOf ? `На дату ${asOf} · ` : null}
          снимок <span className="font-semibold text-[var(--text)]">{snapshot}</span>
        </p>
      </header>
      {children}
    </div>
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
    <p className="text-sm text-[var(--text-muted)]">Нет записей в этом снимке.</p>
  );
}
