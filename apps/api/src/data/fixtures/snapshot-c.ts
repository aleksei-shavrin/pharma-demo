import type { SnapshotFixture } from './types';
import { SNAPSHOT_B } from './snapshot-b';

/**
 * DOC-PROD-012 Snapshot C — Director decision (asOf 2027-03-02).
 * Forecasts/RAG same as B (BR-006); Issue Mitigating; DEC-001 PrioritizeRecovery.
 */
export const SNAPSHOT_C: SnapshotFixture = {
  ...SNAPSHOT_B,
  id: 'C',
  scenarioAsOfDate: '2027-03-02',
  issue: SNAPSHOT_B.issue
    ? {
        ...SNAPSHOT_B.issue,
        status: 'Mitigating',
      }
    : null,
  decision: {
    id: 'DEC-001',
    type: 'PrioritizeRecovery',
    ownerRole: 'SH-006',
    dueDate: '2027-03-20',
    note: 'Expedite vendor / alternate lane',
  },
};
