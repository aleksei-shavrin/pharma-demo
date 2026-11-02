'use client';

import Link from 'next/link';
import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu } from '@/lib/format/ru';
import {
  buildTimelineTextSummary,
  dateToRatio,
  resolveExecutiveMilestones,
  resolveProductionStartBand,
  timelineMonthTicks,
} from '@/lib/dashboard/executive-timeline';

/**
 * Graphical executive milestone strip — weak chrome, strong axis/markers.
 * Linear Demo horizon; not Schedule/Gantt.
 */
export function ExecutiveMilestoneStrip({
  data,
}: {
  data: DashboardOverview;
}) {
  const milestones = resolveExecutiveMilestones(data);
  const band = resolveProductionStartBand(data);
  const asOfRatio = dateToRatio(data.scenarioAsOfDate);
  const monthTicks = timelineMonthTicks();
  const summary = buildTimelineTextSummary(data);
  const msPs = milestones.find((m) => m.id === 'MS-PS');
  const psRag = msPs?.rag ?? 'Green';

  const bandLeft = Math.min(band.baselineRatio, band.forecastRatio) * 100;
  const bandWidth = Math.abs(band.forecastRatio - band.baselineRatio) * 100;

  return (
    <section
      aria-labelledby="executive-timeline-heading"
      className="px-1 py-1"
      data-dashboard-block="executive-timeline"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
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
        className="relative mt-1 h-[8.25rem] w-full rounded-[var(--radius-sm)] bg-[var(--surface-sunken)]/45 px-1"
        data-timeline-track
      >
        {/* Month labels */}
        <div className="absolute inset-x-1 bottom-0.5 h-4">
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
          className="absolute inset-x-1 top-7 h-[4.25rem] w-[calc(100%-0.5rem)] overflow-visible"
          viewBox="0 0 1000 68"
          preserveAspectRatio="none"
          role="img"
          aria-label="Шкала контрольных вех"
        >
          <line
            x1="0"
            y1="34"
            x2="1000"
            y2="34"
            stroke="var(--border)"
            strokeWidth="2.5"
          />
          {monthTicks.map((tick) => (
            <line
              key={tick.date}
              x1={tick.ratio * 1000}
              y1="24"
              x2={tick.ratio * 1000}
              y2="44"
              stroke="var(--border)"
              strokeWidth="1.75"
              opacity="0.55"
            />
          ))}

          {!band.coincident ? (
            <rect
              x={bandLeft * 10}
              y="24"
              width={Math.max(bandWidth * 10, 2)}
              height="20"
              fill="var(--status-danger-bg)"
              stroke="var(--status-danger-border)"
              strokeWidth="1.5"
              opacity="0.95"
              data-ps-variance-span="true"
            />
          ) : null}

          <line
            x1={asOfRatio * 1000}
            y1="4"
            x2={asOfRatio * 1000}
            y2="64"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeDasharray="5 3"
            data-snapshot-marker="true"
          />

          <circle
            cx={band.baselineRatio * 1000}
            cy="34"
            r={band.coincident ? 8 : 7}
            fill="var(--surface)"
            stroke="var(--text-secondary)"
            strokeWidth="2.25"
            data-ps-baseline-marker="true"
          />

          {!band.coincident ? (
            <circle
              cx={band.forecastRatio * 1000}
              cy="34"
              r="8"
              fill={
                psRag === 'Red'
                  ? 'var(--status-danger-border)'
                  : 'var(--status-ok-border)'
              }
              stroke={
                psRag === 'Red'
                  ? 'var(--status-danger-fg)'
                  : 'var(--status-ok-fg)'
              }
              strokeWidth="1.75"
              data-ps-forecast-marker="true"
            />
          ) : (
            <circle
              cx={band.baselineRatio * 1000}
              cy="34"
              r="4.5"
              fill={
                psRag === 'Red'
                  ? 'var(--status-danger-border)'
                  : 'var(--status-ok-border)'
              }
              data-ps-forecast-marker="coincident"
            />
          )}

          {milestones
            .filter((m) => m.id !== 'MS-PS')
            .map((m) => {
              const x = m.ratio * 1000;
              const fill =
                m.rag === 'Red'
                  ? 'var(--status-danger-border)'
                  : 'var(--status-ok-border)';
              return (
                <polygon
                  key={m.id}
                  points={`${x},20 ${x + 9},34 ${x},48 ${x - 9},34`}
                  fill={fill}
                  stroke="var(--surface)"
                  strokeWidth="1.25"
                  data-milestone-marker={m.id}
                  data-milestone-rag={m.rag}
                />
              );
            })}
        </svg>

        <div
          className="absolute top-0.5 max-w-[7rem] -translate-x-1/2 text-center text-[10px] leading-tight text-[var(--primary)]"
          style={{ left: `${asOfRatio * 100}%` }}
          data-snapshot-label
        >
          <span className="font-semibold">Дата снимка</span>
          <br />
          {formatDateRu(data.scenarioAsOfDate)}
        </div>

        {milestones.map((m) => {
          const isPs = m.id === 'MS-PS';
          // Coincident PS: keep label below axis to avoid stacking on marker.
          const top =
            isPs && band.coincident
              ? '5.35rem'
              : m.labelSide === 'above'
                ? '1.85rem'
                : '5.35rem';
          return (
            <div
              key={m.id}
              className="absolute max-w-[4.75rem] -translate-x-1/2 text-center text-[10px] leading-tight text-[var(--text-secondary)]"
              style={{ left: `${m.ratio * 100}%`, top }}
              data-milestone-label={m.id}
            >
              <span className="font-medium text-[var(--text)]">
                {isPs && !band.coincident ? 'Прогноз PS' : m.shortLabel}
              </span>
              <span className="block text-[var(--text-muted)]">
                {m.rag === 'Green' ? '● зел.' : '◆ кр.'}
              </span>
            </div>
          );
        })}

        {!band.coincident ? (
          <div
            className="absolute top-[3.55rem] -translate-x-1/2 rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-[var(--status-danger-fg)] ring-1 ring-[var(--status-danger-border)] bg-[var(--status-danger-bg)]"
            style={{
              left: `${((band.baselineRatio + band.forecastRatio) / 2) * 100}%`,
            }}
            data-ps-delta-label
          >
            {band.deltaLabel}
          </div>
        ) : (
          <div
            className="absolute top-[3.55rem] -translate-x-1/2 text-[10px] font-medium text-[var(--status-ok-fg)]"
            style={{ left: `${band.baselineRatio * 100}%` }}
            data-ps-delta-label
          >
            {band.deltaLabel}
          </div>
        )}

        {!band.coincident ? (
          <div
            className="absolute top-[5.35rem] max-w-[4.5rem] -translate-x-1/2 text-center text-[10px] text-[var(--text-muted)]"
            style={{ left: `${band.baselineRatio * 100}%` }}
            data-ps-baseline-label
          >
            База PS
            <br />
            {formatDateRu(band.baselineDate)}
          </div>
        ) : null}
      </div>
    </section>
  );
}
