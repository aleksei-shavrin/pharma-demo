'use client';

import { usePathname } from 'next/navigation';
import { crumbForPath } from '@/lib/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();
  const section = crumbForPath(pathname);

  return (
    <nav aria-label="Навигационная цепочка" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--text-secondary)]">
        <li className="truncate text-[var(--text-muted)]">PRJ-01</li>
        <li aria-hidden className="text-[var(--text-muted)]">
          /
        </li>
        <li className="truncate font-medium text-[var(--text)]" aria-current="page">
          {section}
        </li>
      </ol>
    </nav>
  );
}
