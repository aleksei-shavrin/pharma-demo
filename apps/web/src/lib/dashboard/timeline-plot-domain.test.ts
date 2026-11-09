import { describe, expect, it } from 'vitest';
import { resolveExecutiveTimelineExperimentModel } from './executive-timeline-experiment';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import {
  dateToPlotRatio,
  escapeHtmlText,
  resolveTimelinePlotDomain,
  scheduleMilestoneFocusHref,
} from './timeline-plot-domain';

describe('timeline-plot-domain', () => {
  it('pads beyond nominal horizon when PS forecast is later (C +21 → Oct)', () => {
    const model = resolveExecutiveTimelineExperimentModel(
      dashboardOverviewFixture('03'),
    );
    const domain = resolveTimelinePlotDomain(model);
    const oct = Date.UTC(2027, 9, 6);
    expect(domain.maxMs).toBeGreaterThan(oct);
    expect(domain.minMs).toBeLessThan(Date.UTC(2026, 8, 1));
    const ratio = dateToPlotRatio('2027-10-06', domain);
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThan(1);
  });

  it('keeps as-of and horizon dates inside padded domain', () => {
    const model = resolveExecutiveTimelineExperimentModel(
      dashboardOverviewFixture('01'),
    );
    const domain = resolveTimelinePlotDomain(model);
    expect(dateToPlotRatio(model.scenarioAsOfDate, domain)).toBeGreaterThan(0);
    expect(dateToPlotRatio(model.scenarioAsOfDate, domain)).toBeLessThan(1);
    expect(dateToPlotRatio(model.horizonStart, domain)).toBeGreaterThan(0);
    expect(dateToPlotRatio(model.horizonEnd, domain)).toBeLessThan(1);
  });

  it('builds focus href via URLSearchParams and escapes HTML', () => {
    expect(scheduleMilestoneFocusHref('MS-HVAC-IQ')).toBe(
      '/schedule?focus=milestone%3AMS-HVAC-IQ',
    );
    expect(escapeHtmlText(`a<b>"c"`)).toBe('a&lt;b&gt;&quot;c&quot;');
  });
});
