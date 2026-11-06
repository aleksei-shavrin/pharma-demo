/**
 * Fallback / normative executive timeline ids (R2-U1-R4).
 * Stable curated map A–S — same membership as API EXECUTIVE_MILESTONE_SET_STABLE.
 * Prefer authoritative API `executiveMilestoneIds` when present.
 */
export const EXECUTIVE_TIMELINE_MILESTONE_IDS = [
  'MS-BLD-EXC',
  'MS-CLN-PANEL',
  'MS-UTL-PWR',
  'MS-BLD-ENCL',
  'MS-CLN-RDY',
  'MS-HVAC-IQ',
  'MS-UTL-WFI',
  'MS-PRD-INST',
  'MS-PKG-SAT',
  'MS-COM-OQ',
  'MS-COM-GO',
  'MS-PS',
] as const;

export type ExecutiveTimelineMilestoneId =
  (typeof EXECUTIVE_TIMELINE_MILESTONE_IDS)[number];

export const EXECUTIVE_MILESTONE_STABLE_COUNT =
  EXECUTIVE_TIMELINE_MILESTONE_IDS.length;

/**
 * Deliberate RU short labels for Dashboard executive strip.
 * Authoritative executive points MUST resolve here (no name.slice).
 */
export const EXECUTIVE_TIMELINE_SHORT_LABEL: Readonly<Record<string, string>> = {
  'MS-BLD-EXC': 'Котлован',
  'MS-BLD-FND': 'Фундамент',
  'MS-BLD-STR': 'Каркас',
  'MS-BLD-ENCL': 'Контур здания',
  'MS-BLD-WT': 'Здание закрыто',
  'MS-BLD-RISER': 'Стояки',
  'MS-BLD-HAND': 'Передача оболочки',
  'MS-CLN-RDY': 'Чистые помещения',
  'MS-CLN-PANEL': 'Панели чистых',
  'MS-CLN-BAL': 'Баланс чистых',
  'MS-CLN-FIN': 'Чистые готовы',
  'MS-HVAC-IQ': 'Готовность HVAC',
  'MS-HVAC-DEL': 'HVAC поставка',
  'MS-HVAC-INST': 'HVAC монтаж',
  'MS-HVAC-BAL': 'HVAC баланс',
  'MS-UTL-PW': 'PW',
  'MS-UTL-PW-RDY': 'PW контур',
  'MS-UTL-WFI': 'Вода WFI',
  'MS-UTL-PWR': 'Энергоснабжение',
  'MS-UTL-BLK': 'Чёрные утил.',
  'MS-UTL-RDY': 'Инж. готовность',
  'MS-UTL-GAS': 'Процесс. газы',
  'MS-PRD-DEL': 'Тех. поставка',
  'MS-PRD-INST': 'Тех. монтаж',
  'MS-PRD-CIP': 'CIP',
  'MS-PRD-COM': 'Пр. готовность',
  'MS-PRD-FAT': 'Тех. FAT',
  'MS-PKG-FAT': 'PKG FAT',
  'MS-PKG-SAT': 'SAT упаковки',
  'MS-PKG-SER': 'Сериализация',
  'MS-PKG-LINE': 'Линия упак.',
  'MS-PKG-RDY': 'Упак. готовность',
  'MS-QC-RDY': 'QC готовность',
  'MS-QC-LAB': 'QC лаборатория',
  'MS-QC-METH': 'QC методы',
  'MS-AUT-BMS': 'BMS',
  'MS-AUT-EMS': 'EMS',
  'MS-AUT-INT': 'BMS/EMS',
  'MS-COM-IQ': 'Квалификация IQ',
  'MS-COM-OQ': 'Квалификация OQ',
  'MS-COM-PQ': 'Квалификация PQ',
  'MS-COM-RDY': 'К старту',
  'MS-COM-GO': 'Решение о запуске',
  'MS-PS': 'Старт производства',
};

export function shortLabelForMilestone(id: string, name: string): string {
  return EXECUTIVE_TIMELINE_SHORT_LABEL[id] ?? name.slice(0, 12);
}

/** Executive strip: missing deliberate label is a contract violation. */
export function requireExecutiveShortLabel(id: string): string {
  const label = EXECUTIVE_TIMELINE_SHORT_LABEL[id];
  if (!label) {
    throw new Error(`missing executive short label for ${id}`);
  }
  return label;
}
