import type { SnapshotFixture } from './types';

/**
 * E1 temporary multi-record stub — Snapshot A (calm).
 * Replace with full DOC-PROD-021 inventory in E2.
 */
export const SNAPSHOT_A: SnapshotFixture = {
  id: 'A',
  scenarioAsOfDate: '2027-02-15',
  project: {
    id: 'PRJ-01',
    name: 'Строительство фармацевтического завода',
    baselineProductionStart: '2027-09-15',
    forecastProductionStart: '2027-09-15',
  },
  milestones: [
    {
      id: 'MS-PS',
      name: 'Готовность к старту производства',
      baselineDate: '2027-09-15',
      forecastDate: '2027-09-15',
      rag: 'Green',
      workstream: null,
    },
    {
      id: 'MS-PKG-SAT',
      name: 'SAT упаковочной линии принят',
      baselineDate: '2027-08-10',
      forecastDate: '2027-08-10',
      rag: 'Green',
      workstream: 'WS-PKG',
    },
  ],
  equipment: [
    {
      id: 'EQ-HVAC-01',
      projectId: 'PRJ-01',
      name: 'Приточная установка AHU (long-lead)',
      critical: true,
      baselineDelivery: '2027-05-15',
      forecastDelivery: '2027-05-15',
      status: 'OnTrack',
      workstream: 'WS-HVAC',
    },
    {
      id: 'EQ-PKG-01',
      projectId: 'PRJ-01',
      name: 'Линия первичной упаковки',
      critical: true,
      baselineDelivery: '2027-06-20',
      forecastDelivery: '2027-06-20',
      status: 'OnTrack',
      workstream: 'WS-PKG',
    },
  ],
  risks: [
    {
      id: 'RISK-001',
      title: 'Срыв окна монтажа HVAC → сдвиг старта производства',
      rag: 'Green',
      milestoneId: 'MS-PS',
      equipmentId: 'EQ-HVAC-01',
      issueId: null,
      workstream: 'WS-HVAC',
    },
  ],
  issues: [],
  decisions: [],
  topExceptions: [],
  trend: { better: [], worse: [], unchangedCritical: [] },
};
