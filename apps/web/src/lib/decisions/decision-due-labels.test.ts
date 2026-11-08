import { describe, expect, it } from 'vitest';
import {
  decisionDueBadgeKind,
  decisionDueBadgeLabel,
  decisionDueFilterLabel,
} from './decision-due-labels';

describe('decisionDueBadgeKind / labels', () => {
  it('none when missing dueDate', () => {
    expect(decisionDueBadgeKind('none', null, '2027-09-22')).toBe('none');
    expect(decisionDueBadgeLabel('none')).toBe('Срок не задан');
  });

  it('today when dueDate equals asOf (not passed, not vague upcoming)', () => {
    expect(decisionDueBadgeKind('upcoming', '2027-09-22', '2027-09-22')).toBe(
      'today',
    );
    expect(decisionDueBadgeLabel('today')).toBe('Сегодня');
  });

  it('passed is calendar label, not failure wording', () => {
    expect(decisionDueBadgeKind('passed', '2027-05-15', '2027-09-22')).toBe(
      'passed',
    );
    expect(decisionDueBadgeLabel('passed')).toBe('Срок прошёл');
    expect(decisionDueBadgeLabel('passed')).not.toMatch(
      /неисполн|failed|истёк/i,
    );
  });

  it('upcoming when dueDate after asOf', () => {
    expect(decisionDueBadgeKind('upcoming', '2027-10-01', '2027-09-22')).toBe(
      'upcoming',
    );
    expect(decisionDueBadgeLabel('upcoming')).toBe('Срок впереди');
  });

  it('filter labels cover due dimension', () => {
    expect(decisionDueFilterLabel('all')).toBe('Все сроки');
    expect(decisionDueFilterLabel('none')).toBe('Срок не задан');
  });
});
