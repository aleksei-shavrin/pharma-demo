/**
 * Zoom X-anchor: keep a real chart element centered across density steps.
 * Prefer selected visible bar/milestone; else nearest visible work/MS/EQ to
 * viewport center. Long bars use range intersection + midpoint (not start-only).
 */

export type ZoomAnchorCandidate = {
  id: string;
  /** Start position in current scale px. */
  startPos: number;
  /** End position; omit/equal start for milestones / points. */
  endPos?: number;
  /** Milestone / diamond — focus exact date, not midpoint. */
  point?: boolean;
};

export type ZoomAnchorPick = {
  id: string;
  /** Pixel to center after rescale (midpoint or point). */
  focusPos: number;
  reason: 'selected' | 'nearest-visible' | 'row-date';
};

function barLeft(c: ZoomAnchorCandidate): number {
  return Number.isFinite(c.startPos) ? c.startPos : Number.NaN;
}

function barRight(c: ZoomAnchorCandidate): number {
  if (c.point || c.endPos == null || !Number.isFinite(c.endPos)) {
    return barLeft(c);
  }
  return Math.max(c.startPos, c.endPos);
}

/** Focus pixel: midpoint for ranges, exact for points. */
export function zoomAnchorFocusPos(c: ZoomAnchorCandidate): number {
  const left = barLeft(c);
  if (!Number.isFinite(left)) return Number.NaN;
  if (c.point) return left;
  const right = barRight(c);
  if (!Number.isFinite(right) || right <= left) return left;
  return (left + right) / 2;
}

/** Inclusive horizontal intersection with [scrollX, scrollX+viewportWidth]. */
export function zoomAnchorIntersectsViewport(
  c: ZoomAnchorCandidate,
  scrollX: number,
  viewportWidthPx: number,
  slopPx = 8,
): boolean {
  const left = barLeft(c);
  const right = barRight(c);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
  const vw =
    Number.isFinite(viewportWidthPx) && viewportWidthPx > 0 ? viewportWidthPx : 0;
  const slop = Number.isFinite(slopPx) ? slopPx : 0;
  const viewL = (Number.isFinite(scrollX) ? scrollX : 0) - slop;
  const viewR = viewL + vw + slop * 2;
  return right >= viewL && left <= viewR;
}

function distanceToCenter(
  c: ZoomAnchorCandidate,
  scrollX: number,
  viewportWidthPx: number,
): number {
  const focus = zoomAnchorFocusPos(c);
  const center =
    (Number.isFinite(scrollX) ? scrollX : 0) +
    (Number.isFinite(viewportWidthPx) && viewportWidthPx > 0
      ? viewportWidthPx / 2
      : 0);
  return Math.abs(focus - center);
}

/**
 * Pick zoom focus: selected if it intersects viewport (start OR full range);
 * else nearest intersecting candidate to viewport center.
 */
export function pickZoomAnchor(
  candidates: readonly ZoomAnchorCandidate[],
  opts: {
    scrollX: number;
    viewportWidthPx: number;
    selectedId?: string | null;
  },
): ZoomAnchorPick | null {
  const scrollX = opts.scrollX;
  const vw = opts.viewportWidthPx;
  const selectedId = opts.selectedId ?? null;

  if (selectedId) {
    const sel = candidates.find((c) => c.id === selectedId);
    if (sel && zoomAnchorIntersectsViewport(sel, scrollX, vw)) {
      const focusPos = zoomAnchorFocusPos(sel);
      if (Number.isFinite(focusPos)) {
        return { id: sel.id, focusPos, reason: 'selected' };
      }
    }
  }

  let best: ZoomAnchorCandidate | null = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    if (!zoomAnchorIntersectsViewport(c, scrollX, vw)) continue;
    const d = distanceToCenter(c, scrollX, vw);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  if (best) {
    const focusPos = zoomAnchorFocusPos(best);
    if (Number.isFinite(focusPos)) {
      return { id: best.id, focusPos, reason: 'nearest-visible' };
    }
  }
  return null;
}

/**
 * When no painted bar intersects X but logical rows have dates outside the
 * window: pick the date position nearest to the current viewport center.
 */
export function pickNearestRowDateFocus(
  datePositions: readonly { id: string; pos: number }[],
  scrollX: number,
  viewportWidthPx: number,
): ZoomAnchorPick | null {
  const center =
    (Number.isFinite(scrollX) ? scrollX : 0) +
    (Number.isFinite(viewportWidthPx) && viewportWidthPx > 0
      ? viewportWidthPx / 2
      : 0);
  let best: { id: string; pos: number } | null = null;
  let bestDist = Infinity;
  for (const row of datePositions) {
    if (!Number.isFinite(row.pos)) continue;
    const d = Math.abs(row.pos - center);
    if (d < bestDist) {
      bestDist = d;
      best = row;
    }
  }
  if (!best) return null;
  return { id: best.id, focusPos: best.pos, reason: 'row-date' };
}
