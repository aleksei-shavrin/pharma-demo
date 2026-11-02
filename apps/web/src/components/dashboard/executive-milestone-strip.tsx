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
  resolveTimelineChromeLayout,
  timelineMonthTicks,
} from '@/lib/dashboard/executive-timeline';
import { presentWorkstream } from '@/lib/ui-labels';
import { ModuleSurface } from './module-surface';
import { TimelineMarker } from './timeline-marker';

/**
 * Executive timeline — SVG axis (scalable) + fixed-geometry HTML markers.
 * R2-U1-R3: multi-lane label policy; no horizontal timeline scroll.
 */
export function ExecutiveMilestoneStrip({
  data,
}: {
  data: DashboardOverview;
}) {
  const milestones = resolveExecutiveMilestones(data);
  const band = resolveProductionStartBand(data);
  const chrome = resolveTimelineChromeLayout(data, band);
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

  const snapshotTopPx = chrome.snapshot.lane === 1 ? 0 : 4;

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
        className="relative mt-3 h-[12.5rem] w-full min-w-0 overflow-x-hidden"
        data-timeline-track
        data-timeline-layout="r2-u1-r3"
      >
        <div className="relative h-full w-full min-w-0">
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
            className="pointer-events-none absolute inset-x-0 top-[4.25rem] h-10 w-full overflow-visible"
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
            {!band.coincident ? (
              <rect
                x={bandLeft * 10}
                y="17"
                width={Math.max(bandWidth * 10, 2)}
                height="6"
                fill="var(--status-danger-bg)"
                stroke="var(--status-danger-border)"
                strokeWidth="1"
                opacity="0.9"
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

          {/* Snapshot caption — dedicated chrome lane */}
          <div
            className={`absolute max-w-[6.5rem] text-[10px] leading-tight text-[var(--primary)] ${
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
          >
            <span className="font-semibold">Дата снимка</span>
            <br />
            {formatDateRu(data.scenarioAsOfDate)}
          </div>

          {/* Fixed-geometry interactive markers */}
          <div className="absolute inset-x-0 top-[4.25rem] h-10">
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

            {band.coincident && chrome.coincident ? (
              <TimelineMarker
                kind="ps-coincident"
                ratio={band.baselineRatio}
                labelSide={chrome.coincident.side}
                labelAlign={chrome.coincident.align}
                labelNudgePx={chrome.coincident.nudgePx}
                labelLane={chrome.coincident.lane}
                shortLabel="Старт пр-ва"
                title="Запуск производства"
                subtitle={msPs?.name}
                entityId="MS-PS"
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
            ) : null}

            {!band.coincident && chrome.baseline && chrome.forecast ? (
              <>
                <TimelineMarker
                  kind="ps-baseline"
                  ratio={band.baselineRatio}
                  labelSide={chrome.baseline.side}
                  labelAlign={chrome.baseline.align}
                  labelNudgePx={chrome.baseline.nudgePx}
                  labelLane={chrome.baseline.lane}
                  shortLabel="База"
                  title="Запуск производства"
                  subtitle="Базовый план"
                  entityId="MS-PS"
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
                  labelSide={chrome.forecast.side}
                  labelAlign={chrome.forecast.align}
                  labelNudgePx={chrome.forecast.nudgePx}
                  labelLane={chrome.forecast.lane}
                  shortLabel={
                    data.snapshotId === 'S' && psRag === 'Green'
                      ? 'Старт'
                      : 'Прогноз'
                  }
                  title="Запуск производства"
                  subtitle={msPs?.name}
                  entityId="MS-PS"
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
            ) : null}
          </div>

          {!band.coincident ? (
            <div
              className="pointer-events-none absolute top-[3.55rem] z-20 -translate-x-1/2 text-[10px] font-semibold tabular-nums text-[var(--status-danger-fg)]"
              style={{
                left: `${((band.baselineRatio + band.forecastRatio) / 2) * 100}%`,
              }}
              data-ps-delta-label
            >
              {band.deltaLabel}
            </div>
          ) : (
            <div
              className="pointer-events-none absolute top-[8.1rem] -translate-x-1/2 text-[10px] font-medium text-[var(--status-ok-fg)]"
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
