'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import type { ScheduleItem, ScheduleLink } from '@/lib/api-client';
import type { ScheduleComparisonMode } from '@/lib/schedule/schedule-comparison';
import type { ScheduleSelectionKey } from '@/lib/schedule/selection-key';
import type { ScheduleScrollAnchor } from '@/lib/schedule/schedule-scroll-anchor';
import { useTheme } from '@/lib/theme/theme-context';
import { ScheduleChartStickyScale } from './schedule-chart-sticky-scale';
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
  /**
   * Parent owns vertical scroll; chart uses bounded viewport + smart_rendering
   * and receives Y via ownedScrollTop (not a second input scroller).
   */
  verticalScrollOwned?: boolean;
  embedded?: boolean;
  /** Programmatic Y from the shared scroll owner (rAF). */
  ownedScrollTop?: number;
  hoveredRowKey?: string | null;
  onHoverRow?: (key: string | null) => void;
};

export function ScheduleTimeline({
  items,
  links = [],
  treeRows,
  comparison = 'forecast',
  selected,
  onSelect,
  scrollAnchor,
  verticalScrollOwned = false,
  embedded = false,
  ownedScrollTop = 0,
  hoveredRowKey = null,
  onHoverRow,
}: Props) {
  const { theme } = useTheme();
  const chartRootRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={chartRootRef}
      className={[
        'flex h-full min-h-0 flex-col',
        embedded ? 'min-h-0' : 'min-h-0 flex-1',
      ].join(' ')}
      data-schedule-timeline="live"
      data-schedule-v-scroll-owned={verticalScrollOwned ? 'true' : undefined}
      data-schedule-virtualized={verticalScrollOwned ? 'true' : undefined}
    >
      {verticalScrollOwned ? (
        <ScheduleChartStickyScale syncRootRef={chartRootRef} />
      ) : null}
      <div
        className={
          verticalScrollOwned
            ? 'ppc-gantt-viewport ppc-gantt-viewport-virtual min-h-0 flex-1'
            : treeRows
              ? 'ppc-gantt-viewport ppc-gantt-viewport-tree min-h-0 flex-1'
              : 'ppc-gantt-viewport min-h-0 flex-1'
        }
        data-gantt-viewport={verticalScrollOwned ? 'virtual' : 'bounded'}
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
          fitVerticalContent={verticalScrollOwned}
          ownedScrollTop={ownedScrollTop}
          hoveredRowKey={hoveredRowKey}
          onHoverRow={onHoverRow}
        />
      </div>
    </div>
  );
}
