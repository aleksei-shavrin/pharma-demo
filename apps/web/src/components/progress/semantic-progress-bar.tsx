import {
  scheduleFillToken,
  type ScheduleFillTone,
} from '@/lib/schedule/schedule-fill-tone';

export type SemanticProgressBarProps = {
  progressPct: number | null;
  fillTone: ScheduleFillTone;
  /** When no leaf denominator — show empty copy instead of a fake 0% bar. */
  emptyLabel?: string;
};

/**
 * Schedule-equivalent progress track + percent. Uses `--schedule-fill-*` tokens only.
 */
export function SemanticProgressBar({
  progressPct,
  fillTone,
  emptyLabel = 'нет данных',
}: SemanticProgressBarProps) {
  if (progressPct == null) {
    return (
      <span
        className="truncate text-[var(--text-muted)]"
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
      className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
      data-semantic-progress="known"
      data-progress-fill-tone={fillTone}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={`Прогресс ${clamped}%`}
    >
      <span
        className="relative h-1.5 min-w-[4rem] flex-1 overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--border-subtle)]"
        aria-hidden
        data-semantic-progress-track="true"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${clamped}%`, background: fill }}
          data-semantic-progress-fill="true"
        />
      </span>
      <span className="shrink-0 whitespace-nowrap tabular-nums text-[var(--text)]">
        {`${clamped}%`}
      </span>
    </span>
  );
}
