/**
 * Authored control-point completion/delivery dates (Demo v1).
 * certainty: assumption — synthetic demo facts keyed by stable catalogue id.
 *
 * Authoring rules:
 * - Default seed copied from catalogue baselineDelivery / baselineDate into this map
 *   (static fixture), then narrative overrides applied below.
 * - Progress at runtime is `authoredDate <= scenarioAsOfDate` → 100 else 0.
 * - MUST NOT read live forecastDate / forecastDelivery for progress.
 * - MUST NOT use sorted-id / SnapshotId-rank readiness.
 *
 * Overrides:
 * - EQ-HVAC-01 → 2027-06-05 (was 2027-09-20 after IQ; now baseline 05-15 + crisis +21, before MS-HVAC-IQ 06-15)
 * - MS-PS → 2027-09-22 (Production Start only on 19)
 * - MS-COM-GO → 2027-09-18 (Go/No-Go; still 0 on 03@2027-03-01)
 * - MS-BLD-ENCL → 2027-03-21 (after BLD install works reach completion band)
 * - MS-CLN-PANEL → 2027-04-15 (slipped panel)
 * - MS-UTL-PWR → 2027-04-20 (power gate mid-arc)
 */
import { EQUIPMENT_CATALOG, MILESTONE_CATALOG } from '../fixtures/catalog';

/** ISO date when equipment is treated as delivered for schedule binary progress. */
export const EQUIPMENT_DELIVERED_ON = {
  'EQ-AUT-01': '2027-06-01',
  'EQ-AUT-02': '2027-06-10',
  'EQ-AUT-03': '2027-06-15',
  'EQ-AUT-04': '2027-06-20',
  'EQ-AUT-05': '2027-06-25',
  'EQ-AUT-06': '2027-07-01',
  'EQ-BLD-02': '2027-02-01',
  'EQ-BLD-03': '2027-02-20',
  'EQ-BLD-04': '2027-03-01',
  'EQ-BLD-05': '2027-03-10',
  'EQ-CLN-01': '2027-03-15',
  'EQ-CLN-02': '2027-03-20',
  'EQ-CLN-03': '2027-04-01',
  'EQ-CLN-04': '2027-03-25',
  'EQ-CLN-05': '2027-04-05',
  'EQ-CLN-06': '2027-04-10',
  'EQ-HVAC-01': '2027-06-05', // was 2027-09-20; crisis +21 from baseline 05-15; before IQ
  'EQ-HVAC-02': '2027-05-20',
  'EQ-HVAC-03': '2027-06-01',
  'EQ-HVAC-04': '2027-05-25',
  'EQ-HVAC-05': '2027-06-05',
  'EQ-HVAC-06': '2027-06-08',
  'EQ-HVAC-07': '2027-06-12',
  'EQ-PKG-01': '2027-06-20',
  'EQ-PKG-02': '2027-07-01',
  'EQ-PKG-03': '2027-07-05',
  'EQ-PKG-04': '2027-07-08',
  'EQ-PKG-05': '2027-07-12',
  'EQ-PKG-06': '2027-07-18',
  'EQ-PKG-07': '2027-07-10',
  'EQ-PRD-01': '2027-06-01',
  'EQ-PRD-02': '2027-06-10',
  'EQ-PRD-03': '2027-06-15',
  'EQ-PRD-04': '2027-06-20',
  'EQ-PRD-05': '2027-06-25',
  'EQ-PRD-06': '2027-07-01',
  'EQ-PRD-07': '2027-06-18',
  'EQ-PRD-08': '2027-07-05',
  'EQ-QC-01': '2027-05-15',
  'EQ-QC-02': '2027-05-20',
  'EQ-QC-03': '2027-05-25',
  'EQ-QC-04': '2027-05-28',
  'EQ-QC-05': '2027-06-01',
  'EQ-QC-06': '2027-06-05',
  'EQ-UTL-01': '2027-05-10',
  'EQ-UTL-02': '2027-05-20',
  'EQ-UTL-03': '2027-05-25',
  'EQ-UTL-04': '2027-04-01',
  'EQ-UTL-05': '2027-05-05',
  'EQ-UTL-06': '2027-05-15',
  'EQ-UTL-07': '2027-04-20',
  'EQ-UTL-08': '2027-05-28',
} as const satisfies Record<keyof typeof EQUIPMENT_CATALOG, string>;

