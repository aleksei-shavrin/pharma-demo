'use client';

import dynamic from 'next/dynamic';
import type { ScheduleItem } from '@/lib/api-client';
import type { ScheduleSelectionKey } from '@/lib/schedule/selection-key';
import { useTheme } from '@/lib/theme/theme-context';
import './dhtmlx-gantt-adapter.css';

const DhtmlxGanttAdapter = dynamic(
  () =>
    import('./dhtmlx-gantt-adapter').then((m) => m.DhtmlxGanttAdapter),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
        Загрузка временной шкалы…
      </p>
    ),
  },
);

type Props = {
  items: ScheduleItem[];
  selected: ScheduleSelectionKey | null;
  onSelect: (key: ScheduleSelectionKey | null) => void;
};

export function ScheduleTimeline({ items, selected, onSelect }: Props) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col gap-2" data-schedule-timeline="live">
      <p
        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]"
        data-schedule-legend="markers"
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rotate-45 border-2 border-[var(--status-danger-border)] bg-[var(--status-danger-fg)]"
            aria-hidden
          />
          Прогноз
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rotate-45 border-2 border-[var(--text-muted)] bg-[var(--surface-raised)] opacity-75"
            aria-hidden
          />
          База
        </span>
      </p>
      {/*
        Project-owned definite viewport height. DHTMLX must fill this box —
        never size an unbounded ancestor (height:100% / flex-1 on auto parents
        + vendor resize→render caused infinite growth).
      */}
      <div className="ppc-gantt-viewport" data-gantt-viewport="bounded">
        <DhtmlxGanttAdapter
          items={items}
          theme={theme}
          selected={selected}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}
