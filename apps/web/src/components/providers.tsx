'use client';

import type { ReactNode } from 'react';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { ThemeProvider } from '@/lib/theme/theme-context';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SnapshotProvider>{children}</SnapshotProvider>
    </ThemeProvider>
  );
}
