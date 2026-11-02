import { describe, expect, it } from 'vitest';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import {
  dateToRatio,
  resolveExecutiveMilestones,
  resolveProductionStartBand,
  timelineMonthTicks,
  TIMELINE_HORIZON_END,
  TIMELINE_HORIZON_START,
} from './executive-timeline';
import { EXECUTIVE_TIMELINE_MILESTONE_IDS } from './executive-timeline-ids';

describe('executive timeline helpers', () => {
  it('uses fixed horizon and linear ratios matching plan sanity table', () => {
    expect(TIMELINE_HORIZON_START).toBe('2027-02-01');
    expect(TIMELINE_HORIZON_END).toBe('2027-10-20');
    expect(dateToRatio('2027-02-01')).toBe(0);
    expect(dateToRatio('2027-10-20')).toBe(1);
    expect(dateToRatio('2027-02-15')).toBeCloseTo(0.0536, 3);
    expect(dateToRatio('2027-02-28')).toBeCloseTo(0.1034, 3);
    expect(dateToRatio('2027-04-30')).toBeCloseTo(0.3372, 3);
    expect(dateToRatio('2027-06-15')).toBeCloseTo(0.5134, 3);
    expect(dateToRatio('2027-07-01')).toBeCloseTo(0.5747, 3);
    expect(dateToRatio('2027-08-10')).toBeCloseTo(0.728, 3);
    expect(dateToRatio('2027-09-15')).toBeCloseTo(0.8659, 3);
    expect(dateToRatio('2027-09-29')).toBeCloseTo(0.9195, 3);
    expect(dateToRatio('2027-10-06')).toBeCloseTo(0.9464, 3);
  });

  it('month ticks cover feb–oct without inventing dates outside horizon', () => {
    const ticks = timelineMonthTicks();
    expect(ticks[0]?.label).toBe('фев');
    expect(ticks.map((t) => t.label)).toEqual([
      'фев',
      'мар',
      'апр',
      'май',
      'июн',
      'июл',
      'авг',
      'сен',
      'окт',
    ]);
  });

  it('subset includes WFI and excludes AUT-BMS; chronological order', () => {
    expect([...EXECUTIVE_TIMELINE_MILESTONE_IDS]).toEqual([
      'MS-BLD-ENCL',
      'MS-CLN-RDY',
      'MS-HVAC-IQ',
      'MS-UTL-WFI',
      'MS-PKG-SAT',
      'MS-PS',
    ]);
    expect(EXECUTIVE_TIMELINE_MILESTONE_IDS).not.toContain('MS-AUT-BMS');

    const points = resolveExecutiveMilestones(dashboardOverviewFixture('C'));
    expect(points.map((p) => p.id)).toEqual([
      ...EXECUTIVE_TIMELINE_MILESTONE_IDS,
    ]);
    expect(points.some((p) => p.id === 'MS-UTL-WFI')).toBe(true);
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].ratio).toBeGreaterThanOrEqual(points[i - 1].ratio);
    }
  });

  it('A/B PS band coincident; C +21; G/H +14', () => {
    const a = resolveProductionStartBand(dashboardOverviewFixture('A'));
    expect(a.coincident).toBe(true);
    expect(a.deltaDays).toBe(0);

    const b = resolveProductionStartBand(dashboardOverviewFixture('B'));
    expect(b.coincident).toBe(true);

    const c = resolveProductionStartBand(dashboardOverviewFixture('C'));
    expect(c.coincident).toBe(false);
    expect(c.deltaDays).toBe(21);
    expect(c.forecastDate).toBe('2027-10-06');
    expect(c.deltaLabel).toMatch(/\+21/);

    const g = resolveProductionStartBand(dashboardOverviewFixture('G'));
    expect(g.deltaDays).toBe(14);
    expect(g.forecastDate).toBe('2027-09-29');
  });

  it('uses backend milestone RAG without recomputation', () => {
    const c = resolveExecutiveMilestones(dashboardOverviewFixture('C'));
    const ps = c.find((p) => p.id === 'MS-PS');
    expect(ps?.rag).toBe('Red');
  });
});
