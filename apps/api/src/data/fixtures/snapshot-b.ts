import type { SnapshotFixture } from './types';

/** DOC-PROD-012 Snapshot B — After delay (asOf 2027-03-01). */
export const SNAPSHOT_B: SnapshotFixture = {
  id: 'B',
  scenarioAsOfDate: '2027-03-01',
  project: {
    id: 'PRJ-01',
    name: 'Facility Expansion Alpha',
    baselineProductionStart: '2027-09-15',
    forecastProductionStart: '2027-10-06',
  },
  milestone: {
    id: 'MS-PS',
    name: 'Ready for production',
    baselineDate: '2027-09-15',
    forecastDate: '2027-10-06',
    rag: 'Red',
  },
  equipment: {
    id: 'EQ-HVAC-01',
    projectId: 'PRJ-01',
    critical: true,
    baselineDelivery: '2027-05-15',
    forecastDelivery: '2027-06-05',
    status: 'Delayed',
  },
  risk: {
    id: 'RISK-001',
    rag: 'Red',
    milestoneId: 'MS-PS',
    equipmentId: 'EQ-HVAC-01',
    issueId: 'ISS-001',
  },
  issue: {
    id: 'ISS-001',
    title: 'HVAC long-lead delivery slip',
    status: 'Open',
    owner: 'SH-002',
    equipmentId: 'EQ-HVAC-01',
    milestoneId: 'MS-PS',
  },
  decision: null,
};
