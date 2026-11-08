import type { DashboardOverview } from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import {
  TIMELINE_HORIZON_END,
  TIMELINE_HORIZON_START,
  buildTimelineTextSummary,
  resolveExecutiveTimelinePresentation,
  timelineMonthTicks,
  type MonthTick,
  type ProductionStartBand,
  type TimelineMilestonePoint,
} from './executive-timeline';

/**
 * Shared presentation model for the portfolio milestones ECharts card.
 * Integrity / ID order stay in resolveExecutiveTimelinePresentation.
 */
export type ExecutiveTimelineExperimentModel = {
  snapshotId: SnapshotId;
  scenarioAsOfDate: string;
  horizonStart: typeof TIMELINE_HORIZON_START;
  horizonEnd: typeof TIMELINE_HORIZON_END;
  /** All executive points including MS-PS (forecast on axis). */
  points: TimelineMilestonePoint[];
  /** Points excluding MS-PS — ordinary markers. */
  ordinaryPoints: TimelineMilestonePoint[];
  band: ProductionStartBand;
  monthTicks: MonthTick[];
  textSummary: string;
};

export function resolveExecutiveTimelineExperimentModel(
  data: DashboardOverview,
): ExecutiveTimelineExperimentModel {
  const presentation = resolveExecutiveTimelinePresentation(data);
  return {
    snapshotId: data.snapshotId,
    scenarioAsOfDate: data.scenarioAsOfDate,
    horizonStart: TIMELINE_HORIZON_START,
    horizonEnd: TIMELINE_HORIZON_END,
    points: presentation.points,
    ordinaryPoints: presentation.points.filter((p) => p.id !== 'MS-PS'),
    band: presentation.band,
    monthTicks: timelineMonthTicks(),
    textSummary: buildTimelineTextSummary(data),
  };
}
