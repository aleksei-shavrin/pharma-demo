'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  RegisterEmpty,
  RegisterError,
  RegisterFilteredEmpty,
  RegisterLoading,
  RegisterShell,
} from '@/components/registers/register-table';
import {
  RegisterSummary,
  RegisterToolbar,
} from '@/components/registers/register-toolbar';
import type { ScheduleItem, ScheduleLink } from '@/lib/api-client';
import { fetchSchedule } from '@/lib/api-client';
import { formatDateRu } from '@/lib/format/ru';
import {
  DEFAULT_REGISTER_FILTERS,
  filtersActive,
  matchesSearch,
  matchesWorkstream,
  normalizeQuery,
  type RegisterFilterState,
} from '@/lib/registers/register-filters';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import {
  bindSchedulePaneScroll,
  GANTT_VERTICAL_SCROLL_SELECTOR,
} from '@/lib/schedule/bind-schedule-pane-scroll';
import {
  captureRowAnchor,
  emptyScheduleScrollAnchor,
  restoreRowAnchor,
  restoreScrollLeft,
} from '@/lib/schedule/schedule-scroll-anchor';
import { isScheduleAttention } from '@/lib/schedule/schedule-geometry';
import type { ScheduleSelectionKey } from '@/lib/schedule/selection-key';
import { parseSelectionKeyId } from '@/lib/schedule/selection-key';
import type { GanttTreeRow } from '@/lib/schedule/to-gantt-presentation';
import {
  buildVisibleScheduleRows,
  DEFAULT_EXPANDED_SCHEDULE_KEYS,
  type ScheduleHierarchyItem,
  type VisibleScheduleRow,
} from '@/lib/schedule/visible-rows';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { presentMilestoneName } from '@/lib/ui-labels';
import type { ScheduleComparisonMode } from '@/lib/schedule/schedule-comparison';
import { ScheduleBoard, type ScheduleTreeRow } from './schedule-board';
import { ScheduleComparisonToggle } from './schedule-comparison-toggle';
import { ScheduleTimeline } from './schedule-timeline';
import {
  SCHEDULE_VIEW_DEFAULT,
  type ScheduleViewMode,
} from './schedule-view-mode';
import { ScheduleViewToggle } from './schedule-view-toggle';

/** Keep a link only when both ends are among the visible rows. */
function linksForVisibleRows(
  links: ScheduleLink[],
  rows: readonly { kind: string; id: string }[],
): ScheduleLink[] {
  const endpointRefs = new Set(
    rows
      .filter((row) => row.kind === 'work' || row.kind === 'milestone')
      .map((row) => `${row.kind}:${row.id}`),
  );
  return links.filter(
    (link) =>
      endpointRefs.has(link.sourceRef) && endpointRefs.has(link.targetRef),
  );
}

const LEGACY_SCHEDULE_KINDS = new Set<string>([
  'equipment_delivery',
  'milestone',
  'work',
]);

/**
 * Группу нельзя класть в `items`: горизонт и маркеры всё ещё читают
 * baselineDate/forecastDate у любой не-работы. Иерархия едет в treeRows.
 */
function legacyScheduleItems<T extends ScheduleHierarchyItem>(
  rows: readonly VisibleScheduleRow<T>[],
): ScheduleItem[] {
  // Структурная строка не сужается до ScheduleItem; группы отсекаются по kind.
  return rows
    .map((row) => row.item)
    .filter((item) => LEGACY_SCHEDULE_KINDS.has(item.kind)) as ScheduleItem[];
}

function toBoardTreeRow<T extends ScheduleHierarchyItem>(
  row: VisibleScheduleRow<T>,
): ScheduleTreeRow {
  return {
    key: row.key,
    depth: row.depth,
    visibleOrdinal: row.visibleOrdinal,
    name: displayTitle(row),
    kind: row.kind,
    wbs: row.wbs,
    hasChildren: row.hasChildren,
    expanded: row.expanded,
    progressPct: row.progressPct,
    warning: row.warning,
  };
}

function toGanttTreeRow<T extends ScheduleHierarchyItem>(
  row: VisibleScheduleRow<T>,
): GanttTreeRow {
  return {
    key: row.key,
    kind: row.kind as GanttTreeRow['kind'],
    id: row.id,
    name: displayTitle(row),
    progressPct: row.progressPct,
    summaryStart: row.summaryStart,
    summaryEnd: row.summaryEnd,
    item: LEGACY_SCHEDULE_KINDS.has(row.kind)
      ? (row.item as ScheduleItem)
      : null,
  };
}

