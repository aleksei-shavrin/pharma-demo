import type { DashboardOverview } from '@/lib/api-client';
import {
  spineEquipment,
  spineIssue,
  spineMilestone,
  spineRisk,
  spineDecision,
} from '@/lib/dashboard/spine';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  issueStatusLabel,
  presentDecisionType,
  presentIssueTitle,
  presentMilestoneName,
} from '@/lib/ui-labels';

/**
 * Director-facing causal narrative using BR-004 spine from collections.
 */
export function ImpactNarrative({ data }: { data: DashboardOverview }) {
  const equipment = spineEquipment(data);
  const issue = spineIssue(data);
  const risk = spineRisk(data);
  const milestone = spineMilestone(data);
  const decision = spineDecision(data);

  const eqDelta = formatDeltaDays(equipment.deliveryVariance.deltaDays);
  const psDelta = formatDeltaDays(data.project.productionStartVariance.deltaDays);

  if (data.derivedImpact.kind === 'none' && !issue) {
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
              {equipment.id}
            </span>
            : поставка по плану ({formatDateRu(equipment.forecastDelivery)}
            ).
          </li>
          <li>
            Риск{' '}
            <span className="font-medium text-[var(--text)]">{risk.id}</span>{' '}
            — зелёный.
          </li>
          <li>
            Веха{' '}
            <span className="font-medium text-[var(--text)]">
              {milestone.id}
            </span>{' '}
            ({presentMilestoneName(milestone.id, milestone.name)}) — зелёная;
            запуск производства без отклонения (
            {formatDateRu(data.project.forecastProductionStart)}).
          </li>
        </ol>
      </section>
    );
  }

  const steps: string[] = [];

  steps.push(
    `Критическое оборудование ${equipment.id}: задержка поставки ${eqDelta} (прогноз ${formatDateRu(equipment.forecastDelivery)}).`,
  );

  if (issue) {
    const issueVerb =
      issue.status === 'Open'
        ? 'открыта'
        : issue.status === 'Closed'
          ? 'закрыта'
          : 'выполняются меры (проблема не закрыта)';
    const issueTitle = presentIssueTitle(issue.id, issue.title);
    steps.push(`Проблема ${issue.id} ${issueVerb}: «${issueTitle}».`);
  }

  steps.push(
    risk.rag === 'Red'
      ? `Риск ${risk.id} — красный.`
      : `Риск ${risk.id} — зелёный.`,
  );

  const milestoneName = presentMilestoneName(milestone.id, milestone.name);
  steps.push(
    milestone.rag === 'Red'
      ? `${milestoneName} (${milestone.id}) — красная.`
      : `${milestoneName} (${milestone.id}) — зелёная.`,
  );

  steps.push(
    `Прогноз запуска производства смещён на ${psDelta} → ${formatDateRu(data.project.forecastProductionStart)} — влияние задержки поставки критического оборудования.`,
  );

  if (data.decisionPanelState === 'recorded' && decision) {
    steps.push(
      `Решение ${decision.id} («${presentDecisionType(decision.type)}») зарегистрировано; восстановление прогноза ещё не произошло.`,
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
      {issue ? (
        <p className="sr-only">
          Статус проблемы: {issueStatusLabel(issue.status)}.
        </p>
      ) : null}
    </section>
  );
}
