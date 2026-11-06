'use client';

import Link from 'next/link';
import { StatusPill } from '@/components/dashboard/status-pill';
import type { ScheduleItem } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  SCHEDULE_GANTT_ROW_HEIGHT_PX,
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
import {
  presentMilestoneName,
  scheduleKindLabel,
} from '@/lib/ui-labels';
import type { ScheduleViewMode } from './schedule-view-mode';
import { ScheduleRowMarkers, ScheduleWorkBar } from './schedule-markers';

const linkClass =
  'block truncate font-medium text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]';

/** Split information rail — wide enough for RU titles; timeline remains primary. */
const SPLIT_LEFT_CLASS = 'w-[26rem] shrink-0';
const GANTT_LEFT_CLASS = 'w-[14rem] shrink-0';

/**
 * Hierarchy lead columns sit in front of the mode columns.
 * Width follows the same rem rails as the flat board, only wider so the new cells stay readable.
 */
const TREE_SPLIT_LEFT_CLASS = 'w-[48rem] shrink-0';
const TREE_GANTT_LEFT_CLASS = 'w-[36rem] shrink-0';

/** Floor for the wide date table so fixed columns do not squeeze the name to zero. */
const WIDE_TABLE_MIN_WIDTH_PX = 1040;

/**
 * Same 0.75rem step as `px-3` / `gap-3` on this board.
 * Depth does not introduce a separate pixel scale.
 */
const DEPTH_INDENT_CLASS = ['pl-0', 'pl-3', 'pl-6', 'pl-9', 'pl-12', 'pl-16'] as const;

