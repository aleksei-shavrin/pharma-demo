import type { ScheduleItem } from '@/lib/api-client';
import {
  parseSelectionKeyId,
  selectionKeyId,
  selectionKeyOf,
  type ScheduleSelectionKey,
} from './selection-key';

/**
 * One DHTMLX row per logical Schedule control point.
 * Forecast is the row's milestone date; baseline (when different) is a
 * same-row overlay marker — never a second row / never duration from delta.
 */
export type GanttPresentationTask = {
  id: string;
  text: string;
  /** Forecast (primary) point — zero-duration milestone. */
  start_date: string;
  duration: 0;
  type: 'milestone';
  css: string;
  selectionKey: ScheduleSelectionKey;
  forecastDate: string;
  baselineDate: string;
  /** When true, adapter paints a ghost marker at baselineDate on this row. */
  showBaselineGhost: boolean;
};

export type GanttPresentationData = {
  data: GanttPresentationTask[];
  links: [];
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

function statusCss(item: ScheduleItem): string {
  if (item.kind === 'equipment_delivery') {
    return item.status === 'Delayed'
      ? 'ppc-eq ppc-eq-delayed'
      : 'ppc-eq ppc-eq-ontrack';
  }
  return item.rag === 'Red' ? 'ppc-ms ppc-ms-red' : 'ppc-ms ppc-ms-green';
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

/**
 * Deterministic Demo v1 fit-to-data window: all control-point dates + padding.
 * Padding keeps May↔Oct story visible without horizontal scroll at desktop width.
 */
export function computeTimelineVisibleRange(
  items: ScheduleItem[],
): TimelineVisibleRange {
  const coveredDates = items
    .flatMap((i) => [i.baselineDate, i.forecastDate])
    .sort();
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

/**
 * Point-based presentation: one visible row per control point.
 * Δ0 → forecast only; Δ≠0 → forecast row + baseline ghost metadata (overlay).
 */
export function toGanttPresentation(
  items: ScheduleItem[],
): GanttPresentationData {
  const data: GanttPresentationTask[] = items.map((item) => {
    const key = selectionKeyOf(item);
    const css = statusCss(item);
    return {
      id: selectionKeyId(key),
      text: itemLabel(item),
      start_date: item.forecastDate,
      duration: 0,
      type: 'milestone',
      css: `${css} ppc-role-forecast`,
      selectionKey: key,
      forecastDate: item.forecastDate,
      baselineDate: item.baselineDate,
      showBaselineGhost: item.baselineDate !== item.forecastDate,
    };
  });

  return { data, links: [] };
}

/** Logical row id (and legacy `:forecast`/`:baseline` ids) → selection key. */
export function presentationIdToSelectionKey(
  presentationId: string | number,
): ScheduleSelectionKey | null {
  const raw = String(presentationId);
  const legacy =
    /^(equipment_delivery|milestone):(.+):(forecast|baseline)$/.exec(raw);
  if (legacy) {
    return { kind: legacy[1] as ScheduleSelectionKey['kind'], entityId: legacy[2] };
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
