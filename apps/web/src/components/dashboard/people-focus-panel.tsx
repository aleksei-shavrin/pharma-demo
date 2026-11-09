'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  CircleCheck,
  TriangleAlert,
  CircleAlert,
  TrendingUp,
} from 'lucide-react';
import type { DashboardOverview } from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { entityDetailHref } from '@/lib/entity-routes';
import { presentRoleTitleRu } from '@/lib/people/present-role-title';
import { programLabelForWorkstream } from '@/lib/registers/program-filter';
import {
  DASHBOARD_PAIR_LIST_SCROLL_CLASS,
  DASHBOARD_PAIR_SURFACE_CLASS,
} from '@/lib/dashboard/dashboard-layout';
import { snapshotAsOfRu } from '@/lib/snapshot/snapshot-meta';
import { snapshotDisplayLabel } from '@/lib/snapshot/snapshot-id';
import { presentIssueTitle } from '@/lib/ui-labels';
import { MetricAbbrTip } from './metric-abbr-tip';
import { ModuleSurface } from './module-surface';

const CRITICAL_DEDUP_TIP =
  'Уникальные вопросы; один может затрагивать нескольких ответственных';

type PersonRow = DashboardOverview['peopleFocus']['people'][number];
type EntityLink = PersonRow['reasons'][number]['links'][number];

export type PeopleFocusCardState = 'quiet' | 'attention' | 'active';

/** Pure UI state — does not invent critical=0∧new>0 (impossible). */
export function resolvePeopleFocusCardState(panel: {
  totalPeopleInFocus: number;
  summary: { criticalQuestionCount: number };
}): PeopleFocusCardState {
  if (panel.totalPeopleInFocus === 0) return 'quiet';
  if (panel.summary.criticalQuestionCount > 0) return 'attention';
  return 'active';
}

/** Trim redundant «критичн…» when row badge already states critical. */
export function presentReasonText(
  text: string,
  hasCriticalBadge: boolean,
): string {
  if (!hasCriticalBadge) return text;
  if (text === 'Новый критичный вопрос по поставке') {
    return 'Новый вопрос по поставке';
  }
  if (text === 'Новая задержка критичной поставки') {
    return 'Новая задержка поставки';
  }
  if (text === 'Критичный вопрос по поставке') {
    return 'По поставке';
  }
  return text;
}

function StatePill({
  state,
  hasNew,
}: {
  state: PeopleFocusCardState;
  hasNew: boolean;
}) {
  if (state === 'quiet') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--status-ok-border)] bg-[var(--status-ok-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--status-ok-fg)]"
        data-people-focus-state="quiet"
      >
        <CircleCheck className="size-3 shrink-0" aria-hidden />
        Без активных вопросов
      </span>
    );
  }
  if (state === 'attention') {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--status-danger-fg)]"
          data-people-focus-state="attention"
        >
          <TriangleAlert className="size-3 shrink-0" aria-hidden />
          Требует внимания
        </span>
        {hasNew ? (
          <span
            className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--status-warn-fg)]"
            data-people-focus-state="new"
          >
            <TrendingUp className="size-3 shrink-0" aria-hidden />
            Новые критичные
          </span>
        ) : null}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--status-warn-fg)]"
      data-people-focus-state="active"
    >
      <CircleAlert className="size-3 shrink-0" aria-hidden />
      Активные вопросы
    </span>
  );
}

