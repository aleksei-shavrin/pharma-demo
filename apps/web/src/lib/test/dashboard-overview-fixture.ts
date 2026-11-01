import type { DashboardOverview } from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';

/**
 * Minimal collection-shaped DashboardOverview for FE unit tests (E1-R1).
 * Spine: EQ-HVAC-01 / ISS-001 / RISK-001 / MS-PS / DEC-001.
 * Semantics: A calm Green; B Yellow local PKG; C HVAC Red Open needed (no DEC).
 */
export function dashboardOverviewFixture(
  snapshotId: SnapshotId,
  overrides: Partial<DashboardOverview> = {},
): DashboardOverview {
  const scenarioAsOfDate =
    snapshotId === 'A'
      ? '2027-02-15'
      : snapshotId === 'B'
        ? '2027-03-01'
        : snapshotId === 'C'
          ? '2027-03-15'
          : '2027-03-20';

  const hvacDelayed = snapshotId === 'C';
  const pkgDelayed = snapshotId === 'B';
  const projectStatus =
    snapshotId === 'C' ? 'Red' : snapshotId === 'B' ? 'Yellow' : 'Green';

  const base: DashboardOverview = {
    snapshotId,
    scenarioAsOfDate,
    projectStatus,
    project: {
      id: 'PRJ-01',
      name: 'Строительство фармацевтического завода',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: hvacDelayed ? '2027-10-06' : '2027-09-15',
      productionStartVariance: {
        subject: 'production_start',
        baselineDate: '2027-09-15',
        forecastDate: hvacDelayed ? '2027-10-06' : '2027-09-15',
        deltaDays: hvacDelayed ? 21 : 0,
      },
    },
    equipment: [
      {
        id: 'EQ-HVAC-01',
        name: 'Приточная установка AHU (long-lead)',
        critical: true,
        status: hvacDelayed ? 'Delayed' : 'OnTrack',
        workstream: 'WS-HVAC',
        baselineDelivery: '2027-05-15',
        forecastDelivery: hvacDelayed ? '2027-06-05' : '2027-05-15',
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: '2027-05-15',
          forecastDate: hvacDelayed ? '2027-06-05' : '2027-05-15',
          deltaDays: hvacDelayed ? 21 : 0,
        },
      },
      {
        id: 'EQ-PKG-01',
        name: 'Линия первичной упаковки',
        critical: true,
        status: pkgDelayed ? 'Delayed' : 'OnTrack',
        workstream: 'WS-PKG',
        baselineDelivery: '2027-06-20',
        forecastDelivery: pkgDelayed ? '2027-06-27' : '2027-06-20',
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: '2027-06-20',
          forecastDate: pkgDelayed ? '2027-06-27' : '2027-06-20',
          deltaDays: pkgDelayed ? 7 : 0,
        },
      },
    ],
    issues:
      snapshotId === 'C'
        ? [
            {
              id: 'ISS-001',
              title: 'Прогноз сдвига поставки long-lead AHU',
              status: 'Open',
              workstream: 'WS-HVAC',
              equipmentId: 'EQ-HVAC-01',
              milestoneId: 'MS-PS',
            },
          ]
        : snapshotId === 'B'
          ? [
              {
                id: 'ISS-PKG-CLOSED',
                title: 'Локальное замечание по упаковке (закрыто)',
                status: 'Closed',
                workstream: 'WS-PKG',
                equipmentId: 'EQ-PKG-01',
                milestoneId: 'MS-PKG-SAT',
              },
            ]
          : [],
    risks: [
      {
        id: 'RISK-001',
        title: 'Срыв окна монтажа HVAC → сдвиг старта производства',
        rag: hvacDelayed ? 'Red' : 'Green',
        workstream: 'WS-HVAC',
        equipmentId: 'EQ-HVAC-01',
        milestoneId: 'MS-PS',
        issueId: hvacDelayed ? 'ISS-001' : null,
      },
    ],
    milestones: [
      {
        id: 'MS-PS',
        name: 'Готовность к старту производства',
        rag: hvacDelayed ? 'Red' : 'Green',
        workstream: null,
        baselineDate: '2027-09-15',
        forecastDate: hvacDelayed ? '2027-10-06' : '2027-09-15',
      },
    ],
    decisions: [],
    workstreamRollups: [
      {
        workstream: 'WS-HVAC',
        status: hvacDelayed ? 'Red' : 'Green',
      },
      {
        workstream: 'WS-PKG',
        status: pkgDelayed ? 'Yellow' : 'Green',
      },
    ],
    topExceptions: [],
    trend: { better: [], worse: [], unchangedCritical: [] },
    decisionPanelState: hvacDelayed ? 'needed' : 'absent',
    directEdges:
      snapshotId === 'A'
        ? [
            {
              kind: 'direct',
              fromType: 'equipment',
              fromId: 'EQ-HVAC-01',
              toType: 'risk',
              toId: 'RISK-001',
            },
            {
              kind: 'direct',
              fromType: 'risk',
              fromId: 'RISK-001',
              toType: 'milestone',
              toId: 'MS-PS',
            },
          ]
        : [],
    derivedImpact: {
      rule: 'BR-004',
      equipmentDeliveryDeltaDays: hvacDelayed ? 21 : 0,
      productionStartDeltaDays: hvacDelayed ? 21 : 0,
      kind: hvacDelayed ? 'aligned_slip' : 'none',
    },
    decisionHonesty: null,
  };

  return { ...base, ...overrides };
}
