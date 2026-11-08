import { SCHEDULE_ROW_HEIGHT_PX } from '@/lib/schedule/schedule-geometry';

const FIT_H_ATTR = 'data-gantt-fit-height';
const FIT_W_ATTR = 'data-gantt-fit-width';

/** Parent box that actually changes on window/owner resize (not the fixed-height host). */
export function resolveGanttResizeObserveTarget(host: HTMLElement): HTMLElement {
  const viewport =
    host.closest('.ppc-gantt-viewport') ??
    host.closest('[data-schedule-pane="chart"]');
  return viewport instanceof HTMLElement ? viewport : host;
}

export function readGanttFitViewportBox(
  host: HTMLElement,
  minRows = 8,
): { viewport: HTMLElement | null; height: number; width: number } {
  const viewport =
    host.closest('.ppc-gantt-viewport') ??
    host.closest('[data-schedule-pane="chart"]');
  const viewportEl = viewport instanceof HTMLElement ? viewport : null;
  const height = Math.max(
    viewportEl?.clientHeight ?? 0,
    host.parentElement?.clientHeight ?? 0,
    SCHEDULE_ROW_HEIGHT_PX * minRows,
  );
  const width = Math.max(
    viewportEl?.clientWidth ?? 0,
    host.parentElement?.clientWidth ?? 0,
    host.clientWidth || 0,
  );
  return { viewport: viewportEl, height, width };
}

/**
 * Skip setSizes/render when the host box already matches the last applied fit.
 * Tracks applied H/W on the host — style.width is not owned by fit.
 */
export function fitHostBoxNeedsUpdate(
  host: HTMLElement,
  nextHeight: number,
  nextWidth: number,
  tolerancePx = 1,
): boolean {
  const lastH = Number(host.getAttribute(FIT_H_ATTR) || '') || 0;
  const lastW = Number(host.getAttribute(FIT_W_ATTR) || '') || 0;
  return (
    Math.abs(lastH - nextHeight) >= tolerancePx ||
    Math.abs(lastW - nextWidth) >= tolerancePx
  );
}

/** Apply bounded host height without inventing extra header/H-bar padding. */
export function applyFitHostBox(
  host: HTMLElement,
  height: number,
  width?: number,
): void {
  const roundedH = Math.max(0, Math.round(height));
  const h = `${roundedH}px`;
  host.style.height = h;
  host.style.minHeight = h;
  host.style.maxHeight = h;
  host.setAttribute(FIT_H_ATTR, String(roundedH));
  if (width != null && Number.isFinite(width)) {
    host.setAttribute(FIT_W_ATTR, String(Math.max(0, Math.round(width))));
  }
}
