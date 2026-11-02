import Link from 'next/link';
import type { DashboardOverview } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import {
  entityTypeLabel,
  presentIssueTitle,
  presentMilestoneName,
} from '@/lib/ui-labels';

type ExceptionLink = DashboardOverview['topExceptions'][number]['links'][number];

function resolveLinkLabel(
  link: ExceptionLink,
  data: DashboardOverview,
): { primary: string; id: string } {
  if (link.type === 'equipment') {
    const eq = data.equipment.find((e) => e.id === link.id);
    return { primary: eq?.name ?? entityTypeLabel(link.type), id: link.id };
  }
  if (link.type === 'issue') {
    const issue = data.issues.find((i) => i.id === link.id);
    return {
      primary: presentIssueTitle(link.id, issue?.title ?? entityTypeLabel(link.type)),
      id: link.id,
    };
  }
  if (link.type === 'risk') {
    const risk = data.risks.find((r) => r.id === link.id);
    return { primary: risk?.title ?? entityTypeLabel(link.type), id: link.id };
  }
  const ms = data.milestones.find((m) => m.id === link.id);
  return {
    primary: presentMilestoneName(link.id, ms?.name ?? entityTypeLabel(link.type)),
    id: link.id,
  };
}

/** Compact causal chain only from authored links order — no inferred edges. */
function CausalFragment({
  links,
  data,
}: {
  links: ExceptionLink[];
  data: DashboardOverview;
}) {
  if (links.length < 2) return null;
  const types = new Set(links.map((l) => l.type));
  const hasSpineShape =
    types.has('equipment') &&
    types.has('issue') &&
    types.has('risk') &&
    types.has('milestone');
  if (!hasSpineShape) return null;

  return (
    <ol
      className="mt-1.5 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-[var(--text-secondary)]"
      data-exception-causal="authored"
    >
      {links.map((link, i) => {
        const label = resolveLinkLabel(link, data);
        return (
          <li key={`${link.type}:${link.id}`} className="inline-flex items-center gap-1">
            {i > 0 ? (
              <span className="text-[var(--text-muted)]" aria-hidden>
                →
              </span>
            ) : null}
            <Link
              href={entityDetailHref(link.type, link.id)}
              className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              {label.primary}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Curated Top Exceptions — backend array order.
 * FE must not re-score or re-sort.
 */
export function TopExceptionsPanel({ data }: { data: DashboardOverview }) {
  const items = data.topExceptions;

  return (
    <section
      aria-labelledby="top-exceptions-heading"
      className="rounded-[var(--radius-md)] bg-[var(--surface-raised)] px-4 py-3 shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
      data-dashboard-block="top-exceptions"
    >
      <h2
        id="top-exceptions-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
      >
        Ключевые исключения
      </h2>

      {items.length === 0 ? (
        <p
          className="mt-3 text-sm text-[var(--text-secondary)]"
          data-top-exceptions="empty"
        >
          На текущую дату критических исключений нет — спокойный базовый план.
        </p>
      ) : (
        <ol className="mt-2 divide-y divide-[var(--border-subtle)]" data-top-exceptions="list">
          {items.map((ex, index) => (
            <li
              key={ex.id}
              className="flex gap-3 py-3 first:pt-1 last:pb-0"
              data-exception-id={ex.id}
              data-exception-order={index + 1}
            >
              <span
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center text-sm font-semibold tabular-nums text-[var(--text-muted)]"
                aria-hidden
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-[15px] font-semibold leading-snug text-[var(--text)]">
                  {ex.title}
                </p>
                <p className="text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
                  {ex.causeImpact}
                </p>
                {index === 0 ? (
                  <CausalFragment links={ex.links} data={data} />
                ) : null}
                {ex.links.length > 0 ? (
                  <ul className="flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5 text-xs">
                    {ex.links.map((link) => {
                      const label = resolveLinkLabel(link, data);
                      return (
                        <li key={`${link.type}:${link.id}`}>
                          <Link
                            href={entityDetailHref(link.type, link.id)}
                            title={`${entityTypeLabel(link.type)} · ${label.id}`}
                            className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                          >
                            <span>{label.primary}</span>
                            <span className="ml-1 text-[var(--text-muted)]">
                              {label.id}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
