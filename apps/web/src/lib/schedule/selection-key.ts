import type { ScheduleItem } from '@/lib/api-client';

/** Stable Schedule selection identity — never array index. */
export type ScheduleSelectionKey = {
  kind: ScheduleItem['kind'];
  entityId: string;
};

export function selectionKeyOf(item: ScheduleItem): ScheduleSelectionKey {
  return { kind: item.kind, entityId: item.id };
}

export function selectionKeyEquals(
  a: ScheduleSelectionKey | null,
  b: ScheduleSelectionKey | null,
): boolean {
  if (!a || !b) return a === b;
  return a.kind === b.kind && a.entityId === b.entityId;
}

export function selectionKeyId(key: ScheduleSelectionKey): string {
  return `${key.kind}:${key.entityId}`;
}

export function parseSelectionKeyId(
  id: string,
): ScheduleSelectionKey | null {
  const m =
    /^(equipment_delivery|milestone|work|project_group|stage_group):(.+)$/.exec(
      id,
    );
  if (!m) return null;
  return { kind: m[1] as ScheduleSelectionKey['kind'], entityId: m[2] };
}
