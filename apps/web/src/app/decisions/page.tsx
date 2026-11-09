'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  RegisterCell,
  RegisterEmpty,
  RegisterEntityCell,
  RegisterError,
  RegisterFilteredEmpty,
  RegisterLoading,
  RegisterRow,
  RegisterShell,
  RegisterTable,
} from '@/components/registers/register-table';
import {
  RegisterSummary,
  RegisterToolbar,
} from '@/components/registers/register-toolbar';
import { StatusPill } from '@/components/dashboard/status-pill';
import type { DecisionsRegister } from '@/lib/api-client';
import { fetchDecisionsRegister } from '@/lib/api-client';
import {
  decisionDueBadgeKind,
  decisionDueBadgeLabel,
  decisionDueFilterLabel,
  type DecisionDueState,
} from '@/lib/decisions/decision-due-labels';
import { decisionExecutionLabel } from '@/lib/decisions/decision-execution-labels';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu } from '@/lib/format/ru';
import { PROGRAM_FILTER_OPTIONS } from '@/lib/registers/program-filter';
import {
  DEFAULT_REGISTER_FILTERS,
  filtersActive,
  filtersFromSearchParams,
  mergeRegisterSearchParams,
  matchesSearch,
  type RegisterFilterState,
} from '@/lib/registers/register-filters';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import {
  presentDecisionNote,
  presentDecisionType,
  presentDecisionTypeCompact,
  presentMilestoneName,
} from '@/lib/ui-labels';

type Item = DecisionsRegister['items'][number];
type DueFilter = 'all' | DecisionDueState;

function sortDecisions(items: Item[]): Item[] {
  return [...items].sort((a, b) => a.id.localeCompare(b.id, 'ru'));
}

function programName(id: string | null): string | null {
  if (!id) return null;
  return PROGRAM_FILTER_OPTIONS.find((p) => p.id === id)?.label ?? id;
}

function dueFromSearch(sp: URLSearchParams): DueFilter {
  const v = sp.get('due');
  if (v === 'passed' || v === 'upcoming' || v === 'none') return v;
  return 'all';
}

