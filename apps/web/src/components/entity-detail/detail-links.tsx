import Link from 'next/link';
import type { EntityLink } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import {
  entityTypeLabel,
  presentIssueTitle,
  presentMilestoneName,
} from '@/lib/ui-labels';

function linkLabel(link: EntityLink): string {
  if (link.targetType === 'issue') {
    return presentIssueTitle(link.targetId, link.displayName);
  }
  if (link.targetType === 'milestone') {
    return presentMilestoneName(link.targetId, link.displayName);
  }
  return link.displayName;
}

/** Direct Domain Links only (DOC-BA-015). Never shows derived Impact edges. */
export function DetailLinks({ links }: { links: EntityLink[] }) {
  return (
    <section aria-labelledby="detail-links-heading">
      <h2
        id="detail-links-heading"
        className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]"
      >
        Связи
      </h2>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Прямые связи в текущем снимке.
      </p>
      {links.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          В этом снимке прямых связей нет.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-[var(--border-subtle)] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)]">
          {links.map((link) => {
            const href = entityDetailHref(link.targetType, link.targetId);
            const typeLabel = entityTypeLabel(link.targetType);
            const name = linkLabel(link);
            return (
              <li key={`${link.targetType}:${link.targetId}`}>
                <Link
                  href={href}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2.5 text-sm text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  <span className="text-[var(--text-muted)]">{typeLabel}</span>
                  <span className="font-medium">{link.targetId}</span>
                  {name !== link.targetId ? (
                    <span className="text-[var(--text-secondary)]">{name}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
