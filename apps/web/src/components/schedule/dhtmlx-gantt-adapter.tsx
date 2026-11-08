'use client';

import { useEffect, useRef } from 'react';
import type { ScheduleItem, ScheduleLink } from '@/lib/api-client';
import {
  SCHEDULE_HEADER_HEIGHT_PX,
  SCHEDULE_ROW_HEIGHT_PX,
} from '@/lib/schedule/schedule-geometry';
import { SCHEDULE_VIRTUAL_OVERSCAN_ROWS } from '@/lib/schedule/schedule-virtual-window';
import {
  applyHiddenVerScrollOwnerStyle,
  ensureVerScrollRange,
  ganttYScrollRangeHealthy,
  isGanttYDiagnosticsEnabled,
  readVerScrollMetrics,
  ySyncAligned,
} from '@/lib/schedule/schedule-gantt-y-sync';
import {
  applyFitHostBox,
  fitHostBoxNeedsUpdate,
  readGanttFitViewportBox,
  resolveGanttResizeObserveTarget,
} from '@/lib/schedule/schedule-gantt-viewport-fit';
import {
  SCHEDULE_GANTT_MIN_COLUMN_WIDTH_PX,
  scheduleMonthScaleEntry,
} from '@/lib/schedule/schedule-month-scale';
import {
  isoFromDate,
  type ScheduleScrollAnchor,
} from '@/lib/schedule/schedule-scroll-anchor';
import type { ScheduleSelectionKey } from '@/lib/schedule/selection-key';
import {
  selectionKeyEquals,
  selectionKeyId,
} from '@/lib/schedule/selection-key';
import type { ScheduleComparisonMode } from '@/lib/schedule/schedule-comparison';
import { shouldPaintComparisonGhosts } from '@/lib/schedule/schedule-overlay-policy';
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
import {
  extractGanttMonthScaleGeometry,
  publishGanttMonthScaleGeometry,
  type GanttScaleLike,
  SCHEDULE_CHART_HSCROLL_EVENT,
  SCHEDULE_CHART_HSCROLL_REQUEST,
} from '@/lib/schedule/gantt-month-scale-geometry';
import { resolveGanttHoverPresentationId } from '@/lib/schedule/gantt-hover-target';
import {
  bumpGanttPerf,
  isGanttPerfDiagnosticsEnabled,
  publishGanttPerfToWindow,
} from '@/lib/schedule/gantt-perf-diagnostics';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import './dhtmlx-gantt-adapter.css';

function instrumentGanttOps(gantt: GanttStatic): void {
  if (!isGanttPerfDiagnosticsEnabled()) return;
  publishGanttPerfToWindow();
  const wrap = <K extends 'parse' | 'clearAll' | 'render' | 'setSizes'>(
    key: K,
  ) => {
    const original = gantt[key];
    if (typeof original !== 'function') return;
    gantt[key] = ((...args: unknown[]) => {
      bumpGanttPerf(key);
      return (original as (...a: unknown[]) => unknown).apply(gantt, args);
    }) as GanttStatic[K];
  };
  wrap('parse');
  wrap('clearAll');
  wrap('render');
  wrap('setSizes');
}

