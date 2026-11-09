import {
  scheduleFillToken,
  type ScheduleFillTone,
} from '@/lib/schedule/schedule-fill-tone';

export type SemanticProgressBarProps = {
  progressPct: number | null;
  fillTone: ScheduleFillTone;
  /** When no leaf denominator — show empty copy instead of a fake 0% bar. */
  emptyLabel?: string;
  /** Optional richer meter label (e.g. % vs calendar deviation tip). */
  ariaLabel?: string;
  /**
   * Compact % label (text-xs) for tight dashboard columns.
   * Default keeps inherited size for portfolio tables.
   */
  compact?: boolean;
};

/**
 * Percent column sized in `ch` so "100%" fits tabular-nums at the active font size.
 * Track stays in the remaining fr so bar left/right align across sibling rows.
 */
export const SEMANTIC_PROGRESS_PCT_COL = '4.75ch';

/**
 * Schedule-equivalent progress track + percent. Uses `--schedule-fill-*` tokens only.
 */
export function SemanticProgressBar({
  progressPct,
  fillTone,
  emptyLabel = 'нет данных',
  ariaLabel,
  compact = false,
}: SemanticProgressBarProps) {
  if (progressPct == null) {
    return (
      <span
        className={`truncate text-[var(--text-muted)]${compact ? ' text-xs' : ''}`}
        data-semantic-progress="empty"
      >
        {emptyLabel}
      </span>
    );
  }

  const clamped = Math.min(100, Math.max(0, progressPct));
  const fill = scheduleFillToken(fillTone);

  return (
    <span
      className={`grid min-w-0 w-full items-center gap-x-1.5${compact ? ' text-xs' : ''}`}
      style={{
        gridTemplateColumns: `minmax(0, 1fr) ${SEMANTIC_PROGRESS_PCT_COL}`,
      }}
      data-semantic-progress="known"
      data-progress-fill-tone={fillTone}
      data-semantic-progress-compact={compact ? 'true' : undefined}
      data-semantic-progress-pct-col={SEMANTIC_PROGRESS_PCT_COL}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={ariaLabel ?? `Прогресс ${clamped}%`}
    >
      <span
        className="relative h-1.5 min-w-0 overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--border-subtle)]"
        aria-hidden
        data-semantic-progress-track="true"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${clamped}%`, background: fill }}
          data-semantic-progress-fill="true"
        />
      </span>
      <span
        className="shrink-0 whitespace-nowrap text-right tabular-nums text-[var(--text)]"
        data-semantic-progress-pct="true"
      >
        {`${clamped}%`}
      </span>
    </span>
  );
}
