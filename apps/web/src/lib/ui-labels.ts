/**
 * Demo v1 director-facing Russian presentation labels.
 * Domain/API/fixture values stay English; mapping is presentation-only.
 * Unknown IDs fall back to the API string (no invented translations).
 */

export type DecisionType = 'PrioritizeRecovery';

/** Known Demo v1 milestone display names by id. */
const MILESTONE_NAME_BY_ID: Readonly<Record<string, string>> = {
  'MS-PS': 'Готовность к производству',
};

/** Known Demo v1 issue titles by id. */
const ISSUE_TITLE_BY_ID: Readonly<Record<string, string>> = {
  'ISS-001':
    'Задержка поставки HVAC с длительным сроком изготовления',
};

/** Known Demo v1 decision notes by id. */
const DECISION_NOTE_BY_ID: Readonly<Record<string, string>> = {
  'DEC-001':
    'Ускорить работу с поставщиком / проработать альтернативный маршрут поставки',
};

export const DECISION_TYPE_LABEL: Record<DecisionType, string> = {
  PrioritizeRecovery: 'Приоритизировать восстановление сроков',
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

export function issueStatusLabel(status: 'Open' | 'Mitigating'): string {
  return status === 'Open' ? 'Открыта' : 'Выполняются меры';
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
