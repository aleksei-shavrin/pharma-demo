'use client';

import type { DashboardOverview, ProjectCost } from '@/lib/api-client';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { DecisionAction } from './decision-panel';
import { ExecutiveMilestoneStrip } from './executive-milestone-strip';
import { ManagementAttention } from './management-attention';
import { ProjectControlSummary } from './project-control-summary';
import { SnapshotChanges } from './trend-panel';
import { TopExceptionsPanel } from './top-exceptions-panel';
import { WorkstreamStatusMatrix } from './workstream-readiness';

/**
 * R2-U1-R4 executive Dashboard IA:
 * 1 Executive overview (Status+PS+Cost | Workstream readiness)
 * 2 Control milestones timeline (stable curated map A–S)
 * 3 Key Exceptions | Management Attention
 * 4 Trend + Decisions
 */
export function DashboardView({
  data,
  projectCost,
}: {
  data: DashboardOverview;
  projectCost?: ProjectCost | null;
}) {
  const { status } = useSnapshot();
  const showDecisions =
    !(data.decisionPanelState === 'absent' && data.decisions.length === 0);

  return (
    <div
      className="flex flex-1 flex-col gap-4 p-4 md:gap-5 md:p-5"
      data-dashboard="r2-u1"
      data-dashboard-ia="r2-u1-r4"
    >
      {status === 'loading' ? (
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          Обновление снимка…
        </p>
      ) : null}

      <div
        className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:gap-5"
        data-dashboard-block="executive-overview"
      >
        <ProjectControlSummary data={data} projectCost={projectCost} />
        <WorkstreamStatusMatrix data={data} />
      </div>

      <ExecutiveMilestoneStrip data={data} />

      <div
        className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:gap-5"
        data-dashboard-block="exceptions-attention"
      >
        <TopExceptionsPanel data={data} />
        <ManagementAttention data={data} />
      </div>

      <div
        className={
          showDecisions
            ? 'grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] xl:gap-5'
            : undefined
        }
      >
        <SnapshotChanges data={data} />
        {showDecisions ? <DecisionAction data={data} /> : null}
      </div>
    </div>
  );
}
