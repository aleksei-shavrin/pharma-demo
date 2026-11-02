'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ScheduleItem } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  markerGeometry,
  type ScheduleHorizon,
} from '@/lib/schedule/schedule-geometry';
import {
  equipmentStatusLabel,
  presentMilestoneName,
  ragLabel,
} from '@/lib/ui-labels';

type Props = {
  item: ScheduleItem;
  horizon: ScheduleHorizon;
};

function titleOf(item: ScheduleItem): string {
  if (item.kind === 'milestone') {
    return presentMilestoneName(item.id, item.name);
  }
  return item.name;
}

function statusLabel(item: ScheduleItem): string {
  if (item.kind === 'equipment_delivery') {
    return equipmentStatusLabel(item.status);
  }
  return ragLabel('milestone', item.rag);
}

type TipPos = { left: number; top: number; placeAbove: boolean };

/**
 * Forecast/baseline point markers. Tooltip portals to document.body so the
 * board overflow viewport does not clip it.
 */
export function ScheduleRowMarkers({ item, horizon }: Props) {
  const geom = markerGeometry(item, horizon);
  const tipId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<TipPos | null>(null);
  const isEq = item.kind === 'equipment_delivery';
  const attention =
    item.kind === 'equipment_delivery'
      ? item.status === 'Delayed'
      : item.rag === 'Red';

  const forecastClass = attention
    ? 'border-[var(--status-danger-border)] bg-[var(--status-danger-fg)]'
    : isEq
      ? 'border-[var(--border)] bg-[var(--text-secondary)]'
      : 'border-[var(--status-success-border)] bg-[var(--status-success-fg)]';

  useLayoutEffect(() => {
    if (!open || !btnRef.current) {
      setPos(null);
      return;
    }
    const r = btnRef.current.getBoundingClientRect();
    const placeAbove = r.bottom > window.innerHeight - 140;
    setPos({
      left: r.left + r.width / 2,
      top: placeAbove ? r.top - 8 : r.bottom + 8,
      placeAbove,
    });
  }, [open]);

  return (
    <div
      className="relative h-full w-full"
      data-schedule-markers={item.id}
      onMouseLeave={() => setOpen(false)}
    >
      {geom.showBaseline ? (
        <>
          <div
            className="absolute top-1/2 h-px -translate-y-1/2 bg-[var(--border)]"
            style={{
              left: `${geom.connectorLeftPct}%`,
              width: `${geom.connectorWidthPct}%`,
            }}
            aria-hidden
          />
          <span
            className={[
              'absolute top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 border-2 bg-[var(--surface-raised)] opacity-80',
              isEq ? 'size-2.5 rounded-full' : 'size-2.5 rotate-45',
              'border-[var(--text-muted)]',
            ].join(' ')}
            style={{ left: `${geom.baselineXPct}%` }}
            aria-hidden
            data-marker="baseline"
          />
        </>
      ) : null}

      <button
        ref={btnRef}
        type="button"
        className={[
          'absolute top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 border-2 outline-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-1',
          isEq ? 'size-3 rounded-full' : 'size-3 rotate-45',
          forecastClass,
        ].join(' ')}
        style={{ left: `${geom.forecastXPct}%` }}
        aria-label={`${titleOf(item)}: прогноз ${formatDateRu(item.forecastDate)}, ${statusLabel(item)}`}
        aria-describedby={open ? tipId : undefined}
        data-marker="forecast"
        data-kind={item.kind}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />

      {open && pos && typeof document !== 'undefined'
        ? createPortal(
            <div
              id={tipId}
              role="tooltip"
              data-schedule-tooltip="true"
              className="pointer-events-none fixed z-[80] max-w-[16rem] -translate-x-1/2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 py-2 text-left text-xs shadow-[var(--elevation-2)]"
              style={{
                left: pos.left,
                top: pos.top,
                transform: pos.placeAbove
                  ? 'translate(-50%, -100%)'
                  : 'translate(-50%, 0)',
              }}
            >
              <p className="font-medium text-[var(--text)]">{titleOf(item)}</p>
              <p className="mt-1 text-[var(--text-muted)]">{item.id}</p>
              <p className="mt-1 tabular-nums text-[var(--text-secondary)]">
                База: {formatDateRu(item.baselineDate)}
              </p>
              <p className="tabular-nums text-[var(--text-secondary)]">
                Прогноз: {formatDateRu(item.forecastDate)}
              </p>
              <p className="tabular-nums text-[var(--text)]">
                {formatDeltaDays(item.dateVariance.deltaDays)}
              </p>
              <p className="mt-1 text-[var(--text-secondary)]">
                {statusLabel(item)}
              </p>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
