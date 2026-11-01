import type { SnapshotFixture } from './types';
import { SNAPSHOT_A } from './snapshot-a';

/**
 * E1 temporary multi-record stub — Snapshot C (HVAC +21 / Red path).
 * ISS-001 Open; no DEC-001 (enriched DEC-001 belongs to F — E2).
 * Replace with full DOC-PROD-021 inventory in E2.
 */
export const SNAPSHOT_C: SnapshotFixture = {
  ...SNAPSHOT_A,
  id: 'C',
  scenarioAsOfDate: '2027-03-15',
  project: {
    ...SNAPSHOT_A.project,
    baselineProductionStart: '2027-09-15',
    forecastProductionStart: '2027-10-06',
  },
  milestones: SNAPSHOT_A.milestones.map((ms) =>
    ms.id === 'MS-PS'
      ? {
          ...ms,
          forecastDate: '2027-10-06',
          rag: 'Red' as const,
        }
      : ms,
  ),
  equipment: SNAPSHOT_A.equipment.map((eq) =>
    eq.id === 'EQ-HVAC-01'
      ? {
          ...eq,
          status: 'Delayed' as const,
          forecastDelivery: '2027-06-05',
        }
      : eq,
  ),
  risks: SNAPSHOT_A.risks.map((risk) =>
    risk.id === 'RISK-001'
      ? {
          ...risk,
          rag: 'Red' as const,
          issueId: 'ISS-001',
        }
      : risk,
  ),
  issues: [
    {
      id: 'ISS-001',
      title: 'Прогноз сдвига поставки long-lead AHU',
      status: 'Open',
      owner: 'SH-PM-01',
      equipmentId: 'EQ-HVAC-01',
      milestoneId: 'MS-PS',
      workstream: 'WS-HVAC',
    },
  ],
  decisions: [],
  topExceptions: [
    {
      id: 'TEX-HVAC-PS',
      title: 'Критический прогноз сдвига AHU',
      causeImpact:
        'Задержка long-lead HVAC угрожает старту производства (+21 дн.)',
      links: [
        { type: 'equipment', id: 'EQ-HVAC-01' },
        { type: 'issue', id: 'ISS-001' },
        { type: 'risk', id: 'RISK-001' },
        { type: 'milestone', id: 'MS-PS' },
      ],
      priority: 1,
    },
  ],
  trend: {
    better: [],
    worse: ['HVAC / старт производства: прогноз +21'],
    unchangedCritical: [],
  },
};
