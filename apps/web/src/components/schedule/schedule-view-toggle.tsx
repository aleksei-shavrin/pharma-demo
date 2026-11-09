'use client';

import { ChartGantt, Columns2, Table2 } from 'lucide-react';

import type { ScheduleViewMode } from './schedule-view-mode';

const MODES: {
  id: ScheduleViewMode;
  label: string;
  Icon: typeof Table2;
}[] = [
  { id: 'table', label: 'Таблица', Icon: Table2 },
  { id: 'split', label: 'Разделение', Icon: Columns2 },
  { id: 'gantt', label: 'Временная шкала', Icon: ChartGantt },
];

type Props = {
  mode: ScheduleViewMode;
  onChange: (mode: ScheduleViewMode) => void;
};

/** Shared group chrome; icons only (active blue / inactive grey), no button pill. */
export function ScheduleViewToggle({ mode, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Режим представления календарного плана"
      data-schedule-view-toggle="true"
      className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-sunken)] p-1"
    >
      {MODES.map((m) => {
        const selected = mode === m.id;
        const { Icon } = m;
        return (
          <button
            key={m.id}
            type="button"
            title={m.label}
            aria-label={m.label}
            aria-pressed={selected}
            onClick={() => onChange(m.id)}
            className={[
              'inline-flex h-6 w-6 shrink-0 items-center justify-center outline-none transition-colors',
              'rounded-[var(--radius-sm)] bg-transparent',
              'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-sunken)]',
              selected
                ? 'text-[var(--status-info-border)] hover:text-[var(--status-info-border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            ].join(' ')}
          >
            <Icon className="size-[18px]" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
