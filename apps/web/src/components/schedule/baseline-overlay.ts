/**
 * Same-row baseline bar above the forecast bar.
 * Community centers the forecast bar in the row and does not paint baselines.
 * The adapter does not import this module; an integrator calls the painter
 * after each Gantt render, because render replaces the task-data DOM.
 *
 * `forecastTop` is `getTaskPosition().top` — the row top in host coordinates,
 * not the centered bar's visual top.
 */

export const BASELINE_GAP_PX = 2;

export type BaselineBox = {
  top: number;
  height: number;
};

export type BaselinePaintTask = {
  taskId: string;
  forecastTop: number;
  barHeight: number;
  rowHeight: number;
  baselineStart?: string | null;
  baselineEnd?: string | null;
  left: number;
  width: number;
};

/** Visual top of the centered forecast bar, same coordinate space as `forecastTop`. */
export function forecastBarTop(
  forecastTop: number,
  barHeight: number,
  rowHeight: number,
): number {
  return forecastTop + centeredBarOffset(barHeight, rowHeight);
}

/**
 * Baseline rectangle above the centered forecast bar.
 * `height` is 0 when the row cannot hold a separate bar without overlap.
 */
export function baselineBox(
  forecastTop: number,
  barHeight: number,
  rowHeight: number,
): BaselineBox {
  if (
    !Number.isFinite(forecastTop) ||
    !Number.isFinite(barHeight) ||
    !Number.isFinite(rowHeight) ||
    barHeight <= 0 ||
    rowHeight <= 0
  ) {
    return { top: Number.isFinite(forecastTop) ? forecastTop : 0, height: 0 };
  }
  const offset = centeredBarOffset(barHeight, rowHeight);
  const room = offset - BASELINE_GAP_PX;
  if (room < 1) {
    return { top: forecastTop, height: 0 };
  }
  const height = Math.min(barHeight, room);
  return {
    top: forecastTop + offset - BASELINE_GAP_PX - height,
    height,
  };
}

/** A baseline node exists only when both ends parse and the interval is ordered. */
export function shouldPaintBaseline(
  baselineStart: string | null | undefined,
  baselineEnd: string | null | undefined,
): boolean {
  const start = parseDay(baselineStart);
  const end = parseDay(baselineEnd);
  if (start === null || end === null) return false;
  return end >= start;
}

/**
 * Replace every baseline node under `host`.
 * Hidden tasks are omitted by the caller, so a collapsed child does not keep a stale y.
 * Returns how many nodes were painted.
 */
export function paintBaselineOverlay(
  host: HTMLElement,
  tasks: readonly BaselinePaintTask[],
): number {
  const layer = ensureLayer(host);
  layer.replaceChildren();
  let painted = 0;
  for (const task of tasks) {
    if (!shouldPaintBaseline(task.baselineStart, task.baselineEnd)) continue;
    const box = baselineBox(task.forecastTop, task.barHeight, task.rowHeight);
    if (box.height <= 0 || !Number.isFinite(task.left) || !Number.isFinite(task.width)) {
      continue;
    }
    const el = document.createElement('div');
    el.className = 'baseline-overlay-bar';
    el.dataset.baselineTask = task.taskId;
    el.style.position = 'absolute';
    el.style.left = `${task.left}px`;
    el.style.top = `${box.top}px`;
    el.style.width = `${Math.max(task.width, 1)}px`;
    el.style.height = `${box.height}px`;
    layer.appendChild(el);
    painted += 1;
  }
  return painted;
}

function centeredBarOffset(barHeight: number, rowHeight: number): number {
  if (rowHeight <= barHeight) return 0;
  return Math.floor((rowHeight - barHeight) / 2);
}

function parseDay(value: string | null | undefined): number | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const parsed = Date.parse(`${trimmed}T00:00:00Z`);
  return Number.isNaN(parsed) ? null : parsed;
}

function ensureLayer(host: HTMLElement): HTMLElement {
  const existing = host.querySelector<HTMLElement>(':scope > [data-baseline-overlay]');
  if (existing) return existing;
  const layer = document.createElement('div');
  layer.setAttribute('data-baseline-overlay', 'true');
  layer.style.position = 'absolute';
  layer.style.inset = '0';
  layer.style.pointerEvents = 'none';
  host.appendChild(layer);
  return layer;
}
