import Link from 'next/link';
import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu } from '@/lib/format/ru';
import {
  presentDecisionNote,
  presentDecisionType,
  presentMilestoneName,
} from '@/lib/ui-labels';
import {
  DASHBOARD_PAIR_LIST_MAX_HEIGHT,
  DASHBOARD_PAIR_LIST_SCROLL_CLASS,
  DASHBOARD_PAIR_SURFACE_CLASS,
} from '@/lib/dashboard/dashboard-layout';
import { ModuleSurface } from './module-surface';

/** Context-sensitive Decision / required-action — paired with Exceptions (R2-U1-R6). */
export function DecisionAction({ data }: { data: DashboardOverview }) {
  const decisions = data.decisions;
  const milestoneName = (id: string | null) => {
    if (!id) return null;
    const ms = data.milestones.find((m) => m.id === id);
    return presentMilestoneName(id, ms?.name ?? id);
  };

  if (data.decisionPanelState === 'absent' && decisions.length === 0) {
    return null;
  }

  const needed = data.decisionPanelState === 'needed' && decisions.length === 0;

  return (
    <ModuleSurface
      data-dashboard-block="decisions"
      className={DASHBOARD_PAIR_SURFACE_CLASS}
    >
      <h2
        id="decision-heading"
        className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
      >
        Управленческие решения
      </h2>

      {needed ? (
        <div
          className="mt-2 shrink-0 rounded-[var(--radius-sm)] border-2 border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3.5 py-3"
          data-decision-callout="needed"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--status-danger-fg)]">
            Требуется управленческое решение
          </p>
          <p className="mt-1.5 text-sm leading-snug text-[var(--text-secondary)]">
            Есть отклонение по поставке и запуску производства. Решение ещё не
            зарегистрировано. Запись решения не устранит прогноз автоматически.
          </p>
        </div>
      ) : null}

      {decisions.length > 0 ? (
        <>
          <p className="mt-1.5 shrink-0 text-[11px] text-[var(--text-muted)]">
            Запись решения не означает автоматическое устранение отклонения.
          </p>
          <ul
            className={`${DASHBOARD_PAIR_LIST_SCROLL_CLASS} divide-y divide-[var(--border-subtle)]`}
            data-decisions="list"
            data-decisions-scroll="bounded"
            style={{ maxHeight: DASHBOARD_PAIR_LIST_MAX_HEIGHT }}
          >
            {decisions.map((decision) => (
              <li
                key={decision.id}
                className="py-2.5 first:pt-1 last:pb-0 text-sm"
                data-decision-id={decision.id}
              >
                <p className="font-semibold text-[var(--text)]">
                  {presentDecisionType(decision.type)}
                </p>
                <p className="mt-0.5 text-[var(--text-secondary)]">
                  {presentDecisionNote(decision.id, decision.note)}
                </p>
                <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-[var(--text-muted)]">
                  <div>
                    <dt className="inline">Владелец: </dt>
                    <dd className="inline text-[var(--text-secondary)]">
                      <Link
                        href={`/people/${encodeURIComponent(decision.ownerPersonId)}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {decision.ownerFullNameRu}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">Срок: </dt>
                    <dd className="inline text-[var(--text-secondary)]">
                      {decision.dueDate
                        ? formatDateRu(decision.dueDate)
                        : 'не задан'}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">Веха: </dt>
                    <dd className="inline text-[var(--text-secondary)]">
                      {decision.milestoneId
                        ? milestoneName(decision.milestoneId)
                        : 'не привязана'}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {data.decisionHonesty && !data.decisionHonesty.recoveryExecuted ? (
        <aside
          className="mt-2 shrink-0 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] px-3 py-2 text-sm text-[var(--text-secondary)]"
          aria-label="Уточнение по решению"
          data-decision-honesty="true"
        >
          Решение зарегистрировано, но это ещё не устранение задержки. Статус
          проекта и прогноз запуска производства не меняются автоматически от
          факта записи решения. Текущий прогноз старта —{' '}
          {formatDateRu(data.project.forecastProductionStart)}.
        </aside>
      ) : null}
    </ModuleSurface>
  );
}

/** @deprecated name — use DecisionAction */
export const DecisionPanel = DecisionAction;
