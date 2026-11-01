'use client';

import { usePathname } from 'next/navigation';
import { crumbForPath, entityIdFromPath } from '@/lib/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();
  const section = crumbForPath(pathname);
  const entityId = entityIdFromPath(pathname);

  return (
    <nav aria-label="Навигационная цепочка" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--text-secondary)]">
        <li className="truncate text-[var(--text-muted)]">PRJ-01</li>
        <li aria-hidden className="text-[var(--text-muted)]">
          /
        </li>
        <li
          className={
            entityId
              ? 'truncate text-[var(--text-secondary)]'
              : 'truncate font-medium text-[var(--text)]'
          }
          aria-current={entityId ? undefined : 'page'}
        >
          {section}
        </li>
        {entityId ? (
          <>
            <li aria-hidden className="text-[var(--text-muted)]">
              /
            </li>
            <li
              className="truncate font-medium text-[var(--text)]"
              aria-current="page"
            >
              {entityId}
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}
