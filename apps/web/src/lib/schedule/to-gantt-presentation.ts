import type {
  ScheduleItem,
  ScheduleLink,
  ScheduleLinkType,
  ScheduleWorkItem,
} from '@/lib/api-client';
import {
  BASELINE_MISSING_TOOLTIP,
  displayedWorkBounds,
  factCaption,
  type ScheduleComparisonMode,
} from './schedule-comparison';
import { scheduleCoveredDates } from './schedule-item-dates';
import {
  parseSelectionKeyId,
  selectionKeyId,
  selectionKeyOf,
  type ScheduleSelectionKey,
} from './selection-key';

/**
 * Visible-row shape for the main gantt. Duplicated so this module does not
 * import the table's row owner (import cycle). Groups carry summary bounds;
 * works and control points carry the schedule `item`.
 */
export type GanttTreeRowKind =
  | ScheduleItem['kind']
  | 'project_group'
  | 'stage_group';

export type GanttTreeRow = {
  key: string;
  kind: GanttTreeRowKind;
  id: string;
  name: string;
  progressPct: number | null;
  summaryStart: string | null;
  summaryEnd: string | null;
  item: ScheduleItem | null;
};

export type GanttPresentationSelectionKey = {
  kind: GanttTreeRowKind;
  entityId: string;
};

/**
 * One DHTMLX row per logical Schedule item.
 * Control point: forecast is the row's milestone date (duration 0); baseline
 * (when different) is a same-row overlay marker — never a second row.
 * Work: inclusive-calendar-day bar (`type: 'task'`, duration >= 1), no baseline.
 * Group (only when `treeRows` is passed): `type: 'project'` summary bar.
 */
export type GanttPresentationTask = {
  id: string;
  text: string;
  /** Forecast point for milestones; work or summary start. Omitted when the row has no bar. */
  start_date?: string;
  /**
   * 0 for milestones; inclusive calendar days (>= 1) for work and summary bars.
   * Omitted when the row has no bar. Works are never duration 0.
   */
  duration?: number;
  type: 'milestone' | 'task' | 'project';
  css: string;
  selectionKey: GanttPresentationSelectionKey;
  /** Control points only. */
  forecastDate?: string;
  /** Control points only. */
  baselineDate?: string;
  /** When true, adapter paints a ghost marker at baselineDate on this row. */
  showBaselineGhost: boolean;
  /** Work baseline interval. Both absent means the forecast bar stands alone. */
  baselineStart?: string | null;
  baselineEnd?: string | null;
  /** Fact-mode caption. Absent in the default forecast comparison. */
  factCaption?: string;
  /**
   * Known work progress as a fraction (0..1). `0` is a known zero.
   * Omitted when progress is unknown — not stored as 0.
   */
  progress?: number;
  /**
   * Chart stage: leave empty — percent/name live in the adapter `title` only.
   * Progress unknown still omits `progress` (no 0% confusion).
   */
  barCaption?: string;
  /** Row stays in the chart with no task bar (group without both summary bounds). */
  unscheduled?: boolean;
  /**
   * Community project tasks drop their own dates unless this is strictly false
   * (scheduled summary). This is not the auto-scheduling engine and not baselines.
   */
  auto_scheduling?: false;
};

/**
 * DHTMLX Community stores link types as strings: "0" FS, "1" SS, "2" FF, "3" SF
 * (`gantt.config.links`). Single source of truth for presentation + adapter config.
 */
export const GANTT_LINK_TYPE_CODE = {
  FS: '0',
  SS: '1',
  FF: '2',
  SF: '3',
} as const satisfies Record<ScheduleLinkType, string>;

export const CROSS_PROJECT_PREDECESSOR_CAPTION =
  'Межпроектное предшествование, тип не указан';

export type GanttPresentationLink = {
  id: string;
  source: string;
  target: string;
  /**
   * DHTMLX geometry code for scheduling links.
   * Absent on a cross-project predecessor: the adapter fills that code itself.
   */
  type?: (typeof GANTT_LINK_TYPE_CODE)[ScheduleLinkType];
  accessibleName?: string;
};

export type GanttPresentationData = {
  data: GanttPresentationTask[];
  links: GanttPresentationLink[];
};

export type TimelineVisibleRange = {
  /** Inclusive ISO date — padded min of baseline/forecast. */
  start: string;
  /** Exclusive-ish end ISO date used as DHTMLX end_date (day after padded max). */
  end: string;
  /** Canonical dates that must remain inside the padded window. */
  coveredDates: string[];
};

function itemLabel(item: ScheduleItem): string {
  return item.id;
}

