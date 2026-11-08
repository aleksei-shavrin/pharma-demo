import { decisionDueState } from './decision-due-state';

describe('decisionDueState', () => {
  it('none when dueDate missing', () => {
    expect(decisionDueState(null, '2027-09-22')).toBe('none');
    expect(decisionDueState(undefined, '2027-09-22')).toBe('none');
  });

  it('upcoming when dueDate equals asOf (not passed)', () => {
    expect(decisionDueState('2027-09-22', '2027-09-22')).toBe('upcoming');
  });

  it('passed only when dueDate strictly before asOf', () => {
    expect(decisionDueState('2027-05-15', '2027-09-22')).toBe('passed');
    expect(decisionDueState('2027-09-23', '2027-09-22')).toBe('upcoming');
  });
});
