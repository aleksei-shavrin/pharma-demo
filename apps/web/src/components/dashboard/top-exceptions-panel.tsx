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
  DASHBOARD_PAIR_LIST_SCROLL_CLASS,
  DASHBOARD_PAIR_SURFACE_CLASS,
} from '@/lib/dashboard/dashboard-layout';
import { assessTopExceptionCritical } from '@/lib/dashboard/top-exception-critical';
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

/**
 * Editorial Top Exceptions — curated order; critical from linked facts only.
 * Critical contour is a 1px border-box border (not outer ring) so scroll gutters
 * keep first/last edges visible without expanding the pair surface.
 */
export function TopExceptionsPanel({ data }: { data: DashboardOverview }) {
  const items = data.topExceptions;
  const psDelta = data.project.productionStartVariance.deltaDays;

  return (
    <ModuleSurface
      data-dashboard-block="top-exceptions"
      className={`${DASHBOARD_PAIR_SURFACE_CLASS} max-h-[28rem] overflow-hidden`}
    >
      <h2
        id="top-exceptions-heading"
        className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
      >
        Требует внимания
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
          className={`${DASHBOARD_PAIR_LIST_SCROLL_CLASS} flex flex-col gap-2.5 px-1 py-1`}
          data-top-exceptions="list"
          data-exceptions-scroll="fill"
        >
          {items.map((ex, index) => {
            const assessment = assessTopExceptionCritical(ex, data);
            const critical = assessment.critical;
            const primaryHref = assessment.primaryLink
              ? entityDetailHref(
                  assessment.primaryLink.type,
                  assessment.primaryLink.id,
                )
              : null;

            return (
              <li
                key={ex.id}
                className={
                  critical
                    ? 'rounded-[var(--radius-sm)] border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-2.5 py-2.5'
                    : 'border-b border-[var(--border-subtle)] px-2.5 py-2 last:border-b-0'
                }
                data-exception-id={ex.id}
                data-exception-order={index + 1}
                data-exception-critical={critical ? 'true' : 'false'}
                data-exception-chrome={
                  critical ? 'critical-box' : 'neutral-divider'
                }
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
                      {primaryHref ? (
                        <Link
                          href={primaryHref}
                          className="text-[15px] font-semibold leading-snug text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                          data-exception-title-link="true"
                        >
                          {ex.title}
                        </Link>
                      ) : (
                        <p className="text-[15px] font-semibold leading-snug text-[var(--text)]">
                          {ex.title}
                        </p>
                      )}
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {critical ? (
                          <span
                            className="rounded-[var(--radius-sm)] border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--status-danger-fg)]"
                            data-exception-badge="critical"
                          >
                            Критично
                          </span>
                        ) : null}
                        {assessment.showPsDelta ? (
                          <span className="text-sm font-semibold tabular-nums text-[var(--status-danger-fg)]">
                            {formatDeltaDays(psDelta)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      {ex.causeImpact}
                    </p>
                    {ex.links.length > 0 ? (
                      <ul className="flex flex-wrap gap-x-2.5 gap-y-0.5 pt-0.5 text-[11px]">
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
                                <span className="ml-1 opacity-70">
                                  {label.id}
                                </span>
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
