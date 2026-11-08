import Link from 'next/link';
import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu } from '@/lib/format/ru';
import {
  decisionDueBadgeKind,
  decisionDueBadgeLabel,
} from '@/lib/decisions/decision-due-labels';
import {
  presentDecisionNote,
  presentDecisionType,
  presentMilestoneName,
} from '@/lib/ui-labels';
import {
  DASHBOARD_PAIR_LIST_SCROLL_CLASS,
  DASHBOARD_PAIR_SURFACE_CLASS,
} from '@/lib/dashboard/dashboard-layout';
import { ModuleSurface } from './module-surface';

/** Context-sensitive Decision / required-action — paired with Exceptions. */
export function DecisionAction({ data }: { data: DashboardOverview }) {
  const decisions = data.decisions;
  const milestoneName = (id: string | null) => {
    if (!id) return null;
    const ms = data.milestones.find((m) => m.id === id);
    return presentMilestoneName(id, ms?.name ?? id);
  };
  const passedCount = decisions.filter((d) => d.dueState === 'passed').length;

  if (data.decisionPanelState === 'absent' && decisions.length === 0) {
    return null;
  }

  const needed = data.decisionPanelState === 'needed' && decisions.length === 0;
  const showHonesty =
    Boolean(data.decisionHonesty) && !data.decisionHonesty?.recoveryExecuted;

  return (
    <ModuleSurface
      data-dashboard-block="decisions"
      /* Tailwind scans this file — keep max-h literal (lib alone is not enough). */
      className={`${DASHBOARD_PAIR_SURFACE_CLASS} max-h-[28rem] overflow-hidden`}
    >
      {needed ? (
        <div
          className="shrink-0 rounded-[var(--radius-sm)] border-2 border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3.5 py-3"
          data-decision-callout="needed"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="decision-heading"
              className="text-sm font-bold uppercase tracking-wide text-[var(--status-danger-fg)]"
            >
              Требуется решение
            </h2>
            <Link
              href="/decisions"
              className="text-xs text-[var(--link)] underline-offset-2 hover:underline"
              data-decisions-register-link
            >
              Все решения
            </Link>
          </div>
          <p className="mt-1.5 text-sm leading-snug text-[var(--text-secondary)]">
            Есть отклонение по поставке и запуску производства. Решение ещё не
            зарегистрировано. Запись решения не устранит прогноз автоматически.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="decision-heading"
            className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
          >
            Решения
          </h2>
          <Link
            href="/decisions"
            className="text-xs text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            data-decisions-register-link
          >
            Все решения
          </Link>
        </div>
      )}

      {decisions.length > 0 ? (
        <>
          <p
            className="mt-1.5 shrink-0 text-[11px] text-[var(--text-muted)]"
            data-decisions-summary="true"
          >
            Записанные решения: {decisions.length}
            {passedCount > 0 ? ` · срок прошёл: ${passedCount}` : ''}
            {' · '}
            исполнение не отслеживается
            {showHonesty ? (
              <>
                . Запись не снимает отклонение автоматически. Прогноз старта
                портфеля:{' '}
                <span className="tabular-nums text-[var(--text-secondary)]">
                  {formatDateRu(data.project.forecastProductionStart)}
                </span>
              </>
            ) : (
              '.'
            )}
          </p>
          <ul
            className={DASHBOARD_PAIR_LIST_SCROLL_CLASS}
            data-decisions="list"
            data-decisions-scroll="fill"
          >
            {decisions.map((decision) => {
              const dueKind = decisionDueBadgeKind(
                decision.dueState ?? 'none',
                decision.dueDate,
                data.scenarioAsOfDate,
              );
              const dueLabel = decisionDueBadgeLabel(dueKind);
              return (
                <li
                  key={decision.id}
                  className="py-2.5 first:pt-1 last:pb-0 text-sm"
                  data-decision-id={decision.id}
                  data-decision-due={decision.dueState ?? 'none'}
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
                        {dueKind === 'passed' || dueKind === 'today' ? (
                          <span
                            className="ml-1 text-[var(--text-muted)]"
                            data-decision-due-badge={dueKind}
                          >
                            · {dueLabel}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline">Веха: </dt>
                      <dd className="inline text-[var(--text-secondary)]">
                        {decision.milestoneId ? (
                          <Link
                            href={`/milestones/${encodeURIComponent(decision.milestoneId)}`}
                            className="underline-offset-2 hover:underline"
                          >
                            {milestoneName(decision.milestoneId)}
                          </Link>
                        ) : (
                          'не привязана'
                        )}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </ModuleSurface>
  );
}

/** @deprecated name — use DecisionAction */
export const DecisionPanel = DecisionAction;