/** Native H scrollbar thickness; keep Y gutter width 0 via CSS/enforceFitChrome. */
const GANTT_SCROLL_SIZE_PX = 15;

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
  /** Live scale (trace_x / left / width); source of truth for the sticky month header. */
  getScale?: () => GanttScaleLike | null | undefined;
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
  $container?: HTMLElement;
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
  /**
   * Parent owns Y: bounded host + smart_rendering; Y arrives via ownedScrollTop.
   * Keeps Community horizontal scroll; hides vendor vertical bar (not an input owner).
   */
  fitVerticalContent?: boolean;
  /** Programmatic vertical offset from the shared scroll owner (rAF). */
  ownedScrollTop?: number;
  hoveredRowKey?: string | null;
  onHoverRow?: (key: string | null) => void;
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
  fitVerticalContent = false,
  ownedScrollTop = 0,
  onHoverRow,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const ganttRef = useRef<GanttStatic | null>(null);
  const readyRef = useRef(false);
  const scrollAnchorRef = useRef(scrollAnchor);
  const suspendScrollRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const onHoverRowRef = useRef(onHoverRow);
  scrollAnchorRef.current = scrollAnchor;
  onHoverRowRef.current = onHoverRow;
  const onSelectRef = useRef(onSelect);
  const itemsRef = useRef(items);
  const linksRef = useRef(links);
  const treeRowsRef = useRef(treeRows);
  const comparisonRef = useRef(comparison);
  const selectedRef = useRef(selected);
  const fitVerticalRef = useRef(fitVerticalContent);
  const ownedScrollTopRef = useRef(ownedScrollTop);
  onSelectRef.current = onSelect;
  itemsRef.current = items;
  linksRef.current = links;
  treeRowsRef.current = treeRows;
  comparisonRef.current = comparison;
  selectedRef.current = selected;
  fitVerticalRef.current = fitVerticalContent;
  ownedScrollTopRef.current = ownedScrollTop;
  const eventIdsRef = useRef<Array<string | number>>([]);
  const scheduleOverlaysRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let overlayRaf = 0;

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
      instrumentGanttOps(gantt);

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
      // Short RU month + yy; full caption in title. Floor = SCHEDULE_MONTH_COL_PX.
      gantt.config.scales = [scheduleMonthScaleEntry()];
      gantt.config.min_column_width = SCHEDULE_GANTT_MIN_COLUMN_WIDTH_PX;
      // Fit mode: month labels live in ScheduleChartStickyScale (outside vendor overflow).
      gantt.config.scale_height = fitVerticalRef.current
        ? 0
        : SCHEDULE_HEADER_HEIGHT_PX;
      gantt.config.row_height = SCHEDULE_ROW_HEIGHT_PX;
      /** Work bar geometry; summary rows use `.ppc-summary` height in CSS. */
      gantt.config.bar_height = 8;
      gantt.config.link_line_width = 1.5;
      gantt.config.link_wrapper_width = 12;
      gantt.config.link_arrow_size = 8;
      gantt.config.smart_rendering = Boolean(fitVerticalRef.current);
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
      const scheduleOverlays = () => {
        if (overlayRaf) window.cancelAnimationFrame(overlayRaf);
        // Double rAF: smart_rendering mutates the window on scroll before paint.
        overlayRaf = window.requestAnimationFrame(() => {
          overlayRaf = window.requestAnimationFrame(() => {
            overlayRaf = 0;
            bumpGanttPerf('overlayPasses');
            paintVisibleOverlays(
              gantt,
              comparisonRef.current,
              (key) => onSelectRef.current(key),
              linksRef.current,
            );
          });
        });
      };
      scheduleOverlaysRef.current = scheduleOverlays;
      const renderId = gantt.attachEvent('onGanttRender', () => {
        bumpGanttPerf('onGanttRender');
        scheduleOverlays();
        if (!fitVerticalRef.current) {
          reapplyTaskPaneScroll(gantt);
        } else {
          // Do not call setSizes here — it re-enters onGanttRender.
          const fitHost =
            (gantt.$root ?? gantt.$container ?? gantt.$task_data)?.closest?.(
              '.ppc-gantt-host',
            ) as HTMLElement | null | undefined;
          if (fitHost) enforceFitChrome(gantt, fitHost);
        }
      });
      const scrollId = gantt.attachEvent('onGanttScroll', (left: unknown) => {
        if (suspendScrollRef.current) return true;
        const anchor = scrollAnchorRef.current;
        if (anchor && typeof gantt.dateFromPos === 'function') {
          const date = gantt.dateFromPos(Number(left));
          if (date instanceof Date && !Number.isNaN(date.getTime())) {
            anchor.chartDateIso = isoFromDate(date);
          }
        }
        if (fitVerticalRef.current) {
          publishChartHScroll(host, Number(left) || 0);
        }
        // smart_rendering reuses the window without onGanttRender — refresh overlays.
        scheduleOverlays();
        return true;
      });
      eventIdsRef.current = [clickId, emptyId, renderId, scrollId];

      gantt.init(hostRef.current);
      ganttRef.current = gantt;
      readyRef.current = true;
      // Host gets fixed height from fitHostToViewport — observe the parent
      // viewport box that actually changes on window/owner resize.
      const observed = resolveGanttResizeObserveTarget(hostRef.current);
      const resize = new ResizeObserver(() => {
        const g = ganttRef.current;
        if (!g) return;
        if (fitVerticalRef.current) {
          const changed = fitHostToViewport(g);
          if (changed) {
            syncOwnedVerticalScroll(g, ownedScrollTopRef.current);
          }
        } else {
          g.setSizes?.();
        }
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
        fitVerticalRef.current,
      );
    })();

    return () => {
      cancelled = true;
      readyRef.current = false;
      scheduleOverlaysRef.current = null;
      if (overlayRaf) {
        window.cancelAnimationFrame(overlayRaf);
        overlayRaf = 0;
      }
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      tearDownFitHScrollBinding(host);
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
      selectedRef.current,
      treeRows,
      comparison,
      scrollAnchorRef.current,
      suspendScrollRef,
      fitVerticalContent,
    );
    // Selection is applied inside syncData once; later selection changes use
    // a dedicated effect without clearAll/parse.
  }, [items, links, treeRows, comparison, fitVerticalContent]);

  useEffect(() => {
    const g = ganttRef.current;
    if (!g || !readyRef.current) return;
    applyExternalSelection(g, selected, !fitVerticalContent);
  }, [selected, fitVerticalContent]);

  useEffect(() => {
    const g = ganttRef.current;
    if (!g || !readyRef.current || !fitVerticalContent) return;
    syncOwnedVerticalScroll(g, ownedScrollTop);
    scheduleOverlaysRef.current?.();
  }, [ownedScrollTop, fitVerticalContent]);

  useEffect(() => {
    hostRef.current?.setAttribute('data-theme', theme);
    if (readyRef.current) ganttRef.current?.render();
  }, [theme]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let lastKey: string | null = null;
    let raf = 0;
    const onMove = (event: MouseEvent) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const taskId = resolveGanttHoverPresentationId(
          event.target,
          host,
          event.clientY,
        );
        const key = taskId
          ? (() => {
              const sk = presentationIdToSelectionKey(taskId);
              return sk ? selectionKeyId(sk) : null;
            })()
          : null;
        if (key === lastKey) return;
        lastKey = key;
        applyHoveredRow(host, key);
        onHoverRowRef.current?.(key);
      });
    };
    const onLeave = () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      lastKey = null;
      applyHoveredRow(host, null);
      onHoverRowRef.current?.(null);
    };
    host.addEventListener('mousemove', onMove);
    host.addEventListener('mouseleave', onLeave);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      host.removeEventListener('mousemove', onMove);
      host.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="ppc-gantt-host"
      data-theme={theme}
      data-gantt-adapter="dhtmlx-community"
      data-gantt-fit-vertical={fitVerticalContent ? 'true' : undefined}
      data-gantt-smart-rendering={fitVerticalContent ? 'true' : undefined}
      data-gantt-owned-scroll-top={
        fitVerticalContent ? String(Math.round(ownedScrollTop)) : undefined
      }
      role="region"
      aria-label="Временная шкала контрольных точек"
    />
  );
}

