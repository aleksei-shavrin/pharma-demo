import type {
  ScheduleControlPointItem,
  ScheduleGroupItem,
  ScheduleItem,
  ScheduleWorkItem,
} from '@/lib/api-client';
import type { ScheduleComparisonMode } from './schedule-comparison';

export function isScheduleWork(item: ScheduleItem): item is ScheduleWorkItem {
  return item.kind === 'work';
}

export function isScheduleGroup(item: ScheduleItem): item is ScheduleGroupItem {
  return item.kind === 'project_group' || item.kind === 'stage_group';
}

export function isScheduleControlPoint(
  item: ScheduleItem,
): item is ScheduleControlPointItem {
  return item.kind === 'milestone' || item.kind === 'equipment_delivery';
}

/**
 * Дата для канонической сортировки: прогноз у контрольных точек, старт у работ.
 * Работы не имеют baseline/forecast — единый ключ нужен только для порядка строк.
 */
export function scheduleSortDate(item: ScheduleItem): string {
  if (isScheduleWork(item)) return item.startDate;
  if (isScheduleGroup(item)) return item.wbs ?? item.id;
  return item.forecastDate;
}

/**
 * Даты горизонта. Закрытый факт входит только в режиме факта,
 * чтобы 2027-02-18 не сдвигал шкалу режима прогноза.
 */
export function scheduleCoveredDates(
  item: ScheduleItem,
  comparison: ScheduleComparisonMode = 'forecast',
): string[] {
  if (isScheduleWork(item)) {
    if (comparison === 'baseline') {
      return item.baselineStart && item.baselineEnd
        ? [item.baselineStart, item.baselineEnd]
        : [];
    }
    const dates = [item.startDate, item.endDate];
    if (item.baselineStart) dates.push(item.baselineStart);
    if (item.baselineEnd) dates.push(item.baselineEnd);
    if (comparison === 'actual' && item.actualStart && item.actualEnd) {
      dates.push(item.actualStart, item.actualEnd);
    }
    return dates;
  }
  if (isScheduleGroup(item)) return [];
  if (comparison === 'baseline') {
    return item.baselineDate ? [item.baselineDate] : [];
  }
  return [item.baselineDate, item.forecastDate];
}

export type ScheduleDateColumnLabels = { first: string; second: string };

/**
 * Две колонки дат общие для контрольных точек (база/прогноз) и работ
 * (начало/окончание). Составные заголовки появляются только если в выборке
 * есть работы — иначе остаются прежние «Базовая дата» / «Прогноз».
 */
export function scheduleDateColumnLabels(
  items: ScheduleItem[],
  base: ScheduleDateColumnLabels,
): ScheduleDateColumnLabels {
  if (!items.some(isScheduleWork)) return base;
  return {
    first: `${base.first} / Начало`,
    second: `${base.second} / Окончание`,
  };
}

/** Значения двух колонок дат: работа → начало/окончание, иначе база/прогноз. */
export function scheduleRowDates(item: ScheduleItem): {
  first: string;
  second: string;
} {
  if (isScheduleWork(item)) {
    return { first: item.startDate, second: item.endDate };
  }
  if (isScheduleGroup(item)) return { first: '—', second: '—' };
  return { first: item.baselineDate, second: item.forecastDate };
}
