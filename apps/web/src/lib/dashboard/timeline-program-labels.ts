/** Director-facing program labels for timeline rows (shared strip + ECharts). */
export const TIMELINE_PROGRAM_LABELS: Readonly<Record<string, string>> = {
  'PRG-DSN': 'Проектирование и разрешения',
  'PRG-CON': 'Строительство',
  'PRG-ENG': 'Инженерия',
  'PRG-EQP': 'Оборудование',
  'PRG-DIG': 'Цифра',
  'PRG-STA': 'Запуск',
  'PRG-ORG': 'Организация и люди',
  none: 'Портфель / без программы',
};

export const TIMELINE_PROGRAM_ORDER = [
  'PRG-DSN',
  'PRG-CON',
  'PRG-ENG',
  'PRG-EQP',
  'PRG-DIG',
  'PRG-STA',
  'PRG-ORG',
  'none',
] as const;

export function timelineProgramLabel(programId: string): string {
  return TIMELINE_PROGRAM_LABELS[programId] ?? programId;
}
