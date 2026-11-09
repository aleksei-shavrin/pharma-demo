'use client';

import type { DashboardOverview, ProjectCost } from '@/lib/api-client';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import {
  DASHBOARD_LOWER_COLUMN_CLASS,
  DASHBOARD_LOWER_GRID_ATTR,
  DASHBOARD_LOWER_GRID_CLASS,
  DASHBOARD_LOWER_LAYOUT_ATTR,
} from '@/lib/dashboard/dashboard-layout';
import { DecisionAction } from './decision-panel';
import { ExecutiveTimelineExperimentHost } from './executive-timeline-experiment-host';
import { ManagementAttention } from './management-attention';
import { PeopleFocusPanel } from './people-focus-panel';
import { ProjectControlSummary } from './project-control-summary';
import { SnapshotChanges } from './trend-panel';
import { TopExceptionsPanel } from './top-exceptions-panel';
import { WorkstreamStatusMatrix } from './workstream-readiness';

/**
 * Tailwind must see complete class literals in this scanned file.
 * Do not rely on src/lib string constants alone for unique utilities.
 * Keep in sync with DASHBOARD_LOWER_GRID_CLASS / DASHBOARD_LOWER_COLUMN_CLASS.
 */
const LOWER_ROW_GRID =
  'grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-5';

const LOWER_COLUMN = 'flex min-w-0 flex-col gap-4';

/**
 * R2-U1-R7 executive Dashboard IA:
 * 1 Executive overview (Status+PS+Cost | Workstream readiness)
 * 2 Control milestones timeline (stable curated map 01–19)
 * 3 Lower zone — two independent columns (replaces B11 auto-flow):
 *    Left: People → Attention → Changes
 *    Right: Exceptions → Decisions?
 *    Narrow: left stack then right (People before Exceptions).
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

  // Compile-time guard: constants and inline literals stay identical.
  if (process.env.NODE_ENV !== 'production') {
    if (LOWER_ROW_GRID !== DASHBOARD_LOWER_GRID_CLASS) {
      throw new Error(
        'DASHBOARD_LOWER_GRID_CLASS drift — keep dashboard-view literal in sync',
      );
    }
    if (LOWER_COLUMN !== DASHBOARD_LOWER_COLUMN_CLASS) {
      throw new Error(
        'DASHBOARD_LOWER_COLUMN_CLASS drift — keep dashboard-view literal in sync',
      );
    }
  }

  return (
    <div
      className="flex flex-col gap-4 p-4 md:gap-5 md:p-5"
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

      <ExecutiveTimelineExperimentHost data={data} />

      {/*
        Two independent columns. Class literals scanned by Tailwind;
        do not replace with lib-only string references.
      */}
      <div
        className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-5"
        data-dashboard-block="lower-cards"
        data-dashboard-grid={DASHBOARD_LOWER_GRID_ATTR}
        data-dashboard-layout={DASHBOARD_LOWER_LAYOUT_ATTR}
      >
        <div
          className="flex min-w-0 flex-col gap-4"
          data-dashboard-lower-column="left"
        >
          <PeopleFocusPanel data={data} />
          <ManagementAttention data={data} />
          <SnapshotChanges data={data} />
        </div>
        <div
          className="flex min-w-0 flex-col gap-4"
          data-dashboard-lower-column="right"
        >
          <TopExceptionsPanel data={data} />
          {showDecisions ? <DecisionAction data={data} /> : null}
        </div>
      </div>
    </div>
  );
}
