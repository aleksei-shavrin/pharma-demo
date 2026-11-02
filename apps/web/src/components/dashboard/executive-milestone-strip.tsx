'use client';

import Link from 'next/link';
import type { DashboardOverview, WorkstreamId } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu } from '@/lib/format/ru';
import {
  buildTimelineTextSummary,
  dateToRatio,
  resolveExecutiveMilestones,
  resolveProductionStartBand,
  timelineMonthTicks,
} from '@/lib/dashboard/executive-timeline';
import { presentWorkstream } from '@/lib/ui-labels';
import { ModuleSurface } from './module-surface';
import { TimelineMarker } from './timeline-marker';

/**
 * Executive timeline — SVG axis (scalable) + fixed-geometry HTML markers.
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
        className="relative mt-3 h-[9rem] w-full min-w-0 overflow-x-auto"
        data-timeline-track
      >
        <div className="relative h-full min-w-[40rem]">
          {/* Month labels */}
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

          {/* Scalable axis layer only — no markers inside SVG */}
          <svg
            className="pointer-events-none absolute inset-x-0 top-[2.75rem] h-10 w-full overflow-visible"
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
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
            {monthTicks.map((tick) => (
              <line
                key={tick.date}
                x1={tick.ratio * 1000}
                y1="10"
                x2={tick.ratio * 1000}
                y2="30"
                stroke="var(--border)"
                strokeWidth="1.5"
                opacity="0.55"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {!band.coincident ? (
              <rect
                x={bandLeft * 10}
                y="16"
                width={Math.max(bandWidth * 10, 2)}
                height="8"
                fill="var(--status-danger-bg)"
                stroke="var(--status-danger-border)"
                strokeWidth="1"
                opacity="0.95"
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
              strokeWidth="2"
              strokeDasharray="5 3"
              vectorEffect="non-scaling-stroke"
              data-snapshot-marker="true"
            />
          </svg>

          {/* Snapshot caption (HTML) */}
          <div
            className="absolute top-0 max-w-[7rem] -translate-x-1/2 text-center text-[10px] leading-tight text-[var(--primary)]"
            style={{ left: `${asOfRatio * 100}%` }}
            data-snapshot-label
          >
            <span className="font-semibold">Дата снимка</span>
            <br />
            {formatDateRu(data.scenarioAsOfDate)}
          </div>

          {/* Fixed-geometry interactive markers */}
          <div className="absolute inset-x-0 top-[2.75rem] h-10">
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
                    shortLabel={m.shortLabel}
                    title={m.shortLabel}
                    subtitle={m.name}
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

            {band.coincident ? (
              <TimelineMarker
                kind="ps-coincident"
                ratio={band.baselineRatio}
                labelSide="below"
                labelAlign={band.baselineRatio > 0.92 ? 'end' : 'center'}
                shortLabel="Старт пр-ва"
                title="Запуск производства"
                subtitle={msPs?.name}
                dateLabel={formatDateRu(band.baselineDate)}
                statusLabel={statusWord(psRag)}
                rag={psRag}
                ariaLabel={`Запуск производства, ${formatDateRu(band.baselineDate)}, ${statusWord(psRag)}`}
                detailRows={[
                  {
                    label: 'План / прогноз',
                    value: formatDateRu(band.baselineDate),
                  },
                  { label: 'Отклонение', value: 'по плану' },
                  { label: 'Состояние', value: statusRow(psRag) },
                ]}
                links={entityLinks('MS-PS')}
                markerDataAttrs={{
                  'data-ps-baseline-marker': 'true',
                  'data-ps-forecast-marker': 'coincident',
                  'data-milestone-id': 'MS-PS',
                  'data-milestone-marker': 'MS-PS',
                  'data-milestone-rag': psRag,
                }}
              />
            ) : (
              <>
                <TimelineMarker
                  kind="ps-baseline"
                  ratio={band.baselineRatio}
                  labelSide="below"
                  labelAlign="end"
                  shortLabel="База PS"
                  title="Запуск производства"
                  subtitle="Базовый план"
                  dateLabel={formatDateRu(band.baselineDate)}
                  statusLabel="Базовый план"
                  rag="Green"
                  ariaLabel={`Запуск производства, базовый план ${formatDateRu(band.baselineDate)}`}
                  detailRows={[
                    {
                      label: 'Базовый план',
                      value: formatDateRu(band.baselineDate),
                    },
                    {
                      label: 'Прогноз',
                      value: formatDateRu(band.forecastDate),
                    },
                    { label: 'Отклонение', value: band.deltaLabel },
                    { label: 'Состояние', value: statusRow(psRag) },
                  ]}
                  links={entityLinks('MS-PS')}
                  markerDataAttrs={{
                    'data-ps-baseline-marker': 'true',
                    'data-milestone-id': 'MS-PS',
                  }}
                />
                <TimelineMarker
                  kind="ps-forecast"
                  ratio={band.forecastRatio}
                  labelSide="above"
                  labelAlign="end"
                  shortLabel="Прогноз PS"
                  title="Запуск производства"
                  subtitle={msPs?.name}
                  dateLabel={formatDateRu(band.forecastDate)}
                  statusLabel={statusWord(psRag)}
                  rag={psRag}
                  ariaLabel={`Запуск производства, прогноз ${formatDateRu(band.forecastDate)}, ${band.deltaLabel}, ${statusWord(psRag)}`}
                  detailRows={[
                    {
                      label: 'Базовый план',
                      value: formatDateRu(band.baselineDate),
                    },
                    {
                      label: 'Прогноз',
                      value: formatDateRu(band.forecastDate),
                    },
                    { label: 'Отклонение', value: band.deltaLabel },
                    { label: 'Состояние', value: statusRow(psRag) },
                  ]}
                  links={entityLinks('MS-PS')}
                  markerDataAttrs={{
                    'data-ps-forecast-marker': 'true',
                    'data-milestone-id': 'MS-PS',
                    'data-milestone-marker': 'MS-PS',
                    'data-milestone-rag': psRag,
                  }}
                />
              </>
            )}
          </div>

          {!band.coincident ? (
            <div
              className="absolute top-[3.15rem] z-20 -translate-x-1/2 rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-[var(--status-danger-fg)] ring-1 ring-[var(--status-danger-border)] bg-[var(--status-danger-bg)]"
              style={{
                left: `${((band.baselineRatio + band.forecastRatio) / 2) * 100}%`,
              }}
              data-ps-delta-label
            >
              {band.deltaLabel}
            </div>
          ) : (
            <div
              className="absolute top-[3.15rem] -translate-x-1/2 text-[10px] font-medium text-[var(--status-ok-fg)]"
              style={{ left: `${band.baselineRatio * 100}%` }}
              data-ps-delta-label
            >
              {band.deltaLabel}
            </div>
          )}
        </div>
      </div>
    </ModuleSurface>
  );
}