function applyHoveredRow(host: HTMLElement, hoveredRowKey: string | null) {
  const rows = host.querySelectorAll<HTMLElement>('.gantt_task_row');
  for (const row of rows) {
    const taskId = row.getAttribute('task_id') ?? row.getAttribute('data-task-id');
    const key = taskId ? presentationIdToSelectionKey(taskId) : null;
    const rowKey = key ? selectionKeyId(key) : null;
    if (rowKey && hoveredRowKey === rowKey) {
      row.setAttribute('data-schedule-row-hover', 'true');
    } else {
      row.removeAttribute('data-schedule-row-hover');
    }
  }
}

function applyChartMode(
  gantt: GanttStatic,
  treeRows: readonly GanttTreeRow[] | undefined,
  fitVerticalContent = false,
) {
  const hierarchical = treeRows != null;
  gantt.config.row_height = SCHEDULE_ROW_HEIGHT_PX;
  // External sticky scale owns month labels when the outer Y owner is active.
  gantt.config.scale_height = fitVerticalContent ? 0 : SCHEDULE_HEADER_HEIGHT_PX;
  gantt.config.smart_rendering = Boolean(fitVerticalContent);
  // Keep scroll_size for native H track height; ver gutter reclaimed in enforceFitChrome.
  gantt.config.scroll_size = GANTT_SCROLL_SIZE_PX;
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

function markChartHorScroll(gantt: GanttStatic): void {
  const from =
    gantt.$root ?? gantt.$container ?? gantt.$task_data ?? undefined;
  const host = from?.closest?.('.ppc-gantt-host') as HTMLElement | null | undefined;
  const hor = host?.querySelector<HTMLElement>('.gantt_hor_scroll');
  if (!hor) return;
  hor.setAttribute('data-schedule-chart-hor-scroll', 'true');
}

function publishChartHScroll(host: HTMLElement | null, x: number): void {
  if (!host) return;
  host.setAttribute('data-schedule-chart-scroll-x', String(x));
  host.dispatchEvent(
    new CustomEvent(SCHEDULE_CHART_HSCROLL_EVENT, {
      bubbles: true,
      detail: { x },
    }),
  );
}

function publishFitScaleGeometry(gantt: GanttStatic): void {
  const from =
    gantt.$root ?? gantt.$container ?? gantt.$task_data ?? undefined;
  const host = from?.closest?.('.ppc-gantt-host') as HTMLElement | null | undefined;
  if (!host) return;
  const geometry = extractGanttMonthScaleGeometry(gantt);
  if (!geometry) return;
  // Geometry comes from gantt.getScale() (posFromDate only if missing) — never scrollWidth heuristics.
  publishGanttMonthScaleGeometry(host, geometry);
  const hor = host.querySelector<HTMLElement>('.gantt_hor_scroll');
  if (hor) {
    host.setAttribute(
      'data-schedule-chart-hor-max',
      String(Math.max(0, hor.scrollWidth - hor.clientWidth)),
    );
    host.setAttribute(
      'data-schedule-chart-hor-scroll-width',
      String(hor.scrollWidth),
    );
    host.setAttribute(
      'data-schedule-chart-hor-client-width',
      String(hor.clientWidth),
    );
  }
}

type FitHScrollBinding = {
  onRequest: (event: Event) => void;
  onHorScroll: () => void;
  hor: HTMLElement | null;
};

const fitHScrollBindings = new WeakMap<HTMLElement, FitHScrollBinding>();

function ensureFitHScrollBinding(gantt: GanttStatic, host: HTMLElement): void {
  if (fitHScrollBindings.has(host)) return;
  const hor = host.querySelector<HTMLElement>('.gantt_hor_scroll');
  const onRequest = (event: Event) => {
    const x = Number((event as CustomEvent<{ x: number }>).detail?.x);
    if (!Number.isFinite(x) || !gantt.scrollTo) return;
    const y = gantt.getScrollState?.()?.y ?? 0;
    gantt.scrollTo(x, y);
  };
  const onHorScroll = () => {
    const x = hor?.scrollLeft ?? gantt.getScrollState?.()?.x ?? 0;
    publishChartHScroll(host, x);
  };
  host.addEventListener(SCHEDULE_CHART_HSCROLL_REQUEST, onRequest);
  hor?.addEventListener('scroll', onHorScroll, { passive: true });
  fitHScrollBindings.set(host, { onRequest, onHorScroll, hor });
  markChartHorScroll(gantt);
}

function tearDownFitHScrollBinding(host: HTMLElement | null): void {
  if (!host) return;
  const binding = fitHScrollBindings.get(host);
  if (!binding) return;
  host.removeEventListener(SCHEDULE_CHART_HSCROLL_REQUEST, binding.onRequest);
  binding.hor?.removeEventListener('scroll', binding.onHorScroll);
  fitHScrollBindings.delete(host);
}

/**
 * Fit chrome under outer Y owner.
 * Virtual/smart mode: keep `.gantt_ver_scroll` in layout (scroll range) but
 * not as input owner — `display:none` made nativeYMax=0 and froze the chart.
 */
function enforceFitChrome(gantt: GanttStatic, host: HTMLElement): void {
  gantt.config.scroll_size = GANTT_SCROLL_SIZE_PX;
  const virtualY = Boolean(gantt.config.smart_rendering);
  for (const el of host.querySelectorAll<HTMLElement>(
    '.scrollVer_cell, .gantt_ver_scroll',
  )) {
    if (virtualY) {
      applyHiddenVerScrollOwnerStyle(el);
    } else {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('width', '0', 'important');
      el.style.setProperty('min-width', '0', 'important');
      el.style.setProperty('max-width', '0', 'important');
    }
  }
  // Vendor still paints timeline as (parent − scroll_size) after collapsing ver cell.
  const layoutX = host.querySelector<HTMLElement>('.gantt_layout_x');
  const fillW = layoutX?.clientWidth ?? host.clientWidth;
  for (const el of host.querySelectorAll<HTMLElement>(
    '.timeline_cell, .timeline_cell > .gantt_layout_content, .gantt_task, .gantt_data_area, .gantt_task_bg',
  )) {
    el.style.setProperty('width', `${fillW}px`, 'important');
    // X hidden; Y stays scrollable for linked smart_rendering when virtual.
    if (virtualY) {
      el.style.setProperty('overflow-x', 'hidden', 'important');
      el.style.setProperty('overflow-y', 'hidden', 'important');
    } else {
      el.style.setProperty('overflow', 'hidden', 'important');
    }
  }
  // Explicitly zero residual right layout cells that are not H / ver scroll.
  for (const el of host.querySelectorAll<HTMLElement>(
    '.gantt_layout_x > .gantt_layout_cell',
  )) {
    if (
      el.classList.contains('timeline_cell') ||
      el.classList.contains('scrollHor_cell')
    ) {
      continue;
    }
    if (
      el.classList.contains('scrollVer_cell') ||
      el.classList.contains('gantt_ver_scroll')
    ) {
      if (virtualY) applyHiddenVerScrollOwnerStyle(el);
      else {
        el.style.setProperty('width', '0', 'important');
        el.style.setProperty('min-width', '0', 'important');
        el.style.setProperty('max-width', '0', 'important');
        el.style.setProperty('display', 'none', 'important');
      }
      continue;
    }
    if (el.childElementCount === 0) {
      el.style.setProperty('width', '0', 'important');
      el.style.setProperty('min-width', '0', 'important');
      el.style.setProperty('max-width', '0', 'important');
      el.style.setProperty('display', 'none', 'important');
    }
  }
  // Native H scrollbar must stay usable at the sticky bottom of the Y owner.
  for (const el of host.querySelectorAll<HTMLElement>(
    '.scrollHor_cell, .gantt_hor_scroll',
  )) {
    el.style.removeProperty('display');
    el.style.setProperty('height', `${GANTT_SCROLL_SIZE_PX}px`, 'important');
    el.style.setProperty('min-height', `${GANTT_SCROLL_SIZE_PX}px`, 'important');
    el.style.setProperty('max-height', `${GANTT_SCROLL_SIZE_PX}px`, 'important');
  }
  const hor = host.querySelector<HTMLElement>('.gantt_hor_scroll');
  if (hor) {
    hor.style.setProperty('overflow-x', 'auto', 'important');
    hor.style.setProperty('overflow-y', 'hidden', 'important');
    hor.style.setProperty('width', '100%', 'important');
  }
  markChartHorScroll(gantt);
  publishFitScaleGeometry(gantt);
  publishVendorScaleDebug(gantt, host);
  ensureFitHScrollBinding(gantt, host);
  publishNativeYDiagnostics(gantt, host, 0);
}

let fitHostToViewportGuard = false;

/**
 * Bounded host height for smart_rendering under an outer Y owner.
 * Matches parent viewport.clientHeight (no extra header/H-bar subtraction).
 * Idempotent: skips setSizes when the host box already matches.
 * @returns true when sizes were reapplied (caller should restore owned Y).
 */
function fitHostToViewport(gantt: GanttStatic): boolean {
  if (fitHostToViewportGuard) return false;
  const from =
    gantt.$root ?? gantt.$container ?? gantt.$task_data ?? undefined;
  const host = from?.closest?.('.ppc-gantt-host') as HTMLElement | null | undefined;
  if (!host) return false;
  const { height, width } = readGanttFitViewportBox(host);
  if (!fitHostBoxNeedsUpdate(host, height, width)) {
    // Still refresh ver rail if row count / chrome drifted without a box change.
    const rowCount = Number(host.getAttribute('data-gantt-logical-rows') || 0);
    const ver = host.querySelector<HTMLElement>('.gantt_ver_scroll');
    if (ver && rowCount > 0) {
      ensureVerScrollRange(ver, rowCount, height);
    }
    return false;
  }
  applyFitHostBox(host, height, width);
  gantt.config.smart_rendering = true;
  gantt.config.scroll_size = GANTT_SCROLL_SIZE_PX;
  fitHostToViewportGuard = true;
  try {
    gantt.setSizes?.();
    enforceFitChrome(gantt, host);
    const rowCount = Number(host.getAttribute('data-gantt-logical-rows') || 0);
    const ver = host.querySelector<HTMLElement>('.gantt_ver_scroll');
    if (ver && rowCount > 0) {
      ensureVerScrollRange(ver, rowCount, height);
    }
  } finally {
    fitHostToViewportGuard = false;
  }
  return true;
}

function syncOwnedVerticalScroll(gantt: GanttStatic, scrollTop: number): void {
  if (!gantt.scrollTo || !gantt.getScrollState) return;
  const host =
    (gantt.$root ?? gantt.$container)?.closest?.('.ppc-gantt-host') ??
    gantt.$task_data?.closest?.('.ppc-gantt-host');
  const y = Math.max(0, Math.round(scrollTop));
  const state = gantt.getScrollState();
  const ver =
    host instanceof HTMLElement
      ? host.querySelector<HTMLElement>('.gantt_ver_scroll')
      : null;
  // Drive vendor scrollY view first (public scrollTo clamps to ver.scrollTop).
  if (ver) {
    applyHiddenVerScrollOwnerStyle(ver);
    if (Math.abs(ver.scrollTop - y) >= 1) ver.scrollTop = y;
  }
  if (!ySyncAligned(y, state.y ?? 0, 1)) {
    gantt.scrollTo(state.x ?? 0, y);
  }
  // Timeline mirror: Community scrollTo also writes $task_data.scrollTop.
  if (gantt.$task_data && Math.abs((gantt.$task_data.scrollTop || 0) - y) >= 1) {
    gantt.$task_data.scrollTop = y;
  }
  if (host instanceof HTMLElement) {
    publishNativeYDiagnostics(gantt, host, y);
  }
}

function publishNativeYDiagnostics(
  gantt: GanttStatic,
  host: HTMLElement,
  requestedY: number,
): void {
  // Minimal correctness attrs always (cheap).
  const state = gantt.getScrollState?.() ?? { x: 0, y: 0 };
  const ver = host.querySelector<HTMLElement>('.gantt_ver_scroll');
  const verMetrics = readVerScrollMetrics(ver);
  const nativeY = state.y ?? verMetrics.scrollTop;
  const nativeYMax = verMetrics.max;
  host.setAttribute('data-gantt-native-y', String(Math.round(nativeY)));
  host.setAttribute('data-gantt-native-ymax', String(Math.round(nativeYMax)));
  host.setAttribute(
    'data-gantt-y-aligned',
    ySyncAligned(requestedY, nativeY) ? 'true' : 'false',
  );
  if (!isGanttYDiagnosticsEnabled()) return;
  // Heavy probe only behind query/window flag.
  const rowCount = Number(host.getAttribute('data-gantt-logical-rows') || 0);
  const visibleIds: string[] = [];
  host.querySelectorAll<HTMLElement>('.gantt_task_row').forEach((row) => {
    const id =
      row.getAttribute('task_id') ?? row.getAttribute('data-task-id') ?? '';
    if (id) visibleIds.push(id);
  });
  host.setAttribute('data-gantt-requested-y', String(Math.round(requestedY)));
  host.setAttribute(
    'data-gantt-y-range-ok',
    ganttYScrollRangeHealthy({
      nativeYMax,
      rowCount,
      viewportHeight: host.clientHeight,
    })
      ? 'true'
      : 'false',
  );
  host.setAttribute(
    'data-gantt-visible-ids',
    visibleIds.slice(0, 24).join('|'),
  );
}

function overlayVisibleBand(gantt: GanttStatic): { top: number; bottom: number } {
  const host =
    (gantt.$root ?? gantt.$container)?.closest?.('.ppc-gantt-host') ??
    gantt.$task_data?.closest?.('.ppc-gantt-host');
  const height =
    (host instanceof HTMLElement ? host.clientHeight : 0) ||
    SCHEDULE_ROW_HEIGHT_PX * 24;
  const pad = SCHEDULE_ROW_HEIGHT_PX * SCHEDULE_VIRTUAL_OVERSCAN_ROWS;
  // smart_rendering: getTaskPosition().top is in the painted window (≈0…viewport),
  // not content-absolute. Absolute band (scrollY±…) culls every visible task.
  if (gantt.config.smart_rendering) {
    return { top: -pad, bottom: height + pad };
  }
  const state = gantt.getScrollState?.() ?? { y: 0 };
  const top = Math.max(0, (state.y ?? 0) - pad);
  return { top, bottom: (state.y ?? 0) + height + pad };
}

function taskInOverlayBand(
  rowTop: number,
  rowHeight: number,
  band: { top: number; bottom: number },
): boolean {
  const rowBottom = rowTop + rowHeight;
  return rowBottom >= band.top && rowTop <= band.bottom;
}

/** Expose native getScale cell left/width for browser evidence (module-scoped gantt). */
function publishVendorScaleDebug(gantt: GanttStatic, host: HTMLElement): void {
  if (!isGanttYDiagnosticsEnabled()) return;
  const geometry = extractGanttMonthScaleGeometry(gantt);
  if (!geometry) return;
  host.setAttribute(
    'data-schedule-vendor-scale-json',
    JSON.stringify(
      geometry.months.map((m) => ({
        iso: m.iso,
        left: m.leftPx,
        width: m.widthPx,
      })),
    ),
  );
  host.setAttribute(
    'data-schedule-vendor-scale-total',
    String(geometry.totalWidthPx),
  );
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
  fitVerticalContent = false,
) {
  suspend.current = true;
  applyChartMode(gantt, treeRows, fitVerticalContent);
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
  const hostEl =
    (gantt.$root ?? gantt.$container)?.closest?.('.ppc-gantt-host') ??
    gantt.$task_data?.closest?.('.ppc-gantt-host');
  if (hostEl instanceof HTMLElement) {
    const logical = treeRows?.length ?? items.length;
    hostEl.setAttribute('data-gantt-logical-rows', String(logical));
    hostEl.setAttribute(
      'data-gantt-logical-links',
      String(presentation.links.length),
    );
  }

  if (fitVerticalContent) {
    fitHostToViewport(gantt);
    // Parent owns Y; restore only the horizontal date. Vertical comes from ownedScrollTop.
    restoreChartDate(gantt, anchor?.chartDateIso ?? null, 0);
    if (anchor?.verticalScrollTop) {
      syncOwnedVerticalScroll(gantt, anchor.verticalScrollTop);
    }
  } else {
    restoreChartDate(
      gantt,
      anchor?.chartDateIso ?? null,
      anchor?.verticalScrollTop ?? 0,
    );
    reapplyTaskPaneScroll(gantt);
  }
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

/**
 * Visible-window overlay pass (coalesced via rAF from render + scroll).
 * baseline-only: clear ghosts, no comparison layers.
 * forecast/actual: gray baseline overlays for visible (+overscan) tasks only.
 */
function paintVisibleOverlays(
  gantt: GanttStatic,
  comparison: ScheduleComparisonMode,
  onSelect: (key: ScheduleSelectionKey | null) => void,
  links: readonly ScheduleLink[],
) {
  if (!shouldPaintComparisonGhosts(comparison)) {
    clearBaselineOverlays(gantt);
  } else {
    paintBaselineOverlays(gantt, onSelect);
    paintWorkBaselineBars(gantt);
  }
  paintFactCaptions(gantt);
  paintCrossProjectCaptions(gantt, links);
  paintWorkBarTitles(gantt);
}

function paintWorkBaselineBars(gantt: GanttStatic) {
  const host = gantt.$task_data;
  if (!host) return;
  const rowHeight = Number(gantt.config.row_height) || SCHEDULE_ROW_HEIGHT_PX;
  const barHeight = Number(gantt.config.bar_height) || 26;
  const band = overlayVisibleBand(gantt);
  const tasks: BaselinePaintTask[] = [];
  gantt.eachTask((task) => {
    if (task.type !== 'task') return;
    if (!task.baselineStart || !task.baselineEnd) return;
    // Prefer index cull before geometry when smart_rendering exposes $index.
    const rawIndex = (task as unknown as { $index?: number }).$index;
    const idx = typeof rawIndex === 'number' ? rawIndex : null;
    if (idx != null) {
      const top = idx * rowHeight;
      if (!taskInOverlayBand(top, rowHeight, band)) return;
    }
    const start = parseIsoLocal(task.baselineStart);
    const end = parseIsoLocal(task.baselineEnd);
    end.setDate(end.getDate() + 1);
    let rowPos: { top: number };
    let barPos: { left: number; width: number };
    try {
      rowPos = gantt.getTaskPosition(task);
      if (!taskInOverlayBand(rowPos.top, rowHeight, band)) return;
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
  const data = gantt.$task_data;
  if (!data) return;
  data.querySelector(`.${BASELINE_LAYER_CLASS}`)?.replaceChildren();
  // Work comparison bars live under [data-baseline-overlay], not the MS ghost layer.
  data.querySelector('[data-baseline-overlay]')?.replaceChildren();
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
  const band = overlayVisibleBand(gantt);

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
    const rowH = rowPos.height || SCHEDULE_ROW_HEIGHT_PX;
    if (!taskInOverlayBand(rowPos.top, rowH, band)) return;
    const left = gantt.posFromDate(baseline);
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `ppc-baseline-marker ${task.css ?? ''}`.replace(
      'ppc-role-forecast',
      'ppc-role-baseline',
    );
    el.style.left = `${left}px`;
    el.style.top = `${rowPos.top + rowH / 2}px`;
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
