'use client';

import type { DashboardOverview, ProjectCost } from '@/lib/api-client';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import {
  DASHBOARD_LOWER_GRID_ATTR,
  DASHBOARD_LOWER_GRID_CLASS,
} from '@/lib/dashboard/dashboard-layout';
import { DecisionAction } from './decision-panel';
import { ExecutiveMilestoneStrip } from './executive-milestone-strip';
import { ManagementAttention } from './management-attention';
import { ProjectControlSummary } from './project-control-summary';
import { SnapshotChanges } from './trend-panel';
import { TopExceptionsPanel } from './top-exceptions-panel';
import { WorkstreamStatusMatrix } from './workstream-readiness';

/**
 * Tailwind must see complete class literals in this scanned file.
 * Do not rely on src/lib string constants alone for unique utilities.
 * Keep in sync with DASHBOARD_LOWER_GRID_CLASS.
 */
const LOWER_ROW_GRID =
  'grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-5';

/**
 * R2-U1-R7 executive Dashboard IA:
 * 1 Executive overview (Status+PS+Cost | Workstream readiness)
 * 2 Control milestones timeline (stable curated map A–S)
 * 3 Key Exceptions | Management Decisions  (lg: 50/50)
 * 4 Management Attention | Snapshot Changes (lg: 50/50)
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

  // Compile-time guard: constant and inline literal stay identical.
  if (process.env.NODE_ENV !== 'production') {
    if (LOWER_ROW_GRID !== DASHBOARD_LOWER_GRID_CLASS) {
      throw new Error(
        'DASHBOARD_LOWER_GRID_CLASS drift — keep dashboard-view literal in sync',
      );
    }
  }

  return (
    <div
      className="flex flex-1 flex-col gap-4 p-4 md:gap-5 md:p-5"
      data-dashboard="r2-u1"
      data-dashboard-ia="r2-u1-r7"
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

      {/*
        Direct children only — no wrappers. Class literal below is scanned by
        Tailwind; do not replace with a lib-only string reference.
      */}
      <div
        className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-5"
        data-dashboard-block="exceptions-decisions"
        data-dashboard-grid={DASHBOARD_LOWER_GRID_ATTR}
        data-dashboard-row="1"
        data-dashboard-layout="two-col"
      >
        <TopExceptionsPanel data={data} />
        {showDecisions ? <DecisionAction data={data} /> : null}
      </div>

      <div
        className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-5"
        data-dashboard-block="attention-changes"
        data-dashboard-grid={DASHBOARD_LOWER_GRID_ATTR}
        data-dashboard-row="2"
        data-dashboard-layout="two-col"
      >
        <ManagementAttention data={data} />
        <SnapshotChanges data={data} />
      </div>
    </div>
  );
}