function DecisionsPage() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(
    fetchDecisionsRegister,
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<RegisterFilterState>(() =>
    filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
  );
  const [dueFilter, setDueFilter] = useState<DueFilter>(() =>
    dueFromSearch(new URLSearchParams(searchParams.toString())),
  );

  const searchKey = searchParams.toString();
  useEffect(() => {
    const sp = new URLSearchParams(searchKey);
    setFilters(filtersFromSearchParams(sp));
    setDueFilter(dueFromSearch(sp));
  }, [searchKey]);

  const applyFilters = (next: RegisterFilterState, due: DueFilter = dueFilter) => {
    setFilters(next);
    setDueFilter(due);
    const merged = mergeRegisterSearchParams(
      new URLSearchParams(searchParams.toString()),
      next,
      { retainKeys: ['program'] },
    );
    if (due === 'all') merged.delete('due');
    else merged.set('due', due);
    const q = merged.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const reset = () => applyFilters(DEFAULT_REGISTER_FILTERS, 'all');

  const filtered = useMemo(() => {
    if (!data) return [];
    return sortDecisions(
      data.items.filter((item) => {
        if (dueFilter !== 'all' && item.dueState !== dueFilter) return false;
        return matchesSearch(filters.query, [
          item.id,
          presentDecisionType(item.type),
          presentDecisionNote(item.id, item.note),
          item.ownerFullNameRu,
          item.milestoneId ?? '',
          item.programId ?? '',
          item.analystProjectId ?? '',
          item.projectId,
        ]);
      }),
    );
  }, [data, filters.query, dueFilter]);

  const passedCount = data
    ? data.items.filter((i) => i.dueState === 'passed').length
    : 0;

  return (
    <RegisterShell
      title="Решения"
      asOf={data ? formatDateRu(data.scenarioAsOfDate) : null}
      snapshot={active}
    >
      {status === 'loading' ? <RegisterLoading /> : null}
      {status === 'error' ? (
        <RegisterError message={error ?? ''} onRetry={retry} />
      ) : null}
      {status === 'idle' && data && data.items.length === 0 ? (
        <RegisterEmpty />
      ) : null}
      {status === 'idle' && data && data.items.length > 0 ? (
        <>
          <RegisterSummary
            total={data.items.length}
            visible={filtered.length}
            counters={[
              { label: 'Записано', value: data.items.length },
              { label: 'Срок прошёл', value: passedCount },
            ]}
          />
          <p
            className="mb-1 text-xs text-[var(--text-muted)]"
            data-decisions-honesty="true"
          >
            Исполнение и состояние срока — разные измерения. Прошедший срок не
            подтверждает неисполнение. Запись решения сама не устраняет
            отклонение прогноза.
          </p>
          <div className="mb-2 flex flex-wrap items-end gap-2">
            <RegisterToolbar
              filters={filters}
              onChange={(next) => applyFilters(next)}
              onReset={reset}
              showWorkstream={false}
              showAttention={false}
              showReset={false}
              searchPlaceholder="Поиск решений"
            />
            <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
              Срок
              <select
                className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)]"
                value={dueFilter}
                aria-label="Фильтр срока решения"
                data-decisions-due-filter="true"
                onChange={(e) =>
                  applyFilters(filters, e.target.value as DueFilter)
                }
              >
                {(['all', 'passed', 'upcoming', 'none'] as const).map((v) => (
                  <option key={v} value={v}>
                    {decisionDueFilterLabel(v)}
                  </option>
                ))}
              </select>
            </label>
            {(filtersActive(filters) || dueFilter !== 'all') && (
              <button
                type="button"
                className="mb-0.5 text-sm text-[var(--link)] underline"
                onClick={reset}
              >
                Сбросить
              </button>
            )}
          </div>
          {filtered.length === 0 &&
          (filtersActive(filters) || dueFilter !== 'all') ? (
            <RegisterFilteredEmpty onReset={reset} />
          ) : (
            <RegisterTable
              caption="Реестр решений"
              layoutHint="decisions-desktop-fit"
              /* ≥lg: fit main column; &lt;lg (incl. 768): inner h-scroll only. */
              tableClassName="w-full table-fixed max-lg:min-w-[64rem] max-lg:table-auto"
              columnClassNames={[
                'w-[5.5rem]',
                'w-[10.5rem]',
                'w-auto',
                'w-[9rem]',
                'w-[7.5rem]',
                'w-[9rem]',
                'w-[9.5rem]',
                'w-[9.5rem]',
              ]}
              columns={[
                'ID',
                'Тип',
                'Суть',
                {
                  label: 'Статус',
                  title:
                    'Исполнение (демо-наблюдение) и состояние срока — отдельно; Срок = только дата',
                },
                'Срок',
                'Владелец',
                'Веха',
                'Контекст',
              ]}
            >
              {filtered.map((item) => {
                const dueKind = decisionDueBadgeKind(
                  item.dueState,
                  item.dueDate,
                  data.scenarioAsOfDate,
                );
                const execStatus = item.executionStatus ?? 'unknown';
                const execLabel = decisionExecutionLabel(execStatus);
                const dueLabel = decisionDueBadgeLabel(dueKind);
                const prog = programName(item.programId);
                return (
                  <RegisterRow key={item.id}>
                    <RegisterCell className="whitespace-nowrap font-mono text-xs tabular-nums">
                      {item.id}
                    </RegisterCell>
                    <RegisterCell className="min-w-0 whitespace-normal break-normal">
                      <span
                        className="block max-w-full"
                        title={presentDecisionType(item.type)}
                        aria-label={presentDecisionType(item.type)}
                      >
                        {presentDecisionTypeCompact(item.type)}
                      </span>
                    </RegisterCell>
                    <RegisterCell className="whitespace-normal break-words">
                      {presentDecisionNote(item.id, item.note)}
                    </RegisterCell>
                    <RegisterCell
                      className="align-top"
                      data-decision-status-cell="true"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div
                          className="flex min-w-0 flex-wrap items-center gap-1"
                          data-decision-execution-state={execStatus}
                        >
                          <span className="text-[10px] text-[var(--text-muted)]">
                            Исполнение:
                          </span>
                          <StatusPill
                            family="decisionExecution"
                            value={execStatus}
                            label={execLabel}
                          />
                        </div>
                        <div
                          className="flex min-w-0 flex-wrap items-center gap-1"
                          data-decision-due-state={item.dueState}
                          title="Состояние срока"
                          aria-label={`Состояние срока: ${dueLabel}`}
                        >
                          <span className="text-[10px] text-[var(--text-muted)]">
                            Срок:
                          </span>
                          <StatusPill
                            family="decisionDue"
                            value={dueKind}
                            label={dueLabel}
                          />
                        </div>
                      </div>
                    </RegisterCell>
                    <RegisterCell className="align-top whitespace-nowrap tabular-nums">
                      {item.dueDate ? formatDateRu(item.dueDate) : '—'}
                    </RegisterCell>
                    <RegisterCell className="whitespace-normal break-words">
                      <Link
                        href={entityDetailHref('person', item.ownerPersonId)}
                        className="text-[var(--link)] underline-offset-2 hover:underline"
                      >
                        {item.ownerFullNameRu}
                      </Link>
                    </RegisterCell>
                    {item.milestoneId ? (
                      <RegisterEntityCell
                        href={entityDetailHref('milestone', item.milestoneId)}
                        title={presentMilestoneName(
                          item.milestoneId,
                          item.milestoneName ?? item.milestoneId,
                        )}
                        id={item.milestoneId}
                        className="min-w-0 whitespace-normal break-words align-top"
                      />
                    ) : (
                      <RegisterCell>
                        <span className="text-[var(--text-muted)]">
                          не привязана
                        </span>
                      </RegisterCell>
                    )}
                    <RegisterCell className="min-w-0 text-xs whitespace-normal break-words align-top">
                      <div className="flex flex-col gap-0.5">
                        {prog && item.programId ? (
                          <Link
                            href={`/programs/${encodeURIComponent(item.programId)}`}
                            className="text-[var(--link)] underline-offset-2 hover:underline"
                            data-decision-context="program"
                          >
                            {prog}
                          </Link>
                        ) : null}
                        {item.analystProjectId ? (
                          <Link
                            href={`/projects/${encodeURIComponent(item.analystProjectId)}`}
                            className="text-[var(--link)] underline-offset-2 hover:underline"
                            data-decision-context="project"
                          >
                            {item.analystProjectName ? (
                              <>
                                <span className="font-medium break-words">
                                  {item.analystProjectName}
                                </span>
                                <span className="mt-0.5 block font-mono text-[10px] text-[var(--text-muted)]">
                                  {item.analystProjectId}
                                </span>
                              </>
                            ) : (
                              <span className="font-mono">
                                {item.analystProjectId}
                              </span>
                            )}
                          </Link>
                        ) : null}
                        <Link
                          href="/"
                          className="text-[var(--text-muted)] underline-offset-2 hover:underline"
                          data-decision-context="portfolio"
                        >
                          Портфель ({item.projectId})
                        </Link>
                      </div>
                    </RegisterCell>
                  </RegisterRow>
                );
              })}
            </RegisterTable>
          )}
        </>
      ) : null}
    </RegisterShell>
  );
}

export default function DecisionsPageRoute() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <DecisionsPage />
    </Suspense>
  );
}
