import type { DashboardOverview } from '@/lib/api-client';
import { OVERVIEW_MILESTONE_IDS } from './executive-timeline';

export type TimelineUniverseScope = 'all' | 'overview';

/**
 * Presentation-only filter over executiveMilestoneIds / milestones.
 * Always keeps MS-PS on portfolio scope when present in the source set.
 */
export function applyTimelineUniverseScope(
  data: DashboardOverview,
  scope: TimelineUniverseScope,
  programFilter: string,
): DashboardOverview {
  const sourceIds =
    data.executiveMilestoneIds ?? data.milestones.map((m) => m.id);
  const overview = new Set<string>(OVERVIEW_MILESTONE_IDS);

  let ids = sourceIds.filter((id) => {
    if (scope === 'overview' && !overview.has(id)) return false;
    if (programFilter === 'all') return true;
    if (id === 'MS-PS') return true;
    const ms = data.milestones.find((m) => m.id === id);
    const pid = ms?.programId ?? 'none';
    return pid === programFilter;
  });

  if (
    data.timelineScope !== 'program' &&
    sourceIds.includes('MS-PS') &&
    !ids.includes('MS-PS')
  ) {
    ids = [...ids, 'MS-PS'];
  }

  return {
    ...data,
    executiveMilestoneIds: ids,
  };
}

export function programIdsPresent(data: DashboardOverview): string[] {
  const ids = new Set<string>();
  for (const m of data.milestones) {
    ids.add(m.programId ?? 'none');
  }
  return [...ids];
}