type KindFilter = 'all' | 'equipment' | 'milestone' | 'work';

function displayTitle(item: { kind: string; id: string; name: string }): string {
  if (item.kind === 'milestone') {
    return presentMilestoneName(item.id, item.name);
  }
  return item.name;
}

function isLeafAttention(item: ScheduleHierarchyItem): boolean {
  if (
    item.kind !== 'equipment_delivery' &&
    item.kind !== 'milestone' &&
    item.kind !== 'work'
  ) {
    return false;
  }
  return isScheduleAttention(item as ScheduleItem);
}

/**
 * Лист проходит прежние фильтры. Группа — семя только при непустом поиске
 * по имени/id/wbs; предков совпавших листьев добавляет buildVisibleScheduleRows.
 */
function includeScheduleItem(
  item: ScheduleHierarchyItem,
  filters: RegisterFilterState,
  kindFilter: KindFilter,
): boolean {
  const group =
    item.kind === 'project_group' || item.kind === 'stage_group';
  if (group) {
    if (normalizeQuery(filters.query).length === 0) return false;
    return matchesSearch(filters.query, [
      displayTitle(item),
      item.id,
      item.wbs,
    ]);
  }
  if (kindFilter === 'equipment' && item.kind !== 'equipment_delivery') {
    return false;
  }
  if (kindFilter === 'milestone' && item.kind !== 'milestone') {
    return false;
  }
  if (kindFilter === 'work' && item.kind !== 'work') {
    return false;
  }
  if (filters.attention === 'attention' && !isLeafAttention(item)) {
    return false;
  }
  if (filters.attention === 'normal' && isLeafAttention(item)) {
    return false;
  }
  if (!matchesWorkstream(filters.workstream, item.workstream)) {
    return false;
  }
  return matchesSearch(filters.query, [displayTitle(item), item.id, item.wbs]);
}

