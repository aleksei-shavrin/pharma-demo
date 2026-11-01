'use client';

import { useEffect, useRef } from 'react';
import type { ScheduleItem } from '@/lib/api-client';
import type { ScheduleSelectionKey } from '@/lib/schedule/selection-key';
import { selectionKeyEquals } from '@/lib/schedule/selection-key';
import {
  computeTimelineVisibleRange,
  logicalPresentationId,
  presentationIdToSelectionKey,
  toGanttPresentation,
} from '@/lib/schedule/to-gantt-presentation';
import type { ThemeMode } from '@/lib/theme/theme-state';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import './dhtmlx-gantt-adapter.css';

/** Runtime task shape after parse — vendor Task + our presentation fields. */
type GanttTask = {
  id: string | number;
  css?: string;
  baselineDate?: string;
  showBaselineGhost?: boolean;
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
  getTask: (id: string | number) => GanttTask;
  eachTask: (cb: (task: GanttTask) => void) => void;
  posFromDate: (date: Date) => number;
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
  theme: ThemeMode;
  selected: ScheduleSelectionKey | null;
  onSelect: (key: ScheduleSelectionKey | null) => void;
};

const BASELINE_LAYER_CLASS = 'ppc-baseline-layer';

/**
 * Sole FE module allowed to import `dhtmlx-gantt` (ADR-0004).
 * Baseline ghosts: project overlay via Community posFromDate (not PRO addTaskLayer).
 */
export function DhtmlxGanttAdapter({
  items,
  theme,
  selected,
  onSelect,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const ganttRef = useRef<GanttStatic | null>(null);
  const readyRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const itemsRef = useRef(items);
  const selectedRef = useRef(selected);
  onSelectRef.current = onSelect;
  itemsRef.current = items;
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
      gantt.config.show_links = false;
      gantt.config.fit_tasks = false;
      // v10: scales[] owns the header (legacy scale_unit is ignored).
      // Month-only fits May→Oct at desktop width without day/week noise.
      gantt.config.scales = [{ unit: 'month', step: 1, format: '%F %Y' }];
      // Narrow enough that Split (~45% pane) still fits May→Oct without H-scroll.
      gantt.config.min_column_width = 48;
      gantt.config.scale_height = 28;
      gantt.config.row_height = 36;
      gantt.config.bar_height = 14;
      gantt.config.columns = [
        {
          name: 'text',
          label: 'Объект',
          tree: false,
          width: 110,
          resize: true,
        },
      ];
      gantt.templates.task_class = (
        _start: unknown,
        _end: unknown,
        task: { css?: string },
      ) => task.css ?? '';

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
      });
      eventIdsRef.current = [clickId, emptyId, renderId];

      gantt.init(hostRef.current);
      ganttRef.current = gantt;
      readyRef.current = true;
      syncData(gantt, itemsRef.current, selectedRef.current);
    })();

    return () => {
      cancelled = true;
      readyRef.current = false;
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
    syncData(g, items, selected);
  }, [items, selected]);

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

function syncData(
  gantt: GanttStatic,
  items: ScheduleItem[],
  selected: ScheduleSelectionKey | null,
) {
  const range = computeTimelineVisibleRange(items);
  gantt.config.start_date = parseIsoLocal(range.start);
  gantt.config.end_date = parseIsoLocal(range.end);
  gantt.clearAll();
  gantt.parse(toGanttPresentation(items));
  // Fit-to-data: keep horizontal origin at range start; do not jump to forecast.
  // Baseline overlays refresh via onGanttRender after parse/render.
  applyExternalSelection(gantt, selected);
}

function applyExternalSelection(
  gantt: GanttStatic,
  selected: ScheduleSelectionKey | null,
) {
  const currentId = gantt.getSelectedId();
  if (currentId != null) {
    const currentKey = presentationIdToSelectionKey(String(currentId));
    if (selectionKeyEquals(currentKey, selected)) {
      ensureRowVisibleVertically(gantt, String(currentId));
      return;
    }
    gantt.unselectTask(currentId);
  }
  if (!selected) return;
  const id = logicalPresentationId(selected);
  try {
    gantt.selectTask(id);
    ensureRowVisibleVertically(gantt, id);
  } catch {
    /* ignore race */
  }
}

/** Vertical only — must not horizontally scroll away from fit-to-data range. */
function ensureRowVisibleVertically(gantt: GanttStatic, id: string) {
  const node = gantt.getTaskRowNode(id);
  node?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
    el.style.top = `${rowPos.top + (rowPos.height || 36) / 2}px`;
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
