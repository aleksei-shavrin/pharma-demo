import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  issueStatusLabel,
  presentDecisionType,
  presentIssueTitle,
  presentMilestoneName,
} from '@/lib/ui-labels';

/**
 * Director-facing causal narrative. Sequence is storytelling / derived impact —
 * not a claim that every adjacent pair is a Domain relationship (DOC-BA-015).
 * Decision is never drawn as a Domain edge.
 */
export function ImpactNarrative({ data }: { data: DashboardOverview }) {
  const eqDelta = formatDeltaDays(data.equipment.deliveryVariance.deltaDays);
  const psDelta = formatDeltaDays(data.project.productionStartVariance.deltaDays);

  if (data.derivedImpact.kind === 'none' && !data.issue) {
    return (
      <section
        aria-labelledby="narrative-heading"
        className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-4"
      >
        <h2
          id="narrative-heading"
          className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]"
        >
          Состояние проекта
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--text-secondary)]">
          <li>
            Критическое оборудование{' '}
            <span className="font-medium text-[var(--text)]">
              {data.equipment.id}
            </span>
            : поставка по плану ({formatDateRu(data.equipment.forecastDelivery)}
            ).
          </li>
          <li>
            Риск{' '}
            <span className="font-medium text-[var(--text)]">{data.risk.id}</span>{' '}
            — зелёный.
          </li>
          <li>
            Веха{' '}
            <span className="font-medium text-[var(--text)]">
              {data.milestone.id}
            </span>{' '}
            (
            {presentMilestoneName(
              data.milestone.id,
              data.milestone.name,
            )}
            ) — зелёная; запуск производства без отклонения (
            {formatDateRu(data.project.forecastProductionStart)}).
          </li>
        </ol>
      </section>
    );
  }

  const steps: string[] = [];

  steps.push(
    `Критическое оборудование ${data.equipment.id}: задержка поставки ${eqDelta} (прогноз ${formatDateRu(data.equipment.forecastDelivery)}).`,
  );

  if (data.issue) {
    const issueVerb =
      data.issue.status === 'Open'
        ? 'открыта'
        : 'выполняются меры (проблема не закрыта)';
    const issueTitle = presentIssueTitle(data.issue.id, data.issue.title);
    steps.push(
      `Проблема ${data.issue.id} ${issueVerb}: «${issueTitle}».`,
    );
  }

  steps.push(
    data.risk.rag === 'Red'
      ? `Риск ${data.risk.id} — красный.`
      : `Риск ${data.risk.id} — зелёный.`,
  );

  const milestoneName = presentMilestoneName(
    data.milestone.id,
    data.milestone.name,
  );
  steps.push(
    data.milestone.rag === 'Red'
      ? `${milestoneName} (${data.milestone.id}) — красная.`
      : `${milestoneName} (${data.milestone.id}) — зелёная.`,
  );

  steps.push(
    `Прогноз запуска производства смещён на ${psDelta} → ${formatDateRu(data.project.forecastProductionStart)} — влияние задержки поставки критического оборудования.`,
  );

  if (data.decisionPanelState === 'recorded' && data.decision) {
    steps.push(
      `Решение ${data.decision.id} («${presentDecisionType(data.decision.type)}») зарегистрировано; восстановление прогноза ещё не произошло.`,
    );
  } else if (data.decisionPanelState === 'needed') {
    steps.push(
      'Управленческое решение по отклонению ещё не зарегистрировано.',
    );
  }

  return (
    <section
      aria-labelledby="narrative-heading"
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-4"
    >
      <h2
        id="narrative-heading"
        className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]"
      >
        Цепочка влияния
      </h2>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Управленческий контекст отклонения. Решение отображается отдельно.
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-secondary)]">
        {steps.map((step) => (
          <li key={step}>
            <span className="text-[var(--text)]">{step}</span>
          </li>
        ))}
      </ol>
      {data.issue ? (
        <p className="sr-only">
          Статус проблемы: {issueStatusLabel(data.issue.status)}.
        </p>
      ) : null}
    </section>
  );
}
