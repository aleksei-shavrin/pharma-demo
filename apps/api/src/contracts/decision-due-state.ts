/** Calendar dueState for Decision relative to snapshot as-of (not execution). */

export type DecisionDueState = 'none' | 'upcoming' | 'passed';

/**
 * - null dueDate → none
 * - dueDate === asOf → upcoming (not passed)
 * - dueDate < asOf → passed
 * - dueDate > asOf → upcoming
 */
export function decisionDueState(
  dueDate: string | null | undefined,
  scenarioAsOfDate: string,
): DecisionDueState {
  if (!dueDate) return 'none';
  if (dueDate < scenarioAsOfDate) return 'passed';
  return 'upcoming';
}
