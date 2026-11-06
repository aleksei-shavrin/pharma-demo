'use client';

import { useEffect, useRef } from 'react';
import type { ScheduleItem, ScheduleLink } from '@/lib/api-client';
import {
  SCHEDULE_HEADER_HEIGHT_PX,
  SCHEDULE_ROW_HEIGHT_PX,
} from '@/lib/schedule/schedule-geometry';
import {
  isoFromDate,
  type ScheduleScrollAnchor,
} from '@/lib/schedule/schedule-scroll-anchor';
import type { ScheduleSelectionKey } from '@/lib/schedule/selection-key';
import { selectionKeyEquals } from '@/lib/schedule/selection-key';
import type { ScheduleComparisonMode } from '@/lib/schedule/schedule-comparison';
import {
  GANTT_LINK_TYPE_CODE,
  computeTimelineVisibleRange,
  logicalPresentationId,
  presentationIdToSelectionKey,
  CROSS_PROJECT_PREDECESSOR_CAPTION,
  toGanttPresentation,
  workBarTooltip,
  type GanttTreeRow,
} from '@/lib/schedule/to-gantt-presentation';
import type { ThemeMode } from '@/lib/theme/theme-state';
import { paintBaselineOverlay, type BaselinePaintTask } from './baseline-overlay';
import {
  copyScrollTop,
  GANTT_VERTICAL_SCROLL_SELECTOR,
} from '@/lib/schedule/bind-schedule-pane-scroll';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import './dhtmlx-gantt-adapter.css';

/** Runtime task shape after parse — vendor Task + our presentation fields. */
type GanttTask = {
  id: string | number;
  css?: string;
  baselineDate?: string;
  showBaselineGhost?: boolean;
  baselineStart?: string | null;
  baselineEnd?: string | null;
  /** Fact dates — tooltip only when fact captions are not painted on the chart. */
  factCaption?: string;
  text?: string;
  type?: string;
  barCaption?: string;
  progress?: number;
  start_date?: Date | string;
  end_date?: Date | string;
};

type GanttStatic = {
  license: string;
  config: Record<string, unknown>;
  templates: Record<string, unknown>;
  i18n: { setLocale: (code: string) => void };
  init: (el: HTMLElement | string) => void;
  clearAll: () => void;
  parse: (data: unknown) => void;
  render: () => void;
  destructor: () => void;
  attachEvent: (
    name: string,
    handler: (...args: unknown[]) => unknown,
  ) => string | number;
  detachEvent: (id: string | number) => void;
  selectTask: (id: string | number) => void;
  unselectTask: (id?: string | number) => void;
  getSelectedId: () => string | number | null;
  getTaskRowNode: (id: string | number) => HTMLElement | null;
  getTaskNode: (id: string | number) => HTMLElement | null;
  getTask: (id: string | number) => GanttTask;
  eachTask: (cb: (task: GanttTask) => void) => void;
  posFromDate: (date: Date) => number;
  dateFromPos?: (x: number) => Date;
  getScrollState?: () => { x: number; y: number };
  scrollTo?: (x: number, y?: number) => void;
  setSizes?: () => void;
  getTaskPosition: (
    task: GanttTask,
    start?: Date,
    end?: Date,
  ) => { left: number; top: number; width: number; height: number };
  $task_data?: HTMLElement;
  $root?: HTMLElement;
};

type Props = {
  items: ScheduleItem[];
  links?: ScheduleLink[];
  /**
   * Visible rows in display order. Omit for the flat control-point/work list.
   * The app table owns expand; this chart does not store it in `gantt.open`.
   */
  treeRows?: readonly GanttTreeRow[];
  comparison?: ScheduleComparisonMode;
  theme: ThemeMode;
  selected: ScheduleSelectionKey | null;
  onSelect: (key: ScheduleSelectionKey | null) => void;
  /** Mutable view-owned anchor. The chart writes the left-edge date and reads it after parse. */
  scrollAnchor?: ScheduleScrollAnchor;
};

const BASELINE_LAYER_CLASS = 'ppc-baseline-layer';
const FACT_CAPTION_LAYER_CLASS = 'ppc-fact-caption-layer';
const EMPTY_LINKS: ScheduleLink[] = [];

