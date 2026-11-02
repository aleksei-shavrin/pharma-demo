'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { PageSurface } from './page-surface';
import { Sidebar } from './sidebar';
import { SkipLink } from './skip-link';
import { TopAppBar } from './top-app-bar';

/**
 * Dashboard (`/`) is a canvas of independent modules — no enclosing Page Surface.
 * All other screens keep the standard Page Surface pattern.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === '/';

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-[var(--canvas)] text-[var(--text)]">
      <SkipLink />
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TopAppBar />
        {isDashboard ? (
          <main
            id="main-content"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col overflow-auto outline-none"
            data-dashboard-canvas="true"
          >
            {children}
          </main>
        ) : (
          <PageSurface>
            <main
              id="main-content"
              tabIndex={-1}
              className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none"
            >
              {children}
            </main>
          </PageSurface>
        )}
      </div>
    </div>
  );
}