/** ISO date when milestone is treated as achieved for schedule binary progress. */
export const MILESTONE_COMPLETED_ON = {
  'MS-AUT-BMS': '2027-07-25',
  'MS-AUT-EMS': '2027-08-01',
  'MS-AUT-INT': '2027-08-10',
  'MS-BLD-ENCL': '2027-03-21', // narrative override
  'MS-BLD-EXC': '2027-02-05',
  'MS-BLD-FND': '2027-02-12',
  'MS-BLD-HAND': '2027-03-25',
  'MS-BLD-RISER': '2027-03-15',
  'MS-BLD-STR': '2027-02-20',
  'MS-BLD-WT': '2027-03-05',
  'MS-CLN-BAL': '2027-05-10',
  'MS-CLN-FIN': '2027-05-20',
  'MS-CLN-PANEL': '2027-04-15', // narrative override
  'MS-CLN-RDY': '2027-04-30',
  'MS-COM-GO': '2027-09-18', // narrative override
  'MS-COM-IQ': '2027-08-05',
  'MS-COM-OQ': '2027-08-15',
  'MS-COM-PQ': '2027-08-25',
  'MS-COM-RDY': '2027-09-10',
  'MS-HVAC-BAL': '2027-06-25',
  'MS-HVAC-DEL': '2027-05-20',
  'MS-HVAC-INST': '2027-06-01',
  'MS-HVAC-IQ': '2027-06-15',
  'MS-PKG-FAT': '2027-07-20',
  'MS-PKG-LINE': '2027-07-25',
  'MS-PKG-RDY': '2027-08-20',
  'MS-PKG-SAT': '2027-08-10',
  'MS-PKG-SER': '2027-08-01',
  'MS-PRD-CIP': '2027-07-20',
  'MS-PRD-COM': '2027-08-01',
  'MS-PRD-DEL': '2027-06-15',
  'MS-PRD-FAT': '2027-06-05',
  'MS-PRD-INST': '2027-07-15',
  'MS-PS': '2027-09-22', // narrative override
  'MS-QC-LAB': '2027-07-01',
  'MS-QC-METH': '2027-07-20',
  'MS-QC-RDY': '2027-07-10',
  'MS-UTL-BLK': '2027-05-01',
  'MS-UTL-GAS': '2027-06-25',
  'MS-UTL-PW': '2027-06-20',
  'MS-UTL-PW-RDY': '2027-06-10',
  'MS-UTL-PWR': '2027-04-20', // narrative override
  'MS-UTL-RDY': '2027-07-10',
  'MS-UTL-WFI': '2027-07-01',
} as const satisfies Record<keyof typeof MILESTONE_CATALOG, string>;

export function assertControlFactsCatalogueComplete(): void {
  const eqIds = Object.keys(EQUIPMENT_CATALOG);
  const msIds = Object.keys(MILESTONE_CATALOG);
  for (const id of eqIds) {
    if (!(id in EQUIPMENT_DELIVERED_ON)) {
      throw new Error(`EQUIPMENT_DELIVERED_ON missing ${id}`);
    }
  }
  for (const id of msIds) {
    if (!(id in MILESTONE_COMPLETED_ON)) {
      throw new Error(`MILESTONE_COMPLETED_ON missing ${id}`);
    }
  }
  if (Object.keys(EQUIPMENT_DELIVERED_ON).length !== eqIds.length) {
    throw new Error(
      'EQUIPMENT_DELIVERED_ON size mismatch vs EQUIPMENT_CATALOG',
    );
  }
  if (Object.keys(MILESTONE_COMPLETED_ON).length !== msIds.length) {
    throw new Error(
      'MILESTONE_COMPLETED_ON size mismatch vs MILESTONE_CATALOG',
    );
  }
}

export function authoredBinaryFromDate(
  authoredIso: string | undefined,
  scenarioAsOfDate: string,
): 0 | 100 {
  if (!authoredIso) return 0;
  return authoredIso <= scenarioAsOfDate ? 100 : 0;
}
