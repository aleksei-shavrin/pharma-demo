/**
 * DOC-PROD-021/022 per-snapshot state overlays (E2).
 * Identity lives in catalog.ts; this file is status/RAG/delta/editorial only.
 */
import type { PopulatedSnapshotId } from './types';
import type { EquipmentStatus, IssueStatus, Rag } from './types';
import type { EquipmentId, IssueId, MilestoneId, RiskId } from './catalog';
import type { TopExceptionFixture, TrendFixture } from './types';

export type SnapshotState = {
  asOf: string;
  /** Production Start forecast date. */
  psForecast: string;
  /** Days vs baseline delivery (DOC-PROD-021 §7). Omitted = 0. */
  eqDelta: Partial<Record<EquipmentId, number>>;
  /**
   * Optional fixture-authored operational status override.
   * Default remains: delta > 0 → Delayed, else OnTrack.
   * Use only for explicit recovery/completion (never inferred from asOf).
   */
  eqStatus?: Partial<Record<EquipmentId, EquipmentStatus>>;
  /** Issue status if present in this snapshot. */
  issues: Partial<Record<IssueId, IssueStatus>>;
  /** Risk RAG for risks present in this snapshot. */
  riskRag: Partial<Record<RiskId, Rag>>;
  /** Milestone forecast delta days vs baseline. Omitted = 0. */
  msDelta: Partial<Record<MilestoneId, number>>;
  /** Milestone RAG. Omitted = Green. */
  msRag: Partial<Record<MilestoneId, Rag>>;
  /**
   * Fixture-authored executive milestone set (R2-U1-R4):
   * stable curated project-lifecycle map — same membership A–S.
   * Snapshot switching changes state/RAG/chrome, not set membership.
   */
  executiveMilestoneIds: MilestoneId[];
  topExceptions: TopExceptionFixture[];
  trend: TrendFixture;
};

const emptyTrend = (): TrendFixture => ({
  better: [],
  worse: [],
  unchangedCritical: [],
});

/**
 * Stable executive map (12) across A–S.
 * FND and STR stay in the catalogue and the milestone register.
 * R2-U1-R4: not snapshot-phase-varying.
 */
export const EXECUTIVE_MILESTONE_SET_STABLE: MilestoneId[] = [
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
  'RISK-PKG-03': 'Green',
  'RISK-QC-01': 'Green',
  'RISK-AUT-01': 'Green',
  'RISK-BLD-01': 'Green',
  'RISK-BLD-02': 'Green',
};

/**
 * Panel and power slips are authored on C and held through S.
 * A–B stay at delta 0. Holding avoids a C→D forecast jump back to baseline
 * while scenarioAsOfDate moves forward. Demo assumption: the source has no recovery date.
 * Project/workstream rollups do not read milestone RAG, so HVAC and MS-PS arcs stay intact.
 */
const PANEL_POWER_SLIP_FROM: readonly PopulatedSnapshotId[] = [
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
];

const PANEL_POWER_SLIP_DELTA: Partial<Record<MilestoneId, number>> = {
  'MS-CLN-PANEL': 21,
  'MS-UTL-PWR': 56,
};

function holdPanelPowerSlip(
  states: Record<PopulatedSnapshotId, SnapshotState>,
): Record<PopulatedSnapshotId, SnapshotState> {
  const next = { ...states };
  for (const id of PANEL_POWER_SLIP_FROM) {
    const state = states[id];
    next[id] = {
      ...state,
      msDelta: { ...state.msDelta, ...PANEL_POWER_SLIP_DELTA },
      msRag: {
        ...state.msRag,
        'MS-CLN-PANEL': 'Red',
        'MS-UTL-PWR': 'Red',
      },
    };
  }
  return next;
}

