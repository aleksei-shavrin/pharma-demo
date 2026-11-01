import type { ReactNode } from 'react';

export function PageSurface({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--canvas)] p-4 md:p-5">
      <div className="flex min-h-0 flex-1 flex-col rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--elevation-1)]">
        {children}
      </div>
    </div>
  );
}