/**
 * Sole FE module allowed to import `dhtmlx-gantt` (ADR-0004).
 * Baseline ghosts: project overlay via Community posFromDate (not PRO addTaskLayer).
 */
export function DhtmlxGanttAdapter({
  items,
  links = EMPTY_LINKS,
  treeRows,
  comparison = 'forecast',
  theme,
  selected,
  onSelect,
  scrollAnchor,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const ganttRef = useRef<GanttStatic | null>(null);
  const readyRef = useRef(false);
  const scrollAnchorRef = useRef(scrollAnchor);
  const suspendScrollRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  scrollAnchorRef.current = scrollAnchor;
  const onSelectRef = useRef(onSelect);
  const itemsRef = useRef(items);
  const linksRef = useRef(links);
  const treeRowsRef = useRef(treeRows);
  const comparisonRef = useRef(comparison);
  const selectedRef = useRef(selected);
  onSelectRef.current = onSelect;
  itemsRef.current = items;
  linksRef.current = links;
  treeRowsRef.current = treeRows;
  comparisonRef.current = comparison;
  selectedRef.current = selected;
  const eventIdsRef = useRef<Array<string | number>>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;

    void (async () => {
      const mod = await import('dhtmlx-gantt');
      if (cancelled || !hostRef.current) return;

      const { Gantt } = mod as unknown as {
        Gantt: { getGanttInstance: () => GanttStatic };
      };
      const gantt = Gantt.getGanttInstance();
      if (gantt.license !== 'mit') {
        throw new Error(
          `Expected dhtmlx-gantt MIT Community, got license=${gantt.license}`,
        );
      }
      if (typeof (gantt as { addTaskLayer?: unknown }).addTaskLayer === 'function') {
        throw new Error('Unexpected PRO addTaskLayer on Community build');
      }

      gantt.i18n.setLocale('ru');
      gantt.config.date_format = '%Y-%m-%d';
      gantt.config.readonly = true;
      gantt.config.drag_move = false;
      gantt.config.drag_resize = false;
      gantt.config.drag_progress = false;
      gantt.config.drag_links = false;
      gantt.config.details_on_dblclick = false;
      gantt.config.select_task = true;
      gantt.config.show_links = true;
      gantt.config.links = {
        finish_to_start: GANTT_LINK_TYPE_CODE.FS,
        start_to_start: GANTT_LINK_TYPE_CODE.SS,
        finish_to_finish: GANTT_LINK_TYPE_CODE.FF,
        start_to_finish: GANTT_LINK_TYPE_CODE.SF,
      };
      gantt.config.fit_tasks = false;
      // v10: scales[] owns the header (legacy scale_unit is ignored).
      // Month-only fits May→Oct at desktop width without day/week noise.
      gantt.config.scales = [{ unit: 'month', step: 1, format: '%F %Y' }];
      // Narrow enough that Split (~45% pane) still fits May→Oct without H-scroll.
      gantt.config.min_column_width = 48;
      gantt.config.scale_height = SCHEDULE_HEADER_HEIGHT_PX;
      gantt.config.row_height = SCHEDULE_ROW_HEIGHT_PX;
      /** Work bar geometry; summary rows use `.ppc-summary` height in CSS. */
      gantt.config.bar_height = 8;
      gantt.config.link_line_width = 1.5;
      gantt.config.link_wrapper_width = 12;
      gantt.config.link_arrow_size = 8;
      gantt.config.smart_rendering = false;
      gantt.config.columns = [
        {
          name: 'text',
          label: 'Объект',
          tree: false,
          width: 110,
          resize: true,
        },
      ];
      // Flat mode keeps the name column. Hierarchical mode hides it in syncData.
      gantt.config.show_grid = true;
      gantt.config.sort = false;
      gantt.config.auto_types = false;
      gantt.config.open_tree_initially = false;
      gantt.templates.task_class = (
        _start: unknown,
        _end: unknown,
        task: { css?: string },
      ) => task.css ?? '';
      gantt.templates.task_text = () => '';

      const clickId = gantt.attachEvent('onTaskClick', (id: unknown) => {
        const key = presentationIdToSelectionKey(String(id));
        if (key) onSelectRef.current(key);
        return true;
      });
      const emptyId = gantt.attachEvent('onEmptyClick', () => {
        onSelectRef.current(null);
        return true;
      });
      const renderId = gantt.attachEvent('onGanttRender', () => {
        paintBaselineOverlays(gantt, (key) => onSelectRef.current(key));
        paintWorkBaselineBars(gantt);
        paintFactCaptions(gantt);
        paintCrossProjectCaptions(gantt, linksRef.current);
        paintWorkBarTitles(gantt);
        reapplyTaskPaneScroll(gantt);
      });
      const scrollId = gantt.attachEvent('onGanttScroll', (left: unknown) => {
        if (suspendScrollRef.current) return true;
        const anchor = scrollAnchorRef.current;
        if (!anchor || typeof gantt.dateFromPos !== 'function') return true;
        const date = gantt.dateFromPos(Number(left));
        if (date instanceof Date && !Number.isNaN(date.getTime())) {
          anchor.chartDateIso = isoFromDate(date);
        }
        return true;
      });
      eventIdsRef.current = [clickId, emptyId, renderId, scrollId];

      gantt.init(hostRef.current);
      ganttRef.current = gantt;
      readyRef.current = true;
      const observed = hostRef.current;
      const resize = new ResizeObserver(() => {
        ganttRef.current?.setSizes?.();
      });
      resize.observe(observed);
      resizeObserverRef.current = resize;
      syncData(
        gantt,
        itemsRef.current,
        linksRef.current,
        selectedRef.current,
        treeRowsRef.current,
        comparisonRef.current,
        scrollAnchorRef.current,
        suspendScrollRef,
      );
    })();

    return () => {
      cancelled = true;
      readyRef.current = false;
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      const g = ganttRef.current;
      if (g) {
        for (const eid of eventIdsRef.current) {
          try {
            g.detachEvent(eid);
          } catch {
            /* ignore */
          }
        }
        eventIdsRef.current = [];
        clearBaselineOverlays(g);
        try {
          g.destructor();
        } catch {
          /* ignore */
        }
        ganttRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const g = ganttRef.current;
    if (!g || !readyRef.current) return;
    syncData(
      g,
      items,
      links,
      selected,
      treeRows,
      comparison,
      scrollAnchorRef.current,
      suspendScrollRef,
    );
  }, [items, links, selected, treeRows, comparison]);

  useEffect(() => {
    hostRef.current?.setAttribute('data-theme', theme);
    if (readyRef.current) ganttRef.current?.render();
  }, [theme]);

  return (
    <div
      ref={hostRef}
      className="ppc-gantt-host"
      data-theme={theme}
      data-gantt-adapter="dhtmlx-community"
      role="region"
      aria-label="Временная шкала контрольных точек"
    />
  );
}

function applyChartMode(
  gantt: GanttStatic,
  treeRows: readonly GanttTreeRow[] | undefined,
) {
  const hierarchical = treeRows != null;
  gantt.config.row_height = SCHEDULE_ROW_HEIGHT_PX;
  gantt.config.scale_height = SCHEDULE_HEADER_HEIGHT_PX;
  gantt.config.bar_height = 8;
  // App table owns columns and expand. Do not keep a gantt tree or grid.
  gantt.config.show_grid = !hierarchical;
  gantt.config.sort = false;
  gantt.config.auto_types = false;
  gantt.config.open_tree_initially = false;
  const columns = gantt.config.columns;
  if (Array.isArray(columns)) {
    for (const column of columns) {
      if (column && typeof column === 'object' && 'tree' in column) {
        (column as { tree: boolean }).tree = false;
      }
    }
  }
}

function syncData(
  gantt: GanttStatic,
  items: ScheduleItem[],
  links: ScheduleLink[],
  selected: ScheduleSelectionKey | null,
  treeRows: readonly GanttTreeRow[] | undefined,
  comparison: ScheduleComparisonMode,
  anchor: ScheduleScrollAnchor | undefined,
  suspend: { current: boolean },
) {
  suspend.current = true;
  applyChartMode(gantt, treeRows);
  const range = computeTimelineVisibleRange(
    items,
    treeRows?.flatMap((row) => [row.summaryStart, row.summaryEnd]),
    comparison,
  );
  gantt.config.start_date = parseIsoLocal(range.start);
  gantt.config.end_date = parseIsoLocal(range.end);
  gantt.clearAll();
  const presentation =
    treeRows != null
      ? toGanttPresentation(items, links, treeRows, { comparison })
      : toGanttPresentation(items, links, undefined, { comparison });
  gantt.parse({
    data: presentation.data,
    links: presentation.links.map((link) => ({
      id: link.id,
      source: link.source,
      target: link.target,
      // Scheduling links already carry a code. A predecessor without one
      // aims at the successor start. That code is not a planning type.
      type: link.type ?? GANTT_LINK_TYPE_CODE.FS,
    })),
  });
  // Fit-to-data stays the default until the view has a date anchor.
  // Baseline overlays refresh via onGanttRender after parse/render.
  applyExternalSelection(gantt, selected, anchor?.rowKey == null);
  restoreChartDate(
    gantt,
    anchor?.chartDateIso ?? null,
    anchor?.verticalScrollTop ?? 0,
  );
  reapplyTaskPaneScroll(gantt);
  window.setTimeout(() => {
    suspend.current = false;
  }, 0);
}

function restoreChartDate(
  gantt: GanttStatic,
  iso: string | null,
  verticalScrollTop: number,
) {
  if (!gantt.scrollTo || !gantt.getScrollState) return;
  const state = gantt.getScrollState();
  let x = state.x;
  if (iso) {
    const fromDate = gantt.posFromDate(parseIsoLocal(iso));
    if (Number.isFinite(fromDate)) x = Math.max(0, fromDate);
  }
  const y = Math.max(state.y, verticalScrollTop);
  gantt.scrollTo(x, y);
}

function reapplyTaskPaneScroll(gantt: GanttStatic): void {
  const data = gantt.$task_data;
  if (!data) return;
  const root = data.closest('.ppc-gantt-host') ?? data.ownerDocument;
  const scrollBar = root.querySelector<HTMLElement>(GANTT_VERTICAL_SCROLL_SELECTOR);
  if (!scrollBar) return;
  copyScrollTop(scrollBar, data);
}

function applyExternalSelection(
  gantt: GanttStatic,
  selected: ScheduleSelectionKey | null,
  scrollIntoView: boolean,
) {
  const currentId = gantt.getSelectedId();
  if (currentId != null) {
    const currentKey = presentationIdToSelectionKey(String(currentId));
    if (selectionKeyEquals(currentKey, selected)) {
      if (scrollIntoView) ensureRowVisibleVertically(gantt, String(currentId));
      return;
    }
    gantt.unselectTask(currentId);
  }
  if (!selected) return;
  const id = logicalPresentationId(selected);
  try {
    gantt.selectTask(id);
    if (scrollIntoView) ensureRowVisibleVertically(gantt, id);
  } catch {
    /* ignore race */
  }
}

/** Vertical only — must not horizontally scroll away from fit-to-data range. */
function ensureRowVisibleVertically(gantt: GanttStatic, id: string) {
  const node = gantt.getTaskRowNode(id);
  node?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

/** Full name and optional percent in native tooltip only — no text painted on the figure. */
function paintWorkBarTitles(gantt: GanttStatic) {
  gantt.eachTask((task) => {
    const node = gantt.getTaskNode(task.id);
    if (!node) return;
    const title = workBarTooltip({
      text: task.text,
      factCaption: task.factCaption,
      progress: task.progress,
      css: task.css,
      type: task.type,
    });
    if (title.length > 0) node.setAttribute('title', title);
    else node.removeAttribute('title');
    node.removeAttribute('data-progress-caption');
  });
}

function paintCrossProjectCaptions(
  gantt: GanttStatic,
  links: readonly ScheduleLink[],
) {
  const host = gantt.$task_data;
  if (!host) return;
  for (const link of links) {
    if (link.kind !== 'cross_project_predecessor') continue;
    const node =
      host.querySelector<HTMLElement>(`[data-link-id="${link.id}"]`) ??
      host.querySelector<HTMLElement>(`[link_id="${link.id}"]`);
    node?.setAttribute('aria-label', CROSS_PROJECT_PREDECESSOR_CAPTION);
    node?.setAttribute(
      'data-schedule-link-caption',
      CROSS_PROJECT_PREDECESSOR_CAPTION,
    );
  }
}

function paintFactCaptions(gantt: GanttStatic) {
  const host = gantt.$task_data;
  if (!host) return;
  /* Stage: no visible fact captions — dates stay on the row/grid; tooltips only on bars. */
  host.querySelector(`.${FACT_CAPTION_LAYER_CLASS}`)?.remove();
}

function paintWorkBaselineBars(gantt: GanttStatic) {
  const host = gantt.$task_data;
  if (!host) return;
  const rowHeight = Number(gantt.config.row_height) || SCHEDULE_ROW_HEIGHT_PX;
  const barHeight = Number(gantt.config.bar_height) || 26;
  const tasks: BaselinePaintTask[] = [];
  gantt.eachTask((task) => {
    if (task.type !== 'task') return;
    if (!task.baselineStart || !task.baselineEnd) return;
    const start = parseIsoLocal(task.baselineStart);
    const end = parseIsoLocal(task.baselineEnd);
    end.setDate(end.getDate() + 1);
    let rowPos: { top: number };
    let barPos: { left: number; width: number };
    try {
      rowPos = gantt.getTaskPosition(task);
      barPos = gantt.getTaskPosition(task, start, end);
    } catch {
      return;
    }
    tasks.push({
      taskId: String(task.id),
      forecastTop: rowPos.top,
      barHeight,
      rowHeight,
      baselineStart: task.baselineStart,
      baselineEnd: task.baselineEnd,
      left: barPos.left,
      width: barPos.width,
    });
  });
  paintBaselineOverlay(host, tasks);
}

function parseIsoLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function ensureOverlayRoot(gantt: GanttStatic): HTMLElement | null {
  const parent = gantt.$task_data;
  if (!parent) return null;
  let layer = parent.querySelector<HTMLElement>(`.${BASELINE_LAYER_CLASS}`);
  if (!layer) {
    layer = document.createElement('div');
    layer.className = BASELINE_LAYER_CLASS;
    layer.setAttribute('data-ppc-layer', 'baseline-ghost');
    parent.appendChild(layer);
  }
  return layer;
}

function clearBaselineOverlays(gantt: GanttStatic) {
  gantt.$task_data
    ?.querySelector(`.${BASELINE_LAYER_CLASS}`)
    ?.replaceChildren();
}

/**
 * Community-safe same-row baseline markers.
 * Uses posFromDate + getTaskPosition; not PRO addTaskLayer / not duration bars.
 */
function paintBaselineOverlays(
  gantt: GanttStatic,
  onSelect: (key: ScheduleSelectionKey | null) => void,
) {
  const layer = ensureOverlayRoot(gantt);
  if (!layer) return;
  layer.replaceChildren();

  gantt.eachTask((task) => {
    if (task.type !== 'milestone') return;
    if (!task.showBaselineGhost || !task.baselineDate) return;
    const baseline = parseIsoLocal(task.baselineDate);
    let rowPos: { top: number; height: number };
    try {
      // Top from the logical row; left from baseline date (same row, two points).
      rowPos = gantt.getTaskPosition(task);
    } catch {
      return;
    }
    const left = gantt.posFromDate(baseline);
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `ppc-baseline-marker ${task.css ?? ''}`.replace(
      'ppc-role-forecast',
      'ppc-role-baseline',
    );
    el.style.left = `${left}px`;
    el.style.top = `${rowPos.top + (rowPos.height || SCHEDULE_ROW_HEIGHT_PX) / 2}px`;
    el.setAttribute('aria-label', `Базовая дата ${task.baselineDate}`);
    el.dataset.taskId = String(task.id);
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const key = presentationIdToSelectionKey(String(task.id));
      if (key) onSelect(key);
    });
    layer.appendChild(el);
  });
}