function SummaryStat({
  label,
  value,
  muted,
  hint,
  tone,
  children,
}: {
  label: string;
  value: string;
  muted?: boolean;
  hint?: string;
  tone?: 'neutral' | 'danger' | 'warn';
  children?: ReactNode;
}) {
  const cell =
    tone === 'danger'
      ? 'rounded-[var(--radius-sm)] border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-1.5 py-1'
      : tone === 'warn'
        ? 'rounded-[var(--radius-sm)] border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-1.5 py-1'
        : 'rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-1.5 py-1';
  const valueTone =
    tone === 'danger'
      ? 'text-[var(--status-danger-fg)]'
      : tone === 'warn'
        ? 'text-[var(--status-warn-fg)]'
        : muted
          ? 'text-[var(--text-muted)]'
          : 'text-[var(--text)]';

  return (
    <div
      className={`min-w-0 ${cell}`}
      data-people-focus-stat={label}
      data-people-focus-stat-tone={tone ?? 'neutral'}
    >
      <p
        className={`font-semibold tabular-nums leading-none ${
          tone === 'danger' ? 'text-xl' : 'text-base'
        } ${valueTone}`}
      >
        {children ?? value}
      </p>
      <p className="mt-0.5 text-[10px] leading-snug text-[var(--text-secondary)]">
        {label}
        {hint ? (
          <span className="mt-0.5 block text-[10px] text-[var(--text-muted)]">
            {hint}
          </span>
        ) : null}
      </p>
    </div>
  );
}

function entityLinkLabel(
  link: EntityLink,
  data: DashboardOverview,
): { text: string; title: string } {
  if (link.type === 'issue') {
    const issue = data.issues.find((i) => i.id === link.id);
    const name = presentIssueTitle(link.id, issue?.title ?? link.id);
    const short =
      name.length > 28 && name !== link.id ? `${name.slice(0, 26)}…` : name;
    return {
      text: short === link.id ? link.id : short,
      title: `${link.id} · ${name}`,
    };
  }
  const eq = data.equipment.find((e) => e.id === link.id);
  const name = eq?.name ?? link.id;
  const short =
    name.length > 28 && name !== link.id ? `${name.slice(0, 26)}…` : name;
  return {
    text: short === link.id ? link.id : short,
    title: `${link.id} · ${name}`,
  };
}

