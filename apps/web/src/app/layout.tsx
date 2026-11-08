import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AppProviders } from '@/components/providers';
import { AppShell } from '@/components/shell/app-shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pharma Demo — Demo v1',
  description: 'Demo v1: оболочка приложения и обзор проекта',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-theme="light" suppressHydrationWarning>
      <body>
        <AppProviders>
          <AppShell>
            <Suspense fallback={null}>{children}</Suspense>
          </AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
