'use client';

import type { DashboardOverview } from '@/lib/api-client';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { DecisionPanel } from './decision-panel';
import { ManagementAttention } from './management-attention';
import { ProjectStatusPanel } from './project-status-panel';
import { TopExceptionsPanel } from './top-exceptions-panel';
import { TrendPanel } from './trend-panel';
import { WorkstreamReadiness } from './workstream-readiness';

/**
 * E3 director Dashboard — DOC-UX-021 hierarchy.
 * Status / rollups / exceptions / trend come from backend only.
 */
export function DashboardView({ data }: { data: DashboardOverview }) {
  const { status } = useSnapshot();

  return (
    <div className="flex flex-1 flex-col gap-3 p-5 md:p-6" data-dashboard="e3">
      {status === 'loading' ? (
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          Обновление снимка…
        </p>
      ) : null}

      {/* Above fold */}
      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)]">
        <ProjectStatusPanel data={data} />
        <TopExceptionsPanel data={data} />
      </div>

      {/* Secondary */}
      <ManagementAttention data={data} />

      {/* Below */}
      <WorkstreamReadiness data={data} />
      <TrendPanel data={data} />
      <DecisionPanel data={data} />
    </div>
  );
}
