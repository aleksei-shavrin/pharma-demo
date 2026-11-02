'use client';

import { useMemo, useState } from 'react';
import { StatusPill } from '@/components/dashboard/status-pill';
import {
  RegisterCell,
  RegisterEmpty,
  RegisterEntityCell,
  RegisterError,
  RegisterFilteredEmpty,
  RegisterLoading,
  RegisterMutedIds,
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
  matchesSearch,
  matchesWorkstream,
  type RegisterFilterState,
} from '@/lib/registers/register-filters';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { presentMilestoneName, presentWorkstream } from '@/lib/ui-labels';

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

export default function MilestonesPage() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(
    fetchMilestonesRegister,
  );
  const [filters, setFilters] = useState<RegisterFilterState>(
    DEFAULT_REGISTER_FILTERS,
  );

  const reset = () => setFilters(DEFAULT_REGISTER_FILTERS);

  const filtered = useMemo(() => {
    if (!data) return [];
    return sortMilestones(
      data.items.filter((item) => {
        if (filters.attention === 'attention' && !isAttention(item)) {
          return false;
        }
        if (filters.attention === 'normal' && isAttention(item)) {
          return false;
        }
        // MS-PS has null workstream — only match when filter is all,
        // or when searching (workstream filter excludes null unless all).
        if (!matchesWorkstream(filters.workstream, item.workstream)) {
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
      { label: 'Красные', value: red },
      { label: 'Зелёные', value: data.items.length - red },
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
            onChange={setFilters}
            onReset={reset}
          />
          {filtered.length === 0 && filtersActive(filters) ? (
            <RegisterFilteredEmpty onReset={reset} />
          ) : (
            <RegisterTable
              caption="Реестр вех"
              columns={[
                'Веха',
                'Направление',
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
                        ? presentWorkstream(item.workstream)
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
                      <RegisterMutedIds
                        ids={[
                          ...item.relatedActiveIssueIds,
                          ...item.relatedRedRiskIds,
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
