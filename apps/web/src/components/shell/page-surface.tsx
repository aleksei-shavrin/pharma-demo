import type { ReactNode } from 'react';

export function PageSurface({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--canvas)] p-4 md:p-5"
      data-page-surface="true"
    >
      {/* Plate uses surface-raised, the same token as dashboard cards. surface stays the pale inner fill. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] shadow-[var(--elevation-1)]">
        {children}
      </div>
    </div>
  );
}
