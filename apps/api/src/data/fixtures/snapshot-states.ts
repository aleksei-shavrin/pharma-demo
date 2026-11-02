/**
 * DOC-PROD-021/022 per-snapshot state overlays (E2).
 * Identity lives in catalog.ts; this file is status/RAG/delta/editorial only.
 */
import type { PopulatedSnapshotId } from './types';
import type { IssueStatus, Rag } from './types';
import type { EquipmentId, IssueId, MilestoneId, RiskId } from './catalog';
import type { TopExceptionFixture, TrendFixture } from './types';

export type SnapshotState = {
  asOf: string;
  /** Production Start forecast date. */
  psForecast: string;
  /** Days vs baseline delivery (DOC-PROD-021 §7). Omitted = 0. */
  eqDelta: Partial<Record<EquipmentId, number>>;
  /** Issue status if present in this snapshot. */
  issues: Partial<Record<IssueId, IssueStatus>>;
  /** Risk RAG for risks present in this snapshot. */
  riskRag: Partial<Record<RiskId, Rag>>;
  /** Milestone forecast delta days vs baseline. Omitted = 0. */
  msDelta: Partial<Record<MilestoneId, number>>;
  /** Milestone RAG. Omitted = Green. */
  msRag: Partial<Record<MilestoneId, Rag>>;
  topExceptions: TopExceptionFixture[];
  trend: TrendFixture;
};

const emptyTrend = (): TrendFixture => ({
  better: [],
  worse: [],
  unchangedCritical: [],
});

/** Risks present from A (Green) excluding RISK-COM-01 until E. */
const BASE_RISKS_GREEN: Partial<Record<RiskId, Rag>> = {
  'RISK-001': 'Green',
  'RISK-HVAC-02': 'Green',
  'RISK-CLN-01': 'Green',
  'RISK-UTL-01': 'Green',
  'RISK-UTL-02': 'Green',
  'RISK-PRD-01': 'Green',
  'RISK-PKG-01': 'Green',
  'RISK-PKG-02': 'Green',
  'RISK-QC-01': 'Green',
  'RISK-AUT-01': 'Green',
  'RISK-BLD-01': 'Green',
};

