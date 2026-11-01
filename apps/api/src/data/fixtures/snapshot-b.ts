import type { SnapshotFixture } from './types';
import { SNAPSHOT_A } from './snapshot-a';

/**
 * E1 temporary multi-record stub — Snapshot B (local PKG attention only).
 * HVAC / RISK-001 / MS-PS / PS remain calm (enriched timeline: B ≠ HVAC +21).
 * Replace with full DOC-PROD-021 inventory in E2.
 */
export const SNAPSHOT_B: SnapshotFixture = {
  ...SNAPSHOT_A,
  id: 'B',
  scenarioAsOfDate: '2027-03-01',
  project: {
    ...SNAPSHOT_A.project,
    baselineProductionStart: '2027-09-15',
    forecastProductionStart: '2027-09-15',
  },
  equipment: SNAPSHOT_A.equipment.map((eq) =>
    eq.id === 'EQ-PKG-01'
      ? {
          ...eq,
          status: 'Delayed' as const,
          forecastDelivery: '2027-06-27',
        }
      : eq,
  ),
  issues: [
    {
      id: 'ISS-PKG-CLOSED',
      title: 'Локальное замечание по упаковке (закрыто)',
      status: 'Closed',
      owner: 'SH-PKG-01',
      equipmentId: 'EQ-PKG-01',
      milestoneId: 'MS-PKG-SAT',
      workstream: 'WS-PKG',
    },
  ],
  decisions: [],
  topExceptions: [
    {
      id: 'TEX-PKG-LOCAL',
      title: 'Локальное отклонение упаковки',
      causeImpact:
        'Критическая линия упаковки с прогнозом задержки; старт производства без сдвига',
      links: [
        { type: 'equipment', id: 'EQ-PKG-01' },
        { type: 'milestone', id: 'MS-PKG-SAT' },
      ],
      priority: 1,
    },
  ],
  trend: {
    better: [],
    worse: ['Упаковка: локальная задержка поставки линии'],
    unchangedCritical: ['HVAC / старт производства: без отклонения'],
  },
};
