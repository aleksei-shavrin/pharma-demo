'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleAlert, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { StatusPill } from '@/components/dashboard/status-pill';
import type { ScheduleItem } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  SCHEDULE_COL_CRIT_PX,
  SCHEDULE_COL_DATE_PX,
  SCHEDULE_COL_DELTA_PX,
  SCHEDULE_COL_FACT_PX,
  SCHEDULE_COL_NAME_PX,
  SCHEDULE_COL_OBJECT_PX,
  SCHEDULE_COL_PROGRESS_PX,
  SCHEDULE_COL_STATUS_PX,
  SCHEDULE_COL_TYPE_PX,
  SCHEDULE_COL_WARN_PX,
  SCHEDULE_COL_WBS_PX,
  scheduleColBoxStyle,
  wideTableMinWidthPx,
  type ScheduleWideColId,
} from '@/lib/schedule/schedule-column-geometry';
import {
  scheduleFillToken,
  type ScheduleFillTone,
} from '@/lib/schedule/schedule-fill-tone';
import {
  SCHEDULE_HEADER_HEIGHT_PX,
  SCHEDULE_ROW_HEIGHT_PX,
  buildScheduleHorizon,
  isScheduleAttention,
  monthLabelSpans,
} from '@/lib/schedule/schedule-geometry';
import { SCHEDULE_LEAD_MIN_WIDTH_PX } from '@/lib/schedule/schedule-pane-layout';
import type { ScheduleComparisonMode } from '@/lib/schedule/schedule-comparison';
import {
  scheduleDateColumnLabels,
  scheduleRowDates,
} from '@/lib/schedule/schedule-item-dates';
import { selectionKeyId, selectionKeyOf } from '@/lib/schedule/selection-key';
import { presentMilestoneName, scheduleKindLabel } from '@/lib/ui-labels';
import type { ScheduleViewMode } from './schedule-view-mode';
import { ScheduleRowMarkers, ScheduleWorkBar } from './schedule-markers';

const linkClass =
  'truncate font-medium text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]';

/** Wide-table Object cell: name + id on one row; link preserved; no row growth. */
function ObjectCell({ item }: { item: ScheduleItem }) {
  const title = displayTitle(item);
  const href = detailHref(item);
  const fullLabel = `${title} (${item.id})`;
  const nameNode = href ? (
    <Link
      href={href}
      className={['min-w-0 flex-1', linkClass].join(' ')}
      title={title}
      aria-label={title}
    >
      {title}
    </Link>
  ) : (
    <span
      className="min-w-0 flex-1 truncate font-medium text-[var(--text)]"
      title={title}
      aria-label={title}
    >
      {title}
    </span>
  );
  return (
    <span
      className="flex min-w-0 items-center gap-1 overflow-hidden"
      data-schedule-object="true"
      title={fullLabel}
    >
      {nameNode}
      <span
        className="max-w-[45%] shrink-0 truncate font-mono text-xs text-[var(--text-muted)]"
        title={item.id}
        aria-label={`Идентификатор ${item.id}`}
      >
        {item.id}
      </span>
    </span>
  );
}

/** Split information rail — wide enough for RU titles; timeline remains primary. */
const SPLIT_LEFT_CLASS = 'w-[26rem] shrink-0';
const GANTT_LEFT_CLASS = 'w-[14rem] shrink-0';

/**
 * Hierarchy lead columns sit in front of the mode columns.
 * Width follows the same rem rails as the flat board, only wider so the new cells stay readable.
 */
const TREE_SPLIT_LEFT_CLASS = 'w-[48rem] shrink-0';
/** Embedded / parent-owned scroll: the rail follows the pane width, so no white gap beside the grid. */
const TREE_SPLIT_LEFT_FLUID_CLASS = 'w-full min-w-0';
const TREE_GANTT_LEFT_CLASS = 'w-[36rem] shrink-0';

