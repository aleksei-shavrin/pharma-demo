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
 * Compact executive milestone strip — linear Demo horizon, not Schedule/Gantt.
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
  const bandWidth =
    Math.abs(band.forecastRatio - band.baselineRatio) * 100;

  return (
    <section
      aria-labelledby="executive-timeline-heading"
      className="rounded-[var(--radius-md)] bg-[var(--surface-raised)] px-4 py-3 shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
      data-dashboard-block="executive-timeline"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="executive-timeline-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
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
        className="relative mt-2 h-[7.5rem] w-full"
        data-timeline-track
        aria-hidden={false}
      >
        {/* Month labels */}
        <div className="absolute inset-x-0 bottom-0 h-4">
          {monthTicks.map((tick) => (
            <span
              key={tick.date}
              className="absolute -translate-x-1/2 text-[10px] tabular-nums text-[var(--text-muted)]"
              style={{ left: `${tick.ratio * 100}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>

        <svg
          className="absolute inset-x-0 top-6 h-16 w-full overflow-visible"
          viewBox="0 0 1000 64"
          preserveAspectRatio="none"
          role="img"
          aria-label="Шкала контрольных вех"
        >
          {/* Axis */}
          <line
            x1="0"
            y1="32"
            x2="1000"
            y2="32"
            stroke="var(--border)"
            strokeWidth="2"
          />
          {monthTicks.map((tick) => (
            <line
              key={tick.date}
              x1={tick.ratio * 1000}
              y1="26"
              x2={tick.ratio * 1000}
              y2="38"
              stroke="var(--border-subtle)"
              strokeWidth="1.5"
            />
          ))}

          {/* Variance span */}
          {!band.coincident ? (
            <rect
              x={bandLeft * 10}
              y="26"
              width={Math.max(bandWidth * 10, 2)}
              height="12"
              fill="var(--status-danger-bg)"
              stroke="var(--status-danger-border)"
              strokeWidth="1"
              opacity="0.85"
              data-ps-variance-span="true"
            />
          ) : null}

          {/* Snapshot date */}
          <line
            x1={asOfRatio * 1000}
            y1="8"
            x2={asOfRatio * 1000}
            y2="56"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeDasharray="4 3"
            data-snapshot-marker="true"
          />

          {/* PS baseline outlined */}
          <circle
            cx={band.baselineRatio * 1000}
            cy="32"
            r="7"
            fill="var(--surface-raised)"
            stroke="var(--text-muted)"
            strokeWidth="2"
            data-ps-baseline-marker="true"
          />

          {/* PS forecast semantic (when not coincident — drawn separately; coincident uses baseline circle only + RAG fill below) */}
          {!band.coincident ? (
            <circle
              cx={band.forecastRatio * 1000}
              cy="32"
              r="7"
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
              strokeWidth="1.5"
              data-ps-forecast-marker="true"
            />
          ) : (
            <circle
              cx={band.baselineRatio * 1000}
              cy="32"
              r="4"
              fill={
                psRag === 'Red'
                  ? 'var(--status-danger-border)'
                  : 'var(--status-ok-border)'
              }
              data-ps-forecast-marker="coincident"
            />
          )}

          {/* Other milestones (exclude MS-PS diamond; PS handled above) */}
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
                  points={`${x},22 ${x + 7},32 ${x},42 ${x - 7},32`}
                  fill={fill}
                  stroke="var(--surface-raised)"
                  strokeWidth="1"
                  data-milestone-marker={m.id}
                  data-milestone-rag={m.rag}
                />
              );
            })}
        </svg>

        {/* Snapshot caption */}
        <div
          className="absolute top-0 max-w-[7rem] -translate-x-1/2 text-center text-[10px] leading-tight text-[var(--primary)]"
          style={{ left: `${asOfRatio * 100}%` }}
          data-snapshot-label
        >
          <span className="font-medium">Дата снимка</span>
          <br />
          {formatDateRu(data.scenarioAsOfDate)}
        </div>

        {/* Milestone labels */}
        {milestones.map((m) => {
          const isPs = m.id === 'MS-PS';
          const top = m.labelSide === 'above' ? '1.65rem' : '4.85rem';
          return (
            <div
              key={m.id}
              className="absolute max-w-[4.5rem] -translate-x-1/2 text-center text-[10px] leading-tight text-[var(--text-secondary)]"
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

        {/* Variance delta on span */}
        {!band.coincident ? (
          <div
            className="absolute top-[3.35rem] -translate-x-1/2 rounded bg-[var(--status-danger-bg)] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--status-danger-fg)]"
            style={{
              left: `${((band.baselineRatio + band.forecastRatio) / 2) * 100}%`,
            }}
            data-ps-delta-label
          >
            {band.deltaLabel}
          </div>
        ) : (
          <div
            className="absolute top-[3.35rem] -translate-x-1/2 text-[10px] text-[var(--status-ok-fg)]"
            style={{ left: `${band.baselineRatio * 100}%` }}
            data-ps-delta-label
          >
            {band.deltaLabel}
          </div>
        )}

        {/* Baseline caption when band open */}
        {!band.coincident ? (
          <div
            className="absolute top-[4.85rem] max-w-[4.5rem] -translate-x-1/2 text-center text-[10px] text-[var(--text-muted)]"
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
