import Link from 'next/link';
import type { DashboardOverview } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import {
  entityTypeLabel,
  presentIssueTitle,
  presentMilestoneName,
} from '@/lib/ui-labels';
import { formatDeltaDays } from '@/lib/format/ru';
import {
  DASHBOARD_PAIR_LIST_MAX_HEIGHT,
  DASHBOARD_PAIR_LIST_SCROLL_CLASS,
  DASHBOARD_PAIR_SURFACE_CLASS,
} from '@/lib/dashboard/dashboard-layout';
import { ModuleSurface } from './module-surface';

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
      primary: presentIssueTitle(
        link.id,
        issue?.title ?? entityTypeLabel(link.type),
      ),
      id: link.id,
    };
  }
  if (link.type === 'risk') {
    const risk = data.risks.find((r) => r.id === link.id);
    return { primary: risk?.title ?? entityTypeLabel(link.type), id: link.id };
  }
  const ms = data.milestones.find((m) => m.id === link.id);
  return {
    primary: presentMilestoneName(
      link.id,
      ms?.name ?? entityTypeLabel(link.type),
    ),
    id: link.id,
  };
}

/** Compact causal chain only from authored links — no inferred edges. */
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
          <li
            key={`${link.type}:${link.id}`}
            className="inline-flex items-center gap-1"
          >
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

function impactAccent(causeImpact: string, psDelta: number): string | null {
  if (psDelta > 0 && /запуск|производств|\+\d+/i.test(causeImpact)) {
    return formatDeltaDays(psDelta);
  }
  return null;
}

/**
 * Editorial Top Exceptions — backend order; paired height with Decisions (R2-U1-R6).
 */
export function TopExceptionsPanel({ data }: { data: DashboardOverview }) {
  const items = data.topExceptions;
  const psDelta = data.project.productionStartVariance.deltaDays;

  return (
    <ModuleSurface
      data-dashboard-block="top-exceptions"
      className={DASHBOARD_PAIR_SURFACE_CLASS}
    >
      <h2
        id="top-exceptions-heading"
        className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
      >
        Ключевые исключения
      </h2>

      {items.length === 0 ? (
        <p
          className="mt-1.5 text-sm leading-snug text-[var(--text-secondary)]"
          data-top-exceptions="empty"
        >
          На текущую дату критических исключений нет — спокойный базовый план.
        </p>
      ) : (
        <ol
          className={DASHBOARD_PAIR_LIST_SCROLL_CLASS}
          data-top-exceptions="list"
          data-exceptions-scroll="bounded"
          style={{ maxHeight: DASHBOARD_PAIR_LIST_MAX_HEIGHT }}
        >
          {items.map((ex, index) => {
            const accent =
              index === 0 ? impactAccent(ex.causeImpact, psDelta) : null;
            return (
              <li
                key={ex.id}
                className="border-b border-[var(--border-subtle)] py-3 first:pt-1 last:border-b-0 last:pb-0"
                data-exception-id={ex.id}
                data-exception-order={index + 1}
              >
                <div className="flex gap-3">
                  <span
                    className="mt-0.5 w-7 shrink-0 text-lg font-semibold tabular-nums leading-none text-[var(--text-muted)]"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <p className="text-[15px] font-semibold leading-snug text-[var(--text)]">
                        {ex.title}
                      </p>
                      {accent ? (
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--status-danger-fg)]">
                          {accent}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      {ex.causeImpact}
                    </p>
                    {index === 0 ? (
                      <CausalFragment links={ex.links} data={data} />
                    ) : null}
                    {ex.links.length > 0 ? (
                      <ul className="flex flex-wrap gap-x-2.5 gap-y-0.5 pt-0.5 text-[11px]">
                        {ex.links.map((link) => {
                          const label = resolveLinkLabel(link, data);
                          return (
                            <li key={`${link.type}:${link.id}`}>
                              <Link
                                href={entityDetailHref(link.type, link.id)}
                                title={`${entityTypeLabel(link.type)} · ${label.id}`}
                                className="text-[var(--text-muted)] underline-offset-2 hover:text-[var(--link)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                              >
                                <span className="text-[var(--text-secondary)]">
                                  {label.primary}
                                </span>
                                <span className="ml-1 opacity-70">{label.id}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </ModuleSurface>
  );
}
