import { describe, expect, it } from 'vitest';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { resolveExecutiveTimelineExperimentModel } from '@/lib/dashboard/executive-timeline-experiment';
import { buildExecutiveTimelineVisItems } from './executive-timeline-vis';

describe('buildExecutiveTimelineVisItems', () => {
  it('строит 12 items: 11 ordinary points + MS-PS (range или point)', () => {
    const model = resolveExecutiveTimelineExperimentModel(
      dashboardOverviewFixture('A'),
    );
    const visible = new Set(model.ordinaryPoints.map((p) => p.id));
    const items = buildExecutiveTimelineVisItems(model, visible);
    expect(items).toHaveLength(12);
    expect(
      items.filter((p) => model.ordinaryPoints.some((o) => o.id === p.id)),
    ).toHaveLength(11);
    const psItem = items.find(
      (i) => i.id === 'MS-PS' || i.id === 'MS-PS-band',
    );
    expect(psItem).toBeDefined();
    expect(
      psItem?.type === 'range' ||
        (psItem?.type === 'point' && psItem.id === 'MS-PS'),
    ).toBe(true);
    expect(
      items
        .filter((i) => i.kind === 'milestone')
        .every((i) => i.showLabel === true),
    ).toBe(true);
  });

  it('скрывает shortLabel у вех вне приоритета узкой шкалы', () => {
    const model = resolveExecutiveTimelineExperimentModel(
      dashboardOverviewFixture('C'),
    );
    const visible = new Set(
      model.ordinaryPoints.slice(0, 3).map((p) => p.id),
    );
    const items = buildExecutiveTimelineVisItems(model, visible);
    const milestones = items.filter((i) => i.kind === 'milestone');
    expect(milestones.filter((i) => i.showLabel).length).toBe(3);
    expect(milestones.filter((i) => !i.showLabel).length).toBe(
      milestones.length - 3,
    );
  });
});
