'use client';

import type { ScheduleComparisonMode } from '@/lib/schedule/schedule-comparison';

const MODES: { id: ScheduleComparisonMode; label: string }[] = [
  { id: 'forecast', label: 'Базовый план / прогноз' },
  { id: 'actual', label: 'Базовый план / факт' },
];

type Props = {
  mode: ScheduleComparisonMode;
  onChange: (mode: ScheduleComparisonMode) => void;
};

/** Две пары сравнения. Третья одновременная полоса не включается. */
export function ScheduleComparisonToggle({ mode, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Сравнение полос"
      className="inline-flex min-h-8 items-stretch gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-sunken)] p-1"
      data-schedule-comparison={mode}
    >
      {MODES.map((item) => {
        const selected = mode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(item.id)}
            className={[
              'flex min-h-8 min-w-0 flex-1 items-center justify-center px-2 py-0 text-center text-xs font-medium leading-tight outline-none transition-colors',
              'rounded-[var(--radius-sm)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-sunken)]',
              selected
                ? 'bg-[var(--surface-raised)] text-[var(--text)] shadow-[var(--elevation-1)] ring-1 ring-inset ring-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--interactive)] hover:text-[var(--text)]',
            ].join(' ')}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
