'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  matchesProgram,
  normalizeQuery,
  type RegisterFilterState,
} from '@/lib/registers/register-filters';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import { GANTT_VERTICAL_SCROLL_SELECTOR } from '@/lib/schedule/bind-schedule-pane-scroll';
import {
  isScheduleAttention,
  SCHEDULE_ROW_HEIGHT_PX,
} from '@/lib/schedule/schedule-geometry';
import {
  captureChartPaneScroll,
  captureRowAnchor,
  centeredOwnedScrollTop,
  emptyScheduleScrollAnchor,
  forwardWheelDeltaToOwner,
  restoreChartPaneScroll,
  restoreRowAnchor,
  restoreScrollLeft,
} from '@/lib/schedule/schedule-scroll-anchor';
import type { ScheduleSelectionKey } from '@/lib/schedule/selection-key';
import { parseSelectionKeyId } from '@/lib/schedule/selection-key';
import type { GanttTreeRow } from '@/lib/schedule/to-gantt-presentation';
import {
  allScheduleGroupKeys,
  buildVisibleScheduleRows,
  type ScheduleHierarchyItem,
  type VisibleScheduleRow,
} from '@/lib/schedule/visible-rows';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { presentMilestoneName } from '@/lib/ui-labels';
import {
  parseScheduleComparisonMode,
  type ScheduleComparisonMode,
} from '@/lib/schedule/schedule-comparison';
import { resolveScheduleFillTone } from '@/lib/schedule/schedule-fill-tone';
import {
  applyScheduleRowHover,
  applyScheduleRowSelected,
} from '@/lib/schedule/schedule-row-hover';
import {
  computeScheduleVirtualWindow,
  type ScheduleVirtualWindow,
} from '@/lib/schedule/schedule-virtual-window';
import { ScheduleBoard, type ScheduleTreeRow } from './schedule-board';
import { ScheduleComparisonToggle } from './schedule-comparison-toggle';
import { ScheduleTimeline } from './schedule-timeline';
import {
  SCHEDULE_VIEW_DEFAULT,
  type ScheduleViewMode,
} from './schedule-view-mode';
import { ScheduleViewToggle } from './schedule-view-toggle';
import { ScheduleZoomToggle } from './schedule-zoom-toggle';
import {
  SCHEDULE_ZOOM_DEFAULT_INDEX,
  canZoomIn,
  canZoomOut,
} from '@/lib/schedule/schedule-gantt-zoom';

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
  const item = row.item as {
    status?: string | null;
    rag?: string | null;
  };
  return {
    key: row.key,
    depth: row.depth,
    name: displayTitle(row),
    kind: row.kind,
    wbs: row.wbs,
    hasChildren: row.hasChildren,
    expanded: row.expanded,
    progressPct: row.progressPct,
    fillTone: resolveScheduleFillTone({
      kind: row.kind,
      status: item.status,
      rag: item.rag,
      warningTone: row.warning.tone,
    }),
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

/** Split pane list width bounds: min 20rem (320px at 16px root), max 70% of the split row. */
const SPLIT_LIST_MIN_PX = 320;
const SPLIT_LIST_MAX_FRACTION = 0.7;
/** Equal panes until the user drags the 1px splitter (then listWidthPx is set). */
const SPLIT_LIST_DEFAULT_WIDTH = '50%';
const SPLIT_KEY_STEP_PX = 24;
const SPLIT_KEY_STEP_LARGE_PX = 96;

function clampSplitListWidth(widthPx: number, containerPx: number): number {
  const max = Math.max(SPLIT_LIST_MIN_PX, containerPx * SPLIT_LIST_MAX_FRACTION);
  return Math.round(Math.min(max, Math.max(SPLIT_LIST_MIN_PX, widthPx)));
}

type KindFilter = 'all' | 'equipment' | 'milestone' | 'controlpoint' | 'work';

function isControlPointMilestone(item: ScheduleHierarchyItem): boolean {
  return (
    item.kind === 'milestone' &&
    ((item as { sourceKind?: string }).sourceKind === 'controlpoint' ||
      item.id.startsWith('KT-'))
  );
}

function matchesProjectScope(
  projectFilter: string | null,
  item: ScheduleHierarchyItem,
): boolean {
  if (!projectFilter) return true;
  const no = Number(projectFilter.replace(/^AN-/, ''));
  if (!Number.isFinite(no)) return true;
  const prefix = `${no}.`;
  const root = String(no);
  if (item.kind === 'project_group') return item.id === projectFilter;
  const wbs = item.wbs ?? '';
  return wbs === root || wbs.startsWith(prefix);
}

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
  projectFilter: string | null,
): boolean {
  if (!matchesProjectScope(projectFilter, item)) return false;
  const group =
    item.kind === 'project_group' || item.kind === 'stage_group';
  if (group) {
    if (normalizeQuery(filters.query).length === 0) {
      // Keep project/stage groups as seeds when scoping to a project.
      return projectFilter != null;
    }
    return matchesSearch(filters.query, [
      displayTitle(item),
      item.id,
      item.wbs,
    ]);
  }
  if (kindFilter === 'equipment' && item.kind !== 'equipment_delivery') {
    return false;
  }
  if (kindFilter === 'milestone') {
    if (item.kind !== 'milestone' || isControlPointMilestone(item)) return false;
  }
  if (kindFilter === 'controlpoint') {
    if (!isControlPointMilestone(item)) return false;
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
  if (!matchesProgram(filters.program, item.workstream)) {
    return false;
  }
  return matchesSearch(filters.query, [displayTitle(item), item.id, item.wbs]);
}

export function ScheduleView() {
  const { active } = useSnapshot();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectFilter = searchParams.get('project');
  const focusParam = searchParams.get('focus');
  const { data, status, error, retry } = useRegisterQuery(fetchSchedule);
  const [mode, setMode] = useState<ScheduleViewMode>(SCHEDULE_VIEW_DEFAULT);
  const [comparison, setComparison] = useState<ScheduleComparisonMode>(() =>
    parseScheduleComparisonMode(searchParams.get('comparison')),
  );
  const [filters, setFilters] = useState<RegisterFilterState>(
    DEFAULT_REGISTER_FILTERS,
  );
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const expandSeedRef = useRef<string | null>(null);
  const focusAppliedRef = useRef<string | null>(null);
  const focusScrollDoneRef = useRef<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const listPaneRef = useRef<HTMLDivElement>(null);
  const chartPaneRef = useRef<HTMLDivElement>(null);
  const scrollOwnerRef = useRef<HTMLDivElement>(null);
  const hoverKeyRef = useRef<string | null>(null);
  const scrollAnchorRef = useRef(emptyScheduleScrollAnchor());
  const splitRowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
  } | null>(null);
  const splitDragCleanupRef = useRef<(() => void) | null>(null);
  /** null = default CSS 50%; set only after the user resizes the list pane. */
  const [listWidthPx, setListWidthPx] = useState<number | null>(null);
  const [splitDragging, setSplitDragging] = useState(false);
  const [ownedScrollTop, setOwnedScrollTop] = useState(0);
  const [ownedViewportHeight, setOwnedViewportHeight] = useState(0);
  const [zoomLevelIndex, setZoomLevelIndex] = useState(
    SCHEDULE_ZOOM_DEFAULT_INDEX,
  );
  const scrollSyncRafRef = useRef(0);

  const splitMetrics = () => {
    const container = splitRowRef.current?.getBoundingClientRect().width ?? 0;
    const current =
      listPaneRef.current?.getBoundingClientRect().width ?? SPLIT_LIST_MIN_PX;
    return { container, current };
  };

  const endSplitDrag = () => {
    splitDragCleanupRef.current?.();
    splitDragCleanupRef.current = null;
    dragRef.current = null;
    setSplitDragging(false);
  };

  const onSplitPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    const { current } = splitMetrics();
    const pointerId = event.pointerId;
    endSplitDrag();
    dragRef.current = {
      pointerId,
      startX: event.clientX,
      startWidth: current,
    };
    setSplitDragging(true);

    // Window listeners (not element capture): Playwright mouse + lostpointercapture
    // otherwise end the drag before the first move.
    const onMove = (move: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== move.pointerId) return;
      const { container } = splitMetrics();
      setListWidthPx(
        clampSplitListWidth(
          drag.startWidth + move.clientX - drag.startX,
          container,
        ),
      );
    };
    const onUp = (up: PointerEvent) => {
      if (dragRef.current?.pointerId !== up.pointerId) return;
      endSplitDrag();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    splitDragCleanupRef.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  };

  const onSplitKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const { container, current } = splitMetrics();
    const step = event.shiftKey ? SPLIT_KEY_STEP_LARGE_PX : SPLIT_KEY_STEP_PX;
    let next: number | null = null;
    if (event.key === 'ArrowLeft') next = current - step;
    else if (event.key === 'ArrowRight') next = current + step;
    else if (event.key === 'Home') next = SPLIT_LIST_MIN_PX;
    else if (event.key === 'End') next = container * SPLIT_LIST_MAX_FRACTION;
    if (next == null) return;
    event.preventDefault();
    setListWidthPx(clampSplitListWidth(next, container));
  };

  // Drop an in-flight drag if the split unmounts (mode switch) mid-gesture.
  useEffect(() => {
    if (mode !== 'split') {
      endSplitDrag();
    }
  }, [mode]);

  useEffect(() => () => endSplitDrag(), []);

  const publishHover = useCallback((key: string | null) => {
    if (hoverKeyRef.current === key) return;
    hoverKeyRef.current = key;
    applyScheduleRowHover(
      [listPaneRef.current, chartPaneRef.current, scrollOwnerRef.current],
      key,
    );
  }, []);

  // Stale hover must not survive filter / expand / mode remount.
  useEffect(() => {
    publishHover(null);
  }, [mode, filters, kindFilter, expandedKeys, comparison, active, publishHover]);

  const rememberScroll = () => {
    const anchor = scrollAnchorRef.current;
    const owner = scrollOwnerRef.current;
    const list = listPaneRef.current?.querySelector<HTMLElement>(
      '[data-schedule-viewport="true"]',
    );
    const chartPane = chartPaneRef.current;
    /** Keep prior Y when the active scroller is not yet scrollable (layout race / mode hop). */
    const writeVertical = (el: HTMLElement) => {
      const max = el.scrollHeight - el.clientHeight;
      if (max > 0 || el.scrollTop > 0) {
        anchor.verticalScrollTop = el.scrollTop;
      }
    };
    if (owner) {
      const row = captureRowAnchor(owner);
      anchor.rowKey = row.rowKey;
      anchor.rowOffsetPx = row.rowOffsetPx;
      writeVertical(owner);
      if (list) anchor.tableScrollLeft = list.scrollLeft;
      return;
    }
    if (list) {
      const row = captureRowAnchor(list);
      anchor.rowKey = row.rowKey;
      anchor.rowOffsetPx = row.rowOffsetPx;
      anchor.tableScrollLeft = list.scrollLeft;
      writeVertical(list);
      return;
    }
    if (!chartPane) return;
    const captured = captureChartPaneScroll(chartPane);
    if (!captured) return;
    if (captured.rowKey) {
      anchor.rowKey = captured.rowKey;
      anchor.rowOffsetPx = captured.rowOffsetPx;
    }
    anchor.verticalScrollTop = captured.verticalScrollTop;
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
    let scroller: HTMLElement | null = null;
    let timer = 0;
    let attempts = 0;
    let stopped = false;
    const onScroll = () => rememberScroll();
    const attach = () => {
      if (stopped) return;
      const next =
        scrollOwnerRef.current ??
        listPaneRef.current?.querySelector<HTMLElement>(
          '[data-schedule-viewport="true"]',
        ) ??
        chartPaneRef.current?.querySelector<HTMLElement>(
          GANTT_VERTICAL_SCROLL_SELECTOR,
        ) ??
        null;
      if (next && next !== scroller) {
        scroller?.removeEventListener('scroll', onScroll);
        scroller = next;
        scroller.addEventListener('scroll', onScroll, { passive: true });
      }
      if (!next && attempts < 20) {
        attempts += 1;
        timer = window.setTimeout(attach, 200);
      }
    };
    attach();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      scroller?.removeEventListener('scroll', onScroll);
    };
  }, [mode, status, data]);

  const forwardChartWheelToOwnerRef = useRef((event: WheelEvent) => {
    const owner = scrollOwnerRef.current;
    if (!owner) return;
    const target = event.target;
    // Nested H-scrollports (table body / gantt data area) can swallow vertical
    // wheel; forward any vertical gesture that originates under the Y owner.
    if (!(target instanceof Node) || !owner.contains(target)) return;
    forwardWheelDeltaToOwner(event, owner, SCHEDULE_ROW_HEIGHT_PX);
  });

  const setChartPaneNode = useCallback((node: HTMLDivElement | null) => {
    chartPaneRef.current = node;
    if (node) {
      node.setAttribute('data-schedule-chart-wheel', 'owner');
    }
  }, []);

  // Listen on the Y owner (capture) so vendor/chart subtree wheels still forward
  // even when the pointer is over nested gantt layers or overlays.
  useEffect(() => {
    const owner = scrollOwnerRef.current;
    if (!owner || mode !== 'split') return;
    const onWheel = forwardChartWheelToOwnerRef.current;
    owner.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => {
      owner.removeEventListener('wheel', onWheel, true);
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
      const owner = scrollOwnerRef.current;
      const list = listPaneRef.current?.querySelector<HTMLElement>(
        '[data-schedule-viewport="true"]',
      );
      if (owner) {
        const max = owner.scrollHeight - owner.clientHeight;
        owner.scrollTop = Math.min(
          Math.max(anchor.verticalScrollTop, 0),
          Math.max(max, 0),
        );
        if (list) {
          restoreRowAnchor(owner, anchor.rowKey, anchor.rowOffsetPx);
          restoreScrollLeft(list, anchor.tableScrollLeft);
        }
        return;
      }
      if (list) {
        const max = list.scrollHeight - list.clientHeight;
        list.scrollTop = Math.min(
          Math.max(anchor.verticalScrollTop, 0),
          Math.max(max, 0),
        );
        restoreRowAnchor(list, anchor.rowKey, anchor.rowOffsetPx);
        restoreScrollLeft(list, anchor.tableScrollLeft);
        return;
      }
      const chartPane = chartPaneRef.current;
      if (chartPane) {
        restoreChartPaneScroll(
          chartPane,
          anchor.verticalScrollTop,
          anchor.rowKey,
          anchor.rowOffsetPx,
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
      comparison,
      includeItem: (item) =>
        includeScheduleItem(item, filters, kindFilter, projectFilter),
    });
  }, [data, expandedKeys, filters, kindFilter, projectFilter, comparison]);

  const legacyItems = useMemo(
    () => legacyScheduleItems(visibleRows),
    [visibleRows],
  );

  const visibleLinks = useMemo(
    () => linksForVisibleRows(data?.links ?? [], visibleRows),
    [data?.links, visibleRows],
  );

  const selectedSelection = selectedKey
    ? parseSelectionKeyId(selectedKey)
    : null;

  // Expand every group on first payload and when snapshot/dataset identity changes.
  // Do not reset on retry/hover/selected-work/ordinary re-render.
  useEffect(() => {
    if (!data?.items?.length) return;
    const seed = `${active}:${data.items.length}:${data.scenarioAsOfDate}`;
    if (expandSeedRef.current === seed) return;
    expandSeedRef.current = seed;
    setExpandedKeys(new Set(allScheduleGroupKeys(data.items)));
  }, [active, data]);

  // Deep-link: /schedule?focus=milestone:MS-… → existing selectionKey + scroll once.
  useEffect(() => {
    if (!data?.items?.length || !focusParam) return;
    if (focusAppliedRef.current === focusParam) return;

    const key = parseSelectionKeyId(focusParam);
    if (!key) {
      focusAppliedRef.current = focusParam;
      return;
    }

    const item = data.items.find(
      (row) => row.kind === key.kind && row.id === key.entityId,
    ) as ScheduleHierarchyItem | undefined;
    if (!item) {
      focusAppliedRef.current = focusParam;
      return;
    }

    // Ensure ancestors are expanded so virtualization/collapse cannot hide the row.
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      for (const groupKey of allScheduleGroupKeys(data.items)) {
        next.add(groupKey);
      }
      let parent = item.parentKey ?? null;
      const byKey = new Map(
        data.items.map((row) => [`${row.kind}:${row.id}`, row as ScheduleHierarchyItem]),
      );
      while (parent) {
        next.add(parent);
        const parentRow = byKey.get(parent);
        parent = parentRow?.parentKey ?? null;
      }
      return next;
    });

    // If ?project= would hide the target, drop it once (keep focus + snapshot).
    const itemProject =
      (item as { projectId?: string | null }).projectId ?? null;
    if (
      projectFilter &&
      itemProject &&
      projectFilter !== itemProject
    ) {
      const q = new URLSearchParams(searchParams.toString());
      q.delete('project');
      q.set('focus', focusParam);
      router.replace(`/schedule?${q.toString()}`, { scroll: false });
    }

    const date =
      (item as { forecastDate?: string | null }).forecastDate ||
      (item as { baselineDate?: string | null }).baselineDate ||
      null;
    if (date) {
      scrollAnchorRef.current.chartDateIso = date;
      scrollAnchorRef.current.rowKey = `${key.kind}:${key.entityId}`;
      // One-shot H center for focus; ordinary restore stays left-edge.
      scrollAnchorRef.current.centerChartDateOnce = true;
    }

    setSelectedKey(`${key.kind}:${key.entityId}`);
    focusAppliedRef.current = focusParam;
    focusScrollDoneRef.current = null;
  }, [data, focusParam, projectFilter, router, searchParams]);

  // After expand settles, reveal/center the focus row (once). Do not mark done
  // until a real scroll owner is available for the active presentation mode.
  useEffect(() => {
    if (!focusParam || focusAppliedRef.current !== focusParam) return;
    if (focusScrollDoneRef.current === focusParam) return;
    const key = parseSelectionKeyId(focusParam);
    if (!key) {
      focusScrollDoneRef.current = focusParam;
      return;
    }
    const rowKey = `${key.kind}:${key.entityId}`;
    const idx = visibleRows.findIndex((row) => row.key === rowKey);
    if (idx < 0) return; // wait until expand makes the row visible

    if (mode === 'split') {
      const owner = scrollOwnerRef.current;
      if (!owner || owner.clientHeight <= 0) return;
      const max = Math.max(0, owner.scrollHeight - owner.clientHeight);
      const sticky = owner.querySelector<HTMLElement>(
        '[data-schedule-sticky-scale], .ppc-schedule-chart-sticky-scale, [data-gantt-sticky-scale]',
      );
      const stickyH = sticky?.getBoundingClientRect().height ?? 0;
      const target = centeredOwnedScrollTop(
        idx,
        SCHEDULE_ROW_HEIGHT_PX,
        owner.clientHeight,
        max,
        stickyH,
      );
      owner.scrollTop = target;
      setOwnedScrollTop(target);
      scrollAnchorRef.current.verticalScrollTop = target;
      scrollAnchorRef.current.rowKey = rowKey;
      focusScrollDoneRef.current = focusParam;
      return;
    }

    if (mode === 'table') {
      const list = listPaneRef.current;
      const viewport =
        list?.querySelector<HTMLElement>('[data-schedule-viewport="true"]') ??
        list;
      if (!viewport || viewport.clientHeight <= 0) return;
      const max = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      const target = centeredOwnedScrollTop(
        idx,
        SCHEDULE_ROW_HEIGHT_PX,
        viewport.clientHeight,
        max,
      );
      viewport.scrollTop = target;
      scrollAnchorRef.current.verticalScrollTop = target;
      scrollAnchorRef.current.rowKey = rowKey;
      focusScrollDoneRef.current = focusParam;
      return;
    }

    if (mode === 'gantt') {
      const chart = chartPaneRef.current;
      if (!chart || chart.clientHeight <= 0) return;
      const max = Math.max(0, chart.scrollHeight - chart.clientHeight);
      const target = centeredOwnedScrollTop(
        idx,
        SCHEDULE_ROW_HEIGHT_PX,
        chart.clientHeight,
        max,
      );
      scrollAnchorRef.current.verticalScrollTop = target;
      scrollAnchorRef.current.rowKey = rowKey;
      // Vendor Y + one-shot H center applied on next syncData/restoreChartDate.
      restoreChartPaneScroll(chart, target, rowKey, 0);
      focusScrollDoneRef.current = focusParam;
      return;
    }
  }, [focusParam, visibleRows, mode]);

  const collapsedHiddenCount = useMemo(() => {
    if (!data) return 0;
    const filtered = data.items.filter((item) =>
      includeScheduleItem(item, filters, kindFilter, projectFilter),
    );
    const visibleIds = new Set(visibleRows.map((row) => row.key));
    // Rows present after filter but omitted solely because an ancestor is collapsed.
    return filtered.filter((item) => {
      const key = `${item.kind}:${item.id}`;
      if (visibleIds.has(key)) return false;
      if (item.kind === 'project_group' || item.kind === 'stage_group') {
        return !expandedKeys.has(key);
      }
      return true;
    }).length;
  }, [data, visibleRows, filters, kindFilter, expandedKeys, projectFilter]);

  const counters = useMemo(() => {
    if (!data) return [];
    const eq = data.items.filter((i) => i.kind === 'equipment_delivery').length;
    const kt = data.items.filter((i) => isControlPointMilestone(i)).length;
    const ms = data.items.filter(
      (i) => i.kind === 'milestone' && !isControlPointMilestone(i),
    ).length;
    const works = data.items.filter((i) => i.kind === 'work').length;
    const attn = data.items.filter(isScheduleAttention).length;
    const rows = [
      { label: 'Оборудование', value: eq },
      { label: 'Вехи', value: ms },
      ...(kt > 0 ? [{ label: 'КТ', value: kt }] : []),
      ...(works > 0 ? [{ label: 'Работы', value: works }] : []),
      { label: 'Внимание', value: attn },
    ];
    if (collapsedHiddenCount > 0) {
      rows.push({ label: 'Свёрнуто', value: collapsedHiddenCount });
    }
    return rows;
  }, [data, collapsedHiddenCount]);

  const hasWorks = useMemo(
    () => data?.items.some((item) => item.kind === 'work') ?? false,
    [data],
  );

  // Snapshot without works must not keep a stale «Работы» kind filter.
  useEffect(() => {
    if (!hasWorks && kindFilter === 'work') {
      setKindFilter('all');
    }
    if (!hasWorks && comparison !== 'baseline') setComparison('baseline');
  }, [hasWorks, kindFilter, comparison]);

  const anyFilter =
    filtersActive({ ...filters, type: 'all' }) || kindFilter !== 'all';

  const boardRows = useMemo(
    () => visibleRows.map(toBoardTreeRow),
    [visibleRows],
  );
  const ganttRows = useMemo(
    () => visibleRows.map(toGanttTreeRow),
    [visibleRows],
  );

  // Chart rows need a DOM selected marker (vendor gantt_selected alone is not
  // enough for the same fill as the React table). Re-apply after virtual re-entry.
  useEffect(() => {
    applyScheduleRowSelected(
      [listPaneRef.current, chartPaneRef.current, scrollOwnerRef.current],
      selectedKey,
    );
  }, [selectedKey, mode, boardRows, ganttRows, comparison, ownedScrollTop, active]);

  const rowWindow: ScheduleVirtualWindow | null = useMemo(() => {
    // Before the owner has a real clientHeight, mount the full list (tests / first paint).
    if (mode !== 'split' || ownedViewportHeight <= 0) return null;
    return computeScheduleVirtualWindow({
      scrollTop: ownedScrollTop,
      viewportHeight: ownedViewportHeight,
      rowCount: boardRows.length,
      rowHeight: SCHEDULE_ROW_HEIGHT_PX,
    });
  }, [mode, ownedScrollTop, ownedViewportHeight, boardRows.length]);

  const syncOwnedScrollMetrics = useCallback(() => {
    const owner = scrollOwnerRef.current;
    if (!owner) return;
    setOwnedScrollTop(owner.scrollTop);
    setOwnedViewportHeight(owner.clientHeight);
  }, []);

  useEffect(() => {
    if (mode !== 'split') return;
    const owner = scrollOwnerRef.current;
    if (!owner) return;
    const onScroll = () => {
      if (scrollSyncRafRef.current) return;
      scrollSyncRafRef.current = window.requestAnimationFrame(() => {
        scrollSyncRafRef.current = 0;
        syncOwnedScrollMetrics();
        rememberScroll();
      });
    };
    syncOwnedScrollMetrics();
    owner.addEventListener('scroll', onScroll, { passive: true });
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => syncOwnedScrollMetrics())
        : null;
    ro?.observe(owner);
    return () => {
      owner.removeEventListener('scroll', onScroll);
      ro?.disconnect();
      if (scrollSyncRafRef.current) {
        window.cancelAnimationFrame(scrollSyncRafRef.current);
        scrollSyncRafRef.current = 0;
      }
    };
  }, [mode, status, data, syncOwnedScrollMetrics]);

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
      </div>

      {status === 'loading' ? <RegisterLoading /> : null}
      {status === 'error' ? (
        <RegisterError message={error ?? ''} onRetry={retry} />
      ) : null}
      {status === 'idle' && data && data.items.length === 0 ? (
        <RegisterEmpty />
      ) : null}
      {status === 'idle' && data && data.items.length > 0 ? (
        <div
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden"
          data-schedule-workspace="true"
          data-schedule-selected={selectedKey ?? undefined}
          data-schedule-focus={focusParam ?? undefined}
          data-schedule-focus-applied={
            focusParam && focusAppliedRef.current === focusParam
              ? 'true'
              : undefined
          }
        >
          <div className="shrink-0 space-y-3">
            <RegisterSummary
              total={data.items.length}
              visible={visibleRows.length}
              counters={counters}
              foundLabel
            />
            <div
              className="flex flex-wrap items-end gap-x-4 gap-y-2"
              data-schedule-toolbar="true"
            >
              <div
                className="flex min-w-0 flex-1 flex-wrap items-end gap-2"
                data-schedule-toolbar-left="true"
              >
                <RegisterToolbar
                  filters={{ ...filters, type: 'all' }}
                  onChange={(next) => setFilters({ ...next, type: 'all' })}
                  onReset={resetAll}
                  showType={false}
                  showWorkstream
                  showReset={false}
                  compactSearch
                  layout="schedule"
                />
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
                    <option value="controlpoint">КТ</option>
                    {hasWorks ? <option value="work">Работы</option> : null}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={resetAll}
                  className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 text-sm text-[var(--text-secondary)] outline-none hover:bg-[var(--interactive)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  Сбросить фильтры
                </button>
              </div>
              <div
                className="ml-auto flex shrink-0 items-center justify-end gap-2"
                data-schedule-toolbar-right="true"
                data-schedule-toolbar-actions="true"
              >
                <ScheduleZoomToggle
                  levelIndex={zoomLevelIndex}
                  canZoomIn={canZoomIn(zoomLevelIndex)}
                  canZoomOut={canZoomOut(zoomLevelIndex)}
                  disabled={mode === 'table'}
                  onZoomIn={() =>
                    setZoomLevelIndex((z) =>
                      canZoomIn(z) ? z + 1 : z,
                    )
                  }
                  onZoomOut={() =>
                    setZoomLevelIndex((z) =>
                      canZoomOut(z) ? z - 1 : z,
                    )
                  }
                />
                {hasWorks ? (
                  <ScheduleComparisonToggle
                    mode={comparison}
                    onChange={changeComparison}
                  />
                ) : null}
                <ScheduleViewToggle mode={mode} onChange={changeMode} />
              </div>
            </div>
          </div>

          {visibleRows.length === 0 && anyFilter ? (
            <RegisterFilteredEmpty onReset={resetAll} />
          ) : mode === 'split' ? (
            <div
              data-schedule-presentation={mode}
              className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)]"
            >
              <div
                ref={scrollOwnerRef}
                data-schedule-scroll-owner="true"
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
                tabIndex={0}
                aria-label="Прокрутка календарного плана"
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  const el = event.currentTarget;
                  if (event.key === 'Home') {
                    event.preventDefault();
                    el.scrollTop = 0;
                  } else if (event.key === 'End') {
                    event.preventDefault();
                    el.scrollTop = el.scrollHeight;
                  }
                }}
              >
                <div ref={splitRowRef} className="flex min-w-0 flex-row items-start">
                  <div
                    ref={listPaneRef}
                    data-schedule-pane="table"
                    className="min-w-0 shrink-0"
                    style={{
                      width: listWidthPx ?? SPLIT_LIST_DEFAULT_WIDTH,
                      minWidth: `${SPLIT_LIST_MIN_PX / 16}rem`,
                      maxWidth: `${SPLIT_LIST_MAX_FRACTION * 100}%`,
                    }}
                    data-schedule-list-width={listWidthPx ?? undefined}
                  >
                    <ScheduleBoard
                      items={legacyItems}
                      mode="table"
                      treeRows={boardRows}
                      onToggleRow={toggleExpanded}
                      comparison={comparison}
                      verticalScrollOwned
                      embedded
                      rowWindow={rowWindow}
                      onHoverRow={publishHover}
                      selectedKeyId={selectedKey}
                      onSelectRow={setSelectedKey}
                    />
                  </div>
                  <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Ширина списка и диаграммы"
                    aria-valuemin={SPLIT_LIST_MIN_PX}
                    aria-valuenow={listWidthPx ?? undefined}
                    tabIndex={0}
                    data-schedule-split-divider="true"
                    data-dragging={splitDragging ? 'true' : undefined}
                    className="group relative z-20 w-px shrink-0 self-stretch cursor-col-resize touch-none bg-[var(--border)] outline-none"
                    onPointerDown={onSplitPointerDown}
                    onKeyDown={onSplitKeyDown}
                  >
                    {/* 10px transparent hit area centred on the 1px rule. */}
                    <span
                      className="absolute inset-y-0 left-1/2 w-[10px] -translate-x-1/2"
                      aria-hidden
                    />
                    {/* ~4px helper on hover / focus / drag. */}
                    <span
                      className={[
                        'pointer-events-none absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-[var(--status-info-border)] opacity-0 transition-opacity',
                        'group-hover:opacity-40 group-focus-visible:opacity-40 group-data-[dragging=true]:opacity-40',
                      ].join(' ')}
                      aria-hidden
                      data-schedule-split-helper="true"
                    />
                  </div>
                  <div
                    ref={setChartPaneNode}
                    data-schedule-pane="chart"
                    data-schedule-chart-virtual="true"
                    className="sticky top-0 min-w-0 flex-1 self-start"
                    style={{
                      height:
                        ownedViewportHeight > 0
                          ? ownedViewportHeight
                          : undefined,
                    }}
                  >
                    <ScheduleTimeline
                      items={legacyItems}
                      links={visibleLinks}
                      treeRows={ganttRows}
                      comparison={comparison}
                      selected={selectedSelection}
                      onSelect={onTimelineSelect}
                      scrollAnchor={scrollAnchorRef.current}
                      verticalScrollOwned
                      embedded
                      ownedScrollTop={ownedScrollTop}
                      onHoverRow={publishHover}
                      zoomLevelIndex={zoomLevelIndex}
                      onZoomLevelChange={setZoomLevelIndex}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              data-schedule-presentation={mode}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              {mode === 'gantt' ? null : (
                <div
                  ref={listPaneRef}
                  data-schedule-pane="table"
                  className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                >
                  <ScheduleBoard
                    items={legacyItems}
                    mode="table"
                    treeRows={boardRows}
                    onToggleRow={toggleExpanded}
                    comparison={comparison}
                    onHoverRow={publishHover}
                    selectedKeyId={selectedKey}
                    onSelectRow={setSelectedKey}
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
                    onHoverRow={publishHover}
                    zoomLevelIndex={zoomLevelIndex}
                    onZoomLevelChange={setZoomLevelIndex}
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
