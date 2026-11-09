'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  SCHEDULE_ZOOM_DEFAULT_INDEX,
  paddedLeftChartScrollX,
  readGanttZoomApi,
  scheduleZoomVendorLevels,
} from '@/lib/schedule/schedule-gantt-zoom';
import {
  pickNearestRowDateFocus,
  pickZoomAnchor,
  zoomAnchorFocusPos,
  type ZoomAnchorCandidate,
} from '@/lib/schedule/schedule-zoom-anchor';
import { buildScheduleChartPopoverModel } from '@/lib/schedule/schedule-chart-popover-model';
import {
  centeredChartScrollX,
  isoFromDate,
  type ScheduleScrollAnchor,
} from '@/lib/schedule/schedule-scroll-anchor';
import type { ScheduleSelectionKey } from '@/lib/schedule/selection-key';
import {
  selectionKeyEquals,
  selectionKeyId,
  selectionKeyOf,
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
import { applyScheduleRowSelected } from '@/lib/schedule/schedule-row-hover';
import {
  bumpGanttPerf,
  isGanttPerfDiagnosticsEnabled,
  publishGanttPerfToWindow,
  registerGanttDebugHost,
} from '@/lib/schedule/gantt-perf-diagnostics';
import {
  ScheduleChartPopover,
  type ScheduleChartPopoverModel,
} from './schedule-chart-popover';
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
  kindLabel?: string;
  statusLabel?: string;
  baselineCaption?: string;
  forecastCaption?: string;
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
  isTaskExists?: (id: string | number) => boolean;
  getTaskRowNode: (id: string | number) => HTMLElement | null;
  getTaskNode: (id: string | number) => HTMLElement | null;
  getTask: (id: string | number) => GanttTask;
  eachTask: (cb: (task: GanttTask) => void) => void;
  getLinks?: () => Array<{ id?: string | number }>;
  refreshLink?: (id: string | number) => void;
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
  $task?: HTMLElement;
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
  /** Coarse→fine index for gantt.ext.zoom.setLevel (default week). */
  zoomLevelIndex?: number;
  onZoomLevelChange?: (index: number) => void;
};

const BASELINE_LAYER_CLASS = 'ppc-baseline-layer';
const FACT_CAPTION_LAYER_CLASS = 'ppc-fact-caption-layer';
const EMPTY_LINKS: ScheduleLink[] = [];

