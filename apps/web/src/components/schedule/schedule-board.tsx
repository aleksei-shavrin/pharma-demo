'use client';

import Link from 'next/link';
import { StatusPill } from '@/components/dashboard/status-pill';
import type { ScheduleItem } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  SCHEDULE_HEADER_HEIGHT_PX,
  SCHEDULE_ROW_HEIGHT_PX,
  buildScheduleHorizon,
  isScheduleAttention,
  monthLabelSpans,
} from '@/lib/schedule/schedule-geometry';
import { selectionKeyId, selectionKeyOf } from '@/lib/schedule/selection-key';
import {
  presentMilestoneName,
  scheduleKindLabel,
} from '@/lib/ui-labels';
import type { ScheduleViewMode } from './schedule-view-mode';
import { ScheduleRowMarkers } from './schedule-markers';

const linkClass =
  'block truncate font-medium text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]';

/** Split information rail — wide enough for RU titles; timeline remains primary. */
const SPLIT_LEFT_CLASS = 'w-[26rem] shrink-0';
const GANTT_LEFT_CLASS = 'w-[14rem] shrink-0';

function displayTitle(item: ScheduleItem): string {
  if (item.kind === 'milestone') {
    return presentMilestoneName(item.id, item.name);
  }
  return item.name;
}

function detailHref(item: ScheduleItem): string {
  return item.kind === 'equipment_delivery'
    ? entityDetailHref('equipment', item.id)
    : entityDetailHref('milestone', item.id);
}

function statusCell(item: ScheduleItem) {
  if (item.kind === 'equipment_delivery') {
    return <StatusPill family="equipment" value={item.status} />;
  }
  return <StatusPill family="rag" value={item.rag} entity="milestone" />;
}

type Props = {
  items: ScheduleItem[];
  mode: ScheduleViewMode;
};

/**
 * Unified Schedule control board.
 * One vertical+horizontal scroll; sticky header + sticky left rail;
 * fixed 48px rows; no row-selection chrome.
 */
