import type { SnapshotFixture } from './types';

/** DOC-PROD-012 Snapshot A — Baseline (asOf 2027-02-15). */
export const SNAPSHOT_A: SnapshotFixture = {
  id: 'A',
  scenarioAsOfDate: '2027-02-15',
  project: {
    id: 'PRJ-01',
    name: 'Строительство фармацевтического завода',
    baselineProductionStart: '2027-09-15',
    forecastProductionStart: '2027-09-15',
  },
  milestone: {
    id: 'MS-PS',
    name: 'Ready for production',
    baselineDate: '2027-09-15',
    forecastDate: '2027-09-15',
    rag: 'Green',
  },
  equipment: {
    id: 'EQ-HVAC-01',
    projectId: 'PRJ-01',
    critical: true,
    baselineDelivery: '2027-05-15',
    forecastDelivery: '2027-05-15',
    status: 'OnTrack',
  },
  risk: {
    id: 'RISK-001',
    rag: 'Green',
    milestoneId: 'MS-PS',
    equipmentId: 'EQ-HVAC-01',
    issueId: null,
  },
  issue: null,
  decision: null,
};
