'use client';

import type { DashboardOverview } from '@/lib/api-client';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { DecisionAction } from './decision-panel';
import { ExecutiveMilestoneStrip } from './executive-milestone-strip';
import { ProjectControlSummary } from './project-control-summary';
import { SnapshotChanges } from './trend-panel';
import { TopExceptionsPanel } from './top-exceptions-panel';
import { WorkstreamStatusMatrix } from './workstream-readiness';

/**
 * E3-R3 Project Control Briefing — distinct visualization patterns per zone.
 * Composition unchanged from E3-R2; surface hierarchy polished.
 */
export function DashboardView({ data }: { data: DashboardOverview }) {
  const { status } = useSnapshot();
  const showDecisions =
    !(data.decisionPanelState === 'absent' && data.decisions.length === 0);

  return (
    <div
      className="flex flex-1 flex-col gap-5 p-5 md:gap-6 md:p-6"
      data-dashboard="e3-r3"
    >
      {status === 'loading' ? (
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          Обновление снимка…
        </p>
      ) : null}

      <ProjectControlSummary data={data} />
      <ExecutiveMilestoneStrip data={data} />

      {/* Management region — editorial list + matrix; divider, not twin cards */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:gap-8">
        <TopExceptionsPanel data={data} />
        <div className="xl:border-l xl:border-[var(--border-subtle)] xl:pl-8">
          <WorkstreamStatusMatrix data={data} />
        </div>
      </div>

      {/* Change / governance — tiles + callout; spacing not twin cards */}
      <div
        className={
          showDecisions
            ? 'grid items-start gap-5 border-t border-[var(--border-subtle)] pt-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] xl:gap-8'
            : 'border-t border-[var(--border-subtle)] pt-5'
        }
      >
        <SnapshotChanges data={data} />
        {showDecisions ? <DecisionAction data={data} /> : null}
      </div>
    </div>
  );
}
