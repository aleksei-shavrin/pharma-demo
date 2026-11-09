import { Test } from '@nestjs/testing';
import { DashboardService } from '../dashboard/dashboard.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { ScheduleService } from '../schedule/schedule.service';
import { DEMO_DATA_SOURCE } from './demo-data-source';
import { MockDemoDataSource } from './mock-demo-data-source';
import {
  isCatalogMilestoneId,
  portfolioMilestoneUniverseIds,
  PORTFOLIO_MILESTONE_UNIVERSE_SIZE,
} from './portfolio-milestone-universe';
import { POPULATED_SCHEDULE_SNAPSHOTS } from './fixtures/schedule-works';

describe('portfolio milestone universe', () => {
  it('classifies catalog vs KT ids', () => {
    expect(isCatalogMilestoneId('MS-PS')).toBe(true);
    expect(isCatalogMilestoneId('KT-1.1.3')).toBe(false);
  });

  it('189 IDs stable across all 19 populated snapshots', async () => {
    const first = portfolioMilestoneUniverseIds();
    const second = portfolioMilestoneUniverseIds();
    expect(first).toBe(second); // cached
    expect(first).toHaveLength(PORTFOLIO_MILESTONE_UNIVERSE_SIZE);
    const mod = await Test.createTestingModule({
      providers: [
        DashboardService,
        PortfolioService,
        ScheduleService,
        { provide: DEMO_DATA_SOURCE, useClass: MockDemoDataSource },
      ],
    }).compile();
    const dash = mod.get(DashboardService);
    let prev: string[] | null = null;
    for (const snap of POPULATED_SCHEDULE_SNAPSHOTS) {
      const o = dash.getOverview('PRT-01', snap);
      expect(o.executiveMilestoneIds).toHaveLength(189);
      expect(o.milestones.length).toBeGreaterThanOrEqual(189);
      const order = [...o.executiveMilestoneIds];
      if (prev) expect(order).toEqual(prev);
      prev = order;
    }
  });
});
