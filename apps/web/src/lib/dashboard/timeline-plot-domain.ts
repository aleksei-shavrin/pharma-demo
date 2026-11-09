import { EXECUTION_PHASE_START } from './executive-timeline';
import type { ExecutiveTimelineExperimentModel } from './executive-timeline-experiment';

export type TimelinePlotDomain = {
  minMs: number;
  maxMs: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoUtcMs(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/**
 * Plot domain covering every drawn temporal cue, then padded on both sides.
 * Does not mutate API horizon constants — presentation only.
 */
export function resolveTimelinePlotDomain(
  model: ExecutiveTimelineExperimentModel,
): TimelinePlotDomain {
  const dates: string[] = [
    model.horizonStart,
    model.horizonEnd,
    model.scenarioAsOfDate,
    model.band.baselineDate,
    model.band.forecastDate,
    EXECUTION_PHASE_START,
  ];
  for (const tick of model.monthTicks) {
    dates.push(tick.date);
  }
  for (const p of model.ordinaryPoints) {
    dates.push(p.forecastDate);
    if (p.baselineDate) dates.push(p.baselineDate);
  }
  let minMs = Number.POSITIVE_INFINITY;
  let maxMs = Number.NEGATIVE_INFINITY;
  for (const iso of dates) {
    const t = parseIsoUtcMs(iso);
    if (Number.isNaN(t)) continue;
    if (t < minMs) minMs = t;
    if (t > maxMs) maxMs = t;
  }
  if (!Number.isFinite(minMs) || !Number.isFinite(maxMs) || maxMs <= minMs) {
    return {
      minMs: parseIsoUtcMs(model.horizonStart),
      maxMs: parseIsoUtcMs(model.horizonEnd),
    };
  }
  const span = maxMs - minMs;
  const pad = Math.max(2 * DAY_MS, Math.round(span * 0.04));
  return { minMs: minMs - pad, maxMs: maxMs + pad };
}

export function dateToPlotRatio(
  isoDate: string,
  domain: TimelinePlotDomain,
): number {
  const t = parseIsoUtcMs(isoDate);
  const span = domain.maxMs - domain.minMs;
  if (Number.isNaN(t) || span <= 0) return 0;
  const r = (t - domain.minMs) / span;
  if (r < 0) return 0;
  if (r > 1) return 1;
  return r;
}

export function scheduleMilestoneFocusHref(milestoneId: string): string {
  const q = new URLSearchParams();
  q.set('focus', `milestone:${milestoneId}`);
  return `/schedule?${q.toString()}`;
}

export function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
