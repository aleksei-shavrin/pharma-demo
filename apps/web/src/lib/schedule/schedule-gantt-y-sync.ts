import { SCHEDULE_ROW_HEIGHT_PX } from './schedule-geometry';

/**
 * Native DHTMLX Y must track the shared scroll owner.
 * certainty: fact — Community `gantt.scrollTo` drives the scrollY view
 * (`.gantt_ver_scroll`); `display:none` collapses scrollSize → y clamps to 0.
 * Additive custom spacers on top of a full vendor inner double the rail (~43k).
 */

export type GanttYSyncProbe = {
  requestedY: number;
  nativeY: number;
  nativeYMax: number;
  verScrollTop: number;
  verScrollHeight: number;
  verClientHeight: number;
  aligned: boolean;
};

/** Horizontal track + sticky header slack for max-Y tolerance. */
export const GANTT_Y_RANGE_TOLERANCE_PX = SCHEDULE_ROW_HEIGHT_PX * 2 + 20;

export function expectedGanttYMax(
  rowCount: number,
  viewportHeight: number,
): number {
  const content = Math.max(0, rowCount) * SCHEDULE_ROW_HEIGHT_PX;
  return Math.max(0, content - Math.max(0, viewportHeight));
}

/**
 * Full required range ± tolerance; half/zero/double are unhealthy.
 */
export function ganttYScrollRangeHealthy(probe: {
  nativeYMax: number;
  rowCount: number;
  viewportHeight: number;
  tolerancePx?: number;
}): boolean {
  if (probe.rowCount <= 0) return probe.nativeYMax <= 2;
  const need = expectedGanttYMax(probe.rowCount, probe.viewportHeight);
  const tol = probe.tolerancePx ?? GANTT_Y_RANGE_TOLERANCE_PX;
  if (need <= 2) return probe.nativeYMax <= tol;
  if (probe.nativeYMax < need - tol) return false;
  // Forbid excess (e.g. additive double rail ≈ 2× need).
  if (probe.nativeYMax > need + need * 0.25 + tol) return false;
  return true;
}

export function ySyncAligned(
  requestedY: number,
  nativeY: number,
  tolerancePx = 2,
): boolean {
  return Math.abs(requestedY - nativeY) <= tolerancePx;
}

export function readVerScrollMetrics(ver: HTMLElement | null | undefined): {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  max: number;
} {
  if (!ver) {
    return { scrollTop: 0, scrollHeight: 0, clientHeight: 0, max: 0 };
  }
  const scrollTop = ver.scrollTop || 0;
  const scrollHeight = ver.scrollHeight || 0;
  const clientHeight = ver.clientHeight || 0;
  return {
    scrollTop,
    scrollHeight,
    clientHeight,
    max: Math.max(0, scrollHeight - clientHeight),
  };
}

/**
 * Keep the vendor ver scroller in the layout (scroll range) but not as an
 * input owner: zero width, no pointer events. Never `display:none`.
 */
export function applyHiddenVerScrollOwnerStyle(
  el: HTMLElement,
  viewportHeight?: number,
): void {
  el.style.setProperty('display', 'block', 'important');
  el.style.setProperty('width', '0', 'important');
  el.style.setProperty('min-width', '0', 'important');
  el.style.setProperty('max-width', '0', 'important');
  el.style.setProperty('opacity', '0', 'important');
  el.style.setProperty('pointer-events', 'none', 'important');
  el.style.setProperty('overflow-y', 'scroll', 'important');
  el.style.setProperty('overflow-x', 'hidden', 'important');
  const h =
    viewportHeight ||
    el.parentElement?.clientHeight ||
    el.closest('.ppc-gantt-host')?.clientHeight ||
    0;
  if (h > 0) {
    el.style.setProperty('height', `${h}px`, 'important');
  }
}

export const PPC_VER_SPACER_ATTR = 'data-ppc-ver-spacer';

/**
 * Ensure scrollY max ≈ N×32 − viewport.
 * Never stack a project spacer on top of a full vendor inner (double rail).
 * Removes our spacer first, keeps vendor if healthy, else one controlled spacer.
 */
export function ensureVerScrollRange(
  ver: HTMLElement,
  rowCount: number,
  viewportHeight: number,
): { nativeYMax: number; usedProjectSpacer: boolean } {
  ver
    .querySelectorAll(`[${PPC_VER_SPACER_ATTR}="true"]`)
    .forEach((node) => node.remove());
  applyHiddenVerScrollOwnerStyle(ver, viewportHeight);

  const vendor = readVerScrollMetrics(ver);
  if (
    ganttYScrollRangeHealthy({
      nativeYMax: vendor.max,
      rowCount,
      viewportHeight,
    })
  ) {
    return { nativeYMax: vendor.max, usedProjectSpacer: false };
  }

  const contentH = Math.max(rowCount, 1) * SCHEDULE_ROW_HEIGHT_PX;
  const inner = document.createElement('div');
  inner.setAttribute(PPC_VER_SPACER_ATTR, 'true');
  inner.style.width = '1px';
  inner.style.height = `${contentH}px`;
  ver.appendChild(inner);
  const after = readVerScrollMetrics(ver);
  return { nativeYMax: after.max, usedProjectSpacer: true };
}

/** Heavy attr/JSON probe — only when explicitly enabled. */
export function isGanttYDiagnosticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const w = window as unknown as { __PPC_GANTT_Y_DIAG__?: boolean };
    if (w.__PPC_GANTT_Y_DIAG__) return true;
    const q = new URLSearchParams(window.location.search);
    return q.get('ppcGanttYDiag') === '1' || q.get('ppcGanttPerf') === '1';
  } catch {
    return false;
  }
}
