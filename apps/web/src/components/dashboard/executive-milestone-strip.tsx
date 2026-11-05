'use client';

import Link from 'next/link';
import type { DashboardOverview, WorkstreamId } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu } from '@/lib/format/ru';
import {
  buildTimelineTextSummary,
  dateToRatio,
  resolveExecutiveTimelinePresentation,
  timelineMonthTicks,
} from '@/lib/dashboard/executive-timeline';
import { resolveProductionStartCluster } from '@/lib/dashboard/production-start-cluster';
import { presentWorkstream } from '@/lib/ui-labels';
import { ModuleSurface } from './module-surface';
import { ProductionStartCluster } from './production-start-cluster';
import { TimelineMarker } from './timeline-marker';

const LANE_TOP_PX: Record<0 | 1 | 2, number> = {
  0: 28,
  1: 10,
  2: 0,
};

/**
 * Executive timeline — SVG axis + fixed-geometry HTML markers.
 * R2-U1-R8: Production Start is one consolidated annotation cluster.
 */
export function ExecutiveMilestoneStrip({
  data,
}: {
  data: DashboardOverview;
}) {
  const { points: milestones, band, chrome } =
    resolveExecutiveTimelinePresentation(data);
  const asOfRatio = dateToRatio(data.scenarioAsOfDate);
  const monthTicks = timelineMonthTicks();
  const summary = buildTimelineTextSummary(data);
  const msPs = milestones.find((m) => m.id === 'MS-PS');
  const psRag = msPs?.rag ?? 'Green';
  const achieved =
    data.snapshotId === 'S' &&
    data.projectStatus === 'Green' &&
    band.forecastDate === '2027-09-22';
  const psCluster = resolveProductionStartCluster(band, {
    snapshotId: data.snapshotId,
    achieved,
  });

  const statusWord = (rag: 'Green' | 'Red') =>
    rag === 'Green' ? 'В норме' : 'Критично';
  const statusRow = (rag: 'Green' | 'Red') => `● ${statusWord(rag)}`;

  const workstreamLabel = (id: string) => {
    const ms = data.milestones.find((m) => m.id === id);
    if (!ms?.workstream) return null;
    return presentWorkstream(ms.workstream as WorkstreamId);
  };

  const bandLeft = Math.min(band.baselineRatio, band.forecastRatio) * 100;
  const bandWidth = Math.abs(band.forecastRatio - band.baselineRatio) * 100;

  const entityLinks = (id: string) => [
    {
      href: entityDetailHref('milestone', id),
      label: 'Открыть веху',
    },
    { href: '/schedule', label: 'Подробный график' },
  ];

  const snapshotTopPx = LANE_TOP_PX[chrome.snapshot.lane];

  return (
    <ModuleSurface data-dashboard-block="executive-timeline">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="executive-timeline-heading"
          className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
        >
          Контрольные вехи проекта
        </h2>
        <Link
          href="/schedule"
          className="text-xs text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          Подробный график
        </Link>
      </div>

      <p className="sr-only">{summary}</p>

      <div
        className="relative mt-3 h-[15rem] w-full min-w-0 overflow-x-hidden"
        data-timeline-track
        data-timeline-layout="r2-u1-r9"
      >
        <div className="relative h-full w-full min-w-0">
          <div className="absolute inset-x-0 bottom-0 h-4">
            {monthTicks.map((tick) => (
              <span
                key={tick.date}
                className="absolute -translate-x-1/2 text-[10px] font-medium tabular-nums text-[var(--text-muted)]"
                style={{ left: `${tick.ratio * 100}%` }}
              >
                {tick.label}
              </span>
            ))}
          </div>

          <svg
            className="pointer-events-none absolute inset-x-0 top-[4.75rem] h-10 w-full overflow-visible"
            viewBox="0 0 1000 40"
            preserveAspectRatio="none"
            role="presentation"
            aria-hidden
            data-timeline-axis
          >
            <line
              x1="0"
              y1="20"
              x2="1000"
              y2="20"
              stroke="var(--border)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {monthTicks.map((tick) => (
              <line
                key={tick.date}
                x1={tick.ratio * 1000}
                y1="12"
                x2={tick.ratio * 1000}
                y2="28"
                stroke="var(--border)"
                strokeWidth="1.25"
                opacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {/* Subtle span under the HTML connector — not a RAG progress bar */}
            {!band.coincident ? (
              <rect
                x={bandLeft * 10}
                y="18"
                width={Math.max(bandWidth * 10, 2)}
                height="4"
                fill="var(--border-subtle)"
                stroke="var(--border)"
                strokeWidth="0.75"
                opacity="0.55"
                vectorEffect="non-scaling-stroke"
                data-ps-variance-span="true"
              />
            ) : null}
            <line
              x1={asOfRatio * 1000}
              y1="0"
              x2={asOfRatio * 1000}
              y2="40"
              stroke="var(--primary)"
              strokeWidth="1.75"
              strokeDasharray="4 3"
              vectorEffect="non-scaling-stroke"
              data-snapshot-marker="true"
            />
          </svg>

          {/* Snapshot chrome — reserved upper lane; not competing with PS cluster */}
          <div
            className={`absolute z-20 max-w-[6.25rem] text-[10px] leading-tight text-[var(--primary)] ${
              chrome.snapshot.align === 'end'
                ? 'translate-x-[-100%] text-right'
                : chrome.snapshot.align === 'start'
                  ? 'text-left'
                  : '-translate-x-1/2 text-center'
            }`}
            style={{
              left: `calc(${asOfRatio * 100}% + ${chrome.snapshot.nudgePx}px)`,
              top: snapshotTopPx,
            }}
            data-snapshot-label
            data-label-side={chrome.snapshot.side}
            data-label-lane={chrome.snapshot.lane}
            data-chrome-slot={`${chrome.snapshot.side}:${chrome.snapshot.lane}`}
          >
            <span className="font-semibold">Дата снимка</span>
            <br />
            {formatDateRu(data.scenarioAsOfDate)}
          </div>

          <div className="absolute inset-x-0 top-[4.75rem] h-10">
            {milestones
              .filter((m) => m.id !== 'MS-PS')
              .map((m) => {
                const ws = workstreamLabel(m.id);
                const rows = [
                  {
                    label: 'Дата / прогноз',
                    value: formatDateRu(m.forecastDate),
                  },
                  { label: 'Состояние', value: statusRow(m.rag) },
                  ...(ws ? [{ label: 'Направление', value: ws }] : []),
                ];
                return (
                  <TimelineMarker
                    key={m.id}
                    kind="milestone"
                    ratio={m.ratio}
                    labelSide={m.labelSide}
                    labelAlign={m.labelAlign}
                    labelNudgePx={m.labelNudgePx}
                    labelLane={m.labelLane}
                    shortLabel={m.shortLabel}
                    title={m.shortLabel}
                    subtitle={m.name}
                    entityId={m.id}
                    dateLabel={formatDateRu(m.forecastDate)}
                    statusLabel={statusWord(m.rag)}
                    rag={m.rag}
                    ariaLabel={`${m.name}, ${formatDateRu(m.forecastDate)}, ${statusWord(m.rag)}`}
                    detailRows={rows}
                    links={entityLinks(m.id)}
                    markerDataAttrs={{
                      'data-milestone-marker': m.id,
                      'data-milestone-rag': m.rag,
                      'data-milestone-id': m.id,
                    }}
                  />
                );
              })}

            <ProductionStartCluster
              cluster={psCluster}
              rag={psRag}
              subtitle={msPs?.name}
            />
          </div>
        </div>
      </div>
    </ModuleSurface>
  );
}
