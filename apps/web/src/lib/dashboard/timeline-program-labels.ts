/** Director-facing program labels for timeline rows (shared strip + ECharts). */
export const TIMELINE_PROGRAM_LABELS: Readonly<Record<string, string>> = {
  'PRG-DSN': 'Проектирование и разрешения',
  'PRG-CON': 'Строительство',
  'PRG-ENG': 'Инженерия',
  'PRG-EQP': 'Оборудование',
  'PRG-DIG': 'Цифра',
  'PRG-STA': 'Запуск',
  'PRG-ORG': 'Организация и люди',
  none: 'Портфель',
};

/** Stable lane key for portfolio / unassigned milestones (not a translated caption). */
export const TIMELINE_PORTFOLIO_LANE_KEY = 'none' as const;

/**
 * Bottom→top source order for ECharts category axis (index 0 = chart bottom).
 * Do not reverse this array in place — use visualTopDown helper for UI lists.
 */
export const TIMELINE_PROGRAM_ORDER = [
  'PRG-DSN',
  'PRG-CON',
  'PRG-ENG',
  'PRG-EQP',
  'PRG-DIG',
  'PRG-STA',
  'PRG-ORG',
  TIMELINE_PORTFOLIO_LANE_KEY,
] as const;

export function timelineProgramLabel(programId: string): string {
  return TIMELINE_PROGRAM_LABELS[programId] ?? programId;
}

export function isTimelinePortfolioLane(programId: string): boolean {
  return programId === TIMELINE_PORTFOLIO_LANE_KEY;
}

/**
 * Dropdown / legend order matching the chart's visual top→bottom.
 * Chart yAxis keeps TIMELINE_PROGRAM_ORDER (0 = bottom); this returns a new array.
 */
export function timelineProgramVisualTopDownIds(
  presentIds: readonly string[],
): string[] {
  const bottomUp = TIMELINE_PROGRAM_ORDER.filter((id) =>
    presentIds.includes(id),
  );
  return [...bottomUp].reverse();
}
