/**
 * Клиентское предупреждение строки. Отдельного поля API нет.
 * `scenarioAsOfDate` сюда не входит: сдвиг считается только по паре база/прогноз.
 */

export type ScheduleWarningTone = 'shift' | 'lag' | 'none';

export type ScheduleWarning = {
  tone: ScheduleWarningTone;
  label: string;
};

/** Поля, которых достаточно для предупреждения. Иерархия может быть шире. */
export type ScheduleWarningItem = {
  kind: string;
  id: string;
  status?: string | null;
  sourceWeeks?: number | null;
  baselineStart?: string | null;
  baselineEnd?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export const SCHEDULE_SHIFT_WARNING_LABEL =
  'Прогноз отличается от базового плана';

export function scheduleLagWarningLabel(sourceWeeks: number | null): string {
  return sourceWeeks != null ? `Отставание, ${sourceWeeks} нед.` : 'Отстаёт';
}

function hasBound(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Собственный сигнал строки, без потомков.
 * Сдвиг работы важнее отставания: иначе неделя на строке спрячет разъезд интервалов.
 */
function ownScheduleWarning(item: ScheduleWarningItem): ScheduleWarning {
  if (
    item.kind === 'work' &&
    hasBound(item.baselineStart) &&
    hasBound(item.baselineEnd) &&
    (item.baselineStart !== item.startDate || item.baselineEnd !== item.endDate)
  ) {
    return { tone: 'shift', label: SCHEDULE_SHIFT_WARNING_LABEL };
  }

  const sourceWeeks =
    typeof item.sourceWeeks === 'number' ? item.sourceWeeks : null;
  const delayed = item.kind === 'work' && item.status === 'Delayed';
  if (delayed || sourceWeeks !== null) {
    return { tone: 'lag', label: scheduleLagWarningLabel(sourceWeeks) };
  }

  return { tone: 'none', label: '' };
}

/**
 * Предупреждение строки.
 * `descendants` — все потомки, не только дети: смотрим их собственный сигнал,
 * а не свёрнутое предупреждение промежуточной группы (у `8.2` свои недели
 * скрыли бы сдвиг `8.2.2` от предка).
 * Свои недели или Delayed возвращаются раньше свёртки, поэтому группа с
 * `sourceWeeks` не подменяется сдвигом ребёнка.
 */
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
      return { tone: 'shift', label: SCHEDULE_SHIFT_WARNING_LABEL };
    }
    if (warning.tone === 'lag') sawLag = true;
  }
  if (sawLag) return { tone: 'lag', label: scheduleLagWarningLabel(null) };
  return { tone: 'none', label: '' };
}
