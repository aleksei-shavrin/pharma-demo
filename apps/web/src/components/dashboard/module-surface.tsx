import type { ReactNode } from 'react';

/** Independent dashboard module surface — sits on canvas, not inside Page Surface. */
export function ModuleSurface({
  children,
  className = '',
  'data-dashboard-block': block,
}: {
  children: ReactNode;
  className?: string;
  'data-dashboard-block'?: string;
}) {
  return (
    <section
      data-dashboard-block={block}
      className={`rounded-[var(--radius-md)] bg-[var(--surface-raised)] p-4 shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)] ${className}`}
    >
      {children}
    </section>
  );
}