export type ScheduleTreeRow = {
  key: string;
  depth: number;
  visibleOrdinal: number;
  name: string;
  kind: string;
  wbs: string | null;
  hasChildren: boolean;
  expanded: boolean;
  progressPct: number | null;
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

function ItemTitle({ item }: { item: ScheduleItem }) {
  const href = detailHref(item);
  if (!href) {
    return (
      <span className="block truncate font-medium text-[var(--text)]">
        {displayTitle(item)}
      </span>
    );
  }
  return (
    <Link href={href} className={linkClass}>
      {displayTitle(item)}
    </Link>
  );
}

function depthIndentClass(depth: number): string {
  const step = Math.max(0, Math.trunc(depth));
  return DEPTH_INDENT_CLASS[Math.min(step, DEPTH_INDENT_CLASS.length - 1)];
}

/** Short type next to the tree name: group / work / milestone / equipment. */
function treeKindLabel(kind: string): string {
  if (kind === 'work' || kind === 'milestone' || kind === 'equipment_delivery') {
    return scheduleKindLabel(kind);
  }
  if (kind === 'equipment') return scheduleKindLabel('equipment_delivery');
  if (kind === 'group' || kind === 'project_group' || kind === 'stage_group') {
    return 'Группа';
  }
  return kind;
}

function treeKindCategory(kind: string): 'group' | 'work' | 'milestone' | 'equipment' | 'other' {
  if (kind === 'group' || kind === 'project_group' || kind === 'stage_group') return 'group';
  if (kind === 'work') return 'work';
  if (kind === 'milestone') return 'milestone';
  if (kind === 'equipment' || kind === 'equipment_delivery') return 'equipment';
  return 'other';
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
      <span className="w-10 shrink-0">№</span>
      <span className="min-w-0 flex-1">Наименование</span>
      <span className="w-40 shrink-0">Предупреждение</span>
      <span className="w-24 shrink-0">Прогресс</span>
    </>
  );
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
  return (
    <>
      <span
        className="w-10 shrink-0 tabular-nums text-[var(--text-secondary)]"
        data-schedule-ordinal={row.visibleOrdinal}
      >
        {row.visibleOrdinal}
      </span>
      <span className="min-w-0 flex-1">
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
          <span className="min-w-0 flex-1 overflow-hidden">
            <span className="block truncate font-medium text-[var(--text)]">{row.name}</span>
            <span
              className="mt-0.5 block truncate text-xs text-[var(--text-muted)]"
              data-schedule-kind={treeKindCategory(row.kind)}
            >
              {treeKindLabel(row.kind)}
            </span>
          </span>
        </span>
      </span>
      <span
        className="w-40 shrink-0 text-xs leading-tight text-[var(--text)]"
        data-schedule-warning={row.warning.tone}
      >
        {row.warning.tone === 'none' ? null : (
          <span aria-label={row.warning.label}>{row.warning.label}</span>
        )}
      </span>
      <span
        className="flex w-24 shrink-0 flex-col justify-center gap-0.5"
        data-schedule-progress={progressKnown ? String(progressPct) : 'unknown'}
      >
        {progressKnown ? (
          <>
            <span className="tabular-nums text-xs text-[var(--text)]">{`${progressPct}%`}</span>
            <progress
              className="h-1.5 w-16 accent-[var(--primary)]"
              max={100}
              value={progressPct}
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Прогресс ${progressPct}%`}
            />
          </>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">нет данных</span>
        )}
      </span>
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

function FactHeaderCells() {
  return FACT_COLUMN_LABELS.map((label) => (
    <span key={label} className="w-40 shrink-0 normal-case">
      {label}
    </span>
  ));
}

function FactValueCells({ item }: { item: ScheduleItem }) {
  return factColumnValues(item).map((value, index) => (
    <span
      key={FACT_COLUMN_LABELS[index]}
      className="w-40 shrink-0 tabular-nums text-[var(--text-secondary)]"
      data-fact-column={FACT_COLUMN_LABELS[index]}
    >
      {value}
    </span>
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
        <span className="w-24">Тип</span>
        <span className="min-w-0 flex-1">Объект</span>
        <span className="w-24">{dateLabels.first}</span>
        <span className="w-24">{dateLabels.second}</span>
        {comparison === 'actual' ? <FactHeaderCells /> : null}
        <span className="w-24">Δ</span>
        <span className="w-28">Статус</span>
        <span className="w-20">Крит.</span>
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
    return (
      <>
        <span className="w-24 shrink-0 text-[var(--text-secondary)]">
          {scheduleKindLabel(item.kind)}
        </span>
        <span className="min-w-0 flex-1 overflow-hidden">
          <ItemTitle item={item} />
          <span className="mt-0.5 block truncate font-mono text-xs text-[var(--text-muted)]">
            {item.id}
          </span>
        </span>
        <span className="w-24 shrink-0 tabular-nums text-[var(--text-secondary)]">
          {workInFactMode ? '—' : formatDateRu(dates.first)}
        </span>
        <span className="w-24 shrink-0 tabular-nums text-[var(--text-secondary)]">
          {workInFactMode ? '—' : formatDateRu(dates.second)}
        </span>
        {comparison === 'actual' ? <FactValueCells item={item} /> : null}
        <span className="w-24 shrink-0 tabular-nums text-[var(--text)]">
          {item.kind === 'milestone' || item.kind === 'equipment_delivery'
            ? formatDeltaDays(item.dateVariance.deltaDays)
            : '—'}
        </span>
        <span className="w-28 shrink-0">{statusCell(item)}</span>
        <span className="w-20 shrink-0 text-[var(--text-secondary)]">
          {item.kind === 'equipment_delivery' ? (item.critical ? 'Да' : 'Нет') : '—'}
        </span>
      </>
    );
  }
  if (mode === 'gantt') {
    return (
      <span className="min-w-0 flex-1 overflow-hidden">
        <ItemTitle item={item} />
        <span className="mt-0.5 block truncate font-mono text-xs text-[var(--text-muted)]">
          {item.id}
        </span>
      </span>
    );
  }
  return (
    <>
      <span className="min-w-0 flex-1 overflow-hidden">
        <ItemTitle item={item} />
        <span className="mt-0.5 block truncate font-mono text-xs text-[var(--text-muted)]">
          {item.id}
        </span>
      </span>
      <span className="w-28 shrink-0">{statusCell(item)}</span>
      <span className="w-24 shrink-0 text-xs tabular-nums text-[var(--text)]">
        <span className="block">
          {formatDateRu(item.kind === 'work' ? dates.first : dates.second)}
        </span>
        <span className="text-[var(--text-muted)]">
          {item.kind === 'work'
            ? `до ${formatDateRu(dates.second)}`
            : item.kind === 'milestone' || item.kind === 'equipment_delivery'
              ? formatDeltaDays(item.dateVariance.deltaDays)
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
        <span className="w-24 shrink-0">{dash}</span>
        <span className="min-w-0 flex-1 overflow-hidden">{dash}</span>
        <span className="w-24 shrink-0">{dash}</span>
        <span className="w-24 shrink-0">{dash}</span>
        {comparison === 'actual'
          ? FACT_COLUMN_LABELS.map((label) => (
              <span key={label} className="w-40 shrink-0">
                {dash}
              </span>
            ))
          : null}
        <span className="w-24 shrink-0">{dash}</span>
        <span className="w-28 shrink-0">{dash}</span>
        <span className="w-20 shrink-0">{dash}</span>
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
};

/**
 * Unified Schedule control board.
 * One vertical+horizontal scroll; sticky header + sticky left rail;
 * fixed 48px rows; no row-selection chrome.
 */
export function ScheduleBoard({
  items,
  mode,
  treeRows,
  onToggleRow,
  leadOnly = false,
  comparison = 'forecast',
}: Props) {
  const horizon = buildScheduleHorizon(items, comparison);
  const monthSpans = monthLabelSpans(horizon.months);
  const showTimeline = !leadOnly && (mode === 'split' || mode === 'gantt');
  const showWideTable = !leadOnly && mode === 'table';
  const rowHeight = leadOnly ? SCHEDULE_GANTT_ROW_HEIGHT_PX : SCHEDULE_ROW_HEIGHT_PX;
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
        ? TREE_SPLIT_LEFT_CLASS
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
    : (timelineMinWidth ?? (showWideTable ? WIDE_TABLE_MIN_WIDTH_PX : undefined));

  const rendered = usingTree
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

          {rendered.map((row) => {
            const attention = row.item ? isScheduleAttention(row.item) : false;
            const emphasis = row.item?.id === 'MS-PS' || attention;

            return (
              <div
                key={row.keyId}
                role="row"
                data-schedule-row={row.keyId}
                data-row-height={rowHeight}
                data-emphasis={emphasis ? 'true' : undefined}
                className={[
                  'flex border-b border-[var(--border-subtle)] last:border-b-0',
                  'hover:bg-[var(--interactive)]',
                  emphasis
                    ? 'border-l-2 border-l-[var(--border-strong,var(--border))]'
                    : '',
                ].join(' ')}
                style={{ height: rowHeight }}
              >
                <div
                  className={[
                    'sticky left-0 z-10 flex items-center gap-3 border-r border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 text-sm',
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
                        <ScheduleRowMarkers item={row.item} horizon={horizon} />
                      ) : null
                    ) : null}
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
