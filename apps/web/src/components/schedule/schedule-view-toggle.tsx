'use client';

import type { ScheduleViewMode } from './schedule-view-mode';

/** I6: only Table is public. Split/Timeline stay disabled until real timeline renderer. */
const MODES: {
  id: ScheduleViewMode;
  label: string;
  disabled?: boolean;
  title?: string;
}[] = [
  { id: 'table', label: 'Таблица' },
  {
    id: 'split',
    label: 'Разделение',
    disabled: true,
    title: 'Будет доступно вместе с временной шкалой.',
  },
  {
    id: 'gantt',
    label: 'Временная шкала',
    disabled: true,
    title: 'Будет доступно вместе с временной шкалой.',
  },
];

type Props = {
  mode: ScheduleViewMode;
  onChange: (mode: ScheduleViewMode) => void;
};

/**
 * Table | Split | Timeline — Split/Timeline native-disabled until real renderer (I7).
 * Selection is not part of this control.
 */
export function ScheduleViewToggle({ mode, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Режим представления графика"
      className="inline-flex rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-sunken)] p-0.5"
    >
      {MODES.map((m) => {
        const selected = !m.disabled && mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            disabled={m.disabled}
            title={m.title}
            aria-pressed={m.disabled ? undefined : selected}
            onClick={() => {
              if (!m.disabled) onChange(m.id);
            }}
            className={[
              'rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-sm font-medium outline-none transition-colors',
              'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
              m.disabled
                ? 'cursor-not-allowed text-[var(--text-muted)] opacity-60'
                : selected
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
