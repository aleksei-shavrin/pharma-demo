import { describe, expect, it } from 'vitest';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import {
  dateToRatio,
  ExecutiveMilestoneIntegrityError,
  resolveExecutiveMilestones,
  resolveExecutiveTimelinePresentation,
  resolveProductionStartBand,
  resolveTimelineChromeLayout,
  timelineMonthTicks,
  TIMELINE_HORIZON_END,
  TIMELINE_HORIZON_START,
} from './executive-timeline';
import { EXECUTIVE_TIMELINE_MILESTONE_IDS } from './executive-timeline-ids';

describe('executive timeline helpers', () => {
  it('uses full pre-project→PS horizon through end of September 2027', () => {
    expect(TIMELINE_HORIZON_START).toBe('2026-09-01');
    expect(TIMELINE_HORIZON_END).toBe('2027-09-30');
    expect(dateToRatio('2026-09-01')).toBe(0);
    expect(dateToRatio('2027-09-30')).toBe(1);
    expect(dateToRatio('2027-02-01')).toBeGreaterThan(0.3);
    expect(dateToRatio('2027-09-22')).toBeGreaterThan(0.9);
    expect(dateToRatio('2027-10-06')).toBe(1);
  });

  it('month ticks cover sep 2026–sep 2027', () => {
    const ticks = timelineMonthTicks();
    expect(ticks[0]?.label).toBe('сен');
    expect(ticks[ticks.length - 1]?.label).toBe('сен');
    expect(ticks.length).toBeGreaterThanOrEqual(13);
  });

  it('uses executiveMilestoneIds when present; always includes MS-PS', () => {
    expect([...EXECUTIVE_TIMELINE_MILESTONE_IDS]).toEqual([
      'MS-BLD-EXC',
      'MS-CLN-PANEL',
      'MS-UTL-PWR',
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
    // Scope order follows API ids (baseline sort); marker X uses forecast ratio.
    expect(points.map((p) => p.id)).toEqual([
      ...EXECUTIVE_TIMELINE_MILESTONE_IDS,
    ]);

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

  it('keeps marker ratios on forecast dates', () => {
    const points = resolveExecutiveMilestones(dashboardOverviewFixture('C'));
    for (const p of points) {
      expect(p.ratio).toBe(dateToRatio(p.forecastDate));
    }
    expect(points.some((p) => p.id === 'MS-HVAC-IQ')).toBe(true);
    expect(points.some((p) => p.id === 'MS-UTL-WFI')).toBe(true);
  });

  it('R2-U1-R8 late O/S: PS chrome reserved; ratios on forecast', () => {
    for (const snap of ['O', 'S'] as const) {
      const presentation = resolveExecutiveTimelinePresentation(
        dashboardOverviewFixture(snap),
      );

      for (const p of presentation.points) {
        expect(p.ratio).toBe(dateToRatio(p.forecastDate));
      }

      const { chrome } = presentation;
      expect(chrome.snapshot.side).toBe('above');
      expect(chrome.snapshot.lane).toBe(2);
      expect(chrome.psCluster.side).toBe('below');
      expect(chrome.psCluster.reservesSlot).toBe(true);
      expect(chrome.baseline).toBeNull();
      expect(chrome.forecast).toBeNull();
      expect(chrome.coincident).toBeNull();
      expect(presentation.points.some((p) => p.id === 'MS-COM-GO')).toBe(true);
    }

    const oData = dashboardOverviewFixture('O');
    const oChrome = resolveTimelineChromeLayout(
      oData,
      resolveProductionStartBand(oData),
    );
    expect(oChrome.psCluster.lane).toBe(0);
  });

  it('R2-U1-R5 RU-first executive short labels for stable 12', () => {
    const points = resolveExecutiveMilestones(dashboardOverviewFixture('S'));
    const byId = Object.fromEntries(points.map((p) => [p.id, p.shortLabel]));
    expect(byId['MS-BLD-EXC']).toBe('Котлован');
    expect(byId['MS-CLN-PANEL']).toBe('Панели чистых');
    expect(byId['MS-UTL-PWR']).toBe('Энергоснабжение');
    expect(byId['MS-BLD-ENCL']).toBe('Контур здания');
    expect(byId['MS-CLN-RDY']).toBe('Чистые помещения');
    expect(byId['MS-HVAC-IQ']).toBe('Готовность HVAC');
    expect(byId['MS-UTL-WFI']).toBe('Вода WFI');
    expect(byId['MS-PRD-INST']).toBe('Тех. монтаж');
    expect(byId['MS-PKG-SAT']).toBe('SAT упаковки');
    expect(byId['MS-COM-OQ']).toBe('Квалификация OQ');
    expect(byId['MS-COM-GO']).toBe('Решение о запуске');
    expect(byId['MS-PS']).toBe('Старт производства');
    for (const label of Object.values(byId)) {
      expect(label).not.toMatch(/Go\/No-Go/);
      expect(label).not.toMatch(/^HVAC IQ$/);
      expect(label).not.toMatch(/^PKG SAT$/);
    }
  });
});