export const SNAPSHOT_STATES: Record<PopulatedSnapshotId, SnapshotState> = {
  A: {
    asOf: '2027-02-15',
    psForecast: '2027-09-15',
    eqDelta: {},
    issues: {},
    riskRag: { ...BASE_RISKS_GREEN },
    msDelta: {},
    msRag: {},
    topExceptions: [],
    trend: emptyTrend(),
  },

  B: {
    asOf: '2027-02-28',
    psForecast: '2027-09-15',
    eqDelta: {
      'EQ-BLD-02': 5,
      'EQ-PKG-01': 10,
    },
    issues: {
      'ISS-BLD-01': 'Open',
      'ISS-PKG-01': 'Open',
    },
    riskRag: { ...BASE_RISKS_GREEN },
    msDelta: {
      'MS-PKG-SAT': 10,
    },
    msRag: {},
    topExceptions: [
      {
        id: 'TEX-B-PKG',
        title: 'Прогноз срыва FAT упаковки',
        causeImpact: 'Локальное отклонение упаковки без влияния на старт производства',
        links: [
          { type: 'equipment', id: 'EQ-PKG-01' },
          { type: 'issue', id: 'ISS-PKG-01' },
          { type: 'risk', id: 'RISK-PKG-01' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-B-BLD',
        title: 'Замечания по дверям оболочки',
        causeImpact: 'Локальное внимание по WS-BLD',
        links: [
          { type: 'equipment', id: 'EQ-BLD-02' },
          { type: 'issue', id: 'ISS-BLD-01' },
        ],
        priority: 2,
      },
    ],
    trend: {
      better: [],
      worse: [
        'Упаковка: прогноз срыва FAT',
        'Оболочка: замечания по дверям',
      ],
      unchangedCritical: [],
    },
  },

  C: {
    asOf: '2027-03-01',
    psForecast: '2027-10-06',
    eqDelta: {
      'EQ-HVAC-01': 21,
      'EQ-PKG-01': 10,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-PKG-01': 'Open',
      'ISS-001': 'Open',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
    },
    msDelta: {
      'MS-PS': 21,
      'MS-PKG-SAT': 10,
    },
    msRag: {
      'MS-PS': 'Red',
    },
    topExceptions: [
      {
        id: 'TEX-C-HVAC-PS',
        title: 'Критический прогноз сдвига AHU',
        causeImpact: 'Задержка long-lead HVAC угрожает старту производства (+21 дн.)',
        links: [
          { type: 'equipment', id: 'EQ-HVAC-01' },
          { type: 'issue', id: 'ISS-001' },
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-C-PKG',
        title: 'Упаковка всё ещё в отклонении',
        causeImpact: 'Фоновый Delayed PKG при критичном HVAC',
        links: [
          { type: 'equipment', id: 'EQ-PKG-01' },
          { type: 'issue', id: 'ISS-PKG-01' },
        ],
        priority: 2,
      },
    ],
    trend: {
      better: ['Оболочка: замечания закрыты'],
      worse: ['HVAC / старт производства: +21'],
      unchangedCritical: [],
    },
  },

  D: {
    asOf: '2027-03-20',
    psForecast: '2027-10-06',
    eqDelta: {
      'EQ-HVAC-01': 21,
      'EQ-HVAC-02': 7,
      'EQ-CLN-01': 14,
      'EQ-PKG-01': 10,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-PKG-01': 'Open',
      'ISS-001': 'Open',
      'ISS-HVAC-02': 'Open',
      'ISS-CLN-01': 'Open',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-HVAC-02': 'Red',
      'RISK-CLN-01': 'Red',
    },
    msDelta: {
      'MS-PS': 21,
      'MS-HVAC-IQ': 7,
      'MS-CLN-RDY': 14,
      'MS-PKG-SAT': 10,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-HVAC-IQ': 'Red',
      'MS-CLN-RDY': 'Red',
    },
    topExceptions: [
      {
        id: 'TEX-D-HVAC-PS',
        title: 'HVAC → старт производства',
        causeImpact: 'Путь PS остаётся +21 / Red',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-D-CLN',
        title: 'Чистые зоны не готовы к HVAC',
        causeImpact: 'Каскад S2: панели +14, RISK-CLN Red',
        links: [
          { type: 'equipment', id: 'EQ-CLN-01' },
          { type: 'issue', id: 'ISS-CLN-01' },
          { type: 'risk', id: 'RISK-CLN-01' },
          { type: 'milestone', id: 'MS-CLN-RDY' },
        ],
        priority: 2,
      },
      {
        id: 'TEX-D-HVAC-IQ',
        title: 'Гейт HVAC (IQ) под давлением документации',
        causeImpact: 'ISS-HVAC-02 / RISK-HVAC-02',
        links: [
          { type: 'issue', id: 'ISS-HVAC-02' },
          { type: 'risk', id: 'RISK-HVAC-02' },
          { type: 'milestone', id: 'MS-HVAC-IQ' },
        ],
        priority: 3,
      },
    ],
    trend: {
      better: [],
      worse: ['Чистые зоны; гейт HVAC (IQ)'],
      unchangedCritical: ['HVAC / PS критичен'],
    },
  },

  E: {
    asOf: '2027-04-10',
    psForecast: '2027-10-06',
    eqDelta: {
      'EQ-HVAC-01': 21,
      'EQ-HVAC-02': 7,
      'EQ-CLN-01': 14,
      'EQ-UTL-02': 18,
      'EQ-UTL-04': 10,
      'EQ-PKG-01': 14,
      'EQ-PKG-03': 10,
      'EQ-QC-01': 14,
      'EQ-PRD-02': 7,
      'EQ-AUT-01': 7,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-PKG-01': 'Open',
      'ISS-001': 'Open',
      'ISS-HVAC-02': 'Open',
      'ISS-CLN-01': 'Open',
      'ISS-UTL-01': 'Open',
      'ISS-UTL-02': 'Open',
      'ISS-PRD-01': 'Open',
      'ISS-PKG-02': 'Open',
      'ISS-QC-01': 'Open',
      'ISS-AUT-01': 'Open',
    },
    // DOC-PROD-022: mix attention + few Reds — not all-Red plant.
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-HVAC-02': 'Red',
      'RISK-CLN-01': 'Red',
      'RISK-UTL-01': 'Red',
      'RISK-PKG-01': 'Red',
      'RISK-COM-01': 'Red',
    },
    msDelta: {
      'MS-PS': 21,
      'MS-HVAC-IQ': 7,
      'MS-CLN-RDY': 14,
      'MS-UTL-WFI': 18,
      'MS-PRD-INST': 7,
      'MS-PKG-SAT': 14,
      'MS-QC-RDY': 14,
      'MS-AUT-BMS': 7,
      'MS-COM-IQ': 10,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-HVAC-IQ': 'Red',
      'MS-CLN-RDY': 'Red',
      'MS-UTL-WFI': 'Red',
      'MS-PKG-SAT': 'Red',
      'MS-COM-IQ': 'Red',
    },
    topExceptions: [
      {
        id: 'TEX-E-HVAC-PS',
        title: 'HVAC → старт производства',
        causeImpact: 'Единственный драйвер PS остаётся +21 / Red',
        links: [
          { type: 'equipment', id: 'EQ-HVAC-01' },
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-E-WFI',
        title: 'WFI недоступна к прогонам',
        causeImpact: 'Дистиллятор +18; RISK-UTL-01 Red',
        links: [
          { type: 'equipment', id: 'EQ-UTL-02' },
          { type: 'issue', id: 'ISS-UTL-01' },
          { type: 'risk', id: 'RISK-UTL-01' },
          { type: 'milestone', id: 'MS-UTL-WFI' },
        ],
        priority: 2,
      },
      {
        id: 'TEX-E-CLN',
        title: 'Чистые зоны',
        causeImpact: 'Панели +14; RISK-CLN Red',
        links: [
          { type: 'risk', id: 'RISK-CLN-01' },
          { type: 'milestone', id: 'MS-CLN-RDY' },
        ],
        priority: 3,
      },
      {
        id: 'TEX-E-PKG',
        title: 'Упаковка / сериализация',
        causeImpact: 'Эскалация PKG + сериализация',
        links: [
          { type: 'equipment', id: 'EQ-PKG-01' },
          { type: 'issue', id: 'ISS-PKG-02' },
          { type: 'risk', id: 'RISK-PKG-01' },
        ],
        priority: 4,
      },
      {
        id: 'TEX-E-QC',
        title: 'QC / HPLC',
        causeImpact: 'Прогноз поздней поставки HPLC (attention без Red Risk)',
        links: [
          { type: 'equipment', id: 'EQ-QC-01' },
          { type: 'issue', id: 'ISS-QC-01' },
        ],
        priority: 5,
      },
    ],
    trend: {
      better: [],
      worse: ['WFI; QC; автоматизация; эскалация упаковки'],
      unchangedCritical: ['HVAC / PS критичен'],
    },
  },

  F: {
    asOf: '2027-04-20',
    psForecast: '2027-10-06',
    eqDelta: {
      'EQ-HVAC-01': 21,
      'EQ-HVAC-02': 7,
      'EQ-CLN-01': 10,
      'EQ-UTL-02': 18,
      'EQ-UTL-04': 10,
      'EQ-PKG-01': 7,
      'EQ-PKG-03': 10,
      'EQ-QC-01': 14,
      'EQ-PRD-02': 7,
      'EQ-AUT-01': 7,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-PKG-01': 'Mitigating',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Open',
      'ISS-CLN-01': 'Mitigating',
      'ISS-UTL-01': 'Mitigating',
      'ISS-UTL-02': 'Open',
      'ISS-PRD-01': 'Open',
      'ISS-PKG-02': 'Open',
      'ISS-QC-01': 'Open',
      'ISS-AUT-01': 'Open',
    },
    // Decisions do not heal Red Risks (BR-006); same Red set as E peak.
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-HVAC-02': 'Red',
      'RISK-CLN-01': 'Red',
      'RISK-UTL-01': 'Red',
      'RISK-PKG-01': 'Red',
      'RISK-COM-01': 'Red',
    },
    msDelta: {
      'MS-PS': 21,
      'MS-HVAC-IQ': 7,
      'MS-CLN-RDY': 10,
      'MS-UTL-WFI': 18,
      'MS-PRD-INST': 7,
      'MS-PKG-SAT': 7,
      'MS-QC-RDY': 14,
      'MS-AUT-BMS': 7,
      'MS-COM-IQ': 10,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-HVAC-IQ': 'Red',
      'MS-CLN-RDY': 'Red',
      'MS-UTL-WFI': 'Red',
      'MS-PKG-SAT': 'Red',
      'MS-COM-IQ': 'Red',
    },
    topExceptions: [
      {
        id: 'TEX-F-HVAC-PS',
        title: 'HVAC → PS без изменения прогноза',
        causeImpact: 'DEC-001 зафиксирован; Δ остаётся +21 (BR-006)',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-F-WFI',
        title: 'Остаточное отклонение WFI',
        causeImpact:
          'DEC-UTL-01 зафиксирован; прогноз WFI без автоматического восстановления',
        links: [
          { type: 'risk', id: 'RISK-UTL-01' },
          { type: 'milestone', id: 'MS-UTL-WFI' },
        ],
        priority: 2,
      },
      {
        id: 'TEX-F-CLN',
        title: 'Остаточное отклонение чистых зон',
        causeImpact:
          'DEC-CLN-01 зафиксирован; остаточное отклонение чистых зон',
        links: [
          { type: 'risk', id: 'RISK-CLN-01' },
          { type: 'milestone', id: 'MS-CLN-RDY' },
        ],
        priority: 3,
      },
    ],
    trend: {
      better: ['Зафиксированы решения (HVAC, WFI, чистые зоны)'],
      worse: [],
      unchangedCritical: ['HVAC / PS без изменения прогноза'],
    },
  },

  G: {
    asOf: '2027-05-15',
    psForecast: '2027-09-29',
    eqDelta: {
      'EQ-HVAC-01': 14,
      'EQ-HVAC-02': 7,
      'EQ-CLN-01': 7,
      'EQ-UTL-02': 12,
      'EQ-UTL-04': 10,
      'EQ-PKG-01': 0,
      'EQ-PKG-03': 7,
      'EQ-QC-01': 7,
      'EQ-PRD-02': 7,
      'EQ-AUT-01': 7,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Open',
      'ISS-CLN-01': 'Mitigating',
      'ISS-UTL-01': 'Mitigating',
      'ISS-UTL-02': 'Open',
      'ISS-PRD-01': 'Open',
      'ISS-PKG-02': 'Open',
      'ISS-QC-01': 'Mitigating',
      'ISS-AUT-01': 'Open',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-HVAC-02': 'Red',
      'RISK-CLN-01': 'Green',
      'RISK-UTL-01': 'Red',
      'RISK-PKG-01': 'Green',
      'RISK-COM-01': 'Red',
    },
    msDelta: {
      'MS-PS': 14,
      'MS-HVAC-IQ': 7,
      'MS-CLN-RDY': 7,
      'MS-UTL-WFI': 12,
      'MS-PRD-INST': 7,
      'MS-PKG-SAT': 0,
      'MS-QC-RDY': 7,
      'MS-AUT-BMS': 7,
      'MS-COM-IQ': 10,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-HVAC-IQ': 'Red',
      'MS-CLN-RDY': 'Green',
      'MS-UTL-WFI': 'Red',
      'MS-PKG-SAT': 'Green',
      'MS-COM-IQ': 'Red',
    },
    topExceptions: [
      {
        id: 'TEX-G-HVAC-PS',
        title: 'Остаточный HVAC +14',
        causeImpact:
          'Прогресс по сценарию; RISK-001 и MS-PS остаются красными',
        links: [
          { type: 'equipment', id: 'EQ-HVAC-01' },
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-G-WFI',
        title: 'Остаточное отклонение WFI',
        causeImpact:
          'WFI +12; меры выполняются, красный риск не снят полностью',
        links: [
          { type: 'risk', id: 'RISK-UTL-01' },
          { type: 'milestone', id: 'MS-UTL-WFI' },
        ],
        priority: 2,
      },
      {
        id: 'TEX-G-QC',
        title: 'Временный обход для QC',
        causeImpact: 'DEC-QC-01 зафиксирован; HPLC всё ещё с задержкой',
        links: [
          { type: 'issue', id: 'ISS-QC-01' },
          { type: 'equipment', id: 'EQ-QC-01' },
        ],
        priority: 3,
      },
    ],
    trend: {
      better: ['Упаковка стабилизирована', 'HVAC Δ снижен до +14'],
      worse: [],
      unchangedCritical: [
        'HVAC / PS остаётся критичным',
        'Остаточное отклонение WFI',
      ],
    },
  },

  H: {
    asOf: '2027-06-01',
    psForecast: '2027-09-29',
    eqDelta: {
      'EQ-HVAC-01': 14,
      'EQ-HVAC-02': 7,
      'EQ-CLN-01': 7,
      'EQ-UTL-02': 12,
      'EQ-UTL-04': 7,
      'EQ-PKG-01': 0,
      'EQ-PKG-03': 7,
      'EQ-QC-01': 7,
      'EQ-PRD-02': 7,
      'EQ-AUT-01': 5,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Open',
      'ISS-CLN-01': 'Mitigating',
      'ISS-UTL-01': 'Mitigating',
      'ISS-UTL-02': 'Open',
      'ISS-PRD-01': 'Open',
      'ISS-PKG-02': 'Open',
      'ISS-QC-01': 'Mitigating',
      'ISS-AUT-01': 'Open',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-HVAC-02': 'Red',
      'RISK-CLN-01': 'Green',
      'RISK-UTL-01': 'Red',
      'RISK-PKG-01': 'Green',
      'RISK-COM-01': 'Red',
    },
    msDelta: {
      'MS-PS': 14,
      'MS-HVAC-IQ': 7,
      'MS-CLN-RDY': 7,
      'MS-UTL-WFI': 12,
      'MS-PRD-INST': 7,
      'MS-PKG-SAT': 0,
      'MS-QC-RDY': 7,
      'MS-AUT-BMS': 5,
      'MS-COM-IQ': 10,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-HVAC-IQ': 'Red',
      'MS-CLN-RDY': 'Green',
      'MS-UTL-WFI': 'Red',
      'MS-PKG-SAT': 'Green',
      'MS-COM-IQ': 'Red',
    },
    topExceptions: [
      {
        id: 'TEX-H-HVAC-PS',
        title: 'Остаточный HVAC / старт производства',
        causeImpact: 'Остаточный +14; решения не завершили исполнение',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-H-AUT',
        title: 'Заморозка точек BMS/EMS',
        causeImpact:
          'DEC-AUT-01 зафиксирован; внимание по интеграции сохраняется',
        links: [
          { type: 'issue', id: 'ISS-AUT-01' },
          { type: 'risk', id: 'RISK-AUT-01' },
          { type: 'milestone', id: 'MS-AUT-BMS' },
        ],
        priority: 2,
      },
      {
        id: 'TEX-H-COM',
        title: 'Накопительный риск общего демо-гейта (IQ)',
        causeImpact: 'RISK-COM-01 (красный без связанной проблемы)',
        links: [
          { type: 'risk', id: 'RISK-COM-01' },
          { type: 'milestone', id: 'MS-COM-IQ' },
        ],
        priority: 3,
      },
    ],
    trend: {
      better: ['Зафиксирована заморозка точек BMS/EMS'],
      worse: [],
      unchangedCritical: ['Остаточный HVAC / старт производства'],
    },
  },
};
