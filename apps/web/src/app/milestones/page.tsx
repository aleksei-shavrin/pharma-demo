'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { StatusPill } from '@/components/dashboard/status-pill';
import {
  RegisterCell,
  RegisterEmpty,
  RegisterEntityCell,
  RegisterError,
  RegisterFilteredEmpty,
  RegisterLoading,
  RegisterIdLinks,
  RegisterRow,
  RegisterShell,
  RegisterTable,
} from '@/components/registers/register-table';
import {
  RegisterSummary,
  RegisterToolbar,
} from '@/components/registers/register-toolbar';
import type { MilestonesRegister } from '@/lib/api-client';
import { fetchMilestonesRegister } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  DEFAULT_REGISTER_FILTERS,
  filtersActive,
  filtersFromSearchParams,
  matchesSearch,
  matchesProgram,
  searchParamsFromFilters,
  type RegisterFilterState,
} from '@/lib/registers/register-filters';
import { programLabelForWorkstream } from '@/lib/registers/program-filter';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { presentMilestoneName } from '@/lib/ui-labels';

type Item = MilestonesRegister['items'][number];

function isAttention(item: Item): boolean {
  return item.rag === 'Red';
}

function sortMilestones(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    const sev = Number(isAttention(b)) - Number(isAttention(a));
    if (sev !== 0) return sev;
    // Keep MS-PS findable near top when severity ties (presentation only).
    if (a.id === 'MS-PS') return -1;
    if (b.id === 'MS-PS') return 1;
    return presentMilestoneName(a.id, a.name).localeCompare(
      presentMilestoneName(b.id, b.name),
      'ru',
    );
  });
}

function MilestonesPage() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(
    fetchMilestonesRegister,
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<RegisterFilterState>(() =>
    filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
  );

  const searchKey = searchParams.toString();
  useEffect(() => {
    setFilters(filtersFromSearchParams(new URLSearchParams(searchKey)));
  }, [searchKey]);

  const applyFilters = (next: RegisterFilterState) => {
    setFilters(next);
    const q = searchParamsFromFilters(next).toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const reset = () => applyFilters(DEFAULT_REGISTER_FILTERS);

  const filtered = useMemo(() => {
    if (!data) return [];
    return sortMilestones(
      data.items.filter((item) => {
        if (filters.rag !== 'all' && item.rag !== filters.rag) return false;
        if (filters.attention === 'attention' && !isAttention(item)) {
          return false;
        }
        if (filters.attention === 'normal' && isAttention(item)) {
          return false;
        }
        // MS-PS has null workstream — only match when filter is all.
        if (!matchesProgram(filters.program, item.workstream)) {
          return false;
        }
        return matchesSearch(filters.query, [
          presentMilestoneName(item.id, item.name),
          item.id,
        ]);
      }),
    );
  }, [data, filters]);

  const counters = useMemo(() => {
    if (!data) return [];
    const red = data.items.filter((i) => i.rag === 'Red').length;
    return [
      { label: 'Критичные', value: red },
      { label: 'В норме', value: data.items.length - red },
    ];
  }, [data]);

  return (
    <RegisterShell
      title="Вехи"
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
            counters={counters}
          />
          <RegisterToolbar
            filters={filters}
            onChange={applyFilters}
            onReset={reset}
          />
          {filtered.length === 0 && filtersActive(filters) ? (
            <RegisterFilteredEmpty onReset={reset} />
          ) : (
            <RegisterTable
              caption="Реестр вех"
              columns={[
                'Веха',
                'Программа',
                'Статус',
                'Базовая дата',
                'Прогноз',
                'Отклонение',
                'Связи',
              ]}
            >
              {filtered.map((item) => {
                const title = presentMilestoneName(item.id, item.name);
                return (
                  <RegisterRow
                    key={item.id}
                    emphasis={item.id === 'MS-PS' || item.rag === 'Red'}
                  >
                    <RegisterEntityCell
                      href={entityDetailHref('milestone', item.id)}
                      title={title}
                      id={item.id}
                    />
                    <RegisterCell className="whitespace-nowrap">
                      {item.workstream
                        ? programLabelForWorkstream(item.workstream)
                        : 'Проект'}
                    </RegisterCell>
                    <RegisterCell>
                      <StatusPill
                        family="rag"
                        value={item.rag}
                        entity="milestone"
                      />
                    </RegisterCell>
                    <RegisterCell className="whitespace-nowrap tabular-nums">
                      {formatDateRu(item.baselineDate)}
                    </RegisterCell>
                    <RegisterCell className="whitespace-nowrap tabular-nums">
                      {formatDateRu(item.forecastDate)}
                    </RegisterCell>
                    <RegisterCell className="whitespace-nowrap tabular-nums text-[var(--text)]">
                      {formatDeltaDays(item.dateVariance.deltaDays)}
                    </RegisterCell>
                    <RegisterCell>
                      <RegisterIdLinks
                        refs={[
                          ...item.relatedActiveIssueIds.map((id) => ({
                            type: 'issue' as const,
                            id,
                          })),
                          ...item.relatedRedRiskIds.map((id) => ({
                            type: 'risk' as const,
                            id,
                          })),
                        ]}
                      />
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

export default function MilestonesPageRoute() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <MilestonesPage />
    </Suspense>
  );
}
