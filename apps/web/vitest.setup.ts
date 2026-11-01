import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children?: React.ReactNode;
  }) => React.createElement('a', { href, ...props }, children),
}));

/** Overridable in tests via globalThis.__testParams */
vi.mock('next/navigation', () => ({
  usePathname: () =>
    (globalThis as { __testPathname?: string }).__testPathname ?? '/',
  useParams: () =>
    (globalThis as { __testParams?: Record<string, string> }).__testParams ??
    {},
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));
