import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu } from '@/lib/format/ru';
import {
  presentDecisionNote,
  presentDecisionType,
} from '@/lib/ui-labels';

export function DecisionPanel({ data }: { data: DashboardOverview }) {
  return (
    <section
      aria-labelledby="decision-heading"
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-4"
    >
      <h2
        id="decision-heading"
        className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]"
      >
        Управленческое решение
      </h2>

      {data.decisionPanelState === 'absent' ? (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Для текущего состояния решение не требуется: отклонений нет,
          зарегистрированное решение отсутствует.
        </p>
      ) : null}

      {data.decisionPanelState === 'needed' ? (
        <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text)]">
            Требуется управленческое решение
          </p>
          <p>
            Есть отклонение по поставке и запуску производства. Решение ещё не
            зарегистрировано.
          </p>
        </div>
      ) : null}

      {data.decisionPanelState === 'recorded' && data.decision ? (
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
              Зарегистрировано
            </p>
            <p className="font-semibold text-[var(--text)]">
              {presentDecisionType(data.decision.type)}
            </p>
            <p className="text-[var(--text-muted)]">
              {data.decision.id} · срок{' '}
              {formatDateRu(data.decision.dueDate)} · владелец{' '}
              {data.decision.ownerRole}
            </p>
            <p className="mt-1 text-[var(--text-secondary)]">
              {presentDecisionNote(data.decision.id, data.decision.note)}
            </p>
          </div>
          {data.decisionHonesty && !data.decisionHonesty.recoveryExecuted ? (
            <aside
              className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-sunken)] p-3 text-[var(--text-secondary)]"
              aria-label="Уточнение по решению"
            >
              Решение зарегистрировано, но это ещё не устранение задержки.
              По проблеме выполняются меры; риск и веха остаются красными;
              прогноз запуска производства —{' '}
              {formatDateRu(data.project.forecastProductionStart)}.
            </aside>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
