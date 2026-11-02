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
import type { EquipmentRegister } from '@/lib/api-client';
import { fetchEquipmentRegister } from '@/lib/api-client';
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
import { presentWorkstream } from '@/lib/ui-labels';

function isAttention(item: EquipmentRegister['items'][number]): boolean {
  return item.status === 'Delayed';
}

function sortEquipment(
  items: EquipmentRegister['items'],
): EquipmentRegister['items'] {
  return [...items].sort((a, b) => {
    const sev = Number(isAttention(b)) - Number(isAttention(a));
    if (sev !== 0) return sev;
    const crit = Number(b.critical) - Number(a.critical);
    if (crit !== 0) return crit;
    return a.name.localeCompare(b.name, 'ru');
  });
}

export default function EquipmentPage() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(fetchEquipmentRegister);
  const [filters, setFilters] = useState<RegisterFilterState>(
    DEFAULT_REGISTER_FILTERS,
  );

  const reset = () => setFilters(DEFAULT_REGISTER_FILTERS);

  const filtered = useMemo(() => {
    if (!data) return [];
    return sortEquipment(
      data.items.filter((item) => {
        if (filters.attention === 'attention' && !isAttention(item)) {
          return false;
        }
        if (filters.attention === 'normal' && isAttention(item)) {
          return false;
        }
        if (!matchesWorkstream(filters.workstream, item.workstream)) {
          return false;
        }
        return matchesSearch(filters.query, [item.name, item.id]);
      }),
    );
  }, [data, filters]);

  const counters = useMemo(() => {
    if (!data) return [];
    const delayed = data.items.filter((i) => i.status === 'Delayed').length;
    const critical = data.items.filter((i) => i.critical).length;
    return [
      { label: 'Задержка', value: delayed },
      { label: 'Критичное', value: critical },
    ];
  }, [data]);

  return (
    <RegisterShell
      title="Оборудование"
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
              caption="Реестр оборудования"
              columns={[
                'Объект',
                'Направление',
                'Статус',
                'Базовая дата',
                'Прогноз',
                'Отклонение',
                'Критичность',
                'Связи',
              ]}
            >
              {filtered.map((item) => (
                <RegisterRow key={item.id} emphasis={item.critical}>
                  <RegisterEntityCell
                    href={entityDetailHref('equipment', item.id)}
                    title={item.name}
                    id={item.id}
                  />
                  <RegisterCell className="whitespace-nowrap text-[var(--text-secondary)]">
                    {presentWorkstream(item.workstream)}
                  </RegisterCell>
                  <RegisterCell>
                    <StatusPill family="equipment" value={item.status} />
                  </RegisterCell>
                  <RegisterCell className="whitespace-nowrap tabular-nums">
                    {formatDateRu(item.baselineDelivery)}
                  </RegisterCell>
                  <RegisterCell className="whitespace-nowrap tabular-nums">
                    {formatDateRu(item.forecastDelivery)}
                  </RegisterCell>
                  <RegisterCell className="whitespace-nowrap tabular-nums text-[var(--text)]">
                    {formatDeltaDays(item.deliveryVariance.deltaDays)}
                  </RegisterCell>
                  <RegisterCell>
                    {item.critical ? (
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        Критичное
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
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
              ))}
            </RegisterTable>
          )}
        </>
      ) : null}
    </RegisterShell>
  );
}
