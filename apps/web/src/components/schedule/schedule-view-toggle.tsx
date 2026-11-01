'use client';

import type { ScheduleViewMode } from './schedule-view-mode';

const MODES: { id: ScheduleViewMode; label: string }[] = [
  { id: 'table', label: 'Таблица' },
  { id: 'split', label: 'Разделение' },
  { id: 'gantt', label: 'Временная шкала' },
];

type Props = {
  mode: ScheduleViewMode;
  onChange: (mode: ScheduleViewMode) => void;
};

/** Table | Split | Timeline — all enabled after I7 / D12. */
export function ScheduleViewToggle({ mode, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Режим представления графика"
      className="inline-flex rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-sunken)] p-0.5"
    >
      {MODES.map((m) => {
        const selected = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(m.id)}
            className={[
              'rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-sm font-medium outline-none transition-colors',
              'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
              selected
                ? 'bg-[var(--surface-raised)] text-[var(--text)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]',
            ].join(' ')}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
