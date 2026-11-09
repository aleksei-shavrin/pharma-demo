import Link from 'next/link';
import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import { decisionExecutionLabel } from '@/lib/decisions/decision-execution-labels';
import {
  equipmentStatusLabel,
  presentDecisionType,
  presentIssueTitle,
  ragLabel,
} from '@/lib/ui-labels';
import { DASHBOARD_PAIR_SURFACE_CLASS } from '@/lib/dashboard/dashboard-layout';
import { ModuleSurface } from './module-surface';
import { StatusPill } from './status-pill';
import { entityDetailHref } from '@/lib/entity-routes';

/**
 * One management control case — Production Start — with at most one related
 * DEC-001. Forecast and execution stay independent (BR-006). Not a register.
 */
export function DecisionAction({ data }: { data: DashboardOverview }) {
  if (data.decisionPanelState === 'absent') {
    return null;
  }

  const psDelta = data.project.productionStartVariance?.deltaDays ?? 0;
  const baseline = data.project.baselineProductionStart;
  const forecast = data.project.forecastProductionStart;
  const primary = data.decisions.find((d) => d.id === 'DEC-001') ?? null;
  const eq = data.equipment.find((e) => e.id === 'EQ-HVAC-01');
  const issueRow = data.issues.find((i) => i.id === 'ISS-001') ?? null;
  const risk = data.risks.find((r) => r.id === 'RISK-001');
  const needed = data.decisionPanelState === 'needed';
  const execStatus = primary?.executionStatus ?? 'unknown';
  const exec = primary?.execution ?? null;
  const deviation =
    data.decisionHonesty?.forecastDeviation ??
    (psDelta === 0 ? 'within_baseline' : 'deviation_persists');

  const eqHuman = eq
    ? `${eq.name} — ${equipmentStatusLabel(eq.status)}`
    : 'Критическое оборудование AHU';
  const riskHuman = risk ? ragLabel('risk', risk.rag) : null;
  const issueHuman = issueRow
    ? presentIssueTitle(issueRow.id, issueRow.title)
    : null;

  const showResidualCaveat =
    execStatus === 'completed' && deviation === 'deviation_persists';
  const showNeededCaveat = needed;

  return (
    <ModuleSurface
      data-dashboard-block="decisions"
      className={`${DASHBOARD_PAIR_SURFACE_CLASS} max-h-[28rem] overflow-hidden`}
    >
      <div className="flex shrink-0 flex-wrap items-baseline justify-between gap-2">
        <h2
          id="decision-heading"
          className={
            needed
              ? 'text-sm font-semibold tracking-wide text-[var(--status-danger-fg)]'
              : 'text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]'
          }
        >
          Прогноз и решение
        </h2>
        <Link
          href="/decisions"
          className="text-xs text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          data-decisions-register-link
        >
          Все решения
        </Link>
      </div>

      {/* Scrollable body — footer CTAs stay reachable on 768. */}
      <div
        className="mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-gutter:stable]"
        data-decision-body="scroll"
      >
        <p
          className="text-xs text-[var(--text-muted)]"
          data-decision-scope="production-start"
        >
          Объект контроля: Запуск производства
        </p>

        <div data-decision-impact="true">
          <p
            className="text-2xl font-semibold tabular-nums tracking-tight text-[var(--text)]"
            data-decision-ps-delta
          >
            {formatDeltaDays(psDelta)}
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            базовый план{' '}
            <span className="tabular-nums">{formatDateRu(baseline)}</span>
            <span className="mx-1.5 text-[var(--border)]" aria-hidden>
              →
            </span>
            прогноз{' '}
            <span className="tabular-nums">{formatDateRu(forecast)}</span>
            {deviation === 'deviation_persists' ? (
              <span className="text-[var(--text-muted)]">
                {' '}
                · отклонение сохраняется
              </span>
            ) : null}
          </p>
          <p className="mt-1.5 text-sm leading-snug text-[var(--text-secondary)]">
            Причина: {eqHuman}
            {needed && issueHuman ? ` · ${issueHuman}` : ''}
            {!needed && riskHuman ? ` · ${riskHuman}` : ''}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[11px] text-[var(--text-muted)]">
            {eq ? (
              <li>
                <Link
                  href={entityDetailHref('equipment', eq.id)}
                  className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {eq.id}
                </Link>
              </li>
            ) : null}
            {issueRow ? (
              <li>
                <Link
                  href={entityDetailHref('issue', issueRow.id)}
                  className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {issueRow.id}
                </Link>
              </li>
            ) : null}
            {risk ? (
              <li>
                <Link
                  href={entityDetailHref('risk', risk.id)}
                  className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {risk.id}
                </Link>
              </li>
            ) : null}
            <li>
              <Link
                href={entityDetailHref('milestone', 'MS-PS')}
                className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              >
                MS-PS
              </Link>
            </li>
          </ul>
        </div>

        {needed ? (
          <div
            className="rounded-[var(--radius-sm)] border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)]/40 px-3 py-2.5"
            data-decision-callout="needed"
          >
            <p className="text-sm font-semibold text-[var(--status-danger-fg)]">
              Требуется решение
            </p>
            <p
              className="mt-1 text-xs font-medium text-[var(--status-danger-fg)]"
              data-decision-callout-state="unregistered"
            >
              Решение по запуску не зарегистрировано
            </p>
            {showNeededCaveat ? (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Запись решения сама по себе не устраняет отклонение прогноза.
              </p>
            ) : null}
          </div>
        ) : primary ? (
          <div
            className="rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] px-3 py-2.5"
            data-decision-callout="recorded"
            data-decision-related="true"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Связанное решение
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug text-[var(--text)]">
              {presentDecisionType(primary.type)}
              <span className="ml-1.5 text-xs font-normal text-[var(--text-muted)]">
                {primary.id}
              </span>
            </p>
            {primary.note ? (
              <p className="mt-1 text-xs leading-snug text-[var(--text-secondary)]">
                {primary.note}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[var(--text-muted)]">Исполнение:</span>
              <StatusPill
                family="decisionExecution"
                value={execStatus}
                label={decisionExecutionLabel(execStatus)}
              />
            </div>
            {exec ? (
              <p
                className="mt-1.5 text-xs text-[var(--text-secondary)]"
                data-decision-execution-source="demo"
              >
                {exec.source.label}: {exec.evidenceNote}
                <span className="text-[var(--text-muted)]">
                  {' '}
                  · на {formatDateRu(exec.asOfDate)}
                </span>
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                Нет данных об исполнении (демо-наблюдение отсутствует).
              </p>
            )}
            {showResidualCaveat ? (
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                Выполнение действия не означает восстановление прогноза.
              </p>
            ) : null}
          </div>
        ) : (
          <p
            className="text-sm text-[var(--status-danger-fg)]"
            data-decision-callout="recorded-missing"
          >
            Решение по запуску отсутствует в снимке при состоянии recorded —
            проверьте API.
          </p>
        )}
      </div>

      <div
        className="mt-2 flex shrink-0 flex-wrap gap-x-3 gap-y-1 border-t border-[var(--border-subtle)] pt-2 text-xs"
        data-decision-footer="cta"
      >
        {needed ? (
          <>
            {issueRow ? (
              <Link
                href={entityDetailHref('issue', issueRow.id)}
                className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                data-decision-cta="open-issue"
              >
                Открыть проблему
              </Link>
            ) : null}
            <Link
              href="/decisions"
              className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              data-decision-cta="open-decisions"
            >
              Все решения
            </Link>
          </>
        ) : primary ? (
          <>
            <Link
              href={`/decisions?q=${encodeURIComponent(primary.id)}`}
              className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              data-decision-cta="open-decision"
            >
              Открыть решение
            </Link>
            {issueRow ? (
              <Link
                href={entityDetailHref('issue', issueRow.id)}
                className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                data-decision-cta="open-issue"
              >
                Открыть проблему
              </Link>
            ) : null}
          </>
        ) : null}
      </div>
    </ModuleSurface>
  );
}