function ScheduleCol({
  id,
  widthPx,
  className,
  title,
  'aria-label': ariaLabel,
  children,
}: {
  id: ScheduleWideColId;
  widthPx: number;
  className?: string;
  title?: string;
  'aria-label'?: string;
  children?: ReactNode;
}) {
  const style: CSSProperties = scheduleColBoxStyle(widthPx, id);
  return (
    <span
      data-schedule-col={id}
      className={['overflow-hidden', className].filter(Boolean).join(' ')}
      style={style}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
}

/**
 * Same 0.75rem step as `px-3` / `gap-3` on this board.
 * Depth does not introduce a separate pixel scale.
 */
const DEPTH_INDENT_CLASS = ['pl-0', 'pl-3', 'pl-6', 'pl-9', 'pl-12', 'pl-16'] as const;

export type { ScheduleFillTone };
export { scheduleFillToken };

export type ScheduleTreeRow = {
  key: string;
  depth: number;
  name: string;
  kind: string;
  wbs: string | null;
  hasChildren: boolean;
  expanded: boolean;
  progressPct: number | null;
  fillTone: ScheduleFillTone;
  warning: { tone: 'shift' | 'lag' | 'none'; label: string };
};

function displayTitle(item: ScheduleItem): string {
  if (item.kind === 'milestone') {
    return presentMilestoneName(item.id, item.name);
  }
  return item.name;
}

/** Работы не имеют карточки детализации — ссылка только у точек. */
function detailHref(item: ScheduleItem): string | null {
  if (item.kind === 'equipment_delivery') {
    return entityDetailHref('equipment', item.id);
  }
  if (item.kind === 'milestone') {
    return entityDetailHref('milestone', item.id);
  }
  return null;
}

function statusCell(item: ScheduleItem) {
  if (item.kind === 'work') {
    return <StatusPill family="work" value={item.status} />;
  }
  if (item.kind === 'equipment_delivery') {
    return <StatusPill family="equipment" value={item.status} />;
  }
  if (item.kind === 'milestone') {
    return <StatusPill family="rag" value={item.rag} entity="milestone" />;
  }
  return <span className="text-[var(--text-muted)]">—</span>;
}

function depthIndentClass(depth: number): string {
  const step = Math.max(0, Math.trunc(depth));
  return DEPTH_INDENT_CLASS[Math.min(step, DEPTH_INDENT_CLASS.length - 1)];
}

function itemsBySelectionKey(items: ScheduleItem[]): Map<string, ScheduleItem> {
  const map = new Map<string, ScheduleItem>();
  for (const item of items) {
    map.set(selectionKeyId(selectionKeyOf(item)), item);
  }
  return map;
}

function TreeLeadHeaders() {
  return (
    <>
      <ScheduleCol id="wbs" widthPx={SCHEDULE_COL_WBS_PX} className="truncate" title="ИСР">
        ИСР
      </ScheduleCol>
      <ScheduleCol
        id="name"
        widthPx={SCHEDULE_COL_NAME_PX}
        className="truncate"
        title="Наименование"
      >
        Наименование
      </ScheduleCol>
      <ScheduleCol
        id="warn"
        widthPx={SCHEDULE_COL_WARN_PX}
        className="flex items-center justify-center"
        aria-label="Предупреждение"
      >
        <TriangleAlert className="h-[15px] w-[15px] text-[var(--status-warn-fg)]" aria-hidden />
      </ScheduleCol>
      <ScheduleCol
        id="progress"
        widthPx={SCHEDULE_COL_PROGRESS_PX}
        className="truncate"
        title="Прогресс"
      >
        Прогресс
      </ScheduleCol>
    </>
  );
}

function warningIconColorClass(tone: 'shift' | 'lag' | 'none'): string {
  if (tone === 'lag') return 'text-[var(--status-danger-fg)]';
  if (tone === 'shift') return 'text-[var(--status-warn-fg)]';
  return '';
}

function TreeLeadCells({
  row,
  onToggleRow,
}: {
  row: ScheduleTreeRow;
  onToggleRow?: (key: string) => void;
}) {
  const progressPct = row.progressPct;
  const progressKnown = typeof progressPct === 'number';
  // Assumption: progress fill uses schedule FILL tokens (status *fg* text contrast untouched).
  const fill = scheduleFillToken(row.fillTone);
  const clampedPct = progressKnown ? Math.min(100, Math.max(0, progressPct)) : 0;
  const isGroup = row.kind === 'project_group' || row.kind === 'stage_group';
  // Groups show a bar only when the rollup is a number; work / EQ / MS always apply.
  const progressApplicable =
    row.kind === 'work' ||
    row.kind === 'equipment_delivery' ||
    row.kind === 'milestone' ||
    (isGroup && progressKnown);
  const wbsRaw = row.wbs;
  const wbsTrimmed = typeof wbsRaw === 'string' ? wbsRaw.trim() : '';
  const wbsDisplay = wbsTrimmed.length > 0 ? wbsTrimmed : '—';
  const wbsTitle = wbsTrimmed.length > 0 ? wbsTrimmed : undefined;
  const wbsAria =
    wbsTrimmed.length > 0 ? `ИСР ${wbsTrimmed}` : 'ИСР отсутствует';

  return (
    <>
      <ScheduleCol
        id="wbs"
        widthPx={SCHEDULE_COL_WBS_PX}
        className="truncate tabular-nums text-[var(--text-secondary)]"
        title={wbsTitle}
        aria-label={wbsAria}
      >
        <span data-schedule-wbs={wbsTrimmed.length > 0 ? wbsTrimmed : undefined}>
          {wbsDisplay}
        </span>
      </ScheduleCol>
      <ScheduleCol id="name" widthPx={SCHEDULE_COL_NAME_PX}>
        <span
          className={['flex min-w-0 items-center gap-2', depthIndentClass(row.depth)].join(' ')}
          data-depth={row.depth}
          data-schedule-name={row.name}
        >
          {row.hasChildren ? (
            <button
              type="button"
              className="relative z-20 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-xs text-[var(--text)] outline-none hover:bg-[var(--interactive)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              aria-expanded={row.expanded}
              aria-label={row.expanded ? `Свернуть ${row.name}` : `Развернуть ${row.name}`}
              onClick={() => onToggleRow?.(row.key)}
            >
              {row.expanded ? '▾' : '▸'}
            </button>
          ) : null}
          <span
            className="min-w-0 flex-1 truncate font-medium text-[var(--text)]"
            title={row.name}
            aria-label={row.name}
          >
            {row.name}
          </span>
        </span>
      </ScheduleCol>
      <ScheduleCol
        id="warn"
        widthPx={SCHEDULE_COL_WARN_PX}
        className="flex items-center justify-center"
      >
        <span data-schedule-warning={row.warning.tone}>
          {row.warning.tone === 'none' ? null : (
            <span
              tabIndex={0}
              className={`inline-flex rounded-[var(--radius-sm)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${warningIconColorClass(row.warning.tone)}`}
              title={row.warning.label}
              aria-label={row.warning.label}
            >
              <CircleAlert className="h-[15px] w-[15px]" stroke="currentColor" aria-hidden />
            </span>
          )}
        </span>
      </ScheduleCol>
      <ScheduleCol
        id="progress"
        widthPx={SCHEDULE_COL_PROGRESS_PX}
        className="flex items-center gap-2"
      >
        <span
          data-schedule-progress={
            !progressApplicable
              ? 'n/a'
              : progressKnown
                ? String(progressPct)
                : 'unknown'
          }
          className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
        >
          {!progressApplicable ? (
            <span
              className="truncate text-[var(--text-muted)]"
              title="Прогресс не применяется"
              aria-label="Прогресс не применяется"
              role="img"
            >
              —
            </span>
          ) : progressKnown ? (
            <>
                <span
                  className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--border-subtle)]"
                  aria-hidden
                  data-schedule-progress-track="true"
                >
                  <span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${clampedPct}%`, background: fill }}
                    data-schedule-progress-fill="true"
                    data-schedule-fill-tone={row.fillTone}
                  />
                </span>
              <span className="shrink-0 whitespace-nowrap tabular-nums text-[var(--text)]">{`${progressPct}%`}</span>
            </>
          ) : (
            <span className="truncate text-[var(--text-muted)]">нет данных</span>
          )}
        </span>
      </ScheduleCol>
    </>
  );
}

const FACT_COLUMN_LABELS = [
  'Прогноз, начало',
  'Прогноз, окончание',
  'Факт, начало',
  'Факт, окончание',
] as const;

function factColumnValues(item: ScheduleItem): string[] {
  if (item.kind !== 'work') return ['—', '—', '—', '—'];
  return [
    formatDateRu(item.startDate),
    formatDateRu(item.endDate),
    item.actualStart ? formatDateRu(item.actualStart) : '—',
    item.actualEnd ? formatDateRu(item.actualEnd) : '—',
  ];
}

const FACT_COL_IDS = ['fact-0', 'fact-1', 'fact-2', 'fact-3'] as const;

function FactHeaderCells() {
  return FACT_COLUMN_LABELS.map((label, index) => (
    <ScheduleCol
      key={label}
      id={FACT_COL_IDS[index]}
      widthPx={SCHEDULE_COL_FACT_PX}
      className="truncate normal-case"
      title={label}
    >
      {label}
    </ScheduleCol>
  ));
}

function FactValueCells({ item }: { item: ScheduleItem }) {
  return factColumnValues(item).map((value, index) => (
    <ScheduleCol
      key={FACT_COLUMN_LABELS[index]}
      id={FACT_COL_IDS[index]}
      widthPx={SCHEDULE_COL_FACT_PX}
      className="truncate tabular-nums text-[var(--text-secondary)]"
      title={value}
      aria-label={value}
    >
      <span data-fact-column={FACT_COLUMN_LABELS[index]}>{value}</span>
    </ScheduleCol>
  ));
}

function ModeHeaders({
  showWideTable,
  mode,
  dateLabels,
  comparison,
}: {
  showWideTable: boolean;
  mode: ScheduleViewMode;
  dateLabels: { first: string; second: string };
  comparison: ScheduleComparisonMode;
}) {
  if (showWideTable) {
    return (
      <>
        <ScheduleCol id="type" widthPx={SCHEDULE_COL_TYPE_PX} className="truncate" title="Тип">
          Тип
        </ScheduleCol>
        <ScheduleCol
          id="object"
          widthPx={SCHEDULE_COL_OBJECT_PX}
          className="truncate"
          title="Объект"
        >
          Объект
        </ScheduleCol>
        <ScheduleCol
          id="date-first"
          widthPx={SCHEDULE_COL_DATE_PX}
          className="truncate"
          title={dateLabels.first}
        >
          {dateLabels.first}
        </ScheduleCol>
        <ScheduleCol
          id="date-second"
          widthPx={SCHEDULE_COL_DATE_PX}
          className="truncate"
          title={dateLabels.second}
        >
          {dateLabels.second}
        </ScheduleCol>
        {comparison === 'actual' ? <FactHeaderCells /> : null}
        <ScheduleCol id="delta" widthPx={SCHEDULE_COL_DELTA_PX} className="truncate" title="Δ">
          Δ
        </ScheduleCol>
        <ScheduleCol
          id="status"
          widthPx={SCHEDULE_COL_STATUS_PX}
          className="truncate"
          title="Статус"
        >
          Статус
        </ScheduleCol>
        <ScheduleCol id="crit" widthPx={SCHEDULE_COL_CRIT_PX} className="truncate" title="Крит.">
          Крит.
        </ScheduleCol>
      </>
    );
  }
  if (mode === 'gantt') {
    return <span>Объект</span>;
  }
  return (
    <>
      <span className="min-w-0 flex-1">Объект</span>
      <span className="w-28 shrink-0">Статус</span>
      <span className="w-24 shrink-0">Прогноз / Δ</span>
    </>
  );
}

function ModeItemCells({
  item,
  showWideTable,
  mode,
  comparison,
}: {
  item: ScheduleItem;
  showWideTable: boolean;
  mode: ScheduleViewMode;
  comparison: ScheduleComparisonMode;
}) {
  const dates = scheduleRowDates(item);
  const workInFactMode = comparison === 'actual' && item.kind === 'work';
  if (showWideTable) {
    const typeLabel = scheduleKindLabel(item.kind);
    const dateFirst = workInFactMode ? '—' : formatDateRu(dates.first);
    const dateSecond = workInFactMode ? '—' : formatDateRu(dates.second);
    const deltaCell =
      item.kind === 'milestone' || item.kind === 'equipment_delivery'
        ? formatDeltaDays(item.dateVariance.deltaDays)
        : '—';
    const critCell =
      item.kind === 'equipment_delivery' ? (item.critical ? 'Да' : 'Нет') : '—';
    return (
      <>
        <ScheduleCol
          id="type"
          widthPx={SCHEDULE_COL_TYPE_PX}
          className="truncate text-[var(--text-secondary)]"
          title={typeLabel}
          aria-label={typeLabel}
        >
          {typeLabel}
        </ScheduleCol>
        <ScheduleCol id="object" widthPx={SCHEDULE_COL_OBJECT_PX}>
          <ObjectCell item={item} />
        </ScheduleCol>
        <ScheduleCol
          id="date-first"
          widthPx={SCHEDULE_COL_DATE_PX}
          className="truncate tabular-nums text-[var(--text-secondary)]"
          title={dateFirst}
          aria-label={dateFirst}
        >
          {dateFirst}
        </ScheduleCol>
        <ScheduleCol
          id="date-second"
          widthPx={SCHEDULE_COL_DATE_PX}
          className="truncate tabular-nums text-[var(--text-secondary)]"
          title={dateSecond}
          aria-label={dateSecond}
        >
          {dateSecond}
        </ScheduleCol>
        {comparison === 'actual' ? <FactValueCells item={item} /> : null}
        <ScheduleCol
          id="delta"
          widthPx={SCHEDULE_COL_DELTA_PX}
          className="truncate tabular-nums text-[var(--text)]"
          title={deltaCell}
          aria-label={deltaCell}
        >
          {deltaCell}
        </ScheduleCol>
        <ScheduleCol
          id="status"
          widthPx={SCHEDULE_COL_STATUS_PX}
          className="flex items-center overflow-hidden whitespace-nowrap"
        >
          {statusCell(item)}
        </ScheduleCol>
        <ScheduleCol
          id="crit"
          widthPx={SCHEDULE_COL_CRIT_PX}
          className="truncate text-[var(--text-secondary)]"
          title={critCell}
          aria-label={critCell}
        >
          {critCell}
        </ScheduleCol>
      </>
    );
  }
  if (mode === 'gantt') {
    return (
      <span className="min-w-0 flex-1 overflow-hidden">
        <ObjectCell item={item} />
      </span>
    );
  }
  return (
    <>
      <span className="min-w-0 flex-1 overflow-hidden">
        <ObjectCell item={item} />
      </span>
      <span className="w-28 shrink-0">{statusCell(item)}</span>
      <span className="w-24 shrink-0 truncate text-xs tabular-nums text-[var(--text)]">
        <span
          className="truncate"
          title={
            item.kind === 'work'
              ? `${formatDateRu(dates.first)} — ${formatDateRu(dates.second)}`
              : item.kind === 'milestone' || item.kind === 'equipment_delivery'
                ? `${formatDateRu(dates.second)} ${formatDeltaDays(item.dateVariance.deltaDays)}`
                : undefined
          }
        >
          {item.kind === 'work'
            ? `${formatDateRu(dates.first)} / ${formatDateRu(dates.second)}`
            : item.kind === 'milestone' || item.kind === 'equipment_delivery'
              ? `${formatDateRu(dates.second)} ${formatDeltaDays(item.dateVariance.deltaDays)}`
              : '—'}
        </span>
      </span>
    </>
  );
}

function ModePlaceholderCells({
  showWideTable,
  mode,
  comparison,
}: {
  showWideTable: boolean;
  mode: ScheduleViewMode;
  comparison: ScheduleComparisonMode;
}) {
  const dash = <span className="text-[var(--text-muted)]">—</span>;
  if (showWideTable) {
    return (
      <>
        <ScheduleCol id="type" widthPx={SCHEDULE_COL_TYPE_PX}>
          {dash}
        </ScheduleCol>
        <ScheduleCol id="object" widthPx={SCHEDULE_COL_OBJECT_PX}>
          {dash}
        </ScheduleCol>
        <ScheduleCol id="date-first" widthPx={SCHEDULE_COL_DATE_PX}>
          {dash}
        </ScheduleCol>
        <ScheduleCol id="date-second" widthPx={SCHEDULE_COL_DATE_PX}>
          {dash}
        </ScheduleCol>
        {comparison === 'actual'
          ? FACT_COLUMN_LABELS.map((label, index) => (
              <ScheduleCol key={label} id={FACT_COL_IDS[index]} widthPx={SCHEDULE_COL_FACT_PX}>
                {dash}
              </ScheduleCol>
            ))
          : null}
        <ScheduleCol id="delta" widthPx={SCHEDULE_COL_DELTA_PX}>
          {dash}
        </ScheduleCol>
        <ScheduleCol id="status" widthPx={SCHEDULE_COL_STATUS_PX}>
          {dash}
        </ScheduleCol>
        <ScheduleCol id="crit" widthPx={SCHEDULE_COL_CRIT_PX}>
          {dash}
        </ScheduleCol>
      </>
    );
  }
  if (mode === 'gantt') {
    return <span className="min-w-0 flex-1 overflow-hidden">{dash}</span>;
  }
  return (
    <>
      <span className="min-w-0 flex-1 overflow-hidden">{dash}</span>
      <span className="w-28 shrink-0">{dash}</span>
      <span className="w-24 shrink-0">{dash}</span>
    </>
  );
}

type Props = {
  items: ScheduleItem[];
  mode: ScheduleViewMode;
  /**
   * Visible hierarchy in caller order. When set, the board does not sort again.
   * When omitted, the flat `items` board is unchanged.
   */
  treeRows?: ScheduleTreeRow[];
  onToggleRow?: (key: string) => void;
  /**
   * List beside the hierarchical chart: number, name, warning, progress.
   * Wide date columns are omitted so the name keeps a width and the chevron stays clickable.
   */
  leadOnly?: boolean;
  comparison?: ScheduleComparisonMode;
  /** Parent presentation owns vertical scroll; board only scrolls horizontally. */
  verticalScrollOwned?: boolean;
  /** Drop own chrome when nested in a shared split frame. */
  embedded?: boolean;
  /** Shared logical-row hover key (`kind:id`); cleared on leave. */
  hoveredRowKey?: string | null;
  onHoverRow?: (key: string | null) => void;
  /**
   * When set with verticalScrollOwned, only mount `[startIndex, endIndex)`
   * and keep full logical height via top/bottom spacers.
   */
  rowWindow?: import('@/lib/schedule/schedule-virtual-window').ScheduleVirtualWindow | null;
  /** Shared selection with chart (immediate pred/succ link chain). */
  selectedKeyId?: string | null;
  onSelectRow?: (keyId: string | null) => void;
};

/**
 * Unified Schedule control board.
 * Sticky header + sticky left rail; fixed row pitch; no row-selection chrome.
 */
export function ScheduleBoard({
  items,
  mode,
  treeRows,
  onToggleRow,
  leadOnly = false,
  comparison = 'forecast',
  verticalScrollOwned = false,
  embedded = false,
  hoveredRowKey = null,
  onHoverRow,
  rowWindow = null,
  selectedKeyId = null,
  onSelectRow,
}: Props) {
  const horizon = buildScheduleHorizon(items, comparison);
  const monthSpans = monthLabelSpans(horizon.months);
  const showTimeline = !leadOnly && (mode === 'split' || mode === 'gantt');
  const showWideTable = !leadOnly && mode === 'table';
  const rowHeight = SCHEDULE_ROW_HEIGHT_PX;
  const dateLabels =
    comparison === 'actual'
      ? { first: 'Базовая дата', second: 'Прогноз' }
      : scheduleDateColumnLabels(items, {
          first: 'База',
          second: 'Прогноз',
        });
  const usingTree = treeRows !== undefined;
  const keyedItems = usingTree ? itemsBySelectionKey(items) : null;

  const leftWidthClass = usingTree
    ? mode === 'gantt'
      ? TREE_GANTT_LEFT_CLASS
      : mode === 'split'
        ? verticalScrollOwned || embedded
          ? TREE_SPLIT_LEFT_FLUID_CLASS
          : TREE_SPLIT_LEFT_CLASS
        : 'w-full'
    : mode === 'gantt'
      ? GANTT_LEFT_CLASS
      : mode === 'split'
        ? SPLIT_LEFT_CLASS
        : 'w-full';

  const railRem = usingTree
    ? mode === 'gantt'
      ? '36rem'
      : '48rem'
    : mode === 'gantt'
      ? '14rem'
      : '26rem';

  const timelineMinWidth = showTimeline
    ? `calc(${railRem} + ${horizon.widthPx}px)`
    : undefined;
  const boardMinWidth = leadOnly
    ? SCHEDULE_LEAD_MIN_WIDTH_PX
    : (timelineMinWidth ??
      (showWideTable ? wideTableMinWidthPx(comparison) : undefined));

  const allRendered = usingTree
    ? treeRows.map((treeRow) => ({
        keyId: treeRow.key,
        item: keyedItems?.get(treeRow.key) ?? null,
        treeRow,
      }))
    : items.map((item) => ({
        keyId: selectionKeyId(selectionKeyOf(item)),
        item,
        treeRow: null as ScheduleTreeRow | null,
      }));
  const virtualized =
    Boolean(rowWindow) &&
    verticalScrollOwned &&
    allRendered.length > 0 &&
    rowWindow!.rowCount === allRendered.length;
  const rendered = virtualized
    ? allRendered.slice(rowWindow!.startIndex, rowWindow!.endIndex)
    : allRendered;
  const spacerTopPx = virtualized
    ? rowWindow!.startIndex * rowWindow!.rowHeight
    : 0;
  const spacerBottomPx = virtualized
    ? Math.max(0, rowWindow!.rowCount - rowWindow!.endIndex) *
      rowWindow!.rowHeight
    : 0;

  const headerHScrollRef = useRef<HTMLDivElement | null>(null);
  const bodyHScrollRef = useRef<HTMLDivElement | null>(null);
  const proxyHScrollRef = useRef<HTMLDivElement | null>(null);
  const [bodyScrollWidth, setBodyScrollWidth] = useState(0);

  /** Keep header, body and the sticky proxy scrollbar on one scrollLeft. */
  const syncHScroll = useCallback((from: 'header' | 'body' | 'proxy') => {
    const nodes = {
      header: headerHScrollRef.current,
      body: bodyHScrollRef.current,
      proxy: proxyHScrollRef.current,
    };
    const source = nodes[from];
    if (!source) return;
    for (const [key, node] of Object.entries(nodes)) {
      if (key === from || !node) continue;
      if (node.scrollLeft !== source.scrollLeft) node.scrollLeft = source.scrollLeft;
    }
  }, []);

  useEffect(() => {
    if (!verticalScrollOwned) return;
    const body = bodyHScrollRef.current;
    if (!body) return;
    const measure = () => setBodyScrollWidth(body.scrollWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    if (body.firstElementChild) observer.observe(body.firstElementChild);
    return () => observer.disconnect();
  }, [verticalScrollOwned, boardMinWidth, rendered.length, mode, comparison]);

  const headerInner = (
    <div
      className={[
        'flex border-b border-[var(--border)] bg-[var(--surface-sunken)] text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]',
        showWideTable ? 'w-full' : '',
      ].join(' ')}
      style={{
        height: SCHEDULE_HEADER_HEIGHT_PX,
        minWidth: boardMinWidth,
        width: showWideTable ? '100%' : undefined,
      }}
      data-schedule-header="true"
    >
      <div
        className={[
          'sticky left-0 z-30 flex items-center gap-3 border-r border-[var(--border)] bg-[var(--surface-sunken)] px-3',
          leftWidthClass,
        ].join(' ')}
      >
        {usingTree ? <TreeLeadHeaders /> : null}
        {leadOnly ? null : (
          <ModeHeaders
            showWideTable={showWideTable}
            mode={mode}
            dateLabels={dateLabels}
            comparison={comparison}
          />
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
  );

  const bodyRows = (
    <>
      {rendered.map((row) => {
            const attention = row.item ? isScheduleAttention(row.item) : false;
            const emphasis = row.item?.id === 'MS-PS' || attention;

            return (
              <div
                key={row.keyId}
                role="row"
                data-schedule-row={row.keyId}
                data-schedule-row-selected={
                  selectedKeyId === row.keyId ? 'true' : undefined
                }
                aria-selected={
                  onSelectRow
                    ? selectedKeyId === row.keyId
                      ? true
                      : false
                    : undefined
                }
                data-row-height={rowHeight}
                data-emphasis={emphasis ? 'true' : undefined}
                data-schedule-row-hover={
                  hoveredRowKey === row.keyId ? 'true' : undefined
                }
                tabIndex={onSelectRow ? 0 : undefined}
                onClick={
                  onSelectRow
                    ? (event) => {
                        const t = event.target as HTMLElement;
                        if (t.closest('a,button,[data-schedule-toggle]')) return;
                        onSelectRow(
                          selectedKeyId === row.keyId ? null : row.keyId,
                        );
                      }
                    : undefined
                }
                onKeyDown={
                  onSelectRow
                    ? (event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        onSelectRow(
                          selectedKeyId === row.keyId ? null : row.keyId,
                        );
                      }
                    : undefined
                }
                onMouseEnter={() => onHoverRow?.(row.keyId)}
                onMouseLeave={() => onHoverRow?.(null)}
                className={[
                  'flex border-b border-[var(--border-subtle)] last:border-b-0',
                  // Hover background via .ppc-schedule-row-hovered (DOM / optional prop for tests).
                  hoveredRowKey === row.keyId
                    ? 'ppc-schedule-row-hovered'
                    : '',
                  selectedKeyId === row.keyId ? 'ppc-schedule-row-selected' : '',
                  onSelectRow ? 'cursor-pointer' : '',
                ].join(' ')}
                style={{
                  height: rowHeight,
                  minWidth: boardMinWidth,
                  width: showWideTable ? '100%' : undefined,
                }}
              >
                <div
                  className={[
                    'sticky left-0 z-10 flex items-center gap-3 border-r border-[var(--border-subtle)] px-3 text-sm',
                    'bg-[var(--surface-raised)]',
                    leftWidthClass,
                  ].join(' ')}
                  data-schedule-row-left="true"
                >
                  {row.treeRow ? (
                    <TreeLeadCells row={row.treeRow} onToggleRow={onToggleRow} />
                  ) : null}
                  {leadOnly ? null : row.item ? (
                    <ModeItemCells
                      item={row.item}
                      showWideTable={showWideTable}
                      mode={mode}
                      comparison={comparison}
                    />
                  ) : (
                    <ModePlaceholderCells
                      showWideTable={showWideTable}
                      mode={mode}
                      comparison={comparison}
                    />
                  )}
                </div>

                {showTimeline ? (
                  <div
                    className="relative flex-1"
                    style={{
                      width: horizon.widthPx,
                      minWidth: horizon.widthPx,
                      height: rowHeight,
                    }}
                    data-schedule-row-timeline="true"
                  >
                    {monthSpans.map((m) => (
                      <span
                        key={`${row.keyId}-${m.iso}`}
                        className="absolute inset-y-0 w-px bg-[var(--border-subtle)]"
                        style={{ left: `${m.leftPct}%` }}
                        aria-hidden
                      />
                    ))}
                    {row.item ? (
                      row.item.kind === 'work' ? (
                        <ScheduleWorkBar
                          item={row.item}
                          horizon={horizon}
                          comparison={comparison}
                        />
                      ) : row.item.kind === 'milestone' ||
                        row.item.kind === 'equipment_delivery' ? (
                        <ScheduleRowMarkers
                          item={row.item}
                          horizon={horizon}
                          comparison={comparison}
                        />
                      ) : null
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
    </>
  );

  if (verticalScrollOwned) {
    // Sticky band is outside the H-scrollports so top sticks to [data-schedule-scroll-owner].
    // Header strip: overflow-x hidden, no scrollbar; scrollLeft follows the body.
    // Body strip keeps wheel / touch H-scroll but hides its native bar (it would sit at the
    // end of all rows). A proxy bar, position: sticky; bottom: 0 inside the scroll owner,
    // stays visible and mirrors scrollLeft.
    return (
      <div
        className={[
          'flex flex-col bg-[var(--surface-raised)]',
          embedded ? 'min-h-0' : 'min-h-0 flex-1',
        ].join(' ')}
        data-schedule-board="true"
        data-schedule-layout={mode}
        data-schedule-row-height={rowHeight}
        data-schedule-lead-only={leadOnly ? 'true' : undefined}
        data-schedule-bounded="true"
        data-schedule-tree={usingTree ? 'true' : undefined}
        data-schedule-v-scroll-owned="true"
        data-schedule-virtualized={virtualized ? 'true' : undefined}
        data-schedule-logical-rows={String(allRendered.length)}
        data-schedule-dom-rows={String(rendered.length)}
      >
        <div
          className="sticky top-0 z-20 bg-[var(--surface-sunken)]"
          data-schedule-sticky-header="true"
        >
          <div
            ref={headerHScrollRef}
            className="overflow-x-hidden overflow-y-hidden [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
            data-schedule-header-hscroll="true"
            onScroll={() => syncHScroll('header')}
            aria-label="Горизонтальная прокрутка шапки таблицы"
          >
            {headerInner}
          </div>
        </div>
        <div
          ref={bodyHScrollRef}
          className="overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
          data-schedule-viewport="true"
          data-schedule-body-hscroll="true"
          onScroll={() => syncHScroll('body')}
          aria-label="Горизонтальная прокрутка таблицы календарного плана"
        >
          <div className="min-w-full" style={{ minWidth: boardMinWidth }}>
            {spacerTopPx > 0 ? (
              <div
                aria-hidden
                data-schedule-virtual-spacer="top"
                style={{ height: spacerTopPx }}
              />
            ) : null}
            {bodyRows}
            {spacerBottomPx > 0 ? (
              <div
                aria-hidden
                data-schedule-virtual-spacer="bottom"
                style={{ height: spacerBottomPx }}
              />
            ) : null}
          </div>
        </div>
        <div
          ref={proxyHScrollRef}
          className="sticky bottom-0 z-20 overflow-x-auto overflow-y-hidden bg-[var(--surface-raised)]"
          style={{ position: 'sticky', bottom: 0 }}
          data-schedule-hscroll-proxy="true"
          onScroll={() => syncHScroll('proxy')}
          aria-label="Горизонтальная полоса прокрутки таблицы"
        >
          <div style={{ width: bodyScrollWidth, height: 1 }} aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)]"
      data-schedule-board="true"
      data-schedule-layout={mode}
      data-schedule-row-height={rowHeight}
      data-schedule-lead-only={leadOnly ? 'true' : undefined}
      data-schedule-bounded="true"
      data-schedule-tree={usingTree ? 'true' : undefined}
    >
      <div
        className="min-h-0 flex-1 overflow-auto"
        data-schedule-viewport="true"
        tabIndex={0}
        aria-label="Прокрутка календарного плана"
      >
        <div className="min-w-full" style={{ minWidth: boardMinWidth }}>
          <div className="sticky top-0 z-20">{headerInner}</div>
          {bodyRows}
        </div>
      </div>
    </div>
  );
}
