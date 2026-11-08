/**
 * Authored control-point progress for schedule leaves.
 * certainty: assumption — binary progress from explicit authored dates in
 * schedule-control-facts.ts, compared to scenarioAsOfDate.
 * NOT forecastDate≤asOf and NOT sorted-id / letter-rank readiness.
 */
import {
  authoredBinaryFromDate,
  EQUIPMENT_DELIVERED_ON,
  MILESTONE_COMPLETED_ON,
  assertControlFactsCatalogueComplete,
} from './schedule-control-facts';
import type { SnapshotId } from '../../snapshot/snapshot-id';

/** Snapshot order for demo bands (works overlays). */
export const SCHEDULE_SNAPSHOT_PHASE: readonly SnapshotId[] = [
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

export function schedulePhaseIndex(snapshotId: SnapshotId): number {
  const idx = SCHEDULE_SNAPSHOT_PHASE.indexOf(snapshotId);
  return idx < 0 ? 0 : idx;
}

/** @deprecated kept for band helpers only — do not use for EQ/MS progress. */
export function authoredBinaryProgress(
  readyPhaseIndex: number,
  snapshotId: SnapshotId,
): 0 | 100 {
  return schedulePhaseIndex(snapshotId) >= readyPhaseIndex ? 100 : 0;
}

assertControlFactsCatalogueComplete();

export function equipmentProgressPct(args: {
  id: string;
  scenarioAsOfDate: string;
}): 0 | 100 {
  const deliveredOn =
    EQUIPMENT_DELIVERED_ON[args.id as keyof typeof EQUIPMENT_DELIVERED_ON];
  if (deliveredOn == null) {
    throw new Error(`EQUIPMENT_DELIVERED_ON missing ${args.id}`);
  }
  return authoredBinaryFromDate(deliveredOn, args.scenarioAsOfDate);
}

export function milestoneProgressPct(args: {
  id: string;
  scenarioAsOfDate: string;
}): 0 | 100 {
  const completedOn =
    MILESTONE_COMPLETED_ON[args.id as keyof typeof MILESTONE_COMPLETED_ON];
  if (completedOn == null) {
    throw new Error(`MILESTONE_COMPLETED_ON missing ${args.id}`);
  }
  return authoredBinaryFromDate(completedOn, args.scenarioAsOfDate);
}
