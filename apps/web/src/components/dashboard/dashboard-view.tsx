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
 * E3-R2 Project Control Briefing — distinct visual patterns per zone.
 * Status / rollups / exceptions / trend come from backend only.
 */
export function DashboardView({ data }: { data: DashboardOverview }) {
  const { status } = useSnapshot();
  const showDecisions =
    !(data.decisionPanelState === 'absent' && data.decisions.length === 0);

  return (
    <div className="flex flex-1 flex-col gap-3 p-5 md:p-6" data-dashboard="e3-r2">
      {status === 'loading' ? (
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          Обновление снимка…
        </p>
      ) : null}

      <ProjectControlSummary data={data} />
      <ExecutiveMilestoneStrip data={data} />

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <TopExceptionsPanel data={data} />
        <WorkstreamStatusMatrix data={data} />
      </div>

      <div
        className={
          showDecisions
            ? 'grid items-start gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]'
            : undefined
        }
      >
        <SnapshotChanges data={data} />
        {showDecisions ? <DecisionAction data={data} /> : null}
      </div>
    </div>
  );
}
