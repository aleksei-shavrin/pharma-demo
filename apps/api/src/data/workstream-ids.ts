/** Workstream machine ids — grouping field, not a Domain entity. */
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
