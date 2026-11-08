'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { DashboardOverview } from '@/lib/api-client';
import { resolveExecutiveTimelineExperimentModel } from '@/lib/dashboard/executive-timeline-experiment';
import {
  applyTimelineUniverseScope,
  programIdsPresent,
  type TimelineUniverseScope,
} from '@/lib/dashboard/timeline-universe-scope';
import { ExecutiveTimelineUniverseChrome } from './executive-timeline-universe-chrome';
import { ModuleSurface } from './module-surface';

const ExecutiveTimelineEcharts = dynamic(
  () =>
    import('./executive-timeline-echarts').then((m) => ({
      default: m.ExecutiveTimelineEcharts,
    })),
  { ssr: false },
);

/**
 * Portfolio / program milestones card — Apache ECharts only
 * (2026-11-08: experiment toggle 1/2/3 removed; default = ECharts).
 */
export function ExecutiveTimelineExperimentHost({
  data,
}: {
  data: DashboardOverview;
}) {
  const [scope, setScope] = useState<TimelineUniverseScope>('all');
  const [programFilter, setProgramFilter] = useState('all');
  const programId = useSearchParams().get('program');

  const programScoped = useMemo(() => {
    if (!programId) return data;
    const ids = data.milestones
      .filter((milestone) => milestone.programId === programId)
      .map((milestone) => milestone.id);
    return {
      ...data,
      executiveMilestoneIds: ids,
      timelineScope: 'program' as const,
    };
  }, [data, programId]);

  const emptyProgram =
    programScoped.timelineScope === 'program' &&
    (programScoped.executiveMilestoneIds?.length ?? 0) === 0;

  const totalCount =
    programScoped.executiveMilestoneIds?.length ??
    programScoped.milestones.length;

  const filtered = useMemo(
    () =>
      emptyProgram
        ? programScoped
        : applyTimelineUniverseScope(programScoped, scope, programFilter),
    [programScoped, scope, programFilter, emptyProgram],
  );

  const shownCount = filtered.executiveMilestoneIds?.length ?? 0;
  const model = useMemo(
    () =>
      emptyProgram ? null : resolveExecutiveTimelineExperimentModel(filtered),
    [filtered, emptyProgram],
  );
  const milestoneMeta = useMemo(
    () =>
      filtered.milestones.map((m) => ({
        id: m.id,
        programId: m.programId ?? null,
      })),
    [filtered.milestones],
  );
  const heading = programId ? 'Вехи программы' : 'Вехи портфеля';

  const chrome =
    emptyProgram || programId ? null : (
      <ExecutiveTimelineUniverseChrome
        totalCount={totalCount}
        shownCount={shownCount}
        scope={scope}
        programFilter={programFilter}
        programIds={programIdsPresent(programScoped)}
        onScopeChange={setScope}
        onProgramFilterChange={setProgramFilter}
      />
    );

  if (emptyProgram) {
    return (
      <ModuleSurface data-dashboard-block="executive-timeline">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            {heading}
          </h2>
          <Link
            href="/schedule"
            className="text-xs text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Календарный план
          </Link>
        </div>
        <p
          className="mt-3 text-sm text-[var(--text-secondary)]"
          data-timeline-empty="program"
        >
          У программы нет вех в этом показе
        </p>
      </ModuleSurface>
    );
  }

  return (
    <ModuleSurface data-dashboard-block="executive-timeline">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="executive-timeline-heading"
          className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
        >
          {heading}
        </h2>
        <Link
          href="/schedule"
          className="text-xs text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Календарный план
        </Link>
      </div>
      {chrome}
      <p className="sr-only">{model?.textSummary}</p>
      <div className="mt-3 min-w-0" data-timeline-body="echarts">
        {model ? (
          <ExecutiveTimelineEcharts
            model={model}
            milestoneMeta={milestoneMeta}
          />
        ) : null}
      </div>
    </ModuleSurface>
  );
}
