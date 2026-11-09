/**
 * Canonical portfolio milestone universe for dashboard/schedule cards.
 * 189 unique IDs = 145 KT-* + 44 catalog MS (2 source KT aliased into MS).
 * Membership is stable across snapshots 01–19; only dates/status travel in time.
 */
import { MILESTONE_IDS, type MilestoneId } from './fixtures/catalog';
import { buildAnalystScheduleFixture } from './fixtures/analyst/schedule-analyst-import';

export const PORTFOLIO_MILESTONE_UNIVERSE_SIZE = 189;

let cached: readonly string[] | null = null;

export function portfolioMilestoneUniverseIds(): readonly string[] {
  if (cached !== null) {
    return cached;
  }
  const built = buildAnalystScheduleFixture();
  const ktIds = built.fixture.importedCheckpoints.map((c) => c.id);
  const set = new Set<string>([...MILESTONE_IDS, ...ktIds]);
  for (const a of built.fixture.aliasedCheckpoints) {
    set.add(a.id);
  }
  cached = [...set].sort((a, b) => a.localeCompare(b));
  return cached;
}

export function isCatalogMilestoneId(id: string): id is MilestoneId {
  return (MILESTONE_IDS as readonly string[]).includes(id);
}
