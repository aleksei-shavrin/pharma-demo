/** FE labels for Decision dueState (API semantic → RU). */

export type DecisionDueState = 'none' | 'upcoming' | 'passed';

/** Presentation tone for StatusPill — today is FE-only when dueDate === asOf. */
export type DecisionDueBadgeKind = DecisionDueState | 'today';

/**
 * Badge label for due calendar (not execution).
 * `dueDate === asOf` → «Сегодня» even though API dueState stays `upcoming`.
 */
export function decisionDueBadgeKind(
  state: DecisionDueState,
  dueDate: string | null | undefined,
  scenarioAsOfDate: string,
): DecisionDueBadgeKind {
  if (!dueDate || state === 'none') return 'none';
  if (dueDate === scenarioAsOfDate) return 'today';
  return state;
}

export function decisionDueBadgeLabel(kind: DecisionDueBadgeKind): string {
  if (kind === 'passed') return 'Срок прошёл';
  if (kind === 'today') return 'Сегодня';
  if (kind === 'upcoming') return 'Срок впереди';
  return 'Срок не задан';
}

/** @deprecated use decisionDueBadgeLabel(decisionDueBadgeKind(...)) */
export function decisionDueStateLabel(state: DecisionDueState): string | null {
  if (state === 'passed') return 'Срок прошёл';
  if (state === 'upcoming') return 'Срок впереди';
  return null;
}

export function decisionDueFilterLabel(
  filter: 'all' | DecisionDueState,
): string {
  if (filter === 'all') return 'Все сроки';
  if (filter === 'passed') return 'Срок прошёл';
  if (filter === 'upcoming') return 'Срок впереди';
  return 'Срок не задан';
}
