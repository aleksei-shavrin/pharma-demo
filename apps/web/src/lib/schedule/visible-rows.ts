import {
  resolveScheduleWarning,
  type ScheduleWarning,
  type ScheduleWarningItem,
} from './schedule-warning';

/**
 * Локальный структурный тип: `ScheduleItem` в api-client ещё без полей иерархии.
 * Лишние поля ответа (rag, critical, …) сохраняются на `item`.
 */
export type ScheduleHierarchyItem = ScheduleWarningItem & {
  name: string;
  parentKey?: string | null;
  wbs?: string | null;
  siblingOrder?: number | null;
  progressPct?: number | null;
  forecastDate?: string | null;
  workstream?: string | null;
  rag?: string | null;
};

export type VisibleScheduleRow<T extends ScheduleHierarchyItem = ScheduleHierarchyItem> =
  {
    key: string;
    kind: T['kind'];
    id: string;
    parentKey: string | null;
    depth: number;
    visibleOrdinal: number;
    wbs: string | null;
    name: string;
    hasChildren: boolean;
    expanded: boolean;
    progressPct: number | null;
    warning: ScheduleWarning;
    summaryStart: string | null;
    summaryEnd: string | null;
    item: T;
  };

/**
 * @deprecated Prefer `allScheduleGroupKeys(items)` — curated subset caused
 * false “no Y-scroll” (26/133). Kept as empty marker for old imports.
 */
export const DEFAULT_EXPANDED_SCHEDULE_KEYS: readonly string[] = [];

/** All project/stage group keys from the current payload. */
export function allScheduleGroupKeys(
  items: readonly { kind: string; id: string }[],
): string[] {
  return items
    .filter((item) => item.kind === 'project_group' || item.kind === 'stage_group')
    .map((item) => scheduleRowKey(item));
}

export function scheduleRowKey(item: { kind: string; id: string }): string {
  return `${item.kind}:${item.id}`;
}

export function isScheduleGroupKind(kind: string): boolean {
  return kind === 'project_group' || kind === 'stage_group';
}

export type ScheduleSummaryComparison = 'baseline' | 'forecast' | 'actual';

export type BuildVisibleScheduleRowsOptions<T extends ScheduleHierarchyItem> = {
  expandedKeys: ReadonlySet<string> | readonly string[];
  /**
   * Семя фильтра. Совпадение оставляет строку и всех предков.
   * Потомок, для которого предикат ложен, не эмитится — так поиск по группе
   * не раскрывает чужие листья, а лист удерживает цепочку групп.
   */
  includeItem?: (item: T) => boolean;
  /**
   * Bounds for group summary / horizon seed.
   * baseline → child baseline dates; actual → shown fact or forecast; forecast → forecast.
   */
  comparison?: ScheduleSummaryComparison;
};

function compareSiblings(
  a: ScheduleHierarchyItem,
  b: ScheduleHierarchyItem,
): number {
  const orderA =
    typeof a.siblingOrder === 'number' ? a.siblingOrder : Number.MAX_SAFE_INTEGER;
  const orderB =
    typeof b.siblingOrder === 'number' ? b.siblingOrder : Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;
  return a.id.localeCompare(b.id);
}

function readProgress(item: ScheduleHierarchyItem): number | null {
  return typeof item.progressPct === 'number' && Number.isFinite(item.progressPct)
    ? item.progressPct
    : null;
}

type LeafBoundsItem = ScheduleHierarchyItem & {
  baselineStart?: string | null;
  baselineEnd?: string | null;
  actualStart?: string | null;
  actualEnd?: string | null;
  baselineDate?: string | null;
};

/** Leaf dates for group rollup — follow the visible comparison primary. */
export function collectLeafBounds(
  item: LeafBoundsItem,
  comparison: ScheduleSummaryComparison,
  bounds: string[],
) {
  if (item.kind === 'work') {
    if (comparison === 'baseline') {
      // Both ends required — partial baseline must not seed summary/horizon.
      if (item.baselineStart && item.baselineEnd) {
        bounds.push(item.baselineStart, item.baselineEnd);
      }
      return;
    }
    if (
      comparison === 'actual' &&
      item.actualStart &&
      item.actualEnd
    ) {
      bounds.push(item.actualStart, item.actualEnd);
      return;
    }
    if (item.startDate) bounds.push(item.startDate);
    if (item.endDate) bounds.push(item.endDate);
    return;
  }
  if (item.kind === 'milestone' || item.kind === 'equipment_delivery') {
    if (comparison === 'baseline') {
      if (item.baselineDate) bounds.push(item.baselineDate);
      return;
    }
    if (item.forecastDate) bounds.push(item.forecastDate);
  }
}

function summaryBounds(
  descendants: readonly ScheduleHierarchyItem[],
  comparison: ScheduleSummaryComparison,
): {
  summaryStart: string | null;
  summaryEnd: string | null;
} {
  const bounds: string[] = [];
  for (const descendant of descendants) {
    collectLeafBounds(descendant, comparison, bounds);
  }
  if (bounds.length === 0) return { summaryStart: null, summaryEnd: null };
  bounds.sort();
  return { summaryStart: bounds[0], summaryEnd: bounds[bounds.length - 1] };
}

