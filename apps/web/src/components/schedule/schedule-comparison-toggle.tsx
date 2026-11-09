'use client';

import { CalendarRange, CircleCheck, TrendingUp } from 'lucide-react';
import type { ScheduleComparisonMode } from '@/lib/schedule/schedule-comparison';

const MODES: {
  id: ScheduleComparisonMode;
  label: string;
  Icon: typeof TrendingUp;
}[] = [
  { id: 'baseline', label: 'Базовый план', Icon: CalendarRange },
  { id: 'forecast', label: 'Базовый план / прогноз', Icon: TrendingUp },
  { id: 'actual', label: 'Базовый план / факт', Icon: CircleCheck },
];

type Props = {
  mode: ScheduleComparisonMode;
  onChange: (mode: ScheduleComparisonMode) => void;
};

/** Shared group chrome; icons only (active blue / inactive grey), no button pill. */
export function ScheduleComparisonToggle({ mode, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Сравнение полос"
      className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-sunken)] p-1"
      data-schedule-comparison={mode}
    >
      {MODES.map((item) => {
        const selected = mode === item.id;
        const Icon = item.Icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            title={item.label}
            aria-pressed={selected}
            onClick={() => onChange(item.id)}
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
