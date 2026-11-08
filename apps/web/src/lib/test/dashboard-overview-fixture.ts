import type { DashboardOverview, WorkstreamId } from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { SNAPSHOT_AS_OF } from '@/lib/snapshot/snapshot-meta';
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
  const hvacDelayed = ['C', 'D', 'E', 'F'].includes(snapshotId);
  const hvacResidual = (
    ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'] as SnapshotId[]
  ).includes(snapshotId);
  const hvacRecovered = (
    ['O', 'P', 'Q', 'R', 'S'] as SnapshotId[]
  ).includes(snapshotId);
  const psDelta = hvacRecovered ? 7 : hvacResidual ? 14 : hvacDelayed ? 21 : 0;
  const psForecast =
    psDelta === 21
      ? '2027-10-06'
      : psDelta === 14
        ? '2027-09-29'
        : psDelta === 7
          ? '2027-09-22'
          : '2027-09-15';

  const projectStatus: DashboardOverview['projectStatus'] =
    snapshotId === 'A' || snapshotId === 'S'
      ? 'Green'
      : snapshotId === 'B' ||
          snapshotId === 'Q' ||
          snapshotId === 'R'
        ? 'Yellow'
        : 'Red';

  const risk001Green = (
    ['A', 'B', 'Q', 'R', 'S'] as SnapshotId[]
  ).includes(snapshotId);
  const panelPowerSlip = snapshotId !== 'A' && snapshotId !== 'B';

  /** Stable curated executive map — same membership A–S. */
  const executiveMilestoneIds = [
    'MS-BLD-EXC',
    'MS-CLN-PANEL',
    'MS-UTL-PWR',
    'MS-BLD-ENCL',
    'MS-CLN-RDY',
    'MS-HVAC-IQ',
    'MS-UTL-WFI',
    'MS-PRD-INST',
    'MS-PKG-SAT',
    'MS-COM-OQ',
    'MS-COM-GO',
    'MS-PS',
  ];

  const base: DashboardOverview = {
    snapshotId,
    scenarioAsOfDate: SNAPSHOT_AS_OF[snapshotId],
    projectStatus,
    executiveMilestoneIds,
    programs: [
      { id: 'PRG-DSN', name: 'Проектирование и разрешения', status: 'Yellow' },
      {
        id: 'PRG-CON',
        name: 'Строительство',
        status: panelPowerSlip ? 'Red' : 'Yellow',
      },
      {
        id: 'PRG-ENG',
        name: 'Инженерия',
        status: panelPowerSlip ? 'Red' : 'Yellow',
      },
      { id: 'PRG-EQP', name: 'Оборудование', status: 'Yellow' },
      { id: 'PRG-DIG', name: 'Цифра', status: 'Yellow' },
      { id: 'PRG-STA', name: 'Запуск', status: 'Yellow' },
      { id: 'PRG-ORG', name: 'Организация и люди', status: 'Yellow' },
    ],
    project: {
      id: 'PRJ-01',
      name: 'Строительство фармацевтической фабрики (Greenfield)',
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
        status:
          hvacDelayed || hvacResidual
            ? 'Delayed'
            : 'OnTrack',
        workstream: 'WS-HVAC',
        baselineDelivery: '2027-05-15',
        forecastDelivery:
          psDelta === 21
            ? '2027-06-05'
            : psDelta === 14
              ? '2027-05-29'
              : psDelta === 7
                ? '2027-05-22'
                : '2027-05-15',
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: '2027-05-15',
          forecastDate:
            psDelta === 21
              ? '2027-06-05'
              : psDelta === 14
                ? '2027-05-29'
                : psDelta === 7
                  ? '2027-05-22'
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
        rag: risk001Green ? 'Green' : 'Red',
        workstream: 'WS-HVAC',
        equipmentId: 'EQ-HVAC-01',
        milestoneId: 'MS-PS',
        issueId: snapshotId === 'A' || snapshotId === 'B' ? null : 'ISS-001',
      },
    ],
    milestones: [
      {
        id: 'MS-BLD-EXC',
        name: 'Котлован завершён',
        rag: 'Green' as const,
        workstream: 'WS-BLD' as const,
        baselineDate: '2027-02-05',
        forecastDate: '2027-02-05',
      },
      {
        id: 'MS-BLD-FND',
        name: 'Фундамент принят',
        rag: 'Green' as const,
        workstream: 'WS-BLD' as const,
        baselineDate: '2027-02-12',
        forecastDate: '2027-02-12',
      },
      {
        id: 'MS-BLD-STR',
        name: 'Каркас здания готов',
        rag: 'Green' as const,
        workstream: 'WS-BLD' as const,
        baselineDate: '2027-02-20',
        forecastDate: '2027-02-20',
      },
      {
        id: 'MS-BLD-ENCL',
        name: 'Оболочка здания закрыта',
        rag: 'Green' as const,
        workstream: 'WS-BLD' as const,
        baselineDate: '2027-02-28',
        forecastDate: '2027-02-28',
      },
      {
        id: 'MS-CLN-PANEL',
        name: 'Монтаж панелей чистых зон завершён',
        rag: panelPowerSlip ? ('Red' as const) : ('Green' as const),
        workstream: 'WS-CLN' as const,
        baselineDate: '2027-02-16',
        forecastDate: panelPowerSlip ? '2027-03-09' : '2027-02-16',
      },
      {
        id: 'MS-UTL-PWR',
        name: 'Энергоснабжение обеспечено',
        rag: panelPowerSlip ? ('Red' as const) : ('Green' as const),
        workstream: 'WS-UTL' as const,
        baselineDate: '2027-02-18',
        forecastDate: panelPowerSlip ? '2027-04-15' : '2027-02-18',
      },
      {
        id: 'MS-CLN-RDY',
        name: 'Чистые помещения готовы к HVAC',
        rag: 'Green' as const,
        workstream: 'WS-CLN' as const,
        baselineDate: '2027-04-30',
        forecastDate: '2027-04-30',
      },
      {
        id: 'MS-HVAC-IQ',
        name: 'Демо-гейт готовности HVAC (IQ)',
        rag: 'Green' as const,
        workstream: 'WS-HVAC' as const,
        baselineDate: '2027-06-15',
        forecastDate: '2027-06-15',
      },
      {
        id: 'MS-HVAC-INST',
        name: 'AHU смонтирована',
        rag: 'Green' as const,
        workstream: 'WS-HVAC' as const,
        baselineDate: '2027-06-01',
        forecastDate: '2027-06-01',
      },
      {
        id: 'MS-HVAC-BAL',
        name: 'Балансировка HVAC завершена',
        rag: 'Green' as const,
        workstream: 'WS-HVAC' as const,
        baselineDate: '2027-08-20',
        forecastDate: '2027-08-20',
      },
      {
        id: 'MS-UTL-WFI',
        name: 'WFI доступна для использования',
        rag: 'Green' as const,
        workstream: 'WS-UTL' as const,
        baselineDate: '2027-07-01',
        forecastDate: '2027-07-01',
      },
      {
        id: 'MS-PRD-INST',
        name: 'Технологическое оборудование смонтировано',
        rag: 'Green' as const,
        workstream: 'WS-PRD' as const,
        baselineDate: '2027-07-15',
        forecastDate: '2027-07-15',
      },
      {
        id: 'MS-PKG-SAT',
        name: 'SAT упаковочной линии принят',
        rag: 'Green' as const,
        workstream: 'WS-PKG' as const,
        baselineDate: '2027-08-10',
        forecastDate:
          snapshotId === 'C' || snapshotId === 'D' || snapshotId === 'E'
            ? '2027-08-20'
            : '2027-08-10',
      },
      {
        id: 'MS-PKG-RDY',
        name: 'Упаковка готова к старту',
        rag: 'Green' as const,
        workstream: 'WS-PKG' as const,
        baselineDate: '2027-09-05',
        forecastDate: '2027-09-05',
      },
      {
        id: 'MS-QC-RDY',
        name: 'QC-лаборатория готова к работе',
        rag: 'Green' as const,
        workstream: 'WS-QC' as const,
        baselineDate: '2027-07-10',
        forecastDate: '2027-07-10',
      },
      {
        id: 'MS-QC-METH',
        name: 'Методы QC готовы',
        rag: 'Green' as const,
        workstream: 'WS-QC' as const,
        baselineDate: '2027-09-08',
        forecastDate: '2027-09-08',
      },
      {
        id: 'MS-AUT-BMS',
        name: 'BMS введён в эксплуатацию',
        rag: 'Green' as const,
        workstream: 'WS-AUT' as const,
        baselineDate: '2027-07-25',
        forecastDate: '2027-07-25',
      },
      {
        id: 'MS-COM-IQ',
        name: 'Общий демо-гейт готовности (IQ)',
        rag: 'Green' as const,
        workstream: 'WS-AUT' as const,
        baselineDate: '2027-08-05',
        forecastDate: '2027-08-05',
      },
      {
        id: 'MS-COM-OQ',
        name: 'Демо-гейт OQ',
        rag: 'Green' as const,
        workstream: 'WS-AUT' as const,
        baselineDate: '2027-09-01',
        forecastDate: '2027-09-01',
      },
      {
        id: 'MS-COM-PQ',
        name: 'Демо-гейт PQ',
        rag: snapshotId === 'P' ? ('Red' as const) : ('Green' as const),
        workstream: 'WS-AUT' as const,
        baselineDate: '2027-09-10',
        forecastDate: '2027-09-10',
      },
      {
        id: 'MS-COM-RDY',
        name: 'Готовность к старту',
        rag: 'Green' as const,
        workstream: null,
        baselineDate: '2027-09-12',
        forecastDate: '2027-09-12',
      },
      {
        id: 'MS-COM-GO',
        name: 'Решение Go/No-Go',
        rag: 'Green' as const,
        workstream: null,
        baselineDate: '2027-09-18',
        forecastDate: '2027-09-18',
      },
      {
        id: 'MS-PS',
        name: 'Готовность к старту производства',
        rag: risk001Green ? 'Green' : 'Red',
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
              ownerPersonId: 'PER-01' as const,
              ownerFullNameRu: 'Соколов Андрей Викторович',
              dueDate: '2027-05-15',
              note: 'Утвердить ускоренную логистику AHU и резервный монтажный слот',
            },
            {
              id: 'DEC-UTL-01' as const,
              projectId: 'PRJ-01',
              milestoneId: 'MS-UTL-WFI',
              type: 'PrioritizeRecovery' as const,
              ownerPersonId: 'PER-09' as const,
              ownerFullNameRu: 'Фёдоров Сергей Михайлович',
              dueDate: null,
              note: 'Согласовать параллельный ввод PW и сжатый монтаж WFI',
            },
            ...(snapshotId === 'G' || snapshotId === 'H'
              ? [
                  {
                    id: 'DEC-PKG-01' as const,
                    projectId: 'PRJ-01',
                    milestoneId: 'MS-PKG-SAT',
                    type: 'AcceptDateSlip' as const,
                    ownerPersonId: 'PER-11' as const,
                    ownerFullNameRu: 'Попов Алексей Дмитриевич',
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
                    ownerPersonId: 'PER-13' as const,
                    ownerFullNameRu: 'Григорьев Артём Владимирович',
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
                      title: 'Остаточный HVAC +14',
                      causeImpact:
                        'Прогресс по сценарию; риск срыва запуска и веха старта остаются в отклонении',
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
                        title: 'Остаточный HVAC / старт производства',
                        causeImpact:
                          'Остаточный +14; решения не завершили исполнение',
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
                      'Остаточное отклонение WFI',
                    ],
                  }
                : snapshotId === 'H'
                  ? {
                      better: ['Зафиксирована заморозка точек BMS/EMS'],
                      worse: [],
                      unchangedCritical: [
                        'Остаточный HVAC / старт производства',
                      ],
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

  const withDue = {
    ...base,
    decisions: base.decisions.map((d) => ({
      ...d,
      dueState: !d.dueDate
        ? ('none' as const)
        : d.dueDate < base.scenarioAsOfDate
          ? ('passed' as const)
          : ('upcoming' as const),
    })),
  };

  return { ...withDue, ...overrides };
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
