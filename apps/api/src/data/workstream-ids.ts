/**
 * Workstream machine ids.
 * R2: read-model entity identity; membership still via `workstream` field (not causal Aggregate).
 */
export const WORKSTREAM_IDS = [
  'WS-BLD',
  'WS-CLN',
  'WS-HVAC',
  'WS-UTL',
  'WS-PRD',
  'WS-PKG',
  'WS-QC',
  'WS-AUT',
] as const;

export type WorkstreamId = (typeof WORKSTREAM_IDS)[number];

/** RU display names for Workstream catalog contract (DOC-PROD-025). */
export const WORKSTREAM_NAME_RU: Record<WorkstreamId, string> = {
  'WS-BLD': 'Здание и оболочка',
  'WS-CLN': 'Чистые помещения',
  'WS-HVAC': 'HVAC',
  'WS-UTL': 'Инженерные системы',
  'WS-PRD': 'Технологическое оборудование',
  'WS-PKG': 'Упаковка',
  'WS-QC': 'QC / лаборатория',
  'WS-AUT': 'Автоматизация BMS/EMS',
};

export const WORKSTREAM_SORT_ORDER: Record<WorkstreamId, number> = {
  'WS-BLD': 1,
  'WS-CLN': 2,
  'WS-HVAC': 3,
  'WS-UTL': 4,
  'WS-PRD': 5,
  'WS-PKG': 6,
  'WS-QC': 7,
  'WS-AUT': 8,
};
