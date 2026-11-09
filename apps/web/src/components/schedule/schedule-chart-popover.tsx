'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  placeScheduleChartPopover,
  type SchedulePopoverAnchorPoint,
} from '@/lib/schedule/schedule-chart-popover-placement';

export type ScheduleChartPopoverModel = {
  title: string;
  subtitle?: string | null;
  kindLabel?: string | null;
  statusLabel?: string | null;
  progressLabel?: string | null;
  dateLines: { label: string; value: string }[];
  href?: string | null;
  hrefLabel?: string;
};

type OwnerRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type Props = {
  open: boolean;
  /** Owner bar/diamond bbox in viewport coordinates. */
  owner: OwnerRect | null;
  model: ScheduleChartPopoverModel | null;
  onClose: () => void;
  onPanelEnter?: () => void;
  onPanelLeave?: () => void;
  /** Publishes panel id so the chart trigger can set aria-describedby. */
  onPanelIdChange?: (id: string | null) => void;
};

/**
 * Rich chart hover panel — dashboard tip visual via React portal.
 * Collision: measure panel then flip/clamp with 8px edge inset (no translate-50%).
 */
export function ScheduleChartPopover({
  open,
  owner,
  model,
  onClose,
  onPanelEnter,
  onPanelLeave,
  onPanelIdChange,
}: Props) {
  const tipId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<SchedulePopoverAnchorPoint | null>(null);

  useEffect(() => {
    if (!open) {
      onPanelIdChange?.(null);
      return;
    }
    onPanelIdChange?.(tipId);
    return () => onPanelIdChange?.(null);
  }, [open, tipId, onPanelIdChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useLayoutEffect(() => {
    if (!open || !owner || !model) {
      setPlaced(null);
      return;
    }
    const el = panelRef.current;
    const size = el
      ? { width: el.offsetWidth, height: el.offsetHeight }
      : { width: 280, height: 120 };
    setPlaced(placeScheduleChartPopover(owner, size));
  }, [open, owner, model]);

  if (!open || !owner || !model || typeof document === 'undefined') return null;

  const pos = placed ?? placeScheduleChartPopover(owner, { width: 280, height: 120 });

  return createPortal(
    <div
      ref={panelRef}
      id={tipId}
      role="tooltip"
      data-schedule-chart-popover="true"
      data-schedule-chart-popover-above={pos.placeAbove ? 'true' : undefined}
      className={[
        'fixed z-[90] max-w-[min(22rem,90vw)]',
        'rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)]',
        'px-2.5 py-2 text-left text-xs text-[var(--text)] shadow-[var(--elevation-2)]',
      ].join(' ')}
      style={{ left: pos.left, top: pos.top }}
      onMouseEnter={onPanelEnter}
      onMouseLeave={onPanelLeave}
    >
      <div className="font-semibold break-words">{model.title}</div>
      {model.subtitle ? (
        <div className="mt-0.5 text-[var(--text-muted)] break-all">
          {model.subtitle}
        </div>
      ) : null}
      {model.kindLabel ? (
        <div className="mt-1 text-[var(--text-secondary)]">{model.kindLabel}</div>
      ) : null}
      {model.statusLabel ? (
        <div className="mt-0.5">{model.statusLabel}</div>
      ) : null}
      {model.progressLabel ? (
        <div className="mt-0.5 text-[var(--text-secondary)]">
          {model.progressLabel}
        </div>
      ) : null}
      {model.dateLines.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5 text-[var(--text-secondary)]">
          {model.dateLines.map((line) => (
            <li key={`${line.label}:${line.value}`}>
              <span className="text-[var(--text-muted)]">{line.label}: </span>
              {line.value}
            </li>
          ))}
        </ul>
      ) : null}
      {model.href ? (
        <Link
          href={model.href}
          className="mt-2 inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--text)] no-underline hover:bg-[var(--interactive)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          data-schedule-chart-popover-link="true"
          onClick={(e) => e.stopPropagation()}
        >
          {model.hrefLabel ?? 'Открыть'}
        </Link>
      ) : null}
    </div>,
    document.body,
  );
}
