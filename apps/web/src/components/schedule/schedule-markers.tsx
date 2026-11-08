'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  ScheduleControlPointItem,
  ScheduleWorkItem,
  ScheduleWorkStatus,
} from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  displayedWorkBounds,
  factCaption,
  type ScheduleComparisonMode,
} from '@/lib/schedule/schedule-comparison';
import {
  markerGeometry,
  workBarGeometry,
  type ScheduleHorizon,
} from '@/lib/schedule/schedule-geometry';
import {
  equipmentStatusLabel,
  presentMilestoneName,
  ragLabel,
  workStatusLabel,
} from '@/lib/ui-labels';

type Props = {
  item: ScheduleControlPointItem;
  horizon: ScheduleHorizon;
  comparison?: ScheduleComparisonMode;
};

function titleOf(item: ScheduleControlPointItem): string {
  if (item.kind === 'milestone') {
    return presentMilestoneName(item.id, item.name);
  }
  return item.name;
}

function statusLabel(item: ScheduleControlPointItem): string {
  if (item.kind === 'equipment_delivery') {
    return equipmentStatusLabel(item.status);
  }
  return ragLabel('milestone', item.rag);
}

const WORK_BAR_CLASS: Record<ScheduleWorkStatus, string> = {
  Waiting:
    'border-[var(--status-warn-border)] bg-[var(--status-warn-bg)]',
  OnSchedule:
    'border-[var(--status-info-border)] bg-[var(--status-info-bg)]',
  Delayed:
    'border-[var(--status-danger-border)] bg-[var(--status-danger-bg)]',
  Completed: 'border-[var(--status-ok-border)] bg-[var(--status-ok-bg)]',
};

type WorkBarProps = {
  item: ScheduleWorkItem;
  horizon: ScheduleHorizon;
  comparison?: ScheduleComparisonMode;
};

/** Нижняя/единственная полоса по режиму. В baseline — без серого overlay. */
export function ScheduleWorkBar({
  item,
  horizon,
  comparison = 'forecast',
}: WorkBarProps) {
  const bounds = displayedWorkBounds(item, comparison);
  if (!bounds) {
    return (
      <div
        className="relative h-full w-full"
        data-schedule-markers={item.id}
        title="Базовый план не задан"
        data-baseline-missing="true"
      />
    );
  }
  const shown = { ...item, startDate: bounds.start, endDate: bounds.end };
  const geom = workBarGeometry(shown, horizon);
  const baseline =
    comparison !== 'baseline' && item.baselineStart && item.baselineEnd
      ? workBarGeometry(
          { ...item, startDate: item.baselineStart, endDate: item.baselineEnd },
          horizon,
        )
      : null;
  const caption = comparison === 'actual' ? factCaption(item.actualStart, item.actualEnd) : null;
  const label = `${item.name}: ${formatDateRu(bounds.start)} – ${formatDateRu(bounds.end)}, ${workStatusLabel(item.status)}`;
  return (
    <div
      className="relative h-full w-full"
      data-schedule-markers={item.id}
    >
      {baseline ? (
        <span
          className="absolute top-1 h-2 rounded-[var(--radius-sm)] border border-[var(--text-muted)] bg-[var(--surface-raised)] opacity-75"
          style={{ left: `${baseline.leftPct}%`, width: `${baseline.widthPct}%` }}
          data-marker="work-baseline"
          data-kind="work"
        />
      ) : null}
      <span
        className={[
          'absolute top-1/2 h-3 -translate-y-1/2 rounded-[var(--radius-sm)] border',
          WORK_BAR_CLASS[item.status],
        ].join(' ')}
        style={{ left: `${geom.leftPct}%`, width: `${geom.widthPct}%` }}
        role="img"
        aria-label={caption ? `${label}. ${caption}` : label}
        title={caption ? `${label}. ${caption}` : label}
        data-marker="work-bar"
        data-kind="work"
        data-fact-caption={caption ?? undefined}
      />
    </div>
  );
}

type TipPos = { left: number; top: number; placeAbove: boolean };

/**
 * Forecast/baseline point markers. Tooltip portals to document.body so the
 * board overflow viewport does not clip it.
 */
export function ScheduleRowMarkers({
  item,
  horizon,
  comparison = 'forecast',
}: Props) {
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
  const baselineOnly = comparison === 'baseline';
  const primaryIso = baselineOnly
    ? item.baselineDate || null
    : item.forecastDate;
  const primaryXPct = baselineOnly
    ? geom.baselineXPct
    : geom.forecastXPct;
  const showGhost = !baselineOnly && geom.showBaseline;

  // Schedule FILL tokens (not status *fg* text contrast).
  const primaryClass = attention
    ? 'border-[var(--schedule-fill-danger)] bg-[var(--schedule-fill-danger)]'
    : isEq
      ? 'border-[var(--border)] bg-[var(--text-secondary)]'
      : 'border-[var(--schedule-fill-ok)] bg-[var(--schedule-fill-ok)]';

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

  if (baselineOnly && !primaryIso) {
    return (
      <div
        className="relative h-full w-full"
        data-schedule-markers={item.id}
        data-baseline-missing="true"
        title="Базовый план не задан"
      />
    );
  }

  return (
    <div
      className="relative h-full w-full"
      data-schedule-markers={item.id}
      onMouseLeave={() => setOpen(false)}
    >
      {showGhost ? (
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
          primaryClass,
        ].join(' ')}
        style={{ left: `${primaryXPct}%` }}
        aria-label={`${titleOf(item)}: ${baselineOnly ? 'база' : 'прогноз'} ${formatDateRu(primaryIso!)}, ${statusLabel(item)}`}
        aria-describedby={open ? tipId : undefined}
        data-marker={baselineOnly ? 'baseline-primary' : 'forecast'}
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
