import { describe, expect, it } from 'vitest';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import {
  TIMELINE_EXPERIMENT_VARIANTS,
  resolveExecutiveTimelineExperimentModel,
} from './executive-timeline-experiment';
import { TIMELINE_HORIZON_END, TIMELINE_HORIZON_START } from './executive-timeline';

describe('resolveExecutiveTimelineExperimentModel', () => {
  it('даёт один горизонт и as-of для снимка A', () => {
    const model = resolveExecutiveTimelineExperimentModel(
      dashboardOverviewFixture('A'),
    );
    expect(model.horizonStart).toBe(TIMELINE_HORIZON_START);
    expect(model.horizonEnd).toBe(TIMELINE_HORIZON_END);
    expect(model.scenarioAsOfDate).toBe('2027-02-15');
    expect(model.snapshotId).toBe('A');
    expect(model.points.length).toBe(12);
    expect(model.ordinaryPoints.every((p) => p.id !== 'MS-PS')).toBe(true);
    expect(model.points.some((p) => p.id === 'MS-PS')).toBe(true);
  });

  it('варианты переключателя — 1/2/3 с доступными именами', () => {
    expect(TIMELINE_EXPERIMENT_VARIANTS.map((v) => v.digit)).toEqual([
      '1',
      '2',
      '3',
    ]);
    expect(TIMELINE_EXPERIMENT_VARIANTS[0]?.id).toBe('current');
  });
});
