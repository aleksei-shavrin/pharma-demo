'use client';

export function PageListLoading({ label = 'Загрузка…' }: { label?: string }) {
  return (
    <div
      className="p-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
      data-page-state="loading"
    >
      <div className="h-5 w-40 animate-pulse rounded bg-[var(--border-subtle)]" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[var(--border-subtle)]" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--border-subtle)]"
          />
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageListError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-6" role="alert" data-page-state="error">
      <p className="text-sm text-[var(--status-danger-fg)]">{message}</p>
      <button
        type="button"
        className="mt-3 text-sm font-medium text-[var(--link)] underline"
        onClick={onRetry}
      >
        Повторить
      </button>
    </div>
  );
}

export function PageListEmpty({ message }: { message: string }) {
  return (
    <p className="mt-4 text-sm text-[var(--text-muted)]" data-page-state="empty">
      {message}
    </p>
  );
}
