import Link from 'next/link';
import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import { projectStatusMeaning } from '@/lib/ui-labels';
import { managementAttentionItems } from './management-attention';
import { StatusPill } from './status-pill';

function conditionAccent(status: DashboardOverview['projectStatus']): string {
  if (status === 'Green') return 'bg-[var(--status-ok-border)]';
  if (status === 'Yellow') return 'bg-[var(--status-warn-border)]';
  return 'bg-[var(--status-danger-border)]';
}

function conditionTint(status: DashboardOverview['projectStatus']): string {
  if (status === 'Green') return 'bg-[var(--status-ok-bg)]/35';
  if (status === 'Yellow') return 'bg-[var(--status-warn-bg)]/35';
  return 'bg-[var(--status-danger-bg)]/35';
}

/**
 * Executive Project Control Summary — one strong surface, three semantic zones.
 * PS forecast/delta dominate; condition/attention support.
 */
export function ProjectControlSummary({ data }: { data: DashboardOverview }) {
  const ps = data.project.productionStartVariance;
  const meaning = projectStatusMeaning(data.projectStatus, ps.deltaDays);
  const onPlan = ps.deltaDays === 0;
  const attention = managementAttentionItems(data).filter((i) => i.count > 0);

  return (
    <section
      aria-labelledby="project-control-summary-heading"
      className="overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-raised)] shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
      data-dashboard-block="project-status"
      data-dashboard-summary="project-control"
    >
      <h2 id="project-control-summary-heading" className="sr-only">
        Сводка управления проектом
      </h2>

      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.9fr)]">
        {/* Project condition ~28–30% */}
        <div
          className={`relative flex gap-3 px-4 py-4 ${conditionTint(data.projectStatus)}`}
          data-summary-zone="condition"
        >
          <span
            className={`absolute inset-y-0 left-0 w-1.5 ${conditionAccent(data.projectStatus)}`}
            aria-hidden
          />
          <div className="min-w-0 pl-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              Состояние
            </p>
            <div className="mt-2">
              <StatusPill family="project" value={data.projectStatus} />
            </div>
            <p className="mt-2.5 text-sm font-medium leading-snug text-[var(--text)]">
              {data.project.name}
            </p>
            <p
              className="mt-1 text-xs leading-snug text-[var(--text-secondary)]"
              data-project-status-meaning
            >
              {meaning}
            </p>
            <p className="mt-2 text-[10px] text-[var(--text-muted)]">
              {data.project.id} · снимок {data.snapshotId} ·{' '}
              {formatDateRu(data.scenarioAsOfDate)}
            </p>
          </div>
        </div>

        {/* Production Start ~40–44% — dominant */}
        <div
          className="border-t border-[var(--border-subtle)] px-5 py-4 lg:border-t-0 lg:border-l"
          data-summary-zone="production-start"
          data-production-start
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Запуск производства
          </p>
          {onPlan ? (
            <>
              <p
                className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-[var(--text)]"
                data-ps-dates
              >
                {formatDateRu(ps.baselineDate)}
              </p>
              <p
                className="mt-1 text-sm font-semibold uppercase tracking-wide text-[var(--status-ok-fg)]"
                data-ps-delta
              >
                по плану · без отклонения
              </p>
            </>
          ) : (
            <>
              <p
                className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-[var(--text)]"
                data-ps-dates
              >
                {formatDateRu(ps.forecastDate)}
                <span className="sr-only">
                  {' '}
                  (базовый план {formatDateRu(ps.baselineDate)})
                </span>
              </p>
              <p
                className="mt-1 text-2xl font-semibold tabular-nums text-[var(--status-danger-fg)]"
                data-ps-delta
              >
                {formatDeltaDays(ps.deltaDays)}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                базовый план {formatDateRu(ps.baselineDate)}
                <span className="mx-1.5 text-[var(--border)]" aria-hidden>
                  →
                </span>
                прогноз {formatDateRu(ps.forecastDate)}
              </p>
            </>
          )}
        </div>

        {/* Attention ~28–30% */}
        <div
          className="border-t border-[var(--border-subtle)] px-4 py-4 lg:border-t-0 lg:border-l"
          data-summary-zone="attention"
          data-dashboard-block="management-attention"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Внимание
          </p>
          {attention.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Нет активных управленческих сигналов.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-sm">
              {attention.map((item) => (
                <li
                  key={item.id}
                  className="flex items-baseline gap-2"
                  data-attention={item.id}
                  data-attention-count={item.count}
                >
                  <span className="text-base font-semibold tabular-nums text-[var(--text)]">
                    {item.count}
                  </span>
                  <Link
                    href={item.href}
                    className="text-[var(--text-secondary)] underline-offset-2 hover:text-[var(--link)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    {item.label}
                    <span className="sr-only"> — {item.hrefLabel}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