const WORK_STATUS_CSS: Record<ScheduleWorkItem['status'], string> = {
  Waiting: 'ppc-work ppc-work-waiting',
  OnSchedule: 'ppc-work ppc-work-onschedule',
  Delayed: 'ppc-work ppc-work-delayed',
  Completed: 'ppc-work ppc-work-completed',
};

function statusCss(item: ScheduleItem): string {
  switch (item.kind) {
    case 'work':
      return WORK_STATUS_CSS[item.status];
    case 'project_group':
    case 'stage_group':
      return 'ppc-summary';
    case 'equipment_delivery':
      return item.status === 'Delayed'
        ? 'ppc-eq ppc-eq-delayed'
        : 'ppc-eq ppc-eq-ontrack';
    case 'milestone':
      // Outline vs filled diamond — a one-day work bar must not share this geometry.
      return item.rag === 'Red'
        ? 'ppc-ms ppc-ms-red ppc-ms-outline'
        : 'ppc-ms ppc-ms-green ppc-ms-filled';
    default: {
      const unreachable: never = item;
      return unreachable;
    }
  }
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(iso: string, days: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

const MS_PER_DAY = 86_400_000;

/** Inclusive calendar-day span (same-day → 1); DST-safe via UTC midnight. */
export function inclusiveDurationDays(startIso: string, endIso: string): number {
  const toUtc = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const diff = Math.round((toUtc(endIso) - toUtc(startIso)) / MS_PER_DAY);
  return Math.max(diff, 0) + 1;
}

/**
 * Deterministic Demo v1 fit-to-data window: all control-point dates + padding.
 * Padding keeps May↔Oct story visible without horizontal scroll at desktop width.
 */
export function computeTimelineVisibleRange(
  items: ScheduleItem[],
  extraDates?: readonly (string | null | undefined)[],
  comparison: ScheduleComparisonMode = 'forecast',
): TimelineVisibleRange {
  const coveredDates = [
    ...items.flatMap((item) => scheduleCoveredDates(item, comparison)),
    ...(extraDates ?? []).filter((date): date is string => Boolean(date)),
  ].sort();
  if (coveredDates.length === 0) {
    return {
      start: '2027-05-01',
      end: '2027-10-01',
      coveredDates: [],
    };
  }
  const min = coveredDates[0];
  const max = coveredDates[coveredDates.length - 1];
  const PAD_DAYS = 14;
  return {
    start: addDays(min, -PAD_DAYS),
    end: addDays(max, PAD_DAYS + 1),
    coveredDates: [...new Set(coveredDates)],
  };
}

function toPresentationTask(
  item: ScheduleItem,
  comparison: ScheduleComparisonMode,
): GanttPresentationTask {
  const key = selectionKeyOf(item);
  const css = statusCss(item);
  switch (item.kind) {
    case 'work': {
      const bounds = displayedWorkBounds(item, comparison);
      if (!bounds) {
        return {
          id: selectionKeyId(key),
          text: itemLabel(item),
          type: 'task',
          css: `${css} ppc-baseline-missing`,
          selectionKey: key,
          showBaselineGhost: false,
          baselineStart: null,
          baselineEnd: null,
          unscheduled: true,
          barCaption: BASELINE_MISSING_TOOLTIP,
        };
      }
      const showGhost =
        comparison !== 'baseline' &&
        Boolean(item.baselineStart && item.baselineEnd);
      return {
        id: selectionKeyId(key),
        text: itemLabel(item),
        start_date: bounds.start,
        duration: inclusiveDurationDays(bounds.start, bounds.end),
        type: 'task',
        css,
        selectionKey: key,
        showBaselineGhost: false,
        baselineStart: showGhost ? item.baselineStart ?? null : null,
        baselineEnd: showGhost ? item.baselineEnd ?? null : null,
        ...(comparison === 'actual'
          ? { factCaption: factCaption(item.actualStart, item.actualEnd) }
          : {}),
      };
    }
    case 'project_group':
    case 'stage_group':
      // Summary bounds live on treeRows. A bare group in the flat list has no bar.
      return {
        id: selectionKeyId(key),
        text: item.name,
        type: 'project',
        css,
        selectionKey: key,
        showBaselineGhost: false,
        auto_scheduling: false,
        unscheduled: true,
      };
    case 'milestone':
    case 'equipment_delivery': {
      const primaryDate =
        comparison === 'baseline'
          ? item.baselineDate || null
          : item.forecastDate;
      if (comparison === 'baseline' && !item.baselineDate) {
        return {
          id: selectionKeyId(key),
          text: itemLabel(item),
          type: 'milestone',
          css: `${css} ppc-baseline-missing`,
          selectionKey: key,
          showBaselineGhost: false,
          unscheduled: true,
          barCaption: BASELINE_MISSING_TOOLTIP,
        };
      }
      return {
        id: selectionKeyId(key),
        text: itemLabel(item),
        start_date: primaryDate!,
        duration: 0,
        type: 'milestone',
        css: `${css} ${comparison === 'baseline' ? 'ppc-role-baseline' : 'ppc-role-forecast'}`,
        selectionKey: key,
        forecastDate: item.forecastDate,
        baselineDate: item.baselineDate,
        showBaselineGhost:
          comparison !== 'baseline' &&
          Boolean(item.baselineDate) &&
          item.baselineDate !== item.forecastDate,
      };
    }
    default: {
      const unreachable: never = item;
      return unreachable;
    }
  }
}

function toPresentationLinks(
  tasks: readonly GanttPresentationTask[],
  links: ScheduleLink[],
  items: readonly ScheduleItem[],
  comparison: ScheduleComparisonMode,
): GanttPresentationLink[] {
  const scheduledIds = new Set(
    tasks
      .filter((task) => task.unscheduled !== true)
      .filter((task) => task.type === 'task' || task.type === 'milestone')
      .map((task) => task.id),
  );
  const worksById = new Map(
    items.filter((item) => item.kind === 'work').map((item) => [item.id, item]),
  );
  const mapped: GanttPresentationLink[] = [];
  const isLeafTask = (ref: string) => scheduledIds.has(ref);
  for (const link of links) {
    if (link.kind === 'cross_project_predecessor') {
      if (!isLeafTask(link.sourceRef) || !isLeafTask(link.targetRef)) {
        continue;
      }
      const work =
        link.targetRef.startsWith('work:')
          ? worksById.get(link.targetRef.slice('work:'.length))
          : undefined;
      // Closed fact replaces the forecast bar. The line is not redrawn onto that fact.
      if (
        comparison === 'actual' &&
        work?.actualStart &&
        work.actualEnd
      ) {
        continue;
      }
      mapped.push({
        id: link.id,
        source: link.sourceRef,
        target: link.targetRef,
        accessibleName: CROSS_PROJECT_PREDECESSOR_CAPTION,
      });
      continue;
    }
    if (
      link.type == null ||
      !isLeafTask(link.sourceRef) ||
      !isLeafTask(link.targetRef)
    ) {
      continue;
    }
    mapped.push({
      id: link.id,
      source: link.sourceRef,
      target: link.targetRef,
      type: GANTT_LINK_TYPE_CODE[link.type],
    });
  }
  return mapped;
}

function rowTaskId(row: GanttTreeRow): string {
  return row.key.trim().length > 0 ? row.key : `${row.kind}:${row.id}`;
}

function rowLabel(row: GanttTreeRow): string {
  return row.name.trim().length > 0 ? row.name : row.id;
}

/** Tooltip percent follows the progress class. Vendor parse stores a missing value as 0. */
export function workBarTooltip(task: {
  text?: string;
  factCaption?: string;
  progress?: number;
  css?: string;
  type?: string;
}): string {
  const css = task.css ?? '';
  const progressKnown =
    css.includes('ppc-progress-known') || css.includes('ppc-progress-zero');
  let percentPart = '';
  if (task.type === 'task' && progressKnown && typeof task.progress === 'number') {
    const pct = Math.round(task.progress * 100);
    percentPart = Number.isFinite(pct) ? `${pct}%` : '';
  }
  return [task.text ?? '', percentPart, task.factCaption ?? '']
    .filter((part) => part.length > 0)
    .join(' · ');
}

function workProgressPresentation(progressPct: number | null): {
  cssClass: string;
  progress?: number;
  barCaption: string;
} {
  if (progressPct === null) {
    return { cssClass: 'ppc-progress-unknown', barCaption: '' };
  }
  if (progressPct === 0) {
    return { cssClass: 'ppc-progress-zero', progress: 0, barCaption: '' };
  }
  return {
    cssClass: 'ppc-progress-known',
    progress: progressPct / 100,
    barCaption: '',
  };
}

function groupPresentationTask(row: GanttTreeRow): GanttPresentationTask {
  const task: GanttPresentationTask = {
    id: rowTaskId(row),
    text: rowLabel(row),
    type: 'project',
    css: 'ppc-summary',
    selectionKey: { kind: row.kind, entityId: row.id },
    showBaselineGhost: false,
    auto_scheduling: false,
  };
  if (!row.summaryStart || !row.summaryEnd) {
    return { ...task, unscheduled: true };
  }
  return {
    ...task,
    start_date: row.summaryStart,
    duration: inclusiveDurationDays(row.summaryStart, row.summaryEnd),
  };
}

function workTreeTask(
  row: GanttTreeRow,
  comparison: ScheduleComparisonMode,
): GanttPresentationTask {
  const progress = workProgressPresentation(row.progressPct);
  const progressFields = {
    barCaption: progress.barCaption,
    ...(progress.progress === undefined ? {} : { progress: progress.progress }),
  };
  if (!row.item || row.item.kind !== 'work') {
    return {
      id: rowTaskId(row),
      text: rowLabel(row),
      type: 'task',
      css: `ppc-work ${progress.cssClass}`,
      selectionKey: { kind: 'work', entityId: row.id },
      showBaselineGhost: false,
      unscheduled: true,
      ...progressFields,
    };
  }
  const task = toPresentationTask(row.item, comparison);
  return {
    ...task,
    id: rowTaskId(row),
    text: rowLabel(row),
    css: `${task.css} ${progress.cssClass}`,
    ...progressFields,
  };
}

function controlPointTreeTask(
  row: GanttTreeRow,
  comparison: ScheduleComparisonMode,
): GanttPresentationTask {
  if (
    row.item &&
    (row.item.kind === 'milestone' || row.item.kind === 'equipment_delivery') &&
    row.item.kind === row.kind
  ) {
    const task = toPresentationTask(row.item, comparison);
    return {
      ...task,
      id: rowTaskId(row),
      text: rowLabel(row),
    };
  }
  const equipment = row.kind === 'equipment_delivery';
  const roleCss =
    comparison === 'baseline' ? 'ppc-role-baseline' : 'ppc-role-forecast';
  return {
    id: rowTaskId(row),
    text: rowLabel(row),
    type: 'milestone',
    css: equipment
      ? `ppc-eq ppc-eq-ontrack ${roleCss}`
      : `ppc-ms ppc-ms-red ppc-ms-outline ${roleCss}`,
    selectionKey: {
      kind: equipment ? 'equipment_delivery' : 'milestone',
      entityId: row.id,
    },
    showBaselineGhost: false,
    unscheduled: true,
  };
}

/** Caller order is the chart order. No parent link and no `open` — the app owns expand. */
function treeRowToTask(
  row: GanttTreeRow,
  comparison: ScheduleComparisonMode,
): GanttPresentationTask {
  if (row.kind === 'project_group' || row.kind === 'stage_group') {
    return groupPresentationTask(row);
  }
  if (row.kind === 'work') return workTreeTask(row, comparison);
  return controlPointTreeTask(row, comparison);
}

/**
 * One visible row per item. Control points: Δ0 → forecast only; Δ≠0 → forecast
 * row + baseline ghost metadata. Works: duration bar. Scheduling links stay
 * on work bars. A cross-project predecessor also needs its milestone row.
 *
 * When `treeRows` is passed, those rows are rendered in that order and `items`
 * are not re-listed. Omit `treeRows` for the flat snapshot.
 */
export function toGanttPresentation(
  items: ScheduleItem[],
  links: ScheduleLink[] = [],
  treeRows?: readonly GanttTreeRow[],
  options?: { comparison?: ScheduleComparisonMode },
): GanttPresentationData {
  const comparison = options?.comparison ?? 'forecast';
  const data =
    treeRows != null
      ? treeRows.map((row) => treeRowToTask(row, comparison))
      : items.map((item) => toPresentationTask(item, comparison));
  return {
    data,
    links: toPresentationLinks(data, links, items, comparison),
  };
}

/** Logical row id (and legacy `:forecast`/`:baseline`/`:actual` ids) → selection key. */
export function presentationIdToSelectionKey(
  presentationId: string | number,
): ScheduleSelectionKey | null {
  const raw = String(presentationId);
  const layered =
    /^(equipment_delivery|milestone|work|project_group|stage_group):(.+):(forecast|baseline|actual)$/.exec(
      raw,
    );
  if (layered) {
    return {
      kind: layered[1] as ScheduleSelectionKey['kind'],
      entityId: layered[2],
    };
  }
  return parseSelectionKeyId(raw);
}

/** DHTMLX task id for a logical selection (one row). */
export function logicalPresentationId(key: ScheduleSelectionKey): string {
  return selectionKeyId(key);
}

/** @deprecated use logicalPresentationId — kept as alias for call sites. */
export function forecastPresentationId(key: ScheduleSelectionKey): string {
  return logicalPresentationId(key);
}
