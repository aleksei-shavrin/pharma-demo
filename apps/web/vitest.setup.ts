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

/** Overridable in tests via globalThis.__testParams / __testSearch */
const testNav = {
  pathname: '/',
  params: {} as Record<string, string>,
  search: '',
  searchParams: new URLSearchParams(),
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  },
};

vi.mock('next/navigation', () => ({
  usePathname: () =>
    (globalThis as { __testPathname?: string }).__testPathname ??
    testNav.pathname,
  useParams: () =>
    (globalThis as { __testParams?: Record<string, string> }).__testParams ??
    testNav.params,
  useRouter: () => testNav.router,
  // Stable identity: a fresh URLSearchParams each render breaks effects that
  // depend on searchParams and setState (registers-view OOM loop).
  useSearchParams: () => {
    const next =
      (globalThis as { __testSearch?: string }).__testSearch ?? testNav.search;
    if (next !== testNav.search) {
      testNav.search = next;
      testNav.searchParams = new URLSearchParams(next);
    }
    return testNav.searchParams;
  },
}));
