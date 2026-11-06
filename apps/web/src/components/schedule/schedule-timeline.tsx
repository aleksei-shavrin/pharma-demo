'use client';

import dynamic from 'next/dynamic';
import type { ScheduleItem, ScheduleLink } from '@/lib/api-client';
import type { ScheduleComparisonMode } from '@/lib/schedule/schedule-comparison';
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
  links?: ScheduleLink[];
  treeRows?: import('@/lib/schedule/to-gantt-presentation').GanttTreeRow[];
  comparison?: ScheduleComparisonMode;
  selected: ScheduleSelectionKey | null;
  onSelect: (key: ScheduleSelectionKey | null) => void;
};

export function ScheduleTimeline({
  items,
  links = [],
  treeRows,
  comparison = 'forecast',
  selected,
  onSelect,
}: Props) {
  const { theme } = useTheme();
  const hasSfDemo = links.some((link) => link.type === 'SF');

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
        {links.length > 0 ? (
          <span data-schedule-legend="links">Связи SS / SF / FF / FS</span>
        ) : null}
      </p>
      {hasSfDemo ? (
        <p
          className="text-xs text-[var(--text-muted)]"
          data-schedule-legend="sf-demo"
        >
          Связь SF на демо показывает точки крепления стрелки; это не
          утверждённая технологическая зависимость.
        </p>
      ) : null}
      {/*
        Project-owned definite viewport height. DHTMLX must fill this box —
        never size an unbounded ancestor (height:100% / flex-1 on auto parents
        + vendor resize→render caused infinite growth).
      */}
      <div
        className={
          treeRows
            ? 'ppc-gantt-viewport ppc-gantt-viewport-tree'
            : 'ppc-gantt-viewport'
        }
        data-gantt-viewport="bounded"
      >
        <DhtmlxGanttAdapter
          items={items}
          links={links}
          treeRows={treeRows}
          comparison={comparison}
          theme={theme}
          selected={selected}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}
