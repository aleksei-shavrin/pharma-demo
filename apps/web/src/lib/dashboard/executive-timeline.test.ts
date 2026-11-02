import { describe, expect, it } from 'vitest';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import {
  dateToRatio,
  ExecutiveMilestoneIntegrityError,
  resolveExecutiveMilestones,
  resolveProductionStartBand,
  resolveTimelineChromeLayout,
  timelineMonthTicks,
  TIMELINE_HORIZON_END,
  TIMELINE_HORIZON_START,
} from './executive-timeline';
import { EXECUTIVE_TIMELINE_MILESTONE_IDS } from './executive-timeline-ids';

describe('executive timeline helpers', () => {
  it('uses R2-U1 horizon through end of September 2027', () => {
    expect(TIMELINE_HORIZON_START).toBe('2027-02-01');
    expect(TIMELINE_HORIZON_END).toBe('2027-09-30');
    expect(dateToRatio('2027-02-01')).toBe(0);
    expect(dateToRatio('2027-09-30')).toBe(1);
    expect(dateToRatio('2027-09-22')).toBeGreaterThan(0.9);
    // C worst PS forecast (06.10) clamps to horizon end
    expect(dateToRatio('2027-10-06')).toBe(1);
  });

  it('month ticks cover feb–sep', () => {
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
    ]);
  });

  it('uses executiveMilestoneIds when present; always includes MS-PS', () => {
    expect([...EXECUTIVE_TIMELINE_MILESTONE_IDS]).toEqual([
      'MS-BLD-EXC',
      'MS-BLD-FND',
      'MS-BLD-STR',
      'MS-BLD-ENCL',
      'MS-CLN-RDY',
      'MS-HVAC-IQ',
      'MS-UTL-WFI',
      'MS-PRD-INST',
      'MS-PKG-SAT',
      'MS-COM-OQ',
      'MS-COM-GO',
      'MS-PS',
    ]);
    expect(EXECUTIVE_TIMELINE_MILESTONE_IDS).toHaveLength(12);

    const points = resolveExecutiveMilestones(dashboardOverviewFixture('C'));
    expect(points.some((p) => p.id === 'MS-PS')).toBe(true);
    expect(points.some((p) => p.id === 'MS-UTL-WFI')).toBe(true);
    expect(new Set(points.map((p) => p.id))).toEqual(
      new Set(EXECUTIVE_TIMELINE_MILESTONE_IDS),
    );
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i]!.ratio).toBeGreaterThanOrEqual(points[i - 1]!.ratio);
    }

    const late = resolveExecutiveMilestones(dashboardOverviewFixture('O'));
    expect(late.some((p) => p.id === 'MS-PS')).toBe(true);
    expect(late.map((p) => p.id)).toContain('MS-COM-GO');
    expect(new Set(late.map((p) => p.id))).toEqual(
      new Set(EXECUTIVE_TIMELINE_MILESTONE_IDS),
    );
  });

  it('R2-U1-R4: executive set membership identical for every A–S', () => {
    const ids = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
    ] as const;
    const expected = new Set(EXECUTIVE_TIMELINE_MILESTONE_IDS);
    for (const snap of ids) {
      const points = resolveExecutiveMilestones(dashboardOverviewFixture(snap));
      expect(points).toHaveLength(12);
      expect(new Set(points.map((p) => p.id))).toEqual(expected);
      expect(points.some((p) => p.id === 'MS-PS')).toBe(true);
      expect(points.some((p) => p.id === 'MS-BLD-EXC')).toBe(true);
    }
  });

  it('R2-U1-R1: authoritative subset integrity (no silent repair)', () => {
    const valid = resolveExecutiveMilestones(dashboardOverviewFixture('C'));
    expect(valid.map((p) => p.id)).toContain('MS-PS');

    const missingRef = dashboardOverviewFixture('C', {
      executiveMilestoneIds: ['MS-PS', 'MS-DOES-NOT-EXIST'],
    });
    expect(() => resolveExecutiveMilestones(missingRef)).toThrow(
      ExecutiveMilestoneIntegrityError,
    );

    const noPs = dashboardOverviewFixture('C', {
      executiveMilestoneIds: ['MS-BLD-ENCL', 'MS-HVAC-IQ'],
    });
    expect(() => resolveExecutiveMilestones(noPs)).toThrow(
      /MS-PS/,
    );

    const empty = dashboardOverviewFixture('C', {
      executiveMilestoneIds: [],
    });
    expect(() => resolveExecutiveMilestones(empty)).toThrow(/empty/);

    const full = dashboardOverviewFixture('C');
    const legacy = { ...full };
    delete (legacy as { executiveMilestoneIds?: string[] })
      .executiveMilestoneIds;
    const fallback = resolveExecutiveMilestones(legacy);
    expect(fallback.map((p) => p.id)).toEqual(
      expect.arrayContaining([...EXECUTIVE_TIMELINE_MILESTONE_IDS]),
    );
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

  it('keeps marker ratios on forecast dates while alternating label sides', () => {
    const points = resolveExecutiveMilestones(dashboardOverviewFixture('C'));
    for (const p of points) {
      expect(p.ratio).toBe(dateToRatio(p.forecastDate));
    }
    expect(points[0]?.labelSide).toBe('below');
    expect(points[1]?.labelSide).toBe('above');
    const hvac = points.find((p) => p.id === 'MS-HVAC-IQ');
    const wfi = points.find((p) => p.id === 'MS-UTL-WFI');
    expect(hvac?.labelSide).not.toBe(wfi?.labelSide);
  });

  it('R2-U1-R3 late O/S layout: true ratios + multi-lane chrome/policy', () => {
    const o = resolveExecutiveMilestones(dashboardOverviewFixture('O'));
    expect(o.some((p) => p.id === 'MS-PS')).toBe(true);
    for (const p of o) {
      expect(p.ratio).toBe(dateToRatio(p.forecastDate));
      expect(p.labelLane === 0 || p.labelLane === 1).toBe(true);
    }
    const lateCluster = o.filter((p) => p.ratio >= 0.7);
    if (lateCluster.length >= 2) {
      const slots = new Set(
        lateCluster.map((p) => `${p.labelSide}:${p.labelLane}`),
      );
      expect(slots.size).toBeGreaterThan(1);
    }

    const sData = dashboardOverviewFixture('S');
    const band = resolveProductionStartBand(sData);
    const chrome = resolveTimelineChromeLayout(sData, band);
    expect(chrome.snapshot.side).toBe('above');
    expect(chrome.snapshot.lane).toBe(1);
    expect(chrome.forecast?.lane).toBe(1);
    expect(chrome.forecast?.side).toBe('below');
    expect(chrome.baseline?.side).toBe('below');
    expect(chrome.baseline?.lane).toBe(0);
  });
});
