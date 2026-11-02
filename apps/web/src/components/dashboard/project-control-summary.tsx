import type { DashboardOverview, ProjectCost } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import { projectStatusMeaning } from '@/lib/ui-labels';
import { CostSignal } from './cost-signal';
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
 * Executive Project Control Summary (R2-U1 / R4):
 * Project RAG + Production Start + Cost signal.
 * Inner zones stretch to full overview-row height.
 */
export function ProjectControlSummary({
  data,
  projectCost,
}: {
  data: DashboardOverview;
  projectCost?: ProjectCost | null;
}) {
  const ps = data.project.productionStartVariance;
  const meaning = projectStatusMeaning(data.projectStatus, ps.deltaDays);
  const onPlan = ps.deltaDays === 0;
  const achieved =
    data.snapshotId === 'S' &&
    data.projectStatus === 'Green' &&
    ps.forecastDate === '2027-09-22';

  return (
    <section
      aria-labelledby="project-control-summary-heading"
      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] shadow-[var(--elevation-1)]"
      data-dashboard-block="project-status"
      data-dashboard-summary="project-control"
      data-overview-stretch="full-height"
    >
      <h2 id="project-control-summary-heading" className="sr-only">
        Сводка управления проектом
      </h2>

      <div
        className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)_minmax(0,0.95fr)] lg:items-stretch"
        data-summary-grid="stretch"
      >
        <div
          className={`relative flex h-full min-h-0 flex-col gap-3 px-4 py-4 ${conditionTint(data.projectStatus)}`}
          data-summary-zone="condition"
        >
          <span
            className={`absolute inset-y-0 left-0 w-1.5 ${conditionAccent(data.projectStatus)}`}
            aria-hidden
          />
          <div className="flex min-h-0 flex-1 flex-col pl-1.5">
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
            <p className="mt-auto pt-3 text-[10px] text-[var(--text-muted)]">
              {data.project.id} · снимок {data.snapshotId} ·{' '}
              {formatDateRu(data.scenarioAsOfDate)}
            </p>
          </div>
        </div>

        <div
          className="flex h-full min-h-0 flex-col border-t border-[var(--border-subtle)] px-5 py-4 lg:border-t-0 lg:border-l"
          data-summary-zone="production-start"
          data-production-start
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Запуск производства
          </p>
          {achieved ? (
            <>
              <p
                className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-[var(--text)]"
                data-ps-dates
              >
                {formatDateRu(ps.forecastDate)}
              </p>
              <p
                className="mt-1 text-sm font-semibold uppercase tracking-wide text-[var(--status-ok-fg)]"
                data-ps-delta
                data-ps-achieved
              >
                достигнут · {formatDeltaDays(ps.deltaDays)} к базовому плану
              </p>
            </>
          ) : onPlan ? (
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
              {data.snapshotId === 'Q' ? (
                <p
                  className="mt-1.5 text-xs text-[var(--status-warn-fg)]"
                  data-ps-baseline-passed
                >
                  Базовая дата пройдена без фактического старта
                </p>
              ) : null}
            </>
          )}
        </div>

        <div
          className="flex h-full min-h-0 flex-col border-t border-[var(--border-subtle)] px-4 py-4 lg:border-t-0 lg:border-l"
          data-summary-zone="cost"
        >
          <CostSignal snapshotId={data.snapshotId} projectCost={projectCost} />
        </div>
      </div>
    </section>
  );
}
