import { NotFoundException } from '@nestjs/common';
import { CostsService } from './costs.service';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import {
  DEMO_PROJECT_BAC_RUB,
  DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
} from '../contracts/money';

describe('CostsService (R2-M1)', () => {
  const service = new CostsService(new MockDemoDataSource());

  it('returns project/workstream/equipment cost overview for Snapshot A', () => {
    const overview = service.getOverview('PRJ-01', 'A');
    expect(overview.snapshotId).toBe('A');
    expect(overview.projectId).toBe('PRJ-01');
    expect(overview.project.approvedBudgetRub).toBe(DEMO_PROJECT_BAC_RUB);
    expect(overview.project.eacRub).toBe(DEMO_PROJECT_BAC_RUB);
    expect(overview.project.vacRub).toBe(0);
    expect(overview.project.contingencyTotalRub).toBe(
      DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
    );
    expect(overview.workstreams).toHaveLength(8);
    expect(overview.equipment.length).toBeGreaterThan(0);
    expect(
      overview.equipment.some((e) => e.equipmentId === 'EQ-HVAC-01'),
    ).toBe(true);
    expect(overview.reconciliation.projectLevelForecastRub).toBe(
      DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
    );
    expect(overview.reconciliation.workstreamEacSumRub).toBe(
      5_850_000_000,
    );
    expect(overview.project.eacRub).toBe(
      overview.reconciliation.workstreamEacSumRub +
        overview.reconciliation.projectLevelForecastRub,
    );
  });

  it('is snapshot-aware for late lifecycle S', () => {
    const s = service.getOverview('PRJ-01', 'S');
    expect(s.scenarioAsOfDate).toBe('2027-09-22');
    expect(s.project.actualCostRub).toBe(6_280_000_000);
    expect(s.project.etcRub).toBe(0);
    expect(s.project.vacRub).toBe(-80_000_000);
  });

  it('404s unknown project', () => {
    expect(() => service.getOverview('PRJ-UNKNOWN', 'A')).toThrow(
      NotFoundException,
    );
  });
});