export function ScheduleBoard({ items, mode }: Props) {
  const horizon = buildScheduleHorizon(items);
  const monthSpans = monthLabelSpans(horizon.months);
  const showTimeline = mode === 'split' || mode === 'gantt';
  const showWideTable = mode === 'table';

  const leftWidthClass =
    mode === 'gantt'
      ? GANTT_LEFT_CLASS
      : mode === 'split'
        ? SPLIT_LEFT_CLASS
        : 'w-full';

  const boardMinWidth = showTimeline
    ? mode === 'gantt'
      ? `calc(14rem + ${horizon.widthPx}px)`
      : `calc(26rem + ${horizon.widthPx}px)`
    : undefined;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)]"
      data-schedule-board="true"
      data-schedule-layout={mode}
      data-schedule-row-height={SCHEDULE_ROW_HEIGHT_PX}
      data-schedule-bounded="true"
    >
      <div
        className="min-h-0 flex-1 overflow-auto"
        data-schedule-viewport="true"
      >
        <div className="min-w-full" style={{ minWidth: boardMinWidth }}>
          <div
            className="sticky top-0 z-20 flex border-b border-[var(--border)] bg-[var(--surface-sunken)] text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
            style={{ height: SCHEDULE_HEADER_HEIGHT_PX }}
            data-schedule-header="true"
          >
            <div
              className={[
                'sticky left-0 z-30 flex items-center gap-3 border-r border-[var(--border)] bg-[var(--surface-sunken)] px-3',
                leftWidthClass,
              ].join(' ')}
            >
              {showWideTable ? (
                <>
                  <span className="w-24">Тип</span>
                  <span className="min-w-0 flex-1">Объект</span>
                  <span className="w-24">База</span>
                  <span className="w-24">Прогноз</span>
                  <span className="w-24">Δ</span>
                  <span className="w-28">Статус</span>
                  <span className="w-20">Крит.</span>
                </>
              ) : mode === 'gantt' ? (
                <span>Объект</span>
              ) : (
                <>
                  <span className="min-w-0 flex-1">Объект</span>
                  <span className="w-28 shrink-0">Статус</span>
                  <span className="w-24 shrink-0">Прогноз / Δ</span>
                </>
              )}
            </div>
            {showTimeline ? (
              <div
                className="relative flex-1 overflow-hidden"
                style={{ width: horizon.widthPx, minWidth: horizon.widthPx }}
                data-schedule-timeline-header="true"
              >
                {monthSpans.map((m) => (
                  <span
                    key={m.iso}
                    className="absolute inset-y-0 flex items-center justify-center overflow-hidden px-1 text-center"
                    style={{ left: `${m.leftPct}%`, width: `${m.widthPct}%` }}
                    data-month-span={m.iso}
                  >
                    <span className="truncate">{m.label}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {items.map((item) => {
            const key = selectionKeyOf(item);
            const keyId = selectionKeyId(key);
            const attention = isScheduleAttention(item);
            const emphasis = item.id === 'MS-PS' || attention;

            return (
              <div
                key={keyId}
                role="row"
                data-schedule-row={keyId}
                data-row-height={SCHEDULE_ROW_HEIGHT_PX}
                data-emphasis={emphasis ? 'true' : undefined}
                className={[
                  'flex border-b border-[var(--border-subtle)] last:border-b-0',
                  'hover:bg-[var(--interactive)]',
                  emphasis
                    ? 'border-l-2 border-l-[var(--border-strong,var(--border))]'
                    : '',
                ].join(' ')}
                style={{ height: SCHEDULE_ROW_HEIGHT_PX }}
              >
                <div
                  className={[
                    'sticky left-0 z-10 flex items-center gap-3 border-r border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 text-sm',
                    leftWidthClass,
                  ].join(' ')}
                  data-schedule-row-left="true"
                >
                  {showWideTable ? (
                    <>
                      <span className="w-24 shrink-0 text-[var(--text-secondary)]">
                        {scheduleKindLabel(item.kind)}
                      </span>
                      <span className="min-w-0 flex-1 overflow-hidden">
                        <Link href={detailHref(item)} className={linkClass}>
                          {displayTitle(item)}
                        </Link>
                        <span className="mt-0.5 block truncate font-mono text-xs text-[var(--text-muted)]">
                          {item.id}
                        </span>
                      </span>
                      <span className="w-24 shrink-0 tabular-nums text-[var(--text-secondary)]">
                        {formatDateRu(item.baselineDate)}
                      </span>
                      <span className="w-24 shrink-0 tabular-nums text-[var(--text-secondary)]">
                        {formatDateRu(item.forecastDate)}
                      </span>
                      <span className="w-24 shrink-0 tabular-nums text-[var(--text)]">
                        {formatDeltaDays(item.dateVariance.deltaDays)}
                      </span>
                      <span className="w-28 shrink-0">{statusCell(item)}</span>
                      <span className="w-20 shrink-0 text-[var(--text-secondary)]">
                        {item.kind === 'equipment_delivery'
                          ? item.critical
                            ? 'Да'
                            : 'Нет'
                          : '—'}
                      </span>
                    </>
                  ) : mode === 'gantt' ? (
                    <span className="min-w-0 flex-1 overflow-hidden">
                      <Link href={detailHref(item)} className={linkClass}>
                        {displayTitle(item)}
                      </Link>
                      <span className="mt-0.5 block truncate font-mono text-xs text-[var(--text-muted)]">
                        {item.id}
                      </span>
                    </span>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1 overflow-hidden">
                        <Link href={detailHref(item)} className={linkClass}>
                          {displayTitle(item)}
                        </Link>
                        <span className="mt-0.5 block truncate font-mono text-xs text-[var(--text-muted)]">
                          {item.id}
                        </span>
                      </span>
                      <span className="w-28 shrink-0">{statusCell(item)}</span>
                      <span className="w-24 shrink-0 text-xs tabular-nums text-[var(--text)]">
                        <span className="block">
                          {formatDateRu(item.forecastDate)}
                        </span>
                        <span className="text-[var(--text-muted)]">
                          {formatDeltaDays(item.dateVariance.deltaDays)}
                        </span>
                      </span>
                    </>
                  )}
                </div>

                {showTimeline ? (
                  <div
                    className="relative flex-1"
                    style={{
                      width: horizon.widthPx,
                      minWidth: horizon.widthPx,
                      height: SCHEDULE_ROW_HEIGHT_PX,
                    }}
                    data-schedule-row-timeline="true"
                  >
                    {monthSpans.map((m) => (
                      <span
                        key={`${keyId}-${m.iso}`}
                        className="absolute inset-y-0 w-px bg-[var(--border-subtle)]"
                        style={{ left: `${m.leftPct}%` }}
                        aria-hidden
                      />
                    ))}
                    <ScheduleRowMarkers item={item} horizon={horizon} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
