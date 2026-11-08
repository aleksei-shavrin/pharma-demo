/** Ведущие колонки списка не уже этой ширины: ИСР, имя, предупреждение и прогресс остаются читаемыми. */
export const SCHEDULE_LEAD_MIN_WIDTH_PX = 560;

/**
 * Список 36rem плюс место под шкалу.
 * Порог считается от ширины колонки календаря, не окна, потому что сайдбар с 1024px снова забирает 240px.
 */
export const SCHEDULE_ROW_LAYOUT_MIN_PX = 860;

export type ScheduleTimelineLayout = 'stack' | 'row';

/** Ряд — только когда колонка календаря вмещает список и шкалу рядом. */
export function resolveScheduleTimelineLayout(
  contentWidthPx: number,
): ScheduleTimelineLayout {
  if (contentWidthPx >= SCHEDULE_ROW_LAYOUT_MIN_PX) return 'row';
  return 'stack';
}
