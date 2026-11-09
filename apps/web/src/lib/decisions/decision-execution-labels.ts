import type { DecisionExecutionStatus } from '@/lib/api-client';

/** Short register/dashboard labels for execution axis (not due calendar). */
export function decisionExecutionLabel(
  status: DecisionExecutionStatus | undefined | null,
): string {
  switch (status) {
    case 'not_started':
      return 'Не начато';
    case 'in_progress':
      return 'В работе';
    case 'completed':
      return 'Выполнено';
    case 'unknown':
    default:
      return 'Нет данных';
  }
}

export function decisionExecutionTone(
  status: DecisionExecutionStatus | undefined | null,
): 'open' | 'info' | 'ok' | 'warn' {
  switch (status) {
    case 'not_started':
      return 'warn';
    case 'in_progress':
      return 'info';
    case 'completed':
      return 'ok';
    case 'unknown':
    default:
      return 'open';
  }
}