const SNAPSHOT_STATES_BASE: Record<PopulatedSnapshotId, SnapshotState> = {
  A: {
    asOf: '2027-02-15',
    psForecast: '2027-09-15',
    eqDelta: {},
    issues: {},
    riskRag: { ...BASE_RISKS_GREEN },
    msDelta: {},
    msRag: {},
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
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
      'ISS-BLD-02': 'Open',
      'ISS-PKG-01': 'Open',
    },
    riskRag: { ...BASE_RISKS_GREEN },
    msDelta: {
      'MS-PKG-SAT': 10,
    },
    msRag: {},
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
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
      'ISS-BLD-02': 'Closed',
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
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
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
        causeImpact: 'Фоновое отклонение упаковки при критичном HVAC',
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
      'ISS-BLD-02': 'Closed',
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
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-D-HVAC-PS',
        title: 'HVAC → старт производства',
        causeImpact: 'Прогноз запуска остаётся сдвинутым на 21 день',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-D-CLN',
        title: 'Чистые зоны не готовы к HVAC',
        causeImpact:
          'Отставание монтажа панелей. Риск: чистые зоны не готовы к HVAC. Сдвиг поставки панелей — отдельное демосостояние, не причина монтажа',
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
      'ISS-BLD-02': 'Closed',
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
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-E-HVAC-PS',
        title: 'HVAC → старт производства',
        causeImpact:
          'Единственный драйвер старта производства остаётся со сдвигом на 21 день',
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
        causeImpact:
          'Дистиллятор сдвинут на 18 дней; риск недоступности WFI сохраняется',
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
        causeImpact:
          'Монтаж панелей сдвинут на 14 дней; риск неготовности чистых зон к HVAC сохраняется',
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
        causeImpact:
          'Прогноз поздней поставки HPLC: внимание, без критичного риска',
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
      'ISS-BLD-02': 'Closed',
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
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
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
      'ISS-BLD-02': 'Closed',
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
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-G-HVAC-PS',
        title: 'Остаточный HVAC +14',
        causeImpact:
          'Прогресс по сценарию; риск срыва запуска и веха старта остаются в отклонении',
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
          'WFI сдвинута на 12 дней; меры выполняются, риск недоступности снят не полностью',
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
      'ISS-BLD-02': 'Closed',
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
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
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
        causeImpact:
          'Риск общего демо-гейта IQ сохраняется без связанной проблемы',
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

  I: {
    asOf: '2027-06-20',
    psForecast: '2027-09-29',
    eqDelta: {
      'EQ-HVAC-01': 14,
      'EQ-HVAC-02': 5,
      'EQ-UTL-02': 5,
      'EQ-UTL-06': 10,
      'EQ-UTL-08': 7,
      'EQ-AUT-01': 5,
      'EQ-AUT-03': 10,
      'EQ-PKG-03': 5,
      'EQ-QC-01': 3,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-BLD-02': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Mitigating',
      'ISS-CLN-01': 'Closed',
      'ISS-UTL-01': 'Mitigating',
      'ISS-UTL-02': 'Closed',
      'ISS-UTL-03': 'Open',
      'ISS-UTL-04': 'Open',
      'ISS-PRD-01': 'Mitigating',
      'ISS-PKG-02': 'Open',
      'ISS-QC-01': 'Mitigating',
      'ISS-AUT-01': 'Mitigating',
      'ISS-AUT-02': 'Open',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-HVAC-02': 'Green',
      'RISK-CLN-01': 'Green',
      'RISK-UTL-01': 'Green',
      'RISK-UTL-03': 'Red',
      'RISK-UTL-04': 'Red',
      'RISK-PKG-01': 'Green',
      'RISK-COM-01': 'Red',
      'RISK-AUT-02': 'Red',
    },
    msDelta: {
      'MS-PS': 14,
      'MS-HVAC-IQ': 5,
      'MS-UTL-WFI': 5,
      'MS-UTL-RDY': 10,
      'MS-UTL-GAS': 7,
      'MS-AUT-BMS': 5,
      'MS-AUT-INT': 10,
      'MS-PKG-SAT': 0,
      'MS-COM-IQ': 7,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-UTL-RDY': 'Red',
      'MS-AUT-INT': 'Red',
      'MS-COM-IQ': 'Red',
    },
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-I-HVAC-PS',
        title: 'Остаточный HVAC / PS +14',
        causeImpact: 'Авторитетные отклонения HVAC и старта производства остаются +14',
        links: [
          { type: 'equipment', id: 'EQ-HVAC-01' },
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-I-UTL',
        title: 'Восстановление инженерных систем под давлением',
        causeImpact: 'Охлаждённая вода / газы; проблемы UTL открыты',
        links: [
          { type: 'issue', id: 'ISS-UTL-03' },
          { type: 'risk', id: 'RISK-UTL-03' },
          { type: 'milestone', id: 'MS-UTL-RDY' },
        ],
        priority: 2,
      },
      {
        id: 'TEX-I-AUT',
        title: 'Давление интерфейсов AUT',
        causeImpact: 'BMS/EMS prep; ISS-AUT-02 Open',
        links: [
          { type: 'issue', id: 'ISS-AUT-02' },
          { type: 'risk', id: 'RISK-AUT-02' },
        ],
        priority: 3,
      },
    ],
    trend: {
      better: ['WFI / CLN: восстановление'],
      worse: ['AUT интерфейсы; охлаждённая вода'],
      unchangedCritical: ['HVAC / PS +14'],
    },
  },

  J: {
    asOf: '2027-07-05',
    psForecast: '2027-09-29',
    eqDelta: {
      'EQ-HVAC-01': 14,
      'EQ-HVAC-02': 5,
      'EQ-PRD-01': 10,
      'EQ-PRD-04': 14,
      'EQ-PRD-07': 10,
      'EQ-UTL-06': 5,
      'EQ-AUT-03': 7,
      'EQ-PKG-03': 5,
      'EQ-QC-01': 3,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-BLD-02': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Closed',
      'ISS-CLN-01': 'Closed',
      'ISS-UTL-01': 'Closed',
      'ISS-UTL-02': 'Closed',
      'ISS-UTL-03': 'Mitigating',
      'ISS-UTL-04': 'Mitigating',
      'ISS-PRD-01': 'Mitigating',
      'ISS-PRD-02': 'Open',
      'ISS-PRD-03': 'Open',
      'ISS-PRD-04': 'Open',
      'ISS-PKG-02': 'Open',
      'ISS-QC-01': 'Mitigating',
      'ISS-AUT-01': 'Mitigating',
      'ISS-AUT-02': 'Mitigating',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-UTL-03': 'Green',
      'RISK-UTL-04': 'Green',
      'RISK-PRD-02': 'Red',
      'RISK-PRD-03': 'Red',
      'RISK-PRD-04': 'Red',
      'RISK-AUT-02': 'Green',
      'RISK-COM-01': 'Red',
      'RISK-PKG-02': 'Green',
    },
    msDelta: {
      'MS-PS': 14,
      'MS-PRD-INST': 14,
      'MS-PRD-CIP': 10,
      'MS-PRD-FAT': 10,
      'MS-PRD-COM': 7,
      'MS-AUT-INT': 5,
      'MS-COM-IQ': 7,
      'MS-PKG-SAT': 0,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-PRD-INST': 'Red',
      'MS-PRD-CIP': 'Red',
      'MS-COM-IQ': 'Red',
    },
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-J-PRD',
        title: 'Волна монтажа PRD',
        causeImpact: 'Фильтрация / CIP / FAT под давлением',
        links: [
          { type: 'equipment', id: 'EQ-PRD-04' },
          { type: 'issue', id: 'ISS-PRD-02' },
          { type: 'risk', id: 'RISK-PRD-02' },
          { type: 'milestone', id: 'MS-PRD-INST' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-J-HVAC-PS',
        title: 'HVAC / PS всё ещё +14',
        causeImpact: 'Монтажный прогресс не меняет авторитетный прогноз старта',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 2,
      },
    ],
    trend: {
      better: ['UTL: смягчение'],
      worse: ['PRD монтаж'],
      unchangedCritical: ['HVAC / PS +14'],
    },
  },

  K: {
    asOf: '2027-07-20',
    psForecast: '2027-09-29',
    eqDelta: {
      'EQ-HVAC-01': 14,
      'EQ-HVAC-02': 3,
      'EQ-HVAC-05': 7,
      'EQ-PRD-01': 5,
      'EQ-PRD-04': 7,
      'EQ-PRD-07': 5,
      'EQ-PKG-03': 0,
      'EQ-PKG-07': 5,
      'EQ-AUT-03': 5,
      'EQ-QC-01': 0,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-BLD-02': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-PKG-02': 'Closed',
      'ISS-PKG-03': 'Open',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Closed',
      'ISS-HVAC-03': 'Open',
      'ISS-CLN-01': 'Closed',
      'ISS-UTL-01': 'Closed',
      'ISS-UTL-02': 'Closed',
      'ISS-UTL-03': 'Closed',
      'ISS-UTL-04': 'Closed',
      'ISS-PRD-01': 'Closed',
      'ISS-PRD-02': 'Mitigating',
      'ISS-PRD-03': 'Mitigating',
      'ISS-PRD-04': 'Mitigating',
      'ISS-QC-01': 'Closed',
      'ISS-AUT-01': 'Mitigating',
      'ISS-AUT-02': 'Mitigating',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-PRD-02': 'Green',
      'RISK-PRD-03': 'Green',
      'RISK-PRD-04': 'Green',
      'RISK-PKG-02': 'Green',
      'RISK-PKG-03': 'Red',
      'RISK-HVAC-03': 'Red',
      'RISK-COM-01': 'Red',
      'RISK-AUT-02': 'Green',
    },
    msDelta: {
      'MS-PS': 14,
      'MS-PRD-INST': 7,
      'MS-PRD-CIP': 5,
      'MS-PKG-SER': 5,
      'MS-HVAC-BAL': 7,
      'MS-COM-IQ': 5,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-PKG-SER': 'Red',
      'MS-HVAC-BAL': 'Red',
      'MS-COM-IQ': 'Red',
    },
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-K-PS',
        title: 'Операционный прогресс; PS всё ещё +14',
        causeImpact:
          'Основное отклонение упаковки закрыто; HVAC/старт производства по-прежнему +14',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-K-PKG',
        title: 'Сериализация: остаточный дефект',
        causeImpact: 'ISS-PKG-03 / RISK-PKG-03',
        links: [
          { type: 'issue', id: 'ISS-PKG-03' },
          { type: 'risk', id: 'RISK-PKG-03' },
          { type: 'milestone', id: 'MS-PKG-SER' },
        ],
        priority: 2,
      },
    ],
    trend: {
      better: ['Основное отклонение упаковки закрыто', 'PRD смягчение'],
      worse: ['HEPA / сериализация'],
      unchangedCritical: ['HVAC / PS +14'],
    },
  },

  L: {
    asOf: '2027-08-01',
    psForecast: '2027-09-29',
    eqDelta: {
      'EQ-HVAC-01': 14,
      'EQ-HVAC-05': 5,
      'EQ-AUT-01': 7,
      'EQ-AUT-02': 10,
      'EQ-AUT-03': 10,
      'EQ-AUT-04': 14,
      'EQ-PRD-04': 3,
      'EQ-PKG-07': 0,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-BLD-02': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-PKG-02': 'Closed',
      'ISS-PKG-03': 'Closed',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Closed',
      'ISS-HVAC-03': 'Mitigating',
      'ISS-CLN-01': 'Closed',
      'ISS-UTL-01': 'Closed',
      'ISS-UTL-02': 'Closed',
      'ISS-UTL-03': 'Closed',
      'ISS-UTL-04': 'Closed',
      'ISS-PRD-01': 'Closed',
      'ISS-PRD-02': 'Closed',
      'ISS-PRD-03': 'Closed',
      'ISS-PRD-04': 'Closed',
      'ISS-QC-01': 'Closed',
      'ISS-AUT-01': 'Mitigating',
      'ISS-AUT-02': 'Mitigating',
      'ISS-AUT-03': 'Open',
      'ISS-AUT-04': 'Open',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-PKG-03': 'Green',
      'RISK-HVAC-03': 'Green',
      'RISK-AUT-03': 'Red',
      'RISK-AUT-04': 'Red',
      'RISK-COM-01': 'Red',
      'RISK-AUT-01': 'Red',
    },
    msDelta: {
      'MS-PS': 14,
      'MS-AUT-BMS': 7,
      'MS-AUT-EMS': 10,
      'MS-AUT-INT': 10,
      'MS-COM-IQ': 7,
      'MS-HVAC-BAL': 5,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-AUT-BMS': 'Red',
      'MS-AUT-EMS': 'Red',
      'MS-AUT-INT': 'Red',
      'MS-COM-IQ': 'Red',
    },
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-L-AUT',
        title: 'BMS/EMS интеграция',
        causeImpact:
          'Автоматизация в отклонении; проблемы EMS и BMS открыты',
        links: [
          { type: 'issue', id: 'ISS-AUT-03' },
          { type: 'risk', id: 'RISK-AUT-03' },
          { type: 'milestone', id: 'MS-AUT-EMS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-L-PS',
        title: 'PS всё ещё +14',
        causeImpact: 'Фокус сместился на AUT; драйвер HVAC без изменения',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 2,
      },
    ],
    trend: {
      better: ['Сериализация упаковки закрыта'],
      worse: ['AUT BMS/EMS'],
      unchangedCritical: ['HVAC / PS +14'],
    },
  },

  M: {
    asOf: '2027-08-12',
    psForecast: '2027-09-29',
    eqDelta: {
      'EQ-HVAC-01': 14,
      'EQ-AUT-01': 5,
      'EQ-AUT-02': 7,
      'EQ-AUT-03': 7,
      'EQ-AUT-04': 7,
      'EQ-QC-04': 10,
      'EQ-PRD-04': 0,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-BLD-02': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-PKG-02': 'Closed',
      'ISS-PKG-03': 'Closed',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Closed',
      'ISS-HVAC-03': 'Closed',
      'ISS-CLN-01': 'Closed',
      'ISS-UTL-01': 'Closed',
      'ISS-UTL-02': 'Closed',
      'ISS-UTL-03': 'Closed',
      'ISS-UTL-04': 'Closed',
      'ISS-PRD-01': 'Closed',
      'ISS-PRD-02': 'Closed',
      'ISS-PRD-03': 'Closed',
      'ISS-PRD-04': 'Closed',
      'ISS-QC-01': 'Closed',
      'ISS-QC-02': 'Open',
      'ISS-AUT-01': 'Closed',
      'ISS-AUT-02': 'Closed',
      'ISS-AUT-03': 'Mitigating',
      'ISS-AUT-04': 'Mitigating',
      'ISS-COM-01': 'Open',
      'ISS-COM-02': 'Open',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-AUT-03': 'Green',
      'RISK-AUT-04': 'Green',
      'RISK-AUT-01': 'Green',
      'RISK-COM-01': 'Red',
      'RISK-COM-02': 'Red',
      'RISK-QC-02': 'Red',
    },
    msDelta: {
      'MS-PS': 14,
      'MS-COM-IQ': 10,
      'MS-COM-OQ': 10,
      'MS-AUT-EMS': 5,
      'MS-AUT-INT': 5,
      'MS-QC-LAB': 10,
      'MS-QC-METH': 7,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-COM-IQ': 'Red',
      'MS-COM-OQ': 'Red',
      'MS-QC-LAB': 'Red',
    },
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-M-COM',
        title: 'Демо-гейты готовности IQ/OQ',
        causeImpact:
          'Давление на пусконаладку; несколько направлений в отклонении или требуют внимания',
        links: [
          { type: 'issue', id: 'ISS-COM-01' },
          { type: 'risk', id: 'RISK-COM-01' },
          { type: 'milestone', id: 'MS-COM-IQ' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-M-PS',
        title: 'PS всё ещё +14',
        causeImpact: 'Фокус смещён с единственного HVAC-нарратива',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 2,
      },
    ],
    trend: {
      better: ['Инфраструктура AUT смягчается'],
      worse: ['Демо-гейты пусконаладки', 'Лаборатория QC'],
      unchangedCritical: ['HVAC / PS +14'],
    },
  },

  N: {
    asOf: '2027-08-22',
    psForecast: '2027-09-29',
    eqDelta: {
      'EQ-HVAC-01': 14,
      'EQ-AUT-01': 5,
      'EQ-AUT-02': 5,
      'EQ-AUT-03': 5,
      'EQ-AUT-04': 5,
      'EQ-QC-04': 7,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-BLD-02': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-PKG-02': 'Closed',
      'ISS-PKG-03': 'Closed',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Closed',
      'ISS-HVAC-03': 'Closed',
      'ISS-CLN-01': 'Closed',
      'ISS-UTL-01': 'Closed',
      'ISS-UTL-02': 'Closed',
      'ISS-UTL-03': 'Closed',
      'ISS-UTL-04': 'Closed',
      'ISS-PRD-01': 'Closed',
      'ISS-PRD-02': 'Closed',
      'ISS-PRD-03': 'Closed',
      'ISS-PRD-04': 'Closed',
      'ISS-QC-01': 'Closed',
      'ISS-QC-02': 'Mitigating',
      'ISS-AUT-01': 'Closed',
      'ISS-AUT-02': 'Closed',
      'ISS-AUT-03': 'Closed',
      'ISS-AUT-04': 'Closed',
      'ISS-COM-01': 'Mitigating',
      'ISS-COM-02': 'Mitigating',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-COM-01': 'Red',
      'RISK-COM-02': 'Red',
      'RISK-QC-02': 'Green',
    },
    msDelta: {
      'MS-PS': 14,
      'MS-COM-IQ': 7,
      'MS-COM-OQ': 7,
      'MS-QC-LAB': 5,
      'MS-QC-METH': 5,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-COM-IQ': 'Red',
      'MS-COM-OQ': 'Red',
    },
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-N-DEC',
        title: 'Решения по пусконаладке зафиксированы',
        causeImpact: 'DEC-COM-*; прогнозы HVAC/старта без автоизменения (BR-006)',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-N-COM',
        title: 'Остаточное давление демо-гейтов',
        causeImpact:
          'По проблемам выполняются меры; критичные риски сохраняются до авторского пост-состояния',
        links: [
          { type: 'issue', id: 'ISS-COM-01' },
          { type: 'milestone', id: 'MS-COM-IQ' },
        ],
        priority: 2,
      },
    ],
    trend: {
      better: ['Зафиксированы решения по пусконаладке'],
      worse: [],
      unchangedCritical: ['HVAC / старт производства +14 без автопересчёта'],
    },
  },

  O: {
    asOf: '2027-09-01',
    psForecast: '2027-09-22',
    eqDelta: {
      'EQ-HVAC-01': 7,
      'EQ-HVAC-02': 0,
      'EQ-HVAC-05': 0,
      'EQ-AUT-01': 3,
      'EQ-AUT-02': 3,
      'EQ-AUT-03': 3,
      'EQ-AUT-04': 3,
      'EQ-QC-04': 3,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-BLD-02': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-PKG-02': 'Closed',
      'ISS-PKG-03': 'Closed',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Closed',
      'ISS-HVAC-03': 'Closed',
      'ISS-HVAC-04': 'Open',
      'ISS-CLN-01': 'Closed',
      'ISS-UTL-01': 'Closed',
      'ISS-UTL-02': 'Closed',
      'ISS-UTL-03': 'Closed',
      'ISS-UTL-04': 'Closed',
      'ISS-PRD-01': 'Closed',
      'ISS-PRD-02': 'Closed',
      'ISS-PRD-03': 'Closed',
      'ISS-PRD-04': 'Closed',
      'ISS-QC-01': 'Closed',
      'ISS-QC-02': 'Closed',
      'ISS-AUT-01': 'Closed',
      'ISS-AUT-02': 'Closed',
      'ISS-AUT-03': 'Closed',
      'ISS-AUT-04': 'Closed',
      'ISS-COM-01': 'Mitigating',
      'ISS-COM-02': 'Mitigating',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-COM-01': 'Green',
      'RISK-COM-02': 'Green',
      'RISK-HVAC-04': 'Red',
    },
    msDelta: {
      'MS-PS': 7,
      'MS-HVAC-BAL': 3,
      'MS-COM-IQ': 3,
      'MS-COM-OQ': 5,
      'MS-COM-PQ': 7,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-COM-OQ': 'Red',
      'MS-COM-PQ': 'Red',
      'MS-HVAC-BAL': 'Red',
    },
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-O-PS',
        title: 'Восстановление прогноза HVAC и старта → +7',
        causeImpact:
          'Атомарное пост-состояние; риск срыва запуска сохраняется (BR-007)',
        links: [
          { type: 'equipment', id: 'EQ-HVAC-01' },
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-O-OQ',
        title: 'Волна OQ / PQ',
        causeImpact: 'Демо-гейты готовности под давлением',
        links: [
          { type: 'milestone', id: 'MS-COM-OQ' },
          { type: 'issue', id: 'ISS-COM-02' },
        ],
        priority: 2,
      },
    ],
    trend: {
      better: ['Прогноз HVAC/старта восстановлен до +7 дней'],
      worse: ['Давление на OQ/PQ'],
      unchangedCritical: ['RISK-001 Red'],
    },
  },

  P: {
    asOf: '2027-09-10',
    psForecast: '2027-09-22',
    eqDelta: {
      'EQ-HVAC-01': 7,
      'EQ-AUT-01': 0,
      'EQ-AUT-02': 0,
      'EQ-QC-01': 0,
      'EQ-QC-04': 0,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-BLD-02': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-PKG-02': 'Closed',
      'ISS-PKG-03': 'Closed',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Closed',
      'ISS-HVAC-03': 'Closed',
      'ISS-HVAC-04': 'Mitigating',
      'ISS-CLN-01': 'Closed',
      'ISS-UTL-01': 'Closed',
      'ISS-UTL-02': 'Closed',
      'ISS-UTL-03': 'Closed',
      'ISS-UTL-04': 'Closed',
      'ISS-PRD-01': 'Closed',
      'ISS-PRD-02': 'Closed',
      'ISS-PRD-03': 'Closed',
      'ISS-PRD-04': 'Closed',
      'ISS-QC-01': 'Closed',
      'ISS-QC-02': 'Closed',
      'ISS-QC-03': 'Open',
      'ISS-AUT-01': 'Closed',
      'ISS-AUT-02': 'Closed',
      'ISS-AUT-03': 'Closed',
      'ISS-AUT-04': 'Closed',
      'ISS-COM-01': 'Closed',
      'ISS-COM-02': 'Closed',
      'ISS-COM-03': 'Open',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Red',
      'RISK-HVAC-04': 'Green',
      'RISK-COM-03': 'Red',
      'RISK-QC-03': 'Red',
    },
    msDelta: {
      'MS-PS': 7,
      'MS-COM-OQ': 0,
      'MS-COM-PQ': 5,
      'MS-COM-RDY': 5,
      'MS-QC-METH': 3,
    },
    msRag: {
      'MS-PS': 'Red',
      'MS-COM-PQ': 'Red',
      'MS-COM-RDY': 'Red',
    },
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-P-PS',
        title: 'PQ / финальная готовность — общий статус в отклонении',
        causeImpact:
          'Риск срыва запуска сохраняется, поэтому веха старта не в норме (BR-007)',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-P-PQ',
        title: 'Демо-гейт PQ',
        causeImpact: 'ISS-COM-03 / RISK-COM-03',
        links: [
          { type: 'issue', id: 'ISS-COM-03' },
          { type: 'risk', id: 'RISK-COM-03' },
          { type: 'milestone', id: 'MS-COM-PQ' },
        ],
        priority: 2,
      },
    ],
    trend: {
      better: ['Ранние проблемы закрыты'],
      worse: ['PQ / остаточное давление на QC'],
      unchangedCritical: ['RISK-001 Red'],
    },
  },

  Q: {
    asOf: '2027-09-15',
    psForecast: '2027-09-22',
    eqDelta: {
      'EQ-HVAC-01': 7,
      'EQ-AUT-01': 0,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-BLD-02': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-PKG-02': 'Closed',
      'ISS-PKG-03': 'Closed',
      'ISS-001': 'Mitigating',
      'ISS-HVAC-02': 'Closed',
      'ISS-HVAC-03': 'Closed',
      'ISS-HVAC-04': 'Closed',
      'ISS-CLN-01': 'Closed',
      'ISS-UTL-01': 'Closed',
      'ISS-UTL-02': 'Closed',
      'ISS-UTL-03': 'Closed',
      'ISS-UTL-04': 'Closed',
      'ISS-PRD-01': 'Closed',
      'ISS-PRD-02': 'Closed',
      'ISS-PRD-03': 'Closed',
      'ISS-PRD-04': 'Closed',
      'ISS-QC-01': 'Closed',
      'ISS-QC-02': 'Closed',
      'ISS-QC-03': 'Mitigating',
      'ISS-AUT-01': 'Closed',
      'ISS-AUT-02': 'Closed',
      'ISS-AUT-03': 'Closed',
      'ISS-AUT-04': 'Closed',
      'ISS-COM-01': 'Closed',
      'ISS-COM-02': 'Closed',
      'ISS-COM-03': 'Closed',
      'ISS-RDY-01': 'Open',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Green',
      'RISK-COM-03': 'Green',
      'RISK-QC-03': 'Green',
      'RISK-RDY-01': 'Red',
    },
    msDelta: {
      'MS-PS': 7,
      'MS-COM-PQ': 0,
      'MS-COM-RDY': 3,
      'MS-COM-GO': 0,
    },
    msRag: {
      'MS-PS': 'Green',
      'MS-COM-RDY': 'Red',
    },
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-Q-BASELINE',
        title: 'Базовая дата старта пройдена без фактического запуска',
        causeImpact:
          'Дата снимка 15.09.2027; прогноз 22.09.2027; критичный путь без отклонения по риску запуска',
        links: [
          { type: 'milestone', id: 'MS-PS' },
          { type: 'issue', id: 'ISS-RDY-01' },
        ],
        priority: 1,
      },
      {
        id: 'TEX-Q-RDY',
        title: 'Финальная готовность',
        causeImpact: 'Контрольный перечень; общий статус Yellow',
        links: [
          { type: 'risk', id: 'RISK-RDY-01' },
          { type: 'milestone', id: 'MS-COM-RDY' },
        ],
        priority: 2,
      },
    ],
    trend: {
      better: ['RISK-001 / MS-PS сняты с Red'],
      worse: ['Честность базовой даты без фактического старта'],
      unchangedCritical: [],
    },
  },

  R: {
    asOf: '2027-09-18',
    psForecast: '2027-09-22',
    eqDelta: {
      'EQ-HVAC-01': 7,
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-BLD-02': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-PKG-02': 'Closed',
      'ISS-PKG-03': 'Closed',
      'ISS-001': 'Closed',
      'ISS-HVAC-02': 'Closed',
      'ISS-HVAC-03': 'Closed',
      'ISS-HVAC-04': 'Closed',
      'ISS-CLN-01': 'Closed',
      'ISS-UTL-01': 'Closed',
      'ISS-UTL-02': 'Closed',
      'ISS-UTL-03': 'Closed',
      'ISS-UTL-04': 'Closed',
      'ISS-PRD-01': 'Closed',
      'ISS-PRD-02': 'Closed',
      'ISS-PRD-03': 'Closed',
      'ISS-PRD-04': 'Closed',
      'ISS-QC-01': 'Closed',
      'ISS-QC-02': 'Closed',
      'ISS-QC-03': 'Closed',
      'ISS-AUT-01': 'Closed',
      'ISS-AUT-02': 'Closed',
      'ISS-AUT-03': 'Closed',
      'ISS-AUT-04': 'Closed',
      'ISS-COM-01': 'Closed',
      'ISS-COM-02': 'Closed',
      'ISS-COM-03': 'Closed',
      'ISS-RDY-01': 'Mitigating',
      'ISS-GO-01': 'Open',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Green',
      'RISK-RDY-01': 'Green',
      'RISK-GO-01': 'Red',
    },
    msDelta: {
      'MS-PS': 7,
      'MS-COM-RDY': 0,
      'MS-COM-GO': 2,
    },
    msRag: {
      'MS-PS': 'Green',
      'MS-COM-GO': 'Red',
    },
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [
      {
        id: 'TEX-R-GO',
        title: 'Go / No-Go',
        causeImpact:
          'DEC-GO-01 записан; критичный путь без отклонения по риску запуска; до фактического старта статус требует внимания',
        links: [
          { type: 'issue', id: 'ISS-GO-01' },
          { type: 'risk', id: 'RISK-GO-01' },
          { type: 'milestone', id: 'MS-COM-GO' },
        ],
        priority: 1,
      },
    ],
    trend: {
      better: ['ISS-001 Closed'],
      worse: [],
      unchangedCritical: ['Ожидание фактического старта производства'],
    },
  },

  S: {
    asOf: '2027-09-22',
    psForecast: '2027-09-22',
    eqDelta: {
      'EQ-HVAC-01': 7,
    },
    // Explicit operational recovery: historical +7 variance kept; status not inferred from asOf.
    eqStatus: {
      'EQ-HVAC-01': 'OnTrack',
    },
    issues: {
      'ISS-BLD-01': 'Closed',
      'ISS-BLD-02': 'Closed',
      'ISS-PKG-01': 'Closed',
      'ISS-PKG-02': 'Closed',
      'ISS-PKG-03': 'Closed',
      'ISS-001': 'Closed',
      'ISS-HVAC-02': 'Closed',
      'ISS-HVAC-03': 'Closed',
      'ISS-HVAC-04': 'Closed',
      'ISS-CLN-01': 'Closed',
      'ISS-UTL-01': 'Closed',
      'ISS-UTL-02': 'Closed',
      'ISS-UTL-03': 'Closed',
      'ISS-UTL-04': 'Closed',
      'ISS-PRD-01': 'Closed',
      'ISS-PRD-02': 'Closed',
      'ISS-PRD-03': 'Closed',
      'ISS-PRD-04': 'Closed',
      'ISS-QC-01': 'Closed',
      'ISS-QC-02': 'Closed',
      'ISS-QC-03': 'Closed',
      'ISS-AUT-01': 'Closed',
      'ISS-AUT-02': 'Closed',
      'ISS-AUT-03': 'Closed',
      'ISS-AUT-04': 'Closed',
      'ISS-COM-01': 'Closed',
      'ISS-COM-02': 'Closed',
      'ISS-COM-03': 'Closed',
      'ISS-RDY-01': 'Closed',
      'ISS-GO-01': 'Closed',
    },
    riskRag: {
      ...BASE_RISKS_GREEN,
      'RISK-001': 'Green',
      'RISK-RDY-01': 'Green',
      'RISK-GO-01': 'Green',
    },
    msDelta: {
      'MS-PS': 7,
      'MS-COM-GO': 0,
      'MS-COM-RDY': 0,
    },
    msRag: {
      'MS-PS': 'Green',
    },
    executiveMilestoneIds: [...EXECUTIVE_MILESTONE_SET_STABLE],
    topExceptions: [],
    trend: {
      better: ['Старт производства достигнут'],
      worse: [],
      unchangedCritical: [],
    },
  },

};

export const SNAPSHOT_STATES = holdPanelPowerSlip(SNAPSHOT_STATES_BASE);
