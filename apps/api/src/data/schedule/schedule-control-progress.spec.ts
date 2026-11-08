import {
  authoredBinaryProgress,
  equipmentProgressPct,
  milestoneProgressPct,
  schedulePhaseIndex,
} from './schedule-control-progress';
import { authoredBinaryFromDate } from './schedule-control-facts';

describe('schedule-control-progress / facts branches', () => {
  it('phase index falls back for unknown snapshot and binary band', () => {
    expect(schedulePhaseIndex('Z' as never)).toBe(0);
    expect(schedulePhaseIndex('C')).toBeGreaterThan(0);
    expect(authoredBinaryProgress(0, 'A')).toBe(100);
    expect(authoredBinaryProgress(99, 'A')).toBe(0);
  });

  it('equipment/milestone progress throw on missing catalogue ids', () => {
    expect(() =>
      equipmentProgressPct({ id: 'EQ-NOPE', scenarioAsOfDate: '2027-01-01' }),
    ).toThrow(/EQUIPMENT_DELIVERED_ON missing/);
    expect(() =>
      milestoneProgressPct({ id: 'MS-NOPE', scenarioAsOfDate: '2027-01-01' }),
    ).toThrow(/MILESTONE_COMPLETED_ON missing/);
  });

  it('authoredBinaryFromDate treats empty as 0 and compares ISO', () => {
    expect(authoredBinaryFromDate(undefined, '2027-01-01')).toBe(0);
    expect(authoredBinaryFromDate('2027-01-01', '2027-01-01')).toBe(100);
    expect(authoredBinaryFromDate('2027-02-01', '2027-01-01')).toBe(0);
  });
});
