import { describe, expect, it } from 'vitest';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { applyTimelineUniverseScope } from './timeline-universe-scope';

describe('applyTimelineUniverseScope', () => {
  it('overview keeps only key ids including MS-PS', () => {
    const base = dashboardOverviewFixture('01');
    const scoped = applyTimelineUniverseScope(base, 'overview', 'all');
    expect(scoped.executiveMilestoneIds).toContain('MS-PS');
    expect(scoped.executiveMilestoneIds!.length).toBeLessThanOrEqual(12);
  });

  it('program filter keeps MS-PS on portfolio', () => {
    const base = dashboardOverviewFixture('01');
    const scoped = applyTimelineUniverseScope(base, 'all', 'PRG-CON');
    expect(scoped.executiveMilestoneIds).toContain('MS-PS');
    for (const id of scoped.executiveMilestoneIds ?? []) {
      if (id === 'MS-PS') continue;
      const ms = base.milestones.find((m) => m.id === id);
      expect(ms?.programId ?? 'none').toBe('PRG-CON');
    }
  });
});
