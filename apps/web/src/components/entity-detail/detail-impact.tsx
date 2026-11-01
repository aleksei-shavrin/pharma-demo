import type { EntityImpact } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  presentDecisionType,
  presentIssueTitle,
  presentMilestoneName,
} from '@/lib/ui-labels';

/**
 * Derived management Impact — separate from Links (DOC-BA-015).
 * Director-facing copy only; no BR-/Domain jargon.
 */
export function DetailImpact({ impact }: { impact: EntityImpact }) {
  const eqDelta = formatDeltaDays(impact.equipmentDeliveryDeltaDays);
  const psDelta = formatDeltaDays(impact.productionStartDeltaDays);

  if (impact.kind === 'none' && !impact.issueId) {
    return (
      <section
        aria-labelledby="detail-impact-heading"
        className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-4"
      >
        <h2
          id="detail-impact-heading"
          className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]"
        >
          Влияние
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Управленческий контекст текущего снимка — не список прямых связей.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--text-secondary)]">
          <li>
            Поставка критического оборудования без отклонения (
            {formatDateRu(impact.equipmentForecastDelivery)}).
          </li>
          <li>
            Риск {impact.riskId} — зелёный.
          </li>
          <li>
            {presentMilestoneName(impact.milestoneId, impact.milestoneName)} (
            {impact.milestoneId}) — зелёная; запуск производства без отклонения (
            {formatDateRu(impact.productionStartForecast)}).
          </li>
        </ol>
      </section>
    );
  }

  const steps: string[] = [];
  steps.push(
    `Критическое оборудование: задержка поставки ${eqDelta} (прогноз ${formatDateRu(impact.equipmentForecastDelivery)}).`,
  );
  if (impact.issueId && impact.issueStatus) {
    const verb =
      impact.issueStatus === 'Open'
        ? 'открыта'
        : 'выполняются меры (проблема не закрыта)';
    const title = presentIssueTitle(impact.issueId, impact.issueId);
    steps.push(`Проблема ${impact.issueId} ${verb}: «${title}».`);
  }
  steps.push(
    impact.riskRag === 'Red'
      ? `Риск ${impact.riskId} — красный.`
      : `Риск ${impact.riskId} — зелёный.`,
  );
  const msName = presentMilestoneName(
    impact.milestoneId,
    impact.milestoneName,
  );
  steps.push(
    impact.milestoneRag === 'Red'
      ? `${msName} (${impact.milestoneId}) — красная.`
      : `${msName} (${impact.milestoneId}) — зелёная.`,
  );
  steps.push(
    `Прогноз запуска производства смещён на ${psDelta} → ${formatDateRu(impact.productionStartForecast)}.`,
  );
  if (impact.decisionState === 'recorded' && impact.decision) {
    steps.push(
      `Решение ${impact.decision.id} («${presentDecisionType(impact.decision.type)}») зарегистрировано; восстановление прогноза ещё не произошло.`,
    );
  } else if (impact.decisionState === 'needed') {
    steps.push(
      'Управленческое решение по отклонению ещё не зарегистрировано.',
    );
  }

  return (
    <section
      aria-labelledby="detail-impact-heading"
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-4"
    >
      <h2
        id="detail-impact-heading"
        className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]"
      >
        Влияние
      </h2>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Управленческий контекст отклонения. Не является списком прямых связей.
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-secondary)]">
        {steps.map((step) => (
          <li key={step}>
            <span className="text-[var(--text)]">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