/** Left padding so the first bar is readable inside the chart clip. */
const INITIAL_CHART_DATE_PAD_PX = 72;

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
  zoomLevelIndex = SCHEDULE_ZOOM_DEFAULT_INDEX,
  onZoomLevelChange,
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
  const zoomLevelRef = useRef(zoomLevelIndex);
  const onZoomLevelChangeRef = useRef(onZoomLevelChange);
  const zoomReadyRef = useRef(false);
  /** First-visible X seed runs once after mount — never on every zoom/sync. */
  const chartInitialSeedDoneRef = useRef(false);
  zoomLevelRef.current = zoomLevelIndex;
  onZoomLevelChangeRef.current = onZoomLevelChange;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverModel, setPopoverModel] =
    useState<ScheduleChartPopoverModel | null>(null);
  const [popoverOwner, setPopoverOwner] = useState<{
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  } | null>(null);
  const popoverOwnerIdRef = useRef<string | null>(null);
  const popoverBridgeRef = useRef(false);
  const closePopoverTimerRef = useRef(0);
  const [popoverPanelId, setPopoverPanelId] = useState<string | null>(null);

  const closePopover = useCallback(() => {
    if (closePopoverTimerRef.current) {
      window.clearTimeout(closePopoverTimerRef.current);
      closePopoverTimerRef.current = 0;
    }
    const prevId = popoverOwnerIdRef.current;
    popoverOwnerIdRef.current = null;
    popoverBridgeRef.current = false;
    setPopoverOpen(false);
    setPopoverModel(null);
    setPopoverOwner(null);
    setPopoverPanelId(null);
    if (prevId && hostRef.current) {
      const node =
        hostRef.current.querySelector<HTMLElement>(
          `.gantt_task_line[task_id="${CSS.escape(prevId)}"]`,
        ) ??
        hostRef.current.querySelector<HTMLElement>(
          `.gantt_task_line[data-task-id="${CSS.escape(prevId)}"]`,
        );
      node?.removeAttribute('aria-describedby');
    }
  }, []);

  const openPopoverForBar = useCallback((bar: HTMLElement, barId: string) => {
    if (closePopoverTimerRef.current) {
      window.clearTimeout(closePopoverTimerRef.current);
      closePopoverTimerRef.current = 0;
    }
    if (popoverOwnerIdRef.current === barId && popoverOpen) {
      // Refresh owner rect (zoom/scroll) while keeping open.
      const rect = bar.getBoundingClientRect();
      setPopoverOwner({
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      });
      return;
    }
    const sk = presentationIdToSelectionKey(barId);
    if (!sk) {
      closePopover();
      return;
    }
    const item = itemsRef.current.find(
      (it) => selectionKeyId(selectionKeyOf(it)) === selectionKeyId(sk),
    );
    if (!item) {
      closePopover();
      return;
    }
    let startIso: string | null = null;
    let endIso: string | null = null;
    const g = ganttRef.current;
    if (g && typeof g.getTask === 'function') {
      try {
        const task = g.getTask(barId) as {
          start_date?: Date;
          end_date?: Date;
        };
        if (task?.start_date instanceof Date) {
          startIso = isoFromDate(task.start_date);
        }
        if (task?.end_date instanceof Date) {
          endIso = isoFromDate(task.end_date);
        }
      } catch {
        /* missing */
      }
    }
    const model = buildScheduleChartPopoverModel(item, comparisonRef.current, {
      startIso,
      endIso,
    });
    const rect = bar.getBoundingClientRect();
    const prevId = popoverOwnerIdRef.current;
    if (prevId && prevId !== barId && hostRef.current) {
      const prev =
        hostRef.current.querySelector<HTMLElement>(
          `.gantt_task_line[task_id="${CSS.escape(prevId)}"]`,
        ) ??
        hostRef.current.querySelector<HTMLElement>(
          `.gantt_task_line[data-task-id="${CSS.escape(prevId)}"]`,
        );
      prev?.removeAttribute('aria-describedby');
    }
    popoverOwnerIdRef.current = barId;
    setPopoverModel(model);
    setPopoverOwner({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });
    setPopoverOpen(true);
  }, [closePopover, popoverOpen]);

  const scheduleClosePopover = useCallback(() => {
    if (closePopoverTimerRef.current) {
      window.clearTimeout(closePopoverTimerRef.current);
    }
    closePopoverTimerRef.current = window.setTimeout(() => {
      closePopoverTimerRef.current = 0;
      if (popoverBridgeRef.current) return;
      closePopover();
    }, 120);
  }, [closePopover]);

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
      // DHTMLX 10.0.3: link_class — secondary vs immediate chain of selection.
      gantt.templates.link_class = (link: {
        source?: string | number;
        target?: string | number;
      }) => {
        const sel = selectedRef.current;
        if (!sel) return 'ppc-link ppc-link-idle';
        const selId = logicalPresentationId(sel);
        const src = String(link.source ?? '');
        const tgt = String(link.target ?? '');
        if (src === selId || tgt === selId) return 'ppc-link ppc-link-chain';
        return 'ppc-link ppc-link-secondary';
      };

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
            const sel = selectedRef.current;
            paintVisibleOverlays(
              gantt,
              comparisonRef.current,
              (key) => onSelectRef.current(key),
              linksRef.current,
              sel ? selectionKeyId(sel) : null,
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
          if (fitHost) {
            enforceFitChrome(gantt, fitHost);
            // Chrome/layout can reset ver.scrollTop — restore owned Y when drifted.
            const wantY = ownedScrollTopRef.current;
            const ver = resolveGanttVerScroll(fitHost);
            if (ver && Math.abs((ver.scrollTop || 0) - wantY) > 2) {
              syncOwnedVerticalScroll(gantt, wantY);
            }
          }
        }
      });
      const scrollId = gantt.attachEvent('onGanttScroll', (left: unknown) => {
        const x = Number(left) || 0;
        // Always keep sticky month header in sync — including programmatic
        // restore under suspend (otherwise header stays on the old months).
        if (fitVerticalRef.current) {
          publishChartHScroll(host, x);
        }
        if (suspendScrollRef.current) return true;
        const anchor = scrollAnchorRef.current;
        // Left-edge anchor only for user / post-suspend scrolls — do not
        // clobber a focus date while programmatic center is in flight.
        if (anchor && typeof gantt.dateFromPos === 'function') {
          const date = gantt.dateFromPos(x);
          if (date instanceof Date && !Number.isNaN(date.getTime())) {
            anchor.chartDateIso = isoFromDate(date);
          }
        }
        // smart_rendering reuses the window without onGanttRender — refresh overlays.
        scheduleOverlays();
        return true;
      });
      eventIdsRef.current = [clickId, emptyId, renderId, scrollId];

      gantt.init(hostRef.current);
      ganttRef.current = gantt;
      readyRef.current = true;

      // Community 10.0.3: gantt.ext.zoom — buttons drive setLevel; no wheel trigger.
      const zoomApi = readGanttZoomApi(gantt as { ext?: { zoom?: import('@/lib/schedule/schedule-gantt-zoom').GanttZoomApi } });
      if (zoomApi) {
        suspendScrollRef.current = true;
        zoomApi.init({
          levels: scheduleZoomVendorLevels(),
          activeLevelIndex: zoomLevelRef.current,
          trigger: null,
        });
        // Month-density levels keep smart_rendering (fit mode).
        gantt.config.smart_rendering = Boolean(fitVerticalRef.current);
        zoomReadyRef.current = true;
        try {
          hostRef.current?.setAttribute('data-schedule-zoom-ready', 'true');
          hostRef.current?.setAttribute('data-schedule-zoom-unit', 'month');
          hostRef.current?.setAttribute(
            'data-schedule-zoom-methods',
            [
              typeof zoomApi.init,
              typeof zoomApi.zoomIn,
              typeof zoomApi.zoomOut,
              typeof zoomApi.setLevel,
            ].join(','),
          );
        } catch {
          /* ignore */
        }
      } else {
        zoomReadyRef.current = false;
      }

      // Test-only geometry probe (ppcGanttPerf=1) — not product UI.
      // Narrow live instance to the debug probe surface (param contravariance).
      registerGanttDebugHost(gantt as unknown as Parameters<typeof registerGanttDebugHost>[0]);
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
      // One-shot initial X: first visible work when no date anchor yet.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (!readyRef.current || !ganttRef.current) return;
          const anchor = scrollAnchorRef.current;
          if (!chartInitialSeedDoneRef.current && !anchor?.chartDateIso) {
            const seeded = scrollChartToFirstVisibleBar(
              ganttRef.current,
              treeRowsRef.current,
              ownedScrollTopRef.current,
            );
            if (seeded && anchor) anchor.chartDateIso = seeded;
          }
          chartInitialSeedDoneRef.current = true;
          suspendScrollRef.current = false;
        });
      });
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
        registerGanttDebugHost(null);
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
    // clearAll/parse resets vendor Y; re-apply owned scroll so smart_rendering
    // paints the same window as the table (focus deep-link depends on this).
    if (fitVerticalContent) {
      syncOwnedVerticalScroll(g, ownedScrollTopRef.current);
    }
    // Selection is applied inside syncData once; later selection changes use
    // a dedicated effect without clearAll/parse.
  }, [items, links, treeRows, comparison, fitVerticalContent]);

  const lastScrolledSelectionRef = useRef<string | null>(null);
  const linkClassRafRef = useRef(0);
  useEffect(() => {
    const g = ganttRef.current;
    if (!g || !readyRef.current) return;
    const selId = selected ? selectionKeyId(selected) : null;
    // Center only when the selection key actually changes — not on every render.
    // If the task is not yet in the smart-rendering window, do not lock the
    // "already scrolled" flag so a later treeRows/ownedScrollTop pass can retry.
    // Parent scroll owner centers Y in fitVerticalContent; adapter only selects.
    const shouldScroll =
      !fitVerticalContent && selId !== lastScrolledSelectionRef.current;
    const applied = applyExternalSelection(g, selected, shouldScroll);
    if (applied && selId) {
      lastScrolledSelectionRef.current = selId;
    } else if (!selId) {
      lastScrolledSelectionRef.current = null;
    }
    applyScheduleRowSelected([hostRef.current], selId);
  }, [selected, fitVerticalContent, treeRows, ownedScrollTop]);

  // Bounded link_class update on selection only — never parse/clearAll, never on scroll.
  useEffect(() => {
    const g = ganttRef.current;
    if (!g || !readyRef.current) return;
    if (linkClassRafRef.current) cancelAnimationFrame(linkClassRafRef.current);
    linkClassRafRef.current = requestAnimationFrame(() => {
      linkClassRafRef.current = 0;
      const bump = () => {
        try {
          (
            window as unknown as { __ppcGanttLinkRefresh?: number }
          ).__ppcGanttLinkRefresh =
            ((window as unknown as { __ppcGanttLinkRefresh?: number })
              .__ppcGanttLinkRefresh ?? 0) + 1;
        } catch {
          /* ignore */
        }
      };
      try {
        const links = g.getLinks?.() ?? [];
        if (typeof g.refreshLink === 'function' && links.length > 0) {
          for (const link of links) {
            if (link?.id != null) g.refreshLink(link.id);
          }
          bump();
          return;
        }
      } catch {
        /* DOM fallback */
      }
      const host = hostRef.current;
      if (!host) return;
      const sel = selectedRef.current;
      const logical = sel ? logicalPresentationId(sel) : null;
      for (const el of host.querySelectorAll<HTMLElement>('.gantt_task_link')) {
        el.classList.remove(
          'ppc-link-idle',
          'ppc-link-chain',
          'ppc-link-secondary',
        );
        if (!logical) {
          el.classList.add('ppc-link', 'ppc-link-idle');
          continue;
        }
        const linkId = el.getAttribute('link_id') || el.getAttribute('data-link-id');
        let source = '';
        let target = '';
        try {
          const raw = linkId != null ? g.getLinks?.()?.find((l) => String(l.id) === String(linkId)) : null;
          source = String((raw as { source?: string } | undefined)?.source ?? '');
          target = String((raw as { target?: string } | undefined)?.target ?? '');
        } catch {
          /* ignore */
        }
        const hit = source === logical || target === logical;
        el.classList.add('ppc-link', hit ? 'ppc-link-chain' : 'ppc-link-secondary');
      }
      bump();
    });
    return () => {
      if (linkClassRafRef.current) {
        cancelAnimationFrame(linkClassRafRef.current);
        linkClassRafRef.current = 0;
      }
    };
  }, [selected]);

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

  // Apply zoom level via setLevel (coarse→fine indices). Preserve Y; re-anchor X.
  useEffect(() => {
    const g = ganttRef.current;
    if (!g || !readyRef.current || !zoomReadyRef.current) return;
    const zoom = readGanttZoomApi(
      g as { ext?: { zoom?: import('@/lib/schedule/schedule-gantt-zoom').GanttZoomApi } },
    );
    if (!zoom) return;
    const current =
      typeof zoom.getCurrentLevel === 'function' ? zoom.getCurrentLevel() : -1;
    if (current === zoomLevelIndex) return;

    const yBefore = ownedScrollTopRef.current;
    const { viewportWidthPx } = resolveChartHorViewport(g);
    const scrollXBefore =
      g.getScrollState?.()?.x ??
      hostRef.current?.querySelector<HTMLElement>('.gantt_hor_scroll')?.scrollLeft ??
      0;

    // Real element anchor (selected visible / nearest visible / row-date) — never empty canvas mid.
    const candidates = collectZoomAnchorCandidates(g, hostRef.current);
    const selId = selectedRef.current
      ? selectionKeyId(selectedRef.current)
      : null;
    let pick = pickZoomAnchor(candidates, {
      scrollX: scrollXBefore,
      viewportWidthPx,
      selectedId: selId,
    });
    if (!pick) {
      const rowDates = collectLogicalRowDatePositions(
        g,
        treeRowsRef.current,
        yBefore,
      );
      pick = pickNearestRowDateFocus(rowDates, scrollXBefore, viewportWidthPx);
    }
    const anchorTaskId = pick?.id ?? null;
    const anchorIsoBefore =
      anchorTaskId && typeof g.getTask === 'function'
        ? (() => {
            try {
              const t = g.getTask(anchorTaskId) as { start_date?: Date };
              return t?.start_date instanceof Date
                ? isoFromDate(t.start_date)
                : null;
            } catch {
              return null;
            }
          })()
        : null;

    suspendScrollRef.current = true;
    try {
      zoom.setLevel(zoomLevelIndex);
    } catch {
      /* invalid level */
    }
    // Fit mode: sticky scale owns the 40px band; keep smart_rendering on.
    g.config.smart_rendering = Boolean(fitVerticalRef.current);
    if (fitVerticalRef.current) {
      g.config.scale_height = 0;
    } else {
      g.config.scale_height = SCHEDULE_HEADER_HEIGHT_PX;
    }
    try {
      g.render();
    } catch {
      /* ignore */
    }
    if (anchorTaskId && typeof g.posFromDate === 'function') {
      try {
        const focusAfter = resolveZoomFocusPosAfterScale(g, anchorTaskId);
        if (focusAfter != null && Number.isFinite(focusAfter)) {
          const { maxScrollX, viewportWidthPx: vwAfter } =
            resolveChartHorViewport(g);
          const x = centeredChartScrollX(
            focusAfter,
            vwAfter || viewportWidthPx,
            maxScrollX,
          );
          applyChartHorScrollX(g, x, yBefore);
          const anchor = scrollAnchorRef.current;
          if (anchor && anchorIsoBefore) anchor.chartDateIso = anchorIsoBefore;
          hostRef.current?.setAttribute(
            'data-schedule-zoom-anchor-id',
            anchorTaskId,
          );
          hostRef.current?.setAttribute(
            'data-schedule-zoom-anchor-reason',
            pick?.reason ?? 'unknown',
          );
        }
      } catch {
        /* keep current x */
      }
    }
    if (fitVerticalRef.current) {
      syncOwnedVerticalScroll(g, yBefore);
    }
    scheduleOverlaysRef.current?.();
    window.requestAnimationFrame(() => {
      // Smart cull may settle after first paint — re-apply center once.
      if (anchorTaskId && typeof g.posFromDate === 'function') {
        try {
          const focusAfter = resolveZoomFocusPosAfterScale(g, anchorTaskId);
          if (focusAfter != null && Number.isFinite(focusAfter)) {
            const { maxScrollX, viewportWidthPx: vwAfter } =
              resolveChartHorViewport(g);
            const x = centeredChartScrollX(
              focusAfter,
              vwAfter || viewportWidthPx,
              maxScrollX,
            );
            applyChartHorScrollX(g, x, yBefore);
            if (fitVerticalRef.current) {
              syncOwnedVerticalScroll(g, yBefore);
            }
          }
        } catch {
          /* ignore */
        }
      }
      suspendScrollRef.current = false;
    });
    closePopover();
  }, [zoomLevelIndex, closePopover]);

  // Close tip on comparison / selection payload change (not on every hover).
  useEffect(() => {
    closePopover();
  }, [comparison, closePopover]);

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
        if (key !== lastKey) {
          lastKey = key;
          applyHoveredRow(host, key);
          onHoverRowRef.current?.(key);
        }

        const el =
          event.target instanceof Element ? event.target : null;
        const bar = el?.closest<HTMLElement>(
          '.gantt_task_line, .gantt_task_drag, .gantt_milestone, .gantt_task_inline_color',
        );
        if (!bar || !host.contains(bar)) {
          if (popoverOwnerIdRef.current) scheduleClosePopover();
          return;
        }
        const barId =
          bar.getAttribute('task_id') ??
          bar.getAttribute('data-task-id') ??
          taskId;
        if (!barId) {
          scheduleClosePopover();
          return;
        }
        openPopoverForBar(bar, barId);
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
      scheduleClosePopover();
    };
    const onFocusIn = (event: FocusEvent) => {
      const el = event.target instanceof Element ? event.target : null;
      const bar = el?.closest<HTMLElement>(
        '.gantt_task_line, .gantt_milestone, .gantt_task_inline_color',
      );
      if (!bar || !host.contains(bar)) return;
      const barId =
        bar.getAttribute('task_id') ?? bar.getAttribute('data-task-id');
      if (!barId) return;
      openPopoverForBar(bar, barId);
    };
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node) {
        const panel = document.querySelector('[data-schedule-chart-popover="true"]');
        if (panel?.contains(next) || host.contains(next)) return;
      }
      scheduleClosePopover();
    };
    const onScrollClose = () => {
      closePopover();
    };
    host.addEventListener('mousemove', onMove);
    host.addEventListener('mouseleave', onLeave);
    host.addEventListener('focusin', onFocusIn);
    host.addEventListener('focusout', onFocusOut);
    host.addEventListener(SCHEDULE_CHART_HSCROLL_EVENT, onScrollClose);
    const hor = host.querySelector('.gantt_hor_scroll');
    hor?.addEventListener('scroll', onScrollClose);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      host.removeEventListener('mousemove', onMove);
      host.removeEventListener('mouseleave', onLeave);
      host.removeEventListener('focusin', onFocusIn);
      host.removeEventListener('focusout', onFocusOut);
      host.removeEventListener(SCHEDULE_CHART_HSCROLL_EVENT, onScrollClose);
      hor?.removeEventListener('scroll', onScrollClose);
    };
  }, [closePopover, scheduleClosePopover, openPopoverForBar]);

  // Keep aria-describedby on the open trigger bar (MetricAbbrTip pattern).
  useEffect(() => {
    const host = hostRef.current;
    const barId = popoverOwnerIdRef.current;
    if (!host || !barId || !popoverPanelId || !popoverOpen) return;
    const node =
      host.querySelector<HTMLElement>(
        `.gantt_task_line[task_id="${CSS.escape(barId)}"]`,
      ) ??
      host.querySelector<HTMLElement>(
        `.gantt_task_line[data-task-id="${CSS.escape(barId)}"]`,
      );
    if (!node) return;
    node.setAttribute('aria-describedby', popoverPanelId);
    return () => {
      node.removeAttribute('aria-describedby');
    };
  }, [popoverPanelId, popoverOpen]);

  return (
    <>
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
        data-schedule-zoom-level={zoomLevelIndex}
        role="region"
        aria-label="Временная шкала контрольных точек"
      />
      <ScheduleChartPopover
        open={popoverOpen}
        owner={popoverOwner}
        model={popoverModel}
        onClose={closePopover}
        onPanelIdChange={setPopoverPanelId}
        onPanelEnter={() => {
          popoverBridgeRef.current = true;
          if (closePopoverTimerRef.current) {
            window.clearTimeout(closePopoverTimerRef.current);
            closePopoverTimerRef.current = 0;
          }
        }}
        onPanelLeave={() => {
          popoverBridgeRef.current = false;
          scheduleClosePopover();
        }}
      />
    </>
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
    const hostEl =
      (gantt.$root ?? gantt.$container ?? gantt.$task_data)?.closest?.(
        '.ppc-gantt-host',
      ) ?? null;
    const ownedY = Number(
      hostEl instanceof HTMLElement
        ? hostEl.getAttribute('data-gantt-owned-scroll-top')
        : NaN,
    );
    const y = Number.isFinite(ownedY)
      ? ownedY
      : (gantt.getScrollState?.()?.y ?? 0);
    applyChartHorScrollX(gantt, x, y);
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
  // Clip viewport (.gantt_task) stays at fillW. Scale layers must keep full
  // scale width — otherwise $task.scrollWidth===clientWidth, scrollTo(x) cannot
  // stick, and smart_rendering culls bars past the first screen (e.g. MS-COM-GO).
  const geometry = extractGanttMonthScaleGeometry(gantt);
  const hor = host.querySelector<HTMLElement>('.gantt_hor_scroll');
  const scaleW = Math.max(
    fillW,
    geometry?.totalWidthPx ?? 0,
    hor?.scrollWidth ?? 0,
  );
  for (const el of host.querySelectorAll<HTMLElement>(
    '.timeline_cell, .timeline_cell > .gantt_layout_content, .gantt_task',
  )) {
    el.style.setProperty('width', `${fillW}px`, 'important');
    if (virtualY) {
      el.style.setProperty('overflow-x', 'hidden', 'important');
      el.style.setProperty('overflow-y', 'hidden', 'important');
    } else {
      el.style.setProperty('overflow', 'hidden', 'important');
    }
  }
  for (const el of host.querySelectorAll<HTMLElement>(
    '.gantt_data_area, .gantt_task_bg, .gantt_bars_area',
  )) {
    el.style.setProperty('width', `${scaleW}px`, 'important');
    el.style.setProperty('min-width', `${scaleW}px`, 'important');
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

/**
 * Keep scale layers wider than the clip so `$task.scrollLeft` can leave 0.
 * Idempotent; safe to call from H restore without full enforceFitChrome.
 */
function ensureTimelineScaleScrollWidth(
  gantt: GanttStatic,
  host: HTMLElement,
): void {
  const layoutX = host.querySelector<HTMLElement>('.gantt_layout_x');
  const fillW = layoutX?.clientWidth ?? host.clientWidth;
  const geometry = extractGanttMonthScaleGeometry(gantt);
  const hor = host.querySelector<HTMLElement>('.gantt_hor_scroll');
  const scaleW = Math.max(
    fillW,
    geometry?.totalWidthPx ?? 0,
    hor?.scrollWidth ?? 0,
  );
  if (scaleW <= fillW) return;
  for (const el of host.querySelectorAll<HTMLElement>(
    '.gantt_data_area, .gantt_task_bg, .gantt_bars_area',
  )) {
    el.style.setProperty('width', `${scaleW}px`, 'important');
    el.style.setProperty('min-width', `${scaleW}px`, 'important');
  }
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

/**
 * Prefer the ver scroller that actually owns the Y range (not a zero-max cell).
 */
function resolveGanttVerScroll(host: HTMLElement | null): HTMLElement | null {
  if (!host) return null;
  const candidates = Array.from(
    host.querySelectorAll<HTMLElement>('.gantt_ver_scroll, .scrollVer_cell'),
  );
  let best: HTMLElement | null = null;
  let bestMax = -1;
  for (const el of candidates) {
    const max = Math.max(0, (el.scrollHeight || 0) - (el.clientHeight || 0));
    if (max > bestMax) {
      bestMax = max;
      best = el;
    }
  }
  return best;
}

function resolveOwnedScrollX(gantt: GanttStatic, host: HTMLElement | null): number {
  const hor = host?.querySelector<HTMLElement>('.gantt_hor_scroll');
  const published = Number(host?.getAttribute('data-schedule-chart-scroll-x') || NaN);
  const taskX = gantt.$task?.scrollLeft;
  const dataX = gantt.$task_data?.scrollLeft;
  const stateX = gantt.getScrollState?.()?.x;
  // Prefer DOM / published X — getScrollState().x can lag or reset while bars stay put.
  if (hor && Number.isFinite(hor.scrollLeft) && hor.scrollLeft > 0) {
    return Math.max(0, hor.scrollLeft);
  }
  if (Number.isFinite(published) && published > 0) return Math.max(0, published);
  if (Number.isFinite(taskX) && (taskX as number) > 0) {
    return Math.max(0, taskX as number);
  }
  if (Number.isFinite(dataX) && (dataX as number) > 0) {
    return Math.max(0, dataX as number);
  }
  if (hor && Number.isFinite(hor.scrollLeft)) return Math.max(0, hor.scrollLeft);
  return Math.max(0, stateX ?? 0);
}

function syncOwnedVerticalScroll(gantt: GanttStatic, scrollTop: number): void {
  if (!gantt.scrollTo || !gantt.getScrollState) return;
  const hostEl =
    (gantt.$root ?? gantt.$container)?.closest?.('.ppc-gantt-host') ??
    gantt.$task_data?.closest?.('.ppc-gantt-host');
  const host = hostEl instanceof HTMLElement ? hostEl : null;
  const y = Math.max(0, Math.round(scrollTop));
  const x = resolveOwnedScrollX(gantt, host);
  const ver = resolveGanttVerScroll(host);
  const rowCount = host
    ? Number(host.getAttribute('data-gantt-logical-rows') || 0)
    : 0;
  const viewportH = host?.clientHeight || ver?.clientHeight || 0;
  if (ver && rowCount > 0 && viewportH > 0) {
    ensureVerScrollRange(ver, rowCount, viewportH);
    applyHiddenVerScrollOwnerStyle(ver, viewportH);
  }
  // Always drive both API and DOM — getScrollState.y can lie while ver.scrollTop=0.
  if (ver && Math.abs(ver.scrollTop - y) >= 1) {
    ver.scrollTop = y;
  }
  gantt.scrollTo(x, y);
  if (ver && Math.abs(ver.scrollTop - y) >= 1) {
    ver.scrollTop = y;
  }
  if (gantt.$task_data) {
    if (Math.abs((gantt.$task_data.scrollTop || 0) - y) >= 1) {
      gantt.$task_data.scrollTop = y;
    }
  }
  // Preserve H on the timeline port without re-entering applyChartHorScrollX
  // (that path calls scrollTo/enforceFitChrome and can loop via onGanttRender).
  if (x > 0 && gantt.$task && Math.abs((gantt.$task.scrollLeft || 0) - x) >= 1) {
    gantt.$task.scrollLeft = x;
  }
  if (host) {
    const hor = host.querySelector<HTMLElement>('.gantt_hor_scroll');
    if (hor && x > 0 && Math.abs(hor.scrollLeft - x) >= 1) {
      hor.scrollLeft = x;
    }
    publishNativeYDiagnostics(gantt, host, y);
    if (x > 0) publishChartHScroll(host, x);
  }
}

function publishNativeYDiagnostics(
  gantt: GanttStatic,
  host: HTMLElement,
  requestedY: number,
): void {
  // Minimal correctness attrs always (cheap). Prefer DOM ver.scrollTop over
  // getScrollState().y — the API can report requested Y while paint stays at 0.
  const state = gantt.getScrollState?.() ?? { x: 0, y: 0 };
  const ver = resolveGanttVerScroll(host);
  const verMetrics = readVerScrollMetrics(ver);
  const nativeY = verMetrics.scrollTop || state.y || 0;
  const nativeYMax = verMetrics.max;
  host.setAttribute('data-gantt-native-y', String(Math.round(nativeY)));
  host.setAttribute('data-gantt-native-ymax', String(Math.round(nativeYMax)));
  host.setAttribute(
    'data-gantt-y-aligned',
    ySyncAligned(requestedY, verMetrics.scrollTop) ? 'true' : 'false',
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

  const centerOnce = Boolean(anchor?.centerChartDateOnce);
  if (fitVerticalContent) {
    fitHostToViewport(gantt);
    // Parent owns Y; restore H here. Y is re-applied by caller via ownedScrollTop.
    // Seed first-visible only when no date anchor yet (true initial) — never wipe a pan.
    const ownedY = Math.max(0, anchor?.verticalScrollTop ?? 0);
    const isoForRestore = anchor?.chartDateIso ?? null;
    if (isoForRestore) {
      restoreChartDate(gantt, isoForRestore, 0, centerOnce, treeRows);
    } else {
      const seeded = scrollChartToFirstVisibleBar(gantt, treeRows, ownedY);
      if (seeded && anchor) anchor.chartDateIso = seeded;
    }
    if (ownedY > 0) {
      syncOwnedVerticalScroll(gantt, ownedY);
    }
  } else {
    restoreChartDate(
      gantt,
      anchor?.chartDateIso ?? null,
      anchor?.verticalScrollTop ?? 0,
      centerOnce,
      treeRows,
    );
    if (anchor && !anchor.chartDateIso) {
      const seeded = firstVisibleBarDateIso(gantt, treeRows);
      if (seeded) anchor.chartDateIso = seeded;
    }
    reapplyTaskPaneScroll(gantt);
  }
  // One-shot focus centering must not re-run after user scroll / later syncs.
  if (anchor && centerOnce) {
    anchor.centerChartDateOnce = false;
  }
  window.setTimeout(() => {
    suspend.current = false;
  }, 0);
}

function resolveChartHorViewport(gantt: GanttStatic): {
  viewportWidthPx: number;
  maxScrollX: number;
} {
  const host =
    (gantt.$root ?? gantt.$container ?? gantt.$task_data)?.closest?.(
      '.ppc-gantt-host',
    ) ?? null;
  const hor = host?.querySelector<HTMLElement>('.gantt_hor_scroll') ?? null;
  if (hor && hor.clientWidth > 0) {
    return {
      viewportWidthPx: hor.clientWidth,
      maxScrollX: Math.max(0, hor.scrollWidth - hor.clientWidth),
    };
  }
  const task = host?.querySelector<HTMLElement>('.gantt_task');
  const width = task?.clientWidth ?? 0;
  return { viewportWidthPx: width, maxScrollX: Math.max(0, width) };
}

/**
 * Apply horizontal x to vendor scrollTo + `.gantt_hor_scroll` + `$task` + sticky.
 * Smart_rendering reads the timeline scroll port (`$task.scrollLeft` /
 * getScrollState().x). Fit chrome must keep scale-wide `$task` scrollWidth so
 * scrollTo(x) sticks; `$task_data.scrollLeft` alone paints without updating cull.
 */
function applyChartHorScrollX(gantt: GanttStatic, x: number, y: number): void {
  const host =
    (gantt.$root ?? gantt.$container ?? gantt.$task_data)?.closest?.(
      '.ppc-gantt-host',
    ) ?? null;
  const targetX = Math.max(0, Math.round(x));
  const targetY = Math.max(0, y);
  // Ensure scale-wide scrollWidth before scrollTo (idempotent style writes).
  if (host instanceof HTMLElement) {
    ensureTimelineScaleScrollWidth(gantt, host);
  }
  if (gantt.scrollTo) {
    gantt.scrollTo(targetX, targetY);
  }
  if (host instanceof HTMLElement) {
    const hor = host.querySelector<HTMLElement>('.gantt_hor_scroll');
    if (hor && Math.abs(hor.scrollLeft - targetX) >= 1) {
      hor.scrollLeft = targetX;
    }
    const task =
      gantt.$task ?? host.querySelector<HTMLElement>('.gantt_task');
    if (task && Math.abs((task.scrollLeft || 0) - targetX) >= 1) {
      task.scrollLeft = targetX;
    }
    // Keep data_area in sync for older paint paths / tests.
    const data =
      gantt.$task_data ??
      host.querySelector<HTMLElement>('.gantt_data_area');
    if (data && data.scrollWidth > data.clientWidth + 1) {
      if (Math.abs((data.scrollLeft || 0) - targetX) >= 1) {
        data.scrollLeft = targetX;
      }
    } else if (data && (data.scrollLeft || 0) !== 0) {
      // Scale-wide data_area: H lives on $task; avoid double-offset.
      data.scrollLeft = 0;
    }
    const nativeX = gantt.getScrollState?.()?.x;
    host.setAttribute(
      'data-gantt-native-x',
      String(Math.round(Number(nativeX) || task?.scrollLeft || targetX)),
    );
    publishChartHScroll(host, targetX);
  }
}

/** Painted bars → zoom candidates (range intersection + midpoint). */
function collectZoomAnchorCandidates(
  gantt: GanttStatic,
  host: HTMLElement | null,
): ZoomAnchorCandidate[] {
  if (!host || typeof gantt.posFromDate !== 'function') return [];
  const out: ZoomAnchorCandidate[] = [];
  const seen = new Set<string>();
  const nodes = host.querySelectorAll<HTMLElement>(
    '.gantt_task_line, .gantt_milestone',
  );
  for (const node of nodes) {
    const id =
      node.getAttribute('task_id') ?? node.getAttribute('data-task-id');
    if (!id || seen.has(id)) continue;
    seen.add(id);
    try {
      if (gantt.isTaskExists && !gantt.isTaskExists(id)) continue;
      const task = gantt.getTask(id) as {
        start_date?: Date;
        end_date?: Date;
        type?: string;
      };
      if (!(task?.start_date instanceof Date) || Number.isNaN(+task.start_date)) {
        continue;
      }
      const startPos = gantt.posFromDate(task.start_date);
      if (!Number.isFinite(startPos)) continue;
      const point =
        task.type === 'milestone' ||
        id.startsWith('milestone:') ||
        id.startsWith('equipment_delivery:');
      let endPos = startPos;
      if (
        !point &&
        task.end_date instanceof Date &&
        !Number.isNaN(+task.end_date)
      ) {
        const ep = gantt.posFromDate(task.end_date);
        if (Number.isFinite(ep)) endPos = ep;
      }
      out.push({
        id,
        startPos,
        endPos,
        point: Boolean(point),
      });
    } catch {
      /* skip */
    }
  }
  return out;
}

/** Logical work/MS/EQ dates near the owned Y window when no bar intersects X. */
function collectLogicalRowDatePositions(
  gantt: GanttStatic,
  treeRows: readonly GanttTreeRow[] | undefined,
  ownedScrollTop: number,
): { id: string; pos: number }[] {
  if (!treeRows?.length || typeof gantt.posFromDate !== 'function') return [];
  const rowH = SCHEDULE_ROW_HEIGHT_PX;
  const approxIndex = Math.max(0, Math.floor(ownedScrollTop / rowH));
  const from = Math.max(0, approxIndex - 8);
  const to = Math.min(treeRows.length, approxIndex + 40);
  const out: { id: string; pos: number }[] = [];
  for (let i = from; i < to; i++) {
    const row = treeRows[i];
    if (
      !row ||
      (row.kind !== 'work' &&
        row.kind !== 'milestone' &&
        row.kind !== 'equipment_delivery')
    ) {
      continue;
    }
    const id = `${row.kind}:${row.id}`;
    try {
      if (gantt.isTaskExists && !gantt.isTaskExists(id)) continue;
      const task = gantt.getTask(id) as { start_date?: Date };
      if (!(task?.start_date instanceof Date) || Number.isNaN(+task.start_date)) {
        continue;
      }
      const pos = gantt.posFromDate(task.start_date);
      if (Number.isFinite(pos)) out.push({ id, pos });
    } catch {
      /* skip */
    }
  }
  return out;
}

/** After setLevel: recompute focus px for the same task id. */
function resolveZoomFocusPosAfterScale(
  gantt: GanttStatic,
  taskId: string,
): number | null {
  if (typeof gantt.posFromDate !== 'function') return null;
  try {
    if (gantt.isTaskExists && !gantt.isTaskExists(taskId)) return null;
    const task = gantt.getTask(taskId) as {
      start_date?: Date;
      end_date?: Date;
      type?: string;
    };
    if (!(task?.start_date instanceof Date) || Number.isNaN(+task.start_date)) {
      return null;
    }
    const startPos = gantt.posFromDate(task.start_date);
    if (!Number.isFinite(startPos)) return null;
    const point =
      task.type === 'milestone' ||
      taskId.startsWith('milestone:') ||
      taskId.startsWith('equipment_delivery:');
    let endPos = startPos;
    if (
      !point &&
      task.end_date instanceof Date &&
      !Number.isNaN(+task.end_date)
    ) {
      const ep = gantt.posFromDate(task.end_date);
      if (Number.isFinite(ep)) endPos = ep;
    }
    return zoomAnchorFocusPos({
      id: taskId,
      startPos,
      endPos,
      point,
    });
  } catch {
    return null;
  }
}

/**
 * First bar date in display order (work / equipment / milestone), not global min.
 * Used when the scroll anchor has no chartDateIso yet.
 */
function firstVisibleBarDateIso(
  gantt: GanttStatic,
  treeRows: readonly GanttTreeRow[] | undefined,
): string | null {
  if (treeRows && treeRows.length > 0) {
    for (const row of treeRows) {
      if (
        row.kind !== 'work' &&
        row.kind !== 'milestone' &&
        row.kind !== 'equipment_delivery'
      ) {
        continue;
      }
      const id = `${row.kind}:${row.id}`;
      try {
        if (gantt.isTaskExists && !gantt.isTaskExists(id)) continue;
        const task = gantt.getTask(id);
        if (task?.start_date instanceof Date && !Number.isNaN(task.start_date.getTime())) {
          return isoFromDate(task.start_date);
        }
      } catch {
        /* missing in parse */
      }
    }
  }
  let found: string | null = null;
  gantt.eachTask((task) => {
    if (found) return;
    if (task.type === 'project') return;
    if (task.start_date instanceof Date && !Number.isNaN(task.start_date.getTime())) {
      found = isoFromDate(task.start_date);
    }
  });
  return found;
}

/**
 * Scroll X so the first on-screen row bar is in view (padded left).
 * Zoom/setLevel often recenters mid-horizon where top rows have no bars → empty smart window.
 */
function scrollChartToFirstVisibleBar(
  gantt: GanttStatic,
  treeRows: readonly GanttTreeRow[] | undefined,
  verticalScrollTop = 0,
): string | null {
  if (!gantt.scrollTo || !gantt.posFromDate) return null;
  const iso = firstVisibleBarDateIso(gantt, treeRows);
  if (!iso) return null;
  const fromDate = gantt.posFromDate(parseIsoLocal(iso));
  if (!Number.isFinite(fromDate)) return null;
  const { maxScrollX } = resolveChartHorViewport(gantt);
  const x = paddedLeftChartScrollX(
    fromDate,
    INITIAL_CHART_DATE_PAD_PX,
    maxScrollX,
  );
  const y = Math.max(gantt.getScrollState?.()?.y ?? 0, verticalScrollTop);
  applyChartHorScrollX(gantt, x, y);
  const host =
    (gantt.$root ?? gantt.$container)?.closest?.('.ppc-gantt-host') ?? null;
  host?.setAttribute('data-schedule-chart-initial-iso', iso);
  host?.setAttribute('data-schedule-chart-scroll-x', String(Math.round(x)));
  window.requestAnimationFrame(() => {
    applyChartHorScrollX(gantt, x, y);
  });
  return iso;
}

function restoreChartDate(
  gantt: GanttStatic,
  iso: string | null,
  verticalScrollTop: number,
  center = false,
  treeRows?: readonly GanttTreeRow[],
) {
  if (!gantt.scrollTo || !gantt.getScrollState) return;
  const state = gantt.getScrollState();
  let x = state.x;
  if (iso) {
    const fromDate = gantt.posFromDate(parseIsoLocal(iso));
    if (Number.isFinite(fromDate)) {
      const { viewportWidthPx, maxScrollX } = resolveChartHorViewport(gantt);
      if (center) {
        x = centeredChartScrollX(fromDate, viewportWidthPx, maxScrollX);
      } else {
        x = Math.max(0, fromDate);
      }
    }
  } else {
    // No stored date: prefer first visible bar (not mid-horizon zoom center).
    scrollChartToFirstVisibleBar(gantt, treeRows, verticalScrollTop);
    return;
  }
  const y = Math.max(state.y, verticalScrollTop);
  applyChartHorScrollX(gantt, x, y);
  if (center) {
    const targetX = x;
    const targetY = y;
    window.requestAnimationFrame(() => {
      applyChartHorScrollX(gantt, targetX, targetY);
    });
  }
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
): boolean {
  const currentId = gantt.getSelectedId();
  if (currentId != null) {
    const currentKey = presentationIdToSelectionKey(String(currentId));
    if (selectionKeyEquals(currentKey, selected)) {
      if (scrollIntoView) ensureRowVisibleVertically(gantt, String(currentId));
      return true;
    }
    gantt.unselectTask(currentId);
  }
  if (!selected) return true;
  const id = logicalPresentationId(selected);
  try {
    // Task may be outside the smart-rendering window until parent scrolls.
    if (typeof gantt.isTaskExists === 'function' && !gantt.isTaskExists(id)) {
      return false;
    }
    gantt.selectTask(id);
    if (scrollIntoView) ensureRowVisibleVertically(gantt, id);
    return true;
  } catch {
    /* ignore race */
    return false;
  }
}

/**
 * Vertical reveal inside the Gantt scroll owner (`.gantt_ver_scroll`), not the
 * document. Centers the row when bounds allow. Horizontal date centering is
 * owned by ScheduleScrollAnchor.chartDateIso / restoreChartDate.
 */
function ensureRowVisibleVertically(gantt: GanttStatic, id: string) {
  const node = gantt.getTaskRowNode(id);
  if (!node) return;
  const data = gantt.$task_data;
  if (!data) return;
  const root =
    (data.closest('.ppc-gantt-host') as HTMLElement | null) ??
    (data.parentElement as HTMLElement | null);
  if (!root) return;
  const scrollBar = root.querySelector<HTMLElement>(
    GANTT_VERTICAL_SCROLL_SELECTOR,
  );
  const rowRect = node.getBoundingClientRect();
  // Prefer the Gantt vertical scroll owner; never scroll the document.
  if (scrollBar && scrollBar.clientHeight > 0) {
    const viewRect = scrollBar.getBoundingClientRect();
    const delta =
      rowRect.top + rowRect.height / 2 - (viewRect.top + viewRect.height / 2);
    const max = Math.max(0, scrollBar.scrollHeight - scrollBar.clientHeight);
    const next = Math.min(Math.max(0, scrollBar.scrollTop + delta), max);
    scrollBar.scrollTop = next;
    copyScrollTop(scrollBar, data);
    return;
  }
  if (data.clientHeight <= 0) return;
  const viewRect = data.getBoundingClientRect();
  const delta =
    rowRect.top + rowRect.height / 2 - (viewRect.top + viewRect.height / 2);
  const max = Math.max(0, data.scrollHeight - data.clientHeight);
  data.scrollTop = Math.min(Math.max(0, data.scrollTop + delta), max);
}

/** Full name in aria-label; native title removed — React portal tip owns hover UI. */
function paintWorkBarTitles(gantt: GanttStatic) {
  gantt.eachTask((task) => {
    const node = gantt.getTaskNode(task.id);
    if (!node) return;
    const label = workBarTooltip({
      text: task.text,
      factCaption: task.factCaption,
      progress: task.progress,
      css: task.css,
      type: task.type,
      kindLabel: task.kindLabel,
      statusLabel: task.statusLabel,
      baselineCaption: task.baselineCaption,
      forecastCaption: task.forecastCaption,
    });
    node.removeAttribute('title');
    if (label.length > 0) node.setAttribute('aria-label', label);
    else node.removeAttribute('aria-label');
    node.removeAttribute('data-progress-caption');
    // Keyboard-advertised trigger: focusable chart bar (dashboard tip pattern).
    if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '0');
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
 * timedProjectBar leaves the outer `.ppc-summary` shell without start/end width
 * (planned child holds the span). Promote left/width from task dates onto the
 * parent so CSS can hide vendor planned/actual without erasing group bars.
 */
function promoteProductSummaryBarGeometry(gantt: GanttStatic): void {
  const data = gantt.$task_data as HTMLElement | null | undefined;
  if (!data || typeof gantt.getTaskPosition !== 'function') return;
  data
    .querySelectorAll<HTMLElement>(
      '.gantt_task_line.ppc-summary.gantt_project',
    )
    .forEach((el) => {
      const id =
        el.getAttribute('task_id') || el.getAttribute('data-task-id');
      if (!id || (gantt.isTaskExists && !gantt.isTaskExists(id))) return;
      let task: {
        start_date?: Date | string;
        end_date?: Date | string;
      };
      try {
        task = gantt.getTask(id);
      } catch {
        return;
      }
      const start =
        task?.start_date instanceof Date ? task.start_date : null;
      const end = task?.end_date instanceof Date ? task.end_date : null;
      if (!start || !end) return;
      try {
        const pos = gantt.getTaskPosition(task as never, start, end);
        if (
          !Number.isFinite(pos.left) ||
          !Number.isFinite(pos.width) ||
          pos.width < 1
        ) {
          return;
        }
        el.style.left = `${Math.round(pos.left)}px`;
        el.style.width = `${Math.round(pos.width)}px`;
      } catch {
        /* task not in layout yet */
      }
    });
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
  selectedKeyId?: string | null,
) {
  promoteProductSummaryBarGeometry(gantt);
  if (!shouldPaintComparisonGhosts(comparison)) {
    clearBaselineOverlays(gantt);
  } else {
    paintBaselineOverlays(gantt, onSelect);
    paintWorkBaselineBars(gantt);
  }
  paintFactCaptions(gantt);
  paintCrossProjectCaptions(gantt, links);
  paintWorkBarTitles(gantt);
  const host =
    (gantt.$root as HTMLElement | null | undefined)?.closest?.(
      '.ppc-gantt-host',
    ) ?? (gantt.$task_data as HTMLElement | null | undefined)?.closest?.(
      '.ppc-gantt-host',
    );
  if (selectedKeyId !== undefined) {
    applyScheduleRowSelected([host as HTMLElement | null], selectedKeyId);
  }
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
