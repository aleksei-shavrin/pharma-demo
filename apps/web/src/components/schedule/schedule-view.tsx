'use client';

import { useMemo, useState } from 'react';
import {
  RegisterEmpty,
  RegisterError,
  RegisterFilteredEmpty,
  RegisterLoading,
  RegisterShell,
} from '@/components/registers/register-table';
import {
  RegisterSummary,
  RegisterToolbar,
} from '@/components/registers/register-toolbar';
import type { ScheduleItem } from '@/lib/api-client';
import { fetchSchedule } from '@/lib/api-client';
import { formatDateRu } from '@/lib/format/ru';
import {
  DEFAULT_REGISTER_FILTERS,
  filtersActive,
  matchesSearch,
  matchesWorkstream,
  type RegisterFilterState,
} from '@/lib/registers/register-filters';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import {
  isScheduleAttention,
  sortScheduleItems,
} from '@/lib/schedule/schedule-geometry';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { presentMilestoneName } from '@/lib/ui-labels';
import { ScheduleBoard } from './schedule-board';
import {
  SCHEDULE_VIEW_DEFAULT,
  type ScheduleViewMode,
} from './schedule-view-mode';
import { ScheduleViewToggle } from './schedule-view-toggle';

type KindFilter = 'all' | 'equipment' | 'milestone';

function displayTitle(item: ScheduleItem): string {
  if (item.kind === 'milestone') {
    return presentMilestoneName(item.id, item.name);
  }
  return item.name;
}

export function ScheduleView() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(fetchSchedule);
  const [mode, setMode] = useState<ScheduleViewMode>(SCHEDULE_VIEW_DEFAULT);
  const [filters, setFilters] = useState<RegisterFilterState>(
    DEFAULT_REGISTER_FILTERS,
  );
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');

  const resetAll = () => {
    setFilters(DEFAULT_REGISTER_FILTERS);
    setKindFilter('all');
  };

  const rows = useMemo(() => {
    if (!data) return [];
    return sortScheduleItems(
      data.items.filter((item) => {
        if (kindFilter === 'equipment' && item.kind !== 'equipment_delivery') {
          return false;
        }
        if (kindFilter === 'milestone' && item.kind !== 'milestone') {
          return false;
        }
        if (filters.attention === 'attention' && !isScheduleAttention(item)) {
          return false;
        }
        if (filters.attention === 'normal' && isScheduleAttention(item)) {
          return false;
        }
        if (!matchesWorkstream(filters.workstream, item.workstream)) {
          return false;
        }
        return matchesSearch(filters.query, [displayTitle(item), item.id]);
      }),
    );
  }, [data, filters, kindFilter]);

  const counters = useMemo(() => {
    if (!data) return [];
    const eq = data.items.filter((i) => i.kind === 'equipment_delivery').length;
    const ms = data.items.filter((i) => i.kind === 'milestone').length;
    const attn = data.items.filter(isScheduleAttention).length;
    return [
      { label: 'Оборудование', value: eq },
      { label: 'Вехи', value: ms },
      { label: 'Внимание', value: attn },
    ];
  }, [data]);

  const anyFilter =
    filtersActive({ ...filters, type: 'all' }) || kindFilter !== 'all';

  return (
    <RegisterShell
      title="График"
      asOf={data ? formatDateRu(data.scenarioAsOfDate) : null}
      snapshot={active}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Контрольные точки поставки оборудования и вех
        </p>
        <ScheduleViewToggle mode={mode} onChange={setMode} />
      </div>

      {status === 'loading' ? <RegisterLoading /> : null}
      {status === 'error' ? (
        <RegisterError message={error ?? ''} onRetry={retry} />
      ) : null}
      {status === 'idle' && data && data.items.length === 0 ? (
        <RegisterEmpty />
      ) : null}
      {status === 'idle' && data && data.items.length > 0 ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          <div className="shrink-0 space-y-3">
            <RegisterSummary
              total={data.items.length}
              visible={rows.length}
              counters={counters}
            />
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-0 flex-1">
                <RegisterToolbar
                  filters={{ ...filters, type: 'all' }}
                  onChange={(next) => setFilters({ ...next, type: 'all' })}
                  onReset={resetAll}
                  showType={false}
                />
              </div>
              <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
                Тип точки
                <select
                  className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                  value={kindFilter}
                  aria-label="Фильтр типа контрольной точки"
                  onChange={(e) => setKindFilter(e.target.value as KindFilter)}
                >
                  <option value="all">Все</option>
                  <option value="equipment">Оборудование</option>
                  <option value="milestone">Вехи</option>
                </select>
              </label>
            </div>
          </div>

          {rows.length === 0 && anyFilter ? (
            <RegisterFilteredEmpty onReset={resetAll} />
          ) : (
            <ScheduleBoard items={rows} mode={mode} />
          )}
        </div>
      ) : null}
    </RegisterShell>
  );
}
