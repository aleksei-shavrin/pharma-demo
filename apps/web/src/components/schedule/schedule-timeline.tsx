'use client';

import dynamic from 'next/dynamic';
import type { ScheduleItem, ScheduleLink } from '@/lib/api-client';
import type { ScheduleComparisonMode } from '@/lib/schedule/schedule-comparison';
import type { ScheduleSelectionKey } from '@/lib/schedule/selection-key';
import type { ScheduleScrollAnchor } from '@/lib/schedule/schedule-scroll-anchor';
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
  scrollAnchor?: ScheduleScrollAnchor;
};

export function ScheduleTimeline({
  items,
  links = [],
  treeRows,
  comparison = 'forecast',
  selected,
  onSelect,
  scrollAnchor,
}: Props) {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-schedule-timeline="live">
      {/*
        The pane is a bounded flex column. The viewport fills it; DHTMLX
        setSizes reads that height. A percentage height on an auto parent
        previously grew without bound, so the fixed 36rem box stays only
        outside this pane.
      */}
      <div
        className={
          treeRows
            ? 'ppc-gantt-viewport ppc-gantt-viewport-tree min-h-0 flex-1'
            : 'ppc-gantt-viewport min-h-0 flex-1'
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
          scrollAnchor={scrollAnchor}
        />
      </div>
    </div>
  );
}
