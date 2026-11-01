import { calendarDaysDelta } from './calendar-days-delta';

describe('calendarDaysDelta (BR-004 helper)', () => {
  it('returns 0 when dates equal', () => {
    expect(calendarDaysDelta('2027-09-15', '2027-09-15')).toBe(0);
  });

  it('returns +21 for DOC-PROD-012 slip', () => {
    expect(calendarDaysDelta('2027-05-15', '2027-06-05')).toBe(21);
    expect(calendarDaysDelta('2027-09-15', '2027-10-06')).toBe(21);
  });
});
