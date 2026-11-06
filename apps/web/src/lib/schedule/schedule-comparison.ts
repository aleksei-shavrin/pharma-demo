import type { ScheduleWorkItem } from '@/lib/api-client';

/** Две пары сравнения. По умолчанию нижняя полоса — прогноз. */
export type ScheduleComparisonMode = 'forecast' | 'actual';

export const FACT_CAPTION_CLOSED = 'Факт';
export const FACT_CAPTION_OPEN = 'Прогноз — факт не завершён';
export const FACT_CAPTION_NONE = 'Прогноз — факта нет';

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

/**
 * Нижняя полоса. Факт заменяет прогноз только когда заданы оба конца.
 * Открытый факт оставляет прогноз: отметки одного начала на диаграмме нет.
 */
export function displayedWorkBounds(
  work: Pick<
    ScheduleWorkItem,
    'startDate' | 'endDate' | 'actualStart' | 'actualEnd'
  >,
  mode: ScheduleComparisonMode,
): { start: string; end: string } {
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
    'startDate' | 'endDate' | 'actualStart' | 'actualEnd'
  >,
  mode: ScheduleComparisonMode,
  role: 'start' | 'finish',
): string {
  const bounds = displayedWorkBounds(work, mode);
  return role === 'start' ? bounds.start : bounds.end;
}