function collectDescendants<T extends ScheduleHierarchyItem>(
  key: string,
  childrenByParent: ReadonlyMap<string, readonly T[]>,
): T[] {
  const descendants: T[] = [];
  const pending = [...(childrenByParent.get(key) ?? [])];
  const seen = new Set<string>();
  while (pending.length > 0) {
    const child = pending.pop();
    if (!child) continue;
    const childKey = scheduleRowKey(child);
    if (seen.has(childKey)) continue;
    seen.add(childKey);
    descendants.push(child);
    const nested = childrenByParent.get(childKey);
    if (nested) pending.push(...nested);
  }
  return descendants;
}

/**
 * Один список видимых строк для таблицы и диаграммы.
 * Номер — порядковый среди эмитированных строк и не подменяет wbs.
 * Сводка группы смотрит всех потомков исходного списка, включая свёрнутых.
 */
export function buildVisibleScheduleRows<T extends ScheduleHierarchyItem>(
  items: readonly T[],
  options: BuildVisibleScheduleRowsOptions<T>,
): VisibleScheduleRow<T>[] {
  const expanded =
    options.expandedKeys instanceof Set
      ? options.expandedKeys
      : new Set(options.expandedKeys);
  const comparison = options.comparison ?? 'forecast';

  const byKey = new Map<string, T>();
  for (const item of items) {
    const key = scheduleRowKey(item);
    if (!byKey.has(key)) byKey.set(key, item);
  }

  const childrenByParent = new Map<string, T[]>();
  for (const item of byKey.values()) {
    const parentKey = item.parentKey ?? null;
    if (!parentKey) continue;
    const siblings = childrenByParent.get(parentKey) ?? [];
    siblings.push(item);
    childrenByParent.set(parentKey, siblings);
  }
  for (const siblings of childrenByParent.values()) {
    siblings.sort(compareSiblings);
  }

  const keep = buildKeepSet(byKey, options.includeItem);

  const parentless: T[] = [];
  const seenRoots = new Set<string>();
  for (const item of items) {
    const stored = byKey.get(scheduleRowKey(item));
    if (!stored) continue;
    // parentKey задан — строка уже чья-то дочерняя и корнем не становится
    // (MS-CLN-PANEL на C лежит под 8.2, а не вторым корнем).
    if ((stored.parentKey ?? null) !== null) continue;
    const key = scheduleRowKey(stored);
    if (seenRoots.has(key)) continue;
    seenRoots.add(key);
    parentless.push(stored);
  }

  const projectRoots = parentless
    .filter((item) => item.kind === 'project_group')
    .sort(compareSiblings);
  const otherRoots = parentless.filter((item) => item.kind !== 'project_group');

  const rows: VisibleScheduleRow<T>[] = [];
  const emitted = new Set<string>();

  const emit = (item: T, depth: number) => {
    const key = scheduleRowKey(item);
    if (emitted.has(key)) return;
    if (keep && !keep.has(key)) return;
    emitted.add(key);

    const childList = childrenByParent.get(key) ?? [];
    const descendants = collectDescendants(key, childrenByParent);
    const hasChildren = childList.some(
      (child) => !keep || keep.has(scheduleRowKey(child)),
    );
    const summary = isScheduleGroupKind(item.kind)
      ? summaryBounds(descendants, comparison)
      : { summaryStart: null, summaryEnd: null };

    rows.push({
      key,
      kind: item.kind,
      id: item.id,
      parentKey: item.parentKey ?? null,
      depth,
      visibleOrdinal: rows.length + 1,
      wbs: item.wbs ?? null,
      name: item.name,
      hasChildren,
      expanded: expanded.has(key),
      progressPct: readProgress(item),
      warning: resolveScheduleWarning(item, descendants),
      summaryStart: summary.summaryStart,
      summaryEnd: summary.summaryEnd,
      item,
    });

    if (!expanded.has(key)) return;
    for (const child of childList) emit(child, depth + 1);
  };

  for (const root of [...projectRoots, ...otherRoots]) emit(root, 0);
  return rows;
}

/**
 * includeItem выбирает семена. Предок семени остаётся, даже если сам предикат
 * для группы ложен — иначе фильтр листа стирает проект и этап.
 */
function buildKeepSet<T extends ScheduleHierarchyItem>(
  byKey: ReadonlyMap<string, T>,
  includeItem: ((item: T) => boolean) | undefined,
): Set<string> | null {
  if (!includeItem) return null;
  const keep = new Set<string>();
  for (const item of byKey.values()) {
    if (!includeItem(item)) continue;
    let current: T | undefined = item;
    const guard = new Set<string>();
    while (current) {
      const key = scheduleRowKey(current);
      if (guard.has(key)) break;
      guard.add(key);
      keep.add(key);
      const parentKey = current.parentKey ?? null;
      if (!parentKey) break;
      current = byKey.get(parentKey);
    }
  }
  return keep;
}
