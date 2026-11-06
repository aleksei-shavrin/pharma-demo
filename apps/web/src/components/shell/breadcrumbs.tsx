'use client';

import { usePathname } from 'next/navigation';
import { crumbForPath, entityIdFromPath } from '@/lib/navigation';

/** Visible root of the portfolio trail. PRJ-01 stays the API container id. */
const PORTFOLIO_NAV_LABEL = 'Портфель 01';

export function Breadcrumbs() {
  const pathname = usePathname();
  const section = crumbForPath(pathname);
  const entityId = entityIdFromPath(pathname);

  return (
    <nav aria-label="Навигационная цепочка" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--text-secondary)]">
        <li className="truncate text-[var(--text-muted)]">{PORTFOLIO_NAV_LABEL}</li>
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
