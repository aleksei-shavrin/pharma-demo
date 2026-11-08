import { describe, expect, it } from 'vitest';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { resolveExecutiveTimelineExperimentModel } from './executive-timeline-experiment';
import {
  echartsLabelDistance,
  echartsLabelPosition,
  resolveSnapshotLabelAlign,
  selectLaneAwareMilestoneLabelIds,
  selectVisibleMilestoneLabelIds,
  snapshotDateCaption,
} from './executive-timeline-experiment-labels';

describe('executive-timeline-experiment-labels', () => {
  it('форматирует подпись даты снимка как в варианте 1', () => {
    expect(snapshotDateCaption('01.03.2027')).toBe('Дата снимка: 01.03.2027');
  });

  it('выравнивает подпись снимка у краёв горизонта', () => {
    expect(resolveSnapshotLabelAlign(0.02)).toBe('start');
    expect(resolveSnapshotLabelAlign(0.5)).toBe('center');
    expect(resolveSnapshotLabelAlign(0.92)).toBe('end');
  });

  it('на широкой шкале показывает все shortLabel', () => {
    const model = resolveExecutiveTimelineExperimentModel(
      dashboardOverviewFixture('C'),
    );
    const ids = selectVisibleMilestoneLabelIds(model.ordinaryPoints, {
      narrow: false,
    });
    expect(ids.size).toBe(model.ordinaryPoints.length);
  });

  it('на узкой шкале ограничивает число подписей и сохраняет Red', () => {
    const model = resolveExecutiveTimelineExperimentModel(
      dashboardOverviewFixture('C'),
    );
    const ids = selectVisibleMilestoneLabelIds(model.ordinaryPoints, {
      narrow: true,
      maxLabels: 5,
    });
    expect(ids.size).toBeLessThanOrEqual(5);
    for (const p of model.ordinaryPoints) {
      if (p.rag === 'Red') expect(ids.has(p.id)).toBe(true);
    }
  });

  it('мапит lane/side на ECharts label', () => {
    expect(echartsLabelPosition('above')).toBe('top');
    expect(echartsLabelPosition('below')).toBe('bottom');
    expect(echartsLabelDistance(0)).toBeLessThan(echartsLabelDistance(2));
  });

  it('lane-aware selection caps dense same-program pairs', () => {
    const model = resolveExecutiveTimelineExperimentModel(
      dashboardOverviewFixture('C'),
    );
    const ids = selectLaneAwareMilestoneLabelIds(model.ordinaryPoints, {
      narrow: false,
      maxPerProgram: 2,
      maxTotal: 8,
      programIdFor: () => 'PRG-CON',
    });
    expect(ids.size).toBeLessThanOrEqual(2);
  });
});
