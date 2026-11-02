/**
 * Fixed Demo v1 executive timeline milestone subset (presentation-only).
 * Chronological by catalog baseline — not Domain scoring.
 * Excludes MS-AUT-BMS (H automation → Changes/Decisions).
 */
export const EXECUTIVE_TIMELINE_MILESTONE_IDS = [
  'MS-BLD-ENCL',
  'MS-CLN-RDY',
  'MS-HVAC-IQ',
  'MS-UTL-WFI',
  'MS-PKG-SAT',
  'MS-PS',
] as const;

export type ExecutiveTimelineMilestoneId =
  (typeof EXECUTIVE_TIMELINE_MILESTONE_IDS)[number];

/** Short RU labels for the strip (visible; not tooltip-only). */
export const EXECUTIVE_TIMELINE_SHORT_LABEL: Record<
  ExecutiveTimelineMilestoneId,
  string
> = {
  'MS-BLD-ENCL': 'Оболочка',
  'MS-CLN-RDY': 'Чистые',
  'MS-HVAC-IQ': 'HVAC IQ',
  'MS-UTL-WFI': 'WFI',
  'MS-PKG-SAT': 'PKG SAT',
  'MS-PS': 'Старт пр-ва',
};
