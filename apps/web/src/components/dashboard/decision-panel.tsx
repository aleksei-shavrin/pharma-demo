import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu } from '@/lib/format/ru';
import {
  presentDecisionNote,
  presentDecisionType,
  presentMilestoneName,
  presentOwnerRole,
} from '@/lib/ui-labels';

export function DecisionPanel({ data }: { data: DashboardOverview }) {
  const decisions = data.decisions;
  const milestoneName = (id: string | null) => {
    if (!id) return null;
    const ms = data.milestones.find((m) => m.id === id);
    return presentMilestoneName(id, ms?.name ?? id);
  };

  return (
    <section
      aria-labelledby="decision-heading"
      className="rounded-[var(--radius-md)] bg-[var(--surface-raised)] px-4 py-3 shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
      data-dashboard-block="decisions"
    >
      <h2
        id="decision-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
      >
        Управленческие решения
      </h2>
      <p className="mt-1 text-[11px] text-[var(--text-muted)]">
        Запись решения не означает автоматическое устранение отклонения.
      </p>

      {data.decisionPanelState === 'absent' && decisions.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Для текущего состояния решение не требуется: зарегистрированные решения
          отсутствуют.
        </p>
      ) : null}

      {data.decisionPanelState === 'needed' && decisions.length === 0 ? (
        <div className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text)]">
            Требуется управленческое решение
          </p>
          <p>
            Есть отклонение по поставке и запуску производства. Решение ещё не
            зарегистрировано.
          </p>
        </div>
      ) : null}

      {decisions.length > 0 ? (
        <ul
          className="mt-2 divide-y divide-[var(--border-subtle)]"
          data-decisions="list"
        >
          {decisions.map((decision) => (
            <li
              key={decision.id}
              className="py-2.5 first:pt-0 last:pb-0 text-sm"
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
                    {presentOwnerRole(decision.ownerRole)}
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
      ) : null}

      {data.decisionHonesty && !data.decisionHonesty.recoveryExecuted ? (
        <aside
          className="mt-2 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] px-3 py-2 text-sm text-[var(--text-secondary)]"
          aria-label="Уточнение по решению"
          data-decision-honesty="true"
        >
          Решение зарегистрировано, но это ещё не устранение задержки. Статус
          проекта и прогноз запуска производства не меняются автоматически от
          факта записи решения. Текущий прогноз старта —{' '}
          {formatDateRu(data.project.forecastProductionStart)}.
        </aside>
      ) : null}
    </section>
  );
}
