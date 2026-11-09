import { describe, expect, it } from 'vitest';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { resolveExecutiveTimelineExperimentModel } from './executive-timeline-experiment';

describe('resolveExecutiveTimelineExperimentModel', () => {
  it('builds shared model with ordinary points excluding MS-PS', () => {
    const model = resolveExecutiveTimelineExperimentModel(
      dashboardOverviewFixture('01'),
    );
    expect(model.points.some((p) => p.id === 'MS-PS')).toBe(true);
    expect(model.ordinaryPoints.some((p) => p.id === 'MS-PS')).toBe(false);
    expect(model.monthTicks.length).toBeGreaterThan(0);
    expect(model.textSummary).toMatch(/Дата снимка/);
  });
});
