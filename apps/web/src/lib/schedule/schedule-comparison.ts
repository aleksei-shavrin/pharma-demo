import type { ScheduleWorkItem } from '@/lib/api-client';

/**
 * Три режима полос. Default = baseline-only (одна основная полоса).
 * forecast/actual сохраняют max 2 bars (база поверх нижней).
 */
export type ScheduleComparisonMode = 'baseline' | 'forecast' | 'actual';

export const BASELINE_MISSING_TOOLTIP = 'Базовый план не задан';

export const FACT_CAPTION_CLOSED = 'Факт';
export const FACT_CAPTION_OPEN = 'Прогноз — факт не завершён';
export const FACT_CAPTION_NONE = 'Прогноз — факта нет';

export function parseScheduleComparisonMode(
  raw: string | null | undefined,
): ScheduleComparisonMode {
  if (raw === 'forecast' || raw === 'actual' || raw === 'baseline') return raw;
  return 'baseline';
}

/**
 * Подпись только для режима факта.
 * Закрытый факт — обе даты; открытый — только начало; иначе факта нет.
 * Даты не выводятся из статуса или процента.
 */
export function factCaption(
  actualStart: string | null | undefined,
  actualEnd: string | null | undefined,
): string {
  if (actualStart && actualEnd) return FACT_CAPTION_CLOSED;
  if (actualStart) return FACT_CAPTION_OPEN;
  return FACT_CAPTION_NONE;
}

export function hasWorkBaseline(
  work: Pick<ScheduleWorkItem, 'baselineStart' | 'baselineEnd'>,
): boolean {
  return Boolean(work.baselineStart && work.baselineEnd);
}

/**
 * Нижняя / единственная полоса по режиму.
 * baseline: только оба конца базы; иначе null (пустая полоса, не silent forecast).
 * actual: закрытый факт заменяет прогноз.
 * forecast: прогноз.
 */
export function displayedWorkBounds(
  work: Pick<
    ScheduleWorkItem,
    'startDate' | 'endDate' | 'actualStart' | 'actualEnd' | 'baselineStart' | 'baselineEnd'
  >,
  mode: ScheduleComparisonMode,
): { start: string; end: string } | null {
  if (mode === 'baseline') {
    if (work.baselineStart && work.baselineEnd) {
      return { start: work.baselineStart, end: work.baselineEnd };
    }
    return null;
  }
  if (mode === 'actual' && work.actualStart && work.actualEnd) {
    return { start: work.actualStart, end: work.actualEnd };
  }
  return { start: work.startDate, end: work.endDate };
}

export type ScheduleLinkEdgeType = 'SS' | 'FS' | 'FF' | 'SF';

/** Край стрелки следует за показанной нижней полосой, не за скрытым интервалом. */
export function linkEdgeRole(
  type: ScheduleLinkEdgeType,
  side: 'source' | 'target',
): 'start' | 'finish' {
  if (type === 'SS') return 'start';
  if (type === 'FF') return 'finish';
  if (type === 'FS') return side === 'source' ? 'finish' : 'start';
  return side === 'source' ? 'start' : 'finish';
}

export function displayedEdge(
  work: Pick<
    ScheduleWorkItem,
    'startDate' | 'endDate' | 'actualStart' | 'actualEnd' | 'baselineStart' | 'baselineEnd'
  >,
  mode: ScheduleComparisonMode,
  role: 'start' | 'finish',
): string | null {
  const bounds = displayedWorkBounds(work, mode);
  if (!bounds) return null;
  return role === 'start' ? bounds.start : bounds.end;
}
