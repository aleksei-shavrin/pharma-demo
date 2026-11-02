/**
 * Demo v1 director-facing Russian presentation labels.
 * Domain/API/fixture values stay English; mapping is presentation-only.
 * Unknown IDs fall back to the API string (no invented translations).
 */

import type { ProjectStatus, WorkstreamId } from '@/lib/api-client';

export type DecisionType = 'PrioritizeRecovery' | 'AcceptDateSlip';

/** Known Demo v1 milestone display names by id. */
const MILESTONE_NAME_BY_ID: Readonly<Record<string, string>> = {
  'MS-PS': 'Готовность к производству',
};

/** Known Demo v1 issue titles by id. */
const ISSUE_TITLE_BY_ID: Readonly<Record<string, string>> = {
  'ISS-001': 'Прогноз сдвига поставки long-lead AHU',
};

/** Known Demo v1 decision notes by id. */
const DECISION_NOTE_BY_ID: Readonly<Record<string, string>> = {
  'DEC-001':
    'Утвердить ускоренную логистику AHU и резервный монтажный слот',
};

export const DECISION_TYPE_LABEL: Record<DecisionType, string> = {
  PrioritizeRecovery: 'Приоритизировать восстановление сроков',
  AcceptDateSlip: 'Принять сдвиг даты',
};

export const WORKSTREAM_LABEL: Record<WorkstreamId, string> = {
  'WS-BLD': 'Здание и оболочка',
  'WS-CLN': 'Чистые помещения',
  'WS-HVAC': 'HVAC',
  'WS-UTL': 'Инженерные системы',
  'WS-PRD': 'Технологическое оборудование',
  'WS-PKG': 'Упаковка',
  'WS-QC': 'Лаборатория / QC',
  'WS-AUT': 'Автоматизация / BMS·EMS',
};

/** Canonical display order for workstream readiness (E3). */
export const WORKSTREAM_DISPLAY_ORDER: readonly WorkstreamId[] = [
  'WS-BLD',
  'WS-CLN',
  'WS-HVAC',
  'WS-UTL',
  'WS-PRD',
  'WS-PKG',
  'WS-QC',
  'WS-AUT',
];

const OWNER_ROLE_LABEL: Readonly<Record<string, string>> = {
  'SH-DIR-01': 'Директор проекта',
  'SH-PM-01': 'Руководитель проекта',
  'SH-ENG-01': 'Главный инженер',
  'SH-QC-01': 'Руководитель QC',
  'SH-PKG-01': 'Руководитель упаковки',
};

export function presentMilestoneName(id: string, apiName: string): string {
  return MILESTONE_NAME_BY_ID[id] ?? apiName;
}

export function presentIssueTitle(id: string, apiTitle: string): string {
  return ISSUE_TITLE_BY_ID[id] ?? apiTitle;
}

export function presentDecisionType(type: DecisionType): string {
  return DECISION_TYPE_LABEL[type];
}

export function presentDecisionNote(id: string, apiNote: string): string {
  return DECISION_NOTE_BY_ID[id] ?? apiNote;
}

export function registerRowTypeLabel(type: 'Issue' | 'Risk'): string {
  return type === 'Issue' ? 'Проблема' : 'Риск';
}

/** Schedule control-point kind → director-facing type label (D11). */
export function scheduleKindLabel(
  kind: 'equipment_delivery' | 'milestone',
): string {
  return kind === 'equipment_delivery' ? 'Оборудование' : 'Веха';
}

export function entityTypeLabel(
  type: 'equipment' | 'issue' | 'risk' | 'milestone',
): string {
  switch (type) {
    case 'equipment':
      return 'Оборудование';
    case 'issue':
      return 'Проблема';
    case 'risk':
      return 'Риск';
    case 'milestone':
      return 'Веха';
  }
}

export function equipmentStatusLabel(
  status: 'OnTrack' | 'Delayed',
): string {
  return status === 'OnTrack' ? 'По плану' : 'Задержка';
}

export function issueStatusLabel(
  status: 'Open' | 'Mitigating' | 'Closed',
): string {
  if (status === 'Open') return 'Открыта';
  if (status === 'Mitigating') return 'Выполняются меры';
  return 'Закрыта';
}

export function ragLabel(
  entity: 'risk' | 'milestone',
  rag: 'Green' | 'Red',
): string {
  if (entity === 'risk') {
    return rag === 'Green' ? 'Риск: зелёный' : 'Риск: красный';
  }
  return rag === 'Green' ? 'Веха: зелёная' : 'Веха: красная';
}

export function presentWorkstream(id: WorkstreamId): string {
  return WORKSTREAM_LABEL[id];
}

export function presentOwnerRole(role: string): string {
  return OWNER_ROLE_LABEL[role] ?? role;
}

export function projectStatusLabel(status: ProjectStatus): string {
  if (status === 'Green') return 'Зелёный';
  if (status === 'Yellow') return 'Жёлтый';
  return 'Красный';
}

/**
 * Director-facing meaning from backend projectStatus + PS delta only.
 * No frontend RAG derivation.
 */
export function projectStatusMeaning(
  status: ProjectStatus,
  productionStartDeltaDays: number,
): string {
  if (status === 'Green') {
    return 'Проект в базовом плане без управленческих отклонений.';
  }
  if (status === 'Yellow') {
    return productionStartDeltaDays === 0
      ? 'Требуется внимание по направлениям проекта; прогноз старта производства без сдвига.'
      : 'Требуется внимание по направлениям проекта.';
  }
  if (productionStartDeltaDays >= 21) {
    return 'Критический прогноз сдвига старта производства; требуется управленческое внимание.';
  }
  if (productionStartDeltaDays > 0) {
    return 'Остаточный критический риск по старту производства; решение не означает устранение.';
  }
  return 'Критическое состояние проекта; требуется управленческое внимание.';
}
