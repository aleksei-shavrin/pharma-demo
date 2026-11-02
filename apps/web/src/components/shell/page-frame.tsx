import type { ReactNode } from 'react';

/**
 * Page scroll contract (R2-W1-R2):
 *
 * PageFrame — fills `#main-content`, column, min-h-0, clips (no page scroll here).
 * PageHeader — flex-none / shrink-0, outside the scroll owner.
 * PageContent mode="page" — sole page-level vertical scroll owner.
 * PageContent mode="workspace" — overflow hidden; inner workspace owns scroll
 *   (Schedule board viewport, register table, etc.).
 */

export type PageScrollMode = 'page' | 'workspace';

export function PageFrame({
  children,
  className = '',
  'data-page': dataPage,
}: {
  children: ReactNode;
  className?: string;
  'data-page'?: string;
}) {
  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${className}`.trim()}
      data-page-frame="true"
      {...(dataPage ? { 'data-page': dataPage } : {})}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`min-w-0 shrink-0 ${className}`.trim()}
      data-page-header="true"
    >
      {children}
    </header>
  );
}

export function PageContent({
  children,
  mode = 'page',
  className = '',
}: {
  children: ReactNode;
  mode?: PageScrollMode;
  className?: string;
}) {
  const modeClass =
    mode === 'workspace'
      ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
      : 'min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden';

  return (
    <div
      className={`${modeClass} ${className}`.trim()}
      data-page-content="true"
      data-page-scroll-mode={mode}
    >
      {children}
    </div>
  );
}