export function ScheduleView() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(fetchSchedule);
  const [mode, setMode] = useState<ScheduleViewMode>(SCHEDULE_VIEW_DEFAULT);
  const [comparison, setComparison] = useState<ScheduleComparisonMode>('forecast');
  const [filters, setFilters] = useState<RegisterFilterState>(
    DEFAULT_REGISTER_FILTERS,
  );
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<string>>(
    () => new Set(DEFAULT_EXPANDED_SCHEDULE_KEYS),
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const listPaneRef = useRef<HTMLDivElement>(null);
  const chartPaneRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef(emptyScheduleScrollAnchor());

  const rememberScroll = () => {
    const anchor = scrollAnchorRef.current;
    const list = listPaneRef.current?.querySelector<HTMLElement>(
      '[data-schedule-viewport="true"]',
    );
    const chartPane = chartPaneRef.current;
    const chart = chartPane?.querySelector<HTMLElement>(
      GANTT_VERTICAL_SCROLL_SELECTOR,
    );
    if (list) {
      const row = captureRowAnchor(list);
      anchor.rowKey = row.rowKey;
      anchor.rowOffsetPx = row.rowOffsetPx;
      anchor.tableScrollLeft = list.scrollLeft;
      anchor.verticalScrollTop = list.scrollTop;
      return;
    }
    if (!chartPane || !chart) return;
    // Rows live in the task pane, not inside the scrollbar element.
    const taskPane =
      chartPane.querySelector<HTMLElement>('.gantt_task') ?? chart;
    const row = captureRowAnchor(
      taskPane,
      chartPane,
      '.gantt_task_row',
      'task_id',
    );
    if (row.rowKey) {
      anchor.rowKey = row.rowKey;
      anchor.rowOffsetPx = row.rowOffsetPx;
    }
    anchor.verticalScrollTop = chart.scrollTop;
  };

  const changeMode = (next: ScheduleViewMode) => {
    rememberScroll();
    setMode(next);
  };

  const changeComparison = (next: ScheduleComparisonMode) => {
    rememberScroll();
    setComparison(next);
  };

  useEffect(() => {
    let list: HTMLElement | null = null;
    let chart: HTMLElement | null = null;
    let timer = 0;
    let attempts = 0;
    let stopped = false;
    const onScroll = () => rememberScroll();
    const attach = () => {
      if (stopped) return;
      const nextList =
        listPaneRef.current?.querySelector<HTMLElement>(
          '[data-schedule-viewport="true"]',
        ) ?? null;
      const nextChart =
        chartPaneRef.current?.querySelector<HTMLElement>(
          GANTT_VERTICAL_SCROLL_SELECTOR,
        ) ?? null;
      if (nextList && nextList !== list) {
        list?.removeEventListener('scroll', onScroll);
        list = nextList;
        list.addEventListener('scroll', onScroll, { passive: true });
      }
      if (nextChart && nextChart !== chart && !nextList) {
        chart?.removeEventListener('scroll', onScroll);
        chart = nextChart;
        chart.addEventListener('scroll', onScroll, { passive: true });
      }
      const waitingForList = mode !== 'gantt' && !nextList;
      const waitingForChart = mode !== 'table' && !nextChart;
      if ((waitingForList || waitingForChart) && attempts < 20) {
        attempts += 1;
        timer = window.setTimeout(attach, 200);
      }
    };
    attach();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      list?.removeEventListener('scroll', onScroll);
      chart?.removeEventListener('scroll', onScroll);
    };
  }, [mode, status, data]);

  useLayoutEffect(() => {
    let timer = 0;
    let attempts = 0;
    const apply = () => {
      const anchor = scrollAnchorRef.current;
      const hasAnchor =
        anchor.rowKey != null ||
        anchor.chartDateIso != null ||
        anchor.tableScrollLeft > 0 ||
        anchor.verticalScrollTop > 0;
      if (!hasAnchor) return;
      const list = listPaneRef.current?.querySelector<HTMLElement>(
        '[data-schedule-viewport="true"]',
      );
      const chart = chartPaneRef.current?.querySelector<HTMLElement>(
        GANTT_VERTICAL_SCROLL_SELECTOR,
      );
      if (list) {
        restoreRowAnchor(list, anchor.rowKey, anchor.rowOffsetPx);
        restoreScrollLeft(list, anchor.tableScrollLeft);
      }
      if (list && chart) {
        chart.scrollTop = list.scrollTop;
      } else if (chart) {
        const max = chart.scrollHeight - chart.clientHeight;
        chart.scrollTop = Math.min(
          Math.max(anchor.verticalScrollTop, 0),
          Math.max(max, 0),
        );
      }
    };
    const loop = () => {
      apply();
      if (attempts < 8) {
        attempts += 1;
        timer = window.setTimeout(loop, 150);
      }
    };
    loop();
    return () => window.clearTimeout(timer);
  }, [mode, comparison, status, data]);

  useEffect(() => {
    if (mode !== 'split') return;
    const listPane = listPaneRef.current;
    const chartPane = chartPaneRef.current;
    if (!listPane || !chartPane) return;
    let release = () => {};
    let timer = 0;
    const attach = () => {
      const list = listPane.querySelector<HTMLElement>(
        '[data-schedule-viewport="true"]',
      );
      const chart = chartPane.querySelector<HTMLElement>(
        GANTT_VERTICAL_SCROLL_SELECTOR,
      );
      if (!list || !chart) {
        timer = window.setTimeout(attach, 200);
        return;
      }
      release = bindSchedulePaneScroll(list, chart);
    };
    attach();
    return () => {
      window.clearTimeout(timer);
      release();
    };
  }, [mode, status, data]);

  const resetAll = () => {
    setFilters(DEFAULT_REGISTER_FILTERS);
    setKindFilter('all');
  };

  const toggleExpanded = (key: string) => {
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visibleRows = useMemo(() => {
    if (!data) return [];
    return buildVisibleScheduleRows(data.items, {
      expandedKeys,
      includeItem: (item) => includeScheduleItem(item, filters, kindFilter),
    });
  }, [data, expandedKeys, filters, kindFilter]);

  const legacyItems = legacyScheduleItems(visibleRows);

  const visibleLinks = useMemo(
    () => linksForVisibleRows(data?.links ?? [], visibleRows),
    [data?.links, visibleRows],
  );

  const selectedSelection = selectedKey
    ? parseSelectionKeyId(selectedKey)
    : null;

  const counters = useMemo(() => {
    if (!data) return [];
    const eq = data.items.filter((i) => i.kind === 'equipment_delivery').length;
    const ms = data.items.filter((i) => i.kind === 'milestone').length;
    const works = data.items.filter((i) => i.kind === 'work').length;
    const attn = data.items.filter(isScheduleAttention).length;
    return [
      { label: 'Оборудование', value: eq },
      { label: 'Вехи', value: ms },
      ...(works > 0 ? [{ label: 'Работы', value: works }] : []),
      { label: 'Внимание', value: attn },
    ];
  }, [data]);

  const hasWorks = useMemo(
    () => data?.items.some((item) => item.kind === 'work') ?? false,
    [data],
  );

  // Snapshot without works must not keep a stale «Работы» kind filter.
  useEffect(() => {
    if (!hasWorks && kindFilter === 'work') {
      setKindFilter('all');
    }
    if (!hasWorks) setComparison('forecast');
  }, [hasWorks, kindFilter]);

  const anyFilter =
    filtersActive({ ...filters, type: 'all' }) || kindFilter !== 'all';

  const boardRows = visibleRows.map(toBoardTreeRow);
  const ganttRows = visibleRows.map(toGanttTreeRow);

  const onTimelineSelect = (key: ScheduleSelectionKey | null) => {
    setSelectedKey(key ? `${key.kind}:${key.entityId}` : null);
  };

  return (
    <RegisterShell
      title="Календарный план"
      asOf={data ? formatDateRu(data.scenarioAsOfDate) : null}
      snapshot={active}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Контрольные точки поставки оборудования и вех
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {hasWorks ? (
            <ScheduleComparisonToggle mode={comparison} onChange={changeComparison} />
          ) : null}
          <ScheduleViewToggle mode={mode} onChange={changeMode} />
        </div>
      </div>

      {status === 'loading' ? <RegisterLoading /> : null}
      {status === 'error' ? (
        <RegisterError message={error ?? ''} onRetry={retry} />
      ) : null}
      {status === 'idle' && data && data.items.length === 0 ? (
        <RegisterEmpty />
      ) : null}
      {status === 'idle' && data && data.items.length > 0 ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          <div className="shrink-0 space-y-3">
            <RegisterSummary
              total={data.items.length}
              visible={visibleRows.length}
              counters={counters}
            />
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-0 flex-1">
                <RegisterToolbar
                  filters={{ ...filters, type: 'all' }}
                  onChange={(next) => setFilters({ ...next, type: 'all' })}
                  onReset={resetAll}
                  showType={false}
                />
              </div>
              <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
                Тип точки
                <select
                  className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                  value={kindFilter}
                  aria-label="Фильтр типа контрольной точки"
                  onChange={(e) => setKindFilter(e.target.value as KindFilter)}
                >
                  <option value="all">Все</option>
                  <option value="equipment">Оборудование</option>
                  <option value="milestone">Вехи</option>
                  {hasWorks ? <option value="work">Работы</option> : null}
                </select>
              </label>
            </div>
          </div>

          {visibleRows.length === 0 && anyFilter ? (
            <RegisterFilteredEmpty onReset={resetAll} />
          ) : (
            <div
              data-schedule-presentation={mode}
              className={
                mode === 'split'
                  ? 'flex min-h-0 flex-1 flex-row gap-2 overflow-hidden'
                  : 'flex min-h-0 flex-1 flex-col overflow-hidden'
              }
            >
              {mode === 'gantt' ? null : (
                <div
                  ref={listPaneRef}
                  data-schedule-pane="table"
                  className={
                    mode === 'split'
                      ? 'flex min-h-0 min-w-0 w-[42rem] max-w-[46%] shrink-0 flex-col overflow-hidden'
                      : 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
                  }
                >
                  <ScheduleBoard
                    items={legacyItems}
                    mode="table"
                    treeRows={boardRows}
                    onToggleRow={toggleExpanded}
                    comparison={comparison}
                  />
                </div>
              )}
              {mode === 'table' ? null : (
                <div
                  ref={chartPaneRef}
                  data-schedule-pane="chart"
                  className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                >
                  <ScheduleTimeline
                    items={legacyItems}
                    links={visibleLinks}
                    treeRows={ganttRows}
                    comparison={comparison}
                    selected={selectedSelection}
                    onSelect={onTimelineSelect}
                    scrollAnchor={scrollAnchorRef.current}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </RegisterShell>
  );
}
