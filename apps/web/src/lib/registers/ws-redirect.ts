/** Legacy WS id → canonical program/project path (mirror of API mapping). */
export const WS_TO_CANONICAL_HREF: Record<string, string> = {
  'WS-BLD': '/programs/PRG-CON',
  'WS-CLN': '/projects/AN-08',
  'WS-HVAC': '/projects/AN-09',
  'WS-UTL': '/projects/AN-24',
  'WS-PRD': '/projects/AN-13',
  'WS-PKG': '/programs/PRG-EQP',
  'WS-QC': '/projects/AN-20',
  'WS-AUT': '/projects/AN-16',
};

export function hrefForWorkstreamTag(ws: string): string {
  return WS_TO_CANONICAL_HREF[ws] ?? '/programs';
}
