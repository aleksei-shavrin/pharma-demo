/**
 * Pure schedule warning + fill-tone semantics (Nest port of FE
 * `schedule-warning.ts` + `schedule-fill-tone.ts`). Keep tests in sync.
 */

export type ScheduleWarningTone = 'shift' | 'lag' | 'none';
export type ScheduleFillTone = 'ok' | 'warn' | 'danger';

export type ScheduleWarningItem = {
  kind: string;
  id: string;
  status?: string | null;
  sourceWeeks?: number | null;
  baselineStart?: string | null;
  baselineEnd?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  rag?: string | null;
  parentKey?: string | null;
  progressPct?: number | null;
};

export type ScheduleWarning = {
  tone: ScheduleWarningTone;
  label: string;
};

const SHIFT_LABEL = 'Прогноз отличается от базового плана';

function lagLabel(sourceWeeks: number | null): string {
  return sourceWeeks != null ? `Отставание, ${sourceWeeks} нед.` : 'Отстаёт';
}

function hasBound(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}

function rowKey(item: ScheduleWarningItem): string {
  return `${item.kind}:${item.id}`;
}

function ownScheduleWarning(item: ScheduleWarningItem): ScheduleWarning {
  if (
    item.kind === 'work' &&
    hasBound(item.baselineStart) &&
    hasBound(item.baselineEnd) &&
    (item.baselineStart !== item.startDate || item.baselineEnd !== item.endDate)
  ) {
    return { tone: 'shift', label: SHIFT_LABEL };
  }

  const sourceWeeks =
    typeof item.sourceWeeks === 'number' ? item.sourceWeeks : null;
  const delayed = item.kind === 'work' && item.status === 'Delayed';
  if (delayed || sourceWeeks !== null) {
    return { tone: 'lag', label: lagLabel(sourceWeeks) };
  }

  return { tone: 'none', label: '' };
}

export function resolveScheduleWarning(
  item: ScheduleWarningItem,
  descendants: readonly ScheduleWarningItem[] = [],
): ScheduleWarning {
  const own = ownScheduleWarning(item);
  if (own.tone !== 'none') return own;

  let sawLag = false;
  for (const descendant of descendants) {
    const warning = ownScheduleWarning(descendant);
    if (warning.tone === 'shift') {
      return { tone: 'shift', label: SHIFT_LABEL };
    }
    if (warning.tone === 'lag') sawLag = true;
  }
  if (sawLag) return { tone: 'lag', label: lagLabel(null) };
  return { tone: 'none', label: '' };
}

export function resolveScheduleFillTone(input: {
  kind: string;
  status?: string | null;
  rag?: string | null;
  warningTone: ScheduleWarningTone;
}): ScheduleFillTone {
  if (input.warningTone === 'lag') return 'danger';
  if (input.warningTone === 'shift') return 'warn';

  if (input.kind === 'work') {
    if (input.status === 'Delayed') return 'danger';
    if (input.status === 'Waiting') return 'warn';
    return 'ok';
  }
  if (input.kind === 'equipment_delivery') {
    if (input.status === 'Delayed') return 'danger';
    return 'ok';
  }
  if (input.kind === 'milestone') {
    if (input.rag === 'Red') return 'danger';
    if (input.rag === 'Yellow' || input.rag === 'Amber') return 'warn';
    return 'ok';
  }
  return 'ok';
}

export function buildScheduleChildrenMap(
  items: readonly ScheduleWarningItem[],
): Map<string, ScheduleWarningItem[]> {
  const byKey = new Map(items.map((item) => [rowKey(item), item]));
  const children = new Map<string, ScheduleWarningItem[]>();
  for (const item of items) {
    const parent = item.parentKey ?? null;
    if (!parent || !byKey.has(parent)) continue;
    const list = children.get(parent) ?? [];
    list.push(item);
    children.set(parent, list);
  }
  return children;
}

export function collectDescendants(
  rootKey: string,
  children: ReadonlyMap<string, ScheduleWarningItem[]>,
): ScheduleWarningItem[] {
  const out: ScheduleWarningItem[] = [];
  const stack = [...(children.get(rootKey) ?? [])];
  while (stack.length > 0) {
    const node = stack.pop()!;
    out.push(node);
    const nested = children.get(rowKey(node));
    if (nested) stack.push(...nested);
  }
  return out;
}

export function fillToneForProjectGroup(
  items: readonly ScheduleWarningItem[],
  projectId: string,
): { progressPct: number | null; progressFillTone: ScheduleFillTone } {
  const group = items.find(
    (item) => item.kind === 'project_group' && item.id === projectId,
  );
  if (!group) {
    return { progressPct: null, progressFillTone: 'ok' };
  }
  const children = buildScheduleChildrenMap(items);
  const descendants = collectDescendants(rowKey(group), children);
  const warning = resolveScheduleWarning(group, descendants);
  const progressFillTone = resolveScheduleFillTone({
    kind: group.kind,
    status: group.status,
    rag: group.rag,
    warningTone: warning.tone,
  });
  const progressPct =
    typeof group.progressPct === 'number' ? group.progressPct : null;
  return { progressPct, progressFillTone };
}

export function fillToneForProgramProjects(
  items: readonly ScheduleWarningItem[],
  projectIds: readonly string[],
): ScheduleFillTone {
  const children = buildScheduleChildrenMap(items);
  const allLeaves: ScheduleWarningItem[] = [];
  for (const projectId of projectIds) {
    const group = items.find(
      (item) => item.kind === 'project_group' && item.id === projectId,
    );
    if (!group) continue;
    allLeaves.push(...collectDescendants(rowKey(group), children));
  }
  const synthetic: ScheduleWarningItem = {
    kind: 'project_group',
    id: '__program__',
  };
  const warning = resolveScheduleWarning(synthetic, allLeaves);
  return resolveScheduleFillTone({
    kind: 'project_group',
    status: null,
    rag: null,
    warningTone: warning.tone,
  });
}
