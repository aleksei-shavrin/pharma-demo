'use client';

import { useEffect, useState } from 'react';
import {
  RegisterEmpty,
  RegisterError,
  RegisterLoading,
  RegisterShell,
} from '@/components/registers/register-table';
import { fetchSchedule } from '@/lib/api-client';
import { formatDateRu } from '@/lib/format/ru';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import type { ScheduleSelectionKey } from '@/lib/schedule/selection-key';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { ScheduleTable } from './schedule-table';
import { ScheduleTimeline } from './schedule-timeline';
import {
  SCHEDULE_VIEW_DEFAULT,
  type ScheduleViewMode,
} from './schedule-view-mode';
import { ScheduleViewToggle } from './schedule-view-toggle';

export function ScheduleView() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(fetchSchedule);
  const [mode, setMode] = useState<ScheduleViewMode>(SCHEDULE_VIEW_DEFAULT);
  const [selected, setSelected] = useState<ScheduleSelectionKey | null>(null);

  // Clear selection on committed snapshot change (no ghost across A/B/C).
  useEffect(() => {
    setSelected(null);
  }, [active]);

  return (
    <RegisterShell
      title="График"
      asOf={data ? formatDateRu(data.scenarioAsOfDate) : null}
      snapshot={active}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        mode === 'split' ? (
          <div
            className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)]"
            data-schedule-layout="split"
          >
            <div className="min-w-0">
              <ScheduleTable
                items={data.items}
                selected={selected}
                onSelect={setSelected}
              />
            </div>
            <ScheduleTimeline
              items={data.items}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        ) : mode === 'gantt' ? (
          <div data-schedule-layout="gantt">
            <ScheduleTimeline
              items={data.items}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        ) : (
          <div data-schedule-layout="table">
            <ScheduleTable
              items={data.items}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        )
      ) : null}
    </RegisterShell>
  );
}