function ReasonLinks({
  row,
  data,
}: {
  row: PersonRow;
  data: DashboardOverview;
}) {
  if (row.reasons.length === 0) return null;
  const hasCriticalBadge = row.criticalIncidentCount > 0;
  return (
    <ul className="mt-1 space-y-1">
      {row.reasons.map((reason) => (
        <li
          key={`${row.personId}-${reason.text}-${reason.links.map((l) => l.id).join(',')}`}
          className="text-xs leading-snug text-[var(--text-secondary)]"
        >
          <span>{presentReasonText(reason.text, hasCriticalBadge)}</span>
          {reason.links.length > 0 ? (
            <span className="ml-1 inline-flex flex-wrap gap-x-1.5">
              {reason.links.map((link) => {
                const label = entityLinkLabel(link, data);
                return (
                  <Link
                    key={`${link.type}-${link.id}`}
                    href={entityDetailHref(link.type, link.id)}
                    title={label.title}
                    aria-label={label.title}
                    className="font-medium text-[var(--text)] underline-offset-2 hover:text-[var(--link)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    {label.text}
                  </Link>
                );
              })}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function PersonFocusRow({
  row,
  data,
}: {
  row: PersonRow;
  data: DashboardOverview;
}) {
  const role = presentRoleTitleRu(row.roleTitleRu);
  const program = programLabelForWorkstream(row.primaryWorkstreamId);
  const meta = [role, program !== '—' ? program : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <li
      className="border-b border-[var(--border-subtle)] py-2 first:pt-1 last:border-b-0 last:pb-0"
      data-people-focus-person={row.personId}
      data-people-focus-critical={row.criticalIncidentCount}
      data-people-focus-new={row.hasNewCritical ? '1' : '0'}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={entityDetailHref('person', row.personId)}
            className="block truncate text-sm font-semibold leading-snug text-[var(--text)] underline-offset-2 hover:text-[var(--link)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            title={row.fullNameRu}
          >
            {row.fullNameRu}
          </Link>
          {meta ? (
            <p
              className="mt-0.5 truncate text-xs text-[var(--text-muted)]"
              title={meta}
            >
              {meta}
            </p>
          ) : null}
          <ReasonLinks row={row} data={data} />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {row.criticalIncidentCount > 0 ? (
            <span
              className="rounded-[var(--radius-sm)] border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--status-danger-fg)]"
              data-people-focus-metric="critical"
            >
              {row.criticalIncidentCount} критичных
            </span>
          ) : null}
          {row.hasNewCritical ? (
            <span
              className="rounded-[var(--radius-sm)] border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--status-warn-fg)]"
              data-people-focus-metric="new"
            >
              Новый сигнал
            </span>
          ) : null}
          {row.otherActiveIssueCount > 0 ? (
            <span
              className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-[var(--text-secondary)]"
              data-people-focus-metric="issues"
            >
              {row.otherActiveIssueCount} прочих
            </span>
          ) : null}
          {row.criticalSignalsRemoved > 0 ? (
            <span
              className="text-[10px] font-medium text-[var(--status-ok-fg)]"
              data-people-focus-metric="removed"
            >
              Снято: {row.criticalSignalsRemoved}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function previousCompareHint(prevId: SnapshotId | null): string | null {
  if (!prevId) return null;
  return `к снимку ${snapshotDisplayLabel(prevId)} · ${snapshotAsOfRu(prevId)}`;
}

/**
 * Director people-focus card — open critical delivery questions by owner.
 * Visual hierarchy only; sort/eligibility come from API. All people in DOM.
 */
export function PeopleFocusPanel({ data }: { data: DashboardOverview }) {
  const panel = data.peopleFocus;
  const total = panel.totalPeopleInFocus;
  const quiet = total === 0;
  const newCount = panel.summary.newCriticalQuestionCount;
  const removedCount = panel.summary.removedCriticalSignalCount;
  const firstSnapshot = panel.previousSnapshotId == null;
  const compareHint = previousCompareHint(panel.previousSnapshotId);
  const showRemoved =
    removedCount != null && removedCount > 0 && !firstSnapshot;
  const cardState = resolvePeopleFocusCardState(panel);
  const hasNew = !firstSnapshot && (newCount ?? 0) > 0;
  const criticalCount = panel.summary.criticalQuestionCount;
  const criticalTone = criticalCount > 0 ? 'danger' : 'neutral';
  const newTone = hasNew ? 'warn' : 'neutral';
  const unassigned = panel.unassignedDelayedCriticalEquipmentIds;

  return (
    <ModuleSurface
      data-dashboard-block="people-focus"
      className={`${DASHBOARD_PAIR_SURFACE_CLASS} max-h-[32rem]`}
    >
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-2">
        <h2
          id="people-focus-heading"
          className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
        >
          Участники: управленческий фокус
        </h2>
        <StatePill state={cardState} hasNew={hasNew} />
      </div>
      <p className="mt-1 shrink-0 text-[11px] leading-snug text-[var(--text-secondary)]">
        Вверху — ответственные с критичными и новыми вопросами.
      </p>

      {quiet ? (
        <>
          <p
            className="mt-2 text-sm leading-snug text-[var(--text-secondary)]"
            data-people-focus="quiet"
          >
            {firstSnapshot
              ? 'Первый снимок: нет активных вопросов по ответственным.'
              : 'Нет активных вопросов по ответственным.'}
          </p>
          {showRemoved ? (
            <p
              className="mt-1.5 inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--status-ok-border)] bg-[var(--status-ok-bg)] px-2 py-1 text-[11px] text-[var(--status-ok-fg)]"
              data-people-focus="removed"
            >
              <CircleCheck className="size-3 shrink-0" aria-hidden />
              Снято критичных сигналов: {removedCount}
              {compareHint ? (
                <span className="text-[var(--text-muted)]">
                  ({compareHint})
                </span>
              ) : null}
            </p>
          ) : null}
          <p
            className="mt-1 text-[11px] text-[var(--text-muted)]"
            data-people-focus="people-zero"
          >
            Ответственных с вопросами: 0
          </p>
        </>
      ) : (
        <>
          <div
            className="mt-2 grid shrink-0 grid-cols-3 gap-1.5 border-b border-[var(--border-subtle)] pb-2"
            data-people-focus="summary"
            data-people-focus-summary-order="critical-new-people"
          >
            <SummaryStat
              label="Критичных вопросов"
              value={String(criticalCount)}
              tone={criticalTone}
            >
              <MetricAbbrTip
                abbr={String(criticalCount)}
                tip={CRITICAL_DEDUP_TIP}
              >
                <span
                  className={`font-semibold tabular-nums ${
                    criticalTone === 'danger'
                      ? 'text-xl text-[var(--status-danger-fg)]'
                      : 'text-base text-[var(--text)]'
                  }`}
                >
                  {criticalCount}
                </span>
              </MetricAbbrTip>
            </SummaryStat>
            <SummaryStat
              label="Новых критичных"
              value={firstSnapshot ? '—' : String(newCount ?? 0)}
              muted={firstSnapshot || !hasNew}
              hint={compareHint ?? undefined}
              tone={newTone}
            />
            <SummaryStat
              label="Ответственных с вопросами"
              value={String(panel.summary.peopleWithQuestions)}
              tone="neutral"
            />
          </div>
          {showRemoved ? (
            <p
              className="mt-1.5 inline-flex shrink-0 items-center gap-1 text-[11px] text-[var(--status-ok-fg)]"
              data-people-focus="removed"
            >
              <CircleCheck className="size-3 shrink-0" aria-hidden />
              Снято критичных сигналов: {removedCount}
            </p>
          ) : null}
          {panel.summary.otherActiveIssueCount > 0 ? (
            <p
              className="mt-1 shrink-0 text-[11px] text-[var(--text-muted)]"
              data-people-focus="other-active"
            >
              Прочие активные вопросы:{' '}
              {panel.summary.otherActiveIssueCount}
            </p>
          ) : null}

          <ol
            className={DASHBOARD_PAIR_LIST_SCROLL_CLASS}
            data-people-focus="list"
          >
            {panel.people.map((row) => (
              <PersonFocusRow key={row.personId} row={row} data={data} />
            ))}
          </ol>

          <div className="mt-2 flex shrink-0 flex-wrap items-center justify-between gap-2 text-[11px]">
            <p className="text-[var(--text-muted)]" data-people-focus="shown">
              Показано {panel.people.length} из {total}
            </p>
            <Link
              href="/people"
              className="font-medium text-[var(--text)] underline-offset-2 hover:text-[var(--link)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              data-people-focus="all-people"
            >
              Все участники
            </Link>
          </div>
        </>
      )}

      {unassigned.length > 0 ? (
        <div
          className="mt-2 shrink-0 rounded-[var(--radius-sm)] border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-2.5 py-2"
          data-people-focus="unassigned-eq"
        >
          <p className="text-[11px] font-semibold text-[var(--status-warn-fg)]">
            Не указан ответственный: {unassigned.length} критичных поставок
          </p>
          <p className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px]">
            {unassigned.slice(0, 4).map((id) => {
              const eq = data.equipment.find((e) => e.id === id);
              const title = eq ? `${id} · ${eq.name}` : id;
              return (
                <Link
                  key={id}
                  href={entityDetailHref('equipment', id)}
                  title={title}
                  aria-label={title}
                  className="font-medium text-[var(--status-warn-fg)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {id}
                </Link>
              );
            })}
          </p>
        </div>
      ) : null}

      {quiet ? (
        <p className="mt-2 shrink-0 text-[11px]">
          <Link
            href="/people"
            className="font-medium text-[var(--text)] underline-offset-2 hover:text-[var(--link)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            data-people-focus="all-people"
          >
            Все участники
          </Link>
        </p>
      ) : null}
    </ModuleSurface>
  );
}
