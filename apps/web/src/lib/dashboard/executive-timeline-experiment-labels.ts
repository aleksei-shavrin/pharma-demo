import type { TimelineMilestonePoint } from './executive-timeline';

/** Below this host width, experimental renderers drop low-priority labels. */
export const EXPERIMENT_NARROW_LABEL_WIDTH_PX = 520;

export type SnapshotLabelAlign = 'start' | 'center' | 'end';

/**
 * Edge alignment for the external «Дата снимка» chrome (variant 1 pattern).
 */
export function resolveSnapshotLabelAlign(ratio: number): SnapshotLabelAlign {
  if (ratio < 0.08) return 'start';
  if (ratio > 0.85) return 'end';
  return 'center';
}

export function snapshotDateCaption(formattedDateRu: string): string {
  return `Дата снимка: ${formattedDateRu}`;
}

/**
 * Narrow-screen priority for which milestone shortLabels stay visible.
 * Always keep Red; then prefer points that are not in a dense local cluster;
 * fill remaining slots until a soft cap.
 */
export function selectVisibleMilestoneLabelIds(
  points: readonly TimelineMilestonePoint[],
  opts: { narrow: boolean; maxLabels?: number },
): Set<string> {
  const maxLabels = opts.maxLabels ?? (opts.narrow ? 6 : points.length);
  if (!opts.narrow || points.length <= maxLabels) {
    return new Set(points.map((p) => p.id));
  }

  const sorted = [...points].sort((a, b) => a.ratio - b.ratio);
  const denseGap = 0.045;
  const scored = sorted.map((p, index) => {
    const prev = sorted[index - 1];
    const next = sorted[index + 1];
    const nearPrev = prev ? p.ratio - prev.ratio < denseGap : false;
    const nearNext = next ? next.ratio - p.ratio < denseGap : false;
    const inCluster = nearPrev || nearNext;
    let score = 0;
    if (p.rag === 'Red') score += 100;
    if (!inCluster) score += 40;
    // Prefer outer lanes already chosen by strip layout (harder to read when hidden).
    score += (2 - p.labelLane) * 5;
    score += p.labelSide === 'above' ? 1 : 0;
    return { id: p.id, score, ratio: p.ratio };
  });

  scored.sort((a, b) => b.score - a.score || a.ratio - b.ratio);
  return new Set(scored.slice(0, maxLabels).map((s) => s.id));
}

/** Map strip lanes to ECharts label distance (px from symbol). */
export function echartsLabelDistance(lane: 0 | 1 | 2): number {
  return 10 + lane * 14;
}

export function echartsLabelPosition(
  side: 'above' | 'below',
): 'top' | 'bottom' {
  return side === 'above' ? 'top' : 'bottom';
}

/**
 * Per-program (same ECharts category row) label selection to avoid
 * horizontal pile-ups like «Котлован» / «Контур здания» on one lane.
 * Always densifies — wide view still caps; Red kept; soft global cap.
 */
export function selectLaneAwareMilestoneLabelIds(
  points: readonly TimelineMilestonePoint[],
  opts: {
    narrow: boolean;
    programIdFor: (point: TimelineMilestonePoint) => string;
    preferIds?: ReadonlySet<string>;
    maxPerProgram?: number;
    maxTotal?: number;
  },
): Set<string> {
  const maxPer = opts.maxPerProgram ?? (opts.narrow ? 2 : 3);
  const maxTotal = opts.maxTotal ?? (opts.narrow ? 6 : 12);
  const prefer = opts.preferIds ?? new Set<string>();
  const denseGap = opts.narrow ? 0.06 : 0.04;

  const byProgram = new Map<string, TimelineMilestonePoint[]>();
  for (const p of points) {
    const pid = opts.programIdFor(p);
    const list = byProgram.get(pid) ?? [];
    list.push(p);
    byProgram.set(pid, list);
  }

  const chosen: { id: string; score: number; ratio: number }[] = [];

  for (const group of byProgram.values()) {
    const sorted = [...group].sort((a, b) => a.ratio - b.ratio || a.id.localeCompare(b.id));
    const scored = sorted.map((p, index) => {
      const prev = sorted[index - 1];
      const next = sorted[index + 1];
      const nearPrev = prev ? p.ratio - prev.ratio < denseGap : false;
      const nearNext = next ? next.ratio - p.ratio < denseGap : false;
      let score = 0;
      if (p.rag === 'Red') score += 100;
      if (prefer.has(p.id)) score += 50;
      if (!nearPrev && !nearNext) score += 30;
      score += (2 - p.labelLane) * 5;
      score += p.labelSide === 'above' ? 1 : 0;
      return { id: p.id, score, ratio: p.ratio };
    });
    scored.sort((a, b) => b.score - a.score || a.ratio - b.ratio);

    const picked: typeof scored = [];
    for (const cand of scored) {
      if (picked.length >= maxPer) break;
      const tooClose = picked.some(
        (x) => Math.abs(x.ratio - cand.ratio) < denseGap,
      );
      if (tooClose && cand.score < 100) continue;
      picked.push(cand);
    }
    // Ensure Reds in this row even if over soft spacing.
    for (const p of sorted) {
      if (p.rag !== 'Red') continue;
      if (picked.some((x) => x.id === p.id)) continue;
      if (picked.length >= maxPer) {
        const weakest = [...picked].sort((a, b) => a.score - b.score)[0];
        if (weakest && weakest.score < 100) {
          picked.splice(picked.indexOf(weakest), 1);
        } else {
          continue;
        }
      }
      picked.push({ id: p.id, score: 100, ratio: p.ratio });
    }
    chosen.push(...picked);
  }

  chosen.sort((a, b) => b.score - a.score || a.ratio - b.ratio);
  return new Set(chosen.slice(0, maxTotal).map((c) => c.id));
}
