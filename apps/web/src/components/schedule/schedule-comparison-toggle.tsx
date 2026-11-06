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
      className="inline-flex rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-sunken)] p-0.5"
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
              'rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-sm font-medium outline-none transition-colors',
              'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
              selected
                ? 'bg-[var(--surface-raised)] text-[var(--text)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]',
            ].join(' ')}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
