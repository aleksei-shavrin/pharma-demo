import type { ScheduleComparisonMode } from './schedule-comparison';

/** Comparison ghosts (gray baseline overlays) only in forecast/actual. */
export function shouldPaintComparisonGhosts(
  comparison: ScheduleComparisonMode,
): boolean {
  return comparison !== 'baseline';
}
