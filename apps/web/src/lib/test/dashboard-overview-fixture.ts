import type { DashboardOverview, WorkstreamId } from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { WORKSTREAM_DISPLAY_ORDER } from '@/lib/ui-labels';

function allWs(
  overrides: Partial<Record<WorkstreamId, 'Green' | 'Yellow' | 'Red'>> = {},
): DashboardOverview['workstreamRollups'] {
  return WORKSTREAM_DISPLAY_ORDER.map((workstream) => ({
    workstream,
    status: overrides[workstream] ?? 'Green',
  }));
}

/**
 * Collection-shaped DashboardOverview for FE unit tests (E3).
 * Uses backend-shaped fields only — FE must not invent status.
 */
export function dashboardOverviewFixture(
  snapshotId: SnapshotId,
  overrides: Partial<DashboardOverview> = {},
): DashboardOverview {
  const asOf: Record<SnapshotId, string> = {
    A: '2027-02-15',
    B: '2027-02-28',
    C: '2027-03-01',
    D: '2027-03-20',
    E: '2027-04-10',
    F: '2027-04-20',
    G: '2027-05-15',
    H: '2027-06-01',
  };

  const hvacDelayed = ['C', 'D', 'E', 'F'].includes(snapshotId);
  const hvacResidual = snapshotId === 'G' || snapshotId === 'H';
  const psDelta = hvacResidual ? 14 : hvacDelayed ? 21 : 0;
  const psForecast =
    psDelta === 21
      ? '2027-10-06'
      : psDelta === 14
        ? '2027-09-29'
        : '2027-09-15';

  const projectStatus: DashboardOverview['projectStatus'] =
    snapshotId === 'A'
      ? 'Green'
      : snapshotId === 'B'
        ? 'Yellow'
        : 'Red';

  const base: DashboardOverview = {
    snapshotId,
    scenarioAsOfDate: asOf[snapshotId],
    projectStatus,
    project: {
      id: 'PRJ-01',
      name: 'Строительство фармацевтического завода',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: psForecast,
      productionStartVariance: {
        subject: 'production_start',
        baselineDate: '2027-09-15',
        forecastDate: psForecast,
        deltaDays: psDelta,
      },
    },
    equipment: [
      {
        id: 'EQ-HVAC-01',
        name: 'Приточная установка AHU (long-lead)',
        critical: true,
        status: hvacDelayed || hvacResidual ? 'Delayed' : 'OnTrack',
        workstream: 'WS-HVAC',
        baselineDelivery: '2027-05-15',
        forecastDelivery:
          psDelta === 21
            ? '2027-06-05'
            : psDelta === 14
              ? '2027-05-29'
              : '2027-05-15',
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: '2027-05-15',
          forecastDate:
            psDelta === 21
              ? '2027-06-05'
              : psDelta === 14
                ? '2027-05-29'
                : '2027-05-15',
          deltaDays: psDelta,
        },
      },
      {
        id: 'EQ-PKG-01',
        name: 'Линия первичной упаковки',
        critical: true,
        status:
          snapshotId === 'B' || snapshotId === 'C' || snapshotId === 'F'
            ? 'Delayed'
            : 'OnTrack',
        workstream: 'WS-PKG',
        baselineDelivery: '2027-06-20',
        forecastDelivery:
          snapshotId === 'B' || snapshotId === 'C'
            ? '2027-06-30'
            : snapshotId === 'F'
              ? '2027-06-27'
              : '2027-06-20',
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: '2027-06-20',
          forecastDate:
            snapshotId === 'B' || snapshotId === 'C'
              ? '2027-06-30'
              : snapshotId === 'F'
                ? '2027-06-27'
                : '2027-06-20',
          deltaDays:
            snapshotId === 'B' || snapshotId === 'C'
              ? 10
              : snapshotId === 'F'
                ? 7
                : 0,
        },
      },
      {
        id: 'EQ-PKG-03',
        name: 'Сериализация / агрегация',
        critical: true,
        status:
          snapshotId === 'G' || snapshotId === 'H' || snapshotId === 'F'
            ? 'Delayed'
            : 'OnTrack',
        workstream: 'WS-PKG',
        baselineDelivery: '2027-07-05',
        forecastDelivery:
          snapshotId === 'G' || snapshotId === 'H' || snapshotId === 'F'
            ? '2027-07-12'
            : '2027-07-05',
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: '2027-07-05',
          forecastDate:
            snapshotId === 'G' || snapshotId === 'H' || snapshotId === 'F'
              ? '2027-07-12'
              : '2027-07-05',
          deltaDays:
            snapshotId === 'G' || snapshotId === 'H' || snapshotId === 'F'
              ? 7
              : 0,
        },
      },
      {
        id: 'EQ-BLD-02',
        name: 'Комплект технических дверей и шлюзов оболочки',
        critical: false,
        status: snapshotId === 'B' ? 'Delayed' : 'OnTrack',
        workstream: 'WS-BLD',
        baselineDelivery: '2027-02-01',
        forecastDelivery: snapshotId === 'B' ? '2027-02-06' : '2027-02-01',
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: '2027-02-01',
          forecastDate: snapshotId === 'B' ? '2027-02-06' : '2027-02-01',
          deltaDays: snapshotId === 'B' ? 5 : 0,
        },
      },
    ],
    issues:
      snapshotId === 'A'
        ? []
        : snapshotId === 'B'
          ? [
              {
                id: 'ISS-PKG-01',
                title: 'Прогноз срыва срока FAT первичной упаковки',
                status: 'Open',
                workstream: 'WS-PKG',
                equipmentId: 'EQ-PKG-01',
                milestoneId: 'MS-PKG-SAT',
              },
              {
                id: 'ISS-BLD-01',
                title: 'Замечания по комплектности технических дверей оболочки',
                status: 'Open',
                workstream: 'WS-BLD',
                equipmentId: 'EQ-BLD-02',
                milestoneId: 'MS-BLD-ENCL',
              },
            ]
          : [
              {
                id: 'ISS-001',
                title: 'Прогноз сдвига поставки long-lead AHU',
                status:
                  snapshotId === 'C' || snapshotId === 'D' || snapshotId === 'E'
                    ? 'Open'
                    : 'Mitigating',
                workstream: 'WS-HVAC',
                equipmentId: 'EQ-HVAC-01',
                milestoneId: 'MS-PS',
              },
              ...(snapshotId === 'G' || snapshotId === 'H'
                ? [
                    {
                      id: 'ISS-PKG-01' as const,
                      title: 'Прогноз срыва срока FAT первичной упаковки',
                      status: 'Closed' as const,
                      workstream: 'WS-PKG' as const,
                      equipmentId: 'EQ-PKG-01',
                      milestoneId: 'MS-PKG-SAT',
                    },
                    {
                      id: 'ISS-PKG-02' as const,
                      title: 'Отставание сериализации от графика интеграции',
                      status: 'Open' as const,
                      workstream: 'WS-PKG' as const,
                      equipmentId: 'EQ-PKG-03',
                      milestoneId: 'MS-PKG-SAT',
                    },
                  ]
                : []),
            ],
    risks: [
      {
        id: 'RISK-001',
        title: 'Срыв окна монтажа HVAC → сдвиг старта производства',
        rag: snapshotId === 'A' || snapshotId === 'B' ? 'Green' : 'Red',
        workstream: 'WS-HVAC',
        equipmentId: 'EQ-HVAC-01',
        milestoneId: 'MS-PS',
        issueId: snapshotId === 'A' || snapshotId === 'B' ? null : 'ISS-001',
      },
    ],
    milestones: [
      {
        id: 'MS-PS',
        name: 'Готовность к старту производства',
        rag: snapshotId === 'A' || snapshotId === 'B' ? 'Green' : 'Red',
        workstream: null,
        baselineDate: '2027-09-15',
        forecastDate: psForecast,
      },
    ],
    decisions:
      snapshotId === 'F' || snapshotId === 'G' || snapshotId === 'H'
        ? [
            {
              id: 'DEC-001',
              projectId: 'PRJ-01',
              milestoneId: 'MS-PS',
              type: 'PrioritizeRecovery',
              ownerRole: 'SH-DIR-01',
              dueDate: '2027-05-15',
              note: 'Утвердить ускоренную логистику AHU и резервный монтажный слот',
            },
            ...(snapshotId === 'G' || snapshotId === 'H'
              ? [
                  {
                    id: 'DEC-PKG-01' as const,
                    projectId: 'PRJ-01',
                    milestoneId: 'MS-PKG-SAT',
                    type: 'AcceptDateSlip' as const,
                    ownerRole: 'SH-PKG-01',
                    dueDate: null,
                    note: 'Зафиксировать принятие текущего прогноза SAT с оговорками по сериализации',
                  },
                ]
              : []),
            ...(snapshotId === 'H'
              ? [
                  {
                    id: 'DEC-AUT-01' as const,
                    projectId: 'PRJ-01',
                    milestoneId: 'MS-AUT-BMS',
                    type: 'PrioritizeRecovery' as const,
                    ownerRole: 'SH-ENG-01',
                    dueDate: '2027-06-15',
                    note: 'Зафиксировать freeze точек интеграции BMS/EMS',
                  },
                ]
              : []),
          ]
        : [],
    workstreamRollups: allWs(
      snapshotId === 'B'
        ? { 'WS-PKG': 'Yellow', 'WS-BLD': 'Yellow' }
        : snapshotId === 'C'
          ? { 'WS-HVAC': 'Red', 'WS-PKG': 'Yellow' }
          : snapshotId === 'F'
            ? { 'WS-HVAC': 'Red', 'WS-PKG': 'Red' }
            : snapshotId === 'G' || snapshotId === 'H'
              ? { 'WS-HVAC': 'Red', 'WS-PKG': 'Yellow' }
              : {},
    ),
    topExceptions:
      snapshotId === 'A'
        ? []
        : snapshotId === 'B'
          ? [
              {
                id: 'TEX-B-PKG',
                title: 'Прогноз срыва FAT упаковки',
                causeImpact:
                  'Локальное отклонение упаковки без влияния на старт производства',
                links: [
                  { type: 'equipment', id: 'EQ-PKG-01' },
                  { type: 'issue', id: 'ISS-PKG-01' },
                ],
                priority: 1,
              },
              {
                id: 'TEX-B-BLD',
                title: 'Замечания по дверям оболочки',
                causeImpact: 'Локальное внимание по направлению здания',
                links: [{ type: 'issue', id: 'ISS-BLD-01' }],
                priority: 2,
              },
            ]
          : snapshotId === 'C'
            ? [
                {
                  id: 'TEX-C-HVAC-PS',
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
              ]
            : snapshotId === 'F'
              ? [
                  {
                    id: 'TEX-F-HVAC-PS',
                    title: 'HVAC → PS без изменения прогноза',
                    causeImpact: 'DEC-001 зафиксирован; Δ остаётся +21',
                    links: [
                      { type: 'risk', id: 'RISK-001' },
                      { type: 'milestone', id: 'MS-PS' },
                    ],
                    priority: 1,
                  },
                ]
              : snapshotId === 'G'
                ? [
                    {
                      id: 'TEX-G-HVAC-PS',
                      title: 'HVAC residual +14',
                      causeImpact:
                        'Прогресс fixture-authored; RISK-001 / MS-PS остаются Red',
                      links: [
                        { type: 'equipment', id: 'EQ-HVAC-01' },
                        { type: 'risk', id: 'RISK-001' },
                      ],
                      priority: 1,
                    },
                  ]
                : snapshotId === 'H'
                  ? [
                      {
                        id: 'TEX-H-HVAC-PS',
                        title: 'HVAC / PS residual',
                        causeImpact:
                          'Остаточный +14; Decisions не завершили исполнение',
                        links: [{ type: 'risk', id: 'RISK-001' }],
                        priority: 1,
                      },
                    ]
                  : [],
    trend:
      snapshotId === 'A'
        ? { better: [], worse: [], unchangedCritical: [] }
        : snapshotId === 'B'
          ? {
              better: [],
              worse: [
                'Упаковка: прогноз срыва FAT',
                'Оболочка: замечания по дверям',
              ],
              unchangedCritical: [],
            }
          : snapshotId === 'C'
            ? {
                better: ['Оболочка: замечания закрыты'],
                worse: ['HVAC / старт производства: +21'],
                unchangedCritical: [],
              }
            : snapshotId === 'F'
              ? {
                  better: [
                    'Зафиксированы решения (HVAC, WFI, чистые зоны)',
                  ],
                  worse: [],
                  unchangedCritical: ['HVAC / PS без изменения прогноза'],
                }
              : snapshotId === 'G'
                ? {
                    better: [
                      'Упаковка стабилизирована',
                      'HVAC Δ снижен до +14',
                    ],
                    worse: [],
                    unchangedCritical: [
                      'HVAC / PS остаётся критичным',
                      'WFI residual',
                    ],
                  }
                : snapshotId === 'H'
                  ? {
                      better: ['Зафиксирован freeze BMS/EMS'],
                      worse: [],
                      unchangedCritical: ['HVAC / PS residual'],
                    }
                  : { better: [], worse: [], unchangedCritical: [] },
    decisionPanelState:
      decisionsState(snapshotId),
    directEdges: [],
    derivedImpact: {
      rule: 'BR-004',
      equipmentDeliveryDeltaDays: psDelta,
      productionStartDeltaDays: psDelta,
      kind: psDelta === 0 ? 'none' : 'aligned_slip',
    },
    decisionHonesty:
      snapshotId === 'F' || snapshotId === 'G' || snapshotId === 'H'
        ? { recoveryExecuted: false }
        : null,
  };

  return { ...base, ...overrides };
}

function decisionsState(
  snapshotId: SnapshotId,
): DashboardOverview['decisionPanelState'] {
  if (snapshotId === 'F' || snapshotId === 'G' || snapshotId === 'H') {
    return 'recorded';
  }
  if (['C', 'D', 'E'].includes(snapshotId)) return 'needed';
  return 'absent';
}
