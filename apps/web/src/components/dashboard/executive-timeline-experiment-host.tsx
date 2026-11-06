'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { DashboardOverview } from '@/lib/api-client';
import {
  TIMELINE_EXPERIMENT_VARIANTS,
  resolveExecutiveTimelineExperimentModel,
  type TimelineExperimentVariant,
} from '@/lib/dashboard/executive-timeline-experiment';
import { ExecutiveMilestoneStrip } from './executive-milestone-strip';
import { ModuleSurface } from './module-surface';

const ExecutiveTimelineVis = dynamic(
  () =>
    import('./executive-timeline-vis').then((m) => ({
      default: m.ExecutiveTimelineVis,
    })),
  { ssr: false },
);

const ExecutiveTimelineEcharts = dynamic(
  () =>
    import('./executive-timeline-echarts').then((m) => ({
      default: m.ExecutiveTimelineEcharts,
    })),
  { ssr: false },
);

function TimelineRendererToggle({
  value,
  onChange,
}: {
  value: TimelineExperimentVariant;
  onChange: (next: TimelineExperimentVariant) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-1"
      role="group"
      aria-label="Вариант рендера шкалы вех"
      data-timeline-renderer-toggle
    >
      {TIMELINE_EXPERIMENT_VARIANTS.map((variant) => {
        const active = variant.id === value;
        return (
          <button
            key={variant.id}
            type="button"
            aria-label={variant.label}
            aria-pressed={active}
            data-timeline-renderer-option={variant.id}
            data-timeline-renderer-digit={variant.digit}
            onClick={() => onChange(variant.id)}
            className={`inline-flex h-7 min-w-7 items-center justify-center rounded-[var(--radius-sm)] border px-2 text-xs font-semibold tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
              active
                ? 'border-[var(--primary)] bg-[var(--selected)] text-[var(--text)]'
                : 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--text)]'
            }`}
          >
            {variant.digit}
          </button>
        );
      })}
    </div>
  );
}

/**
 * C09–C11 host: one data contract, three renderers, default = current strip.
 * Snapshot stays in SnapshotProvider — toggling renderer must not change it.
 */
export function ExecutiveTimelineExperimentHost({
  data,
}: {
  data: DashboardOverview;
}) {
  const [variant, setVariant] =
    useState<TimelineExperimentVariant>('current');
  const programId = useSearchParams().get('program');
  const scoped = useMemo(() => {
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
    scoped.timelineScope === 'program' &&
    (scoped.executiveMilestoneIds?.length ?? 0) === 0;
  const model = useMemo(
    () =>
      emptyProgram ? null : resolveExecutiveTimelineExperimentModel(scoped),
    [scoped, emptyProgram],
  );
  const heading = programId ? 'Вехи программы' : 'Вехи портфеля';
  const toggle = (
    <TimelineRendererToggle value={variant} onChange={setVariant} />
  );

  if (emptyProgram) {
    return (
      <ModuleSurface data-dashboard-block="executive-timeline">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            {heading}
          </h2>
          {toggle}
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]" data-timeline-empty="program">
          У программы нет вех в этом показе
        </p>
      </ModuleSurface>
    );
  }

  if (variant === 'current') {
    return (
      <ExecutiveMilestoneStrip
        data={scoped}
        toolbar={toggle}
        dataTimelineRenderer="current"
        heading={heading}
      />
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
        <div className="flex flex-wrap items-center gap-3">
          {toggle}
          <Link
            href="/schedule"
            className="text-xs text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Календарный план
          </Link>
        </div>
      </div>
      <p className="sr-only">{model?.textSummary}</p>
      <div className="mt-3 min-w-0" data-timeline-experiment-body={variant}>
        {model && variant === 'vis' ? (
          <ExecutiveTimelineVis model={model} />
        ) : null}
        {model && variant === 'echarts' ? (
          <ExecutiveTimelineEcharts model={model} />
        ) : null}
      </div>
    </ModuleSurface>
  );
}
