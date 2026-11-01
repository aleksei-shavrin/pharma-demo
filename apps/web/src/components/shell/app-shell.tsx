import type { ReactNode } from 'react';
import { PageSurface } from './page-surface';
import { Sidebar } from './sidebar';
import { SkipLink } from './skip-link';
import { TopAppBar } from './top-app-bar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--canvas)] text-[var(--text)]">
      <SkipLink />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopAppBar />
        <PageSurface>
          <main
            id="main-content"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col outline-none"
          >
            {children}
          </main>
        </PageSurface>
      </div>
    </div>
  );
}
