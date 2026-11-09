'use client';

import { Minus, Plus } from 'lucide-react';

type Props = {
  levelIndex: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  disabled?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

/** Shared group chrome; −/+ icons only, no individual button border/bg. */
export function ScheduleZoomToggle({
  levelIndex,
  canZoomIn,
  canZoomOut,
  disabled = false,
  onZoomIn,
  onZoomOut,
}: Props) {
  const inactive = 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]';
  const enabled = 'text-[var(--status-info-border)]';
  return (
    <div
      role="group"
      aria-label="Масштаб шкалы"
      data-schedule-zoom-toggle="true"
      data-schedule-zoom-level={levelIndex}
      className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-sunken)] p-1"
    >
      <button
        type="button"
        aria-label="Отдалить шкалу"
        title="Отдалить"
        disabled={disabled || !canZoomOut}
        onClick={onZoomOut}
        className={[
          'inline-flex h-6 w-6 shrink-0 items-center justify-center outline-none transition-colors',
          'rounded-[var(--radius-sm)] bg-transparent',
          'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-sunken)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          !disabled && canZoomOut ? enabled : inactive,
        ].join(' ')}
      >
        <Minus className="size-[18px]" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Приблизить шкалу"
        title="Приблизить"
        disabled={disabled || !canZoomIn}
        onClick={onZoomIn}
        className={[
          'inline-flex h-6 w-6 shrink-0 items-center justify-center outline-none transition-colors',
          'rounded-[var(--radius-sm)] bg-transparent',
          'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-sunken)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          !disabled && canZoomIn ? enabled : inactive,
        ].join(' ')}
      >
        <Plus className="size-[18px]" aria-hidden />
      </button>
    </div>
  );
}
