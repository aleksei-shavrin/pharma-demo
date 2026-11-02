import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import { projectStatusMeaning } from '@/lib/ui-labels';
import { StatusPill } from './status-pill';

/**
 * Executive Project Status — Production Start is the primary visual signal.
 * RAG and metadata stay visible but secondary. No FE variance computation.
 */
export function ProjectStatusPanel({ data }: { data: DashboardOverview }) {
  const ps = data.project.productionStartVariance;
  const meaning = projectStatusMeaning(data.projectStatus, ps.deltaDays);
  const baseline = formatDateRu(ps.baselineDate);
  const forecast = formatDateRu(ps.forecastDate);
  const delta = formatDeltaDays(ps.deltaDays);
  const onPlan = ps.deltaDays === 0;

  return (
    <section
      aria-labelledby="project-status-heading"
      className="rounded-[var(--radius-md)] bg-[var(--surface-raised)] p-4 shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
      data-dashboard-block="project-status"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="project-status-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
        >
          Статус проекта
        </h2>
        <StatusPill family="project" value={data.projectStatus} />
      </div>

      <div className="mt-3" data-production-start>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
          Запуск производства
        </p>

        {onPlan ? (
          <p
            className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[var(--text)]"
            data-ps-dates
          >
            {baseline}
          </p>
        ) : (
          <p
            className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[var(--text)]"
            data-ps-dates
          >
            <span>{baseline}</span>
            <span className="mx-2 text-[var(--text-muted)]" aria-hidden>
              →
            </span>
            <span>{forecast}</span>
          </p>
        )}

        <p
          className={
            onPlan
              ? 'mt-1 text-base font-medium tabular-nums text-[var(--status-ok-fg)]'
              : 'mt-1 text-xl font-semibold tabular-nums text-[var(--status-danger-fg)]'
          }
          data-ps-delta
        >
          {onPlan ? 'по плану · без отклонения' : delta}
        </p>
      </div>

      <p
        className="mt-3 text-sm leading-snug text-[var(--text-secondary)]"
        data-project-status-meaning
      >
        {meaning}
      </p>

      <p className="mt-3 border-t border-[var(--border-subtle)] pt-2 text-[11px] text-[var(--text-muted)]">
        {data.project.name}
        <span className="mx-1.5 text-[var(--border)]" aria-hidden>
          ·
        </span>
        {data.project.id}
        <span className="mx-1.5 text-[var(--border)]" aria-hidden>
          ·
        </span>
        на дату {formatDateRu(data.scenarioAsOfDate)}
        <span className="mx-1.5 text-[var(--border)]" aria-hidden>
          ·
        </span>
        снимок {data.snapshotId}
      </p>
    </section>
  );
}
