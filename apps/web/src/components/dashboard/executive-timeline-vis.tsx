'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { ExecutiveTimelineExperimentModel } from '@/lib/dashboard/executive-timeline-experiment';
import {
  EXPERIMENT_NARROW_LABEL_WIDTH_PX,
  selectVisibleMilestoneLabelIds,
} from '@/lib/dashboard/executive-timeline-experiment-labels';
import { formatDateRu } from '@/lib/format/ru';
import { DataSet } from 'vis-data';
/**
 * Turbopack does not always resolve package exports subpath `vis-timeline/standalone`;
 * pin the ESM entry that Node resolves for that export.
 */
import { Timeline } from 'vis-timeline/standalone/esm/vis-timeline-graph2d.mjs';
import type { DataItem, TimelineOptions } from 'vis-timeline';
/** v8 package exports `styles/vis-timeline-graph2d.css` (no `styles.css` entry). */
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import { ExecutiveTimelineSnapshotChrome } from './executive-timeline-snapshot-chrome';

const TIMELINE_HEIGHT_PX = 240;
const SNAPSHOT_CUSTOM_TIME_ID = 'snapshot';

type VisMilestoneItem = DataItem & {
  labelSide?: 'above' | 'below';
  labelLane?: 0 | 1 | 2;
  showLabel?: boolean;
  kind?: 'milestone' | 'ps-band' | 'ps-point';
};

export function executiveTimelineRagClassName(
  rag: 'Green' | 'Red',
): string {
  return rag === 'Green'
    ? 'executive-timeline-rag-green'
    : 'executive-timeline-rag-red';
}

/**
 * MS-PS: один `range` baseline→forecast (полоса Δ на оси), не два point —
 * ближе к band в strip и не дублирует forecast MS-PS среди ordinaryPoints.
 * При coincident — один point на общей дате.
 */
export function buildExecutiveTimelineVisItems(
  model: ExecutiveTimelineExperimentModel,
  visibleLabelIds: Set<string>,
): VisMilestoneItem[] {
  const msPs = model.points.find((p) => p.id === 'MS-PS');
  const psRag = msPs?.rag ?? 'Green';
  const psRagClass = executiveTimelineRagClassName(psRag);

  const items: VisMilestoneItem[] = model.ordinaryPoints.map((point) => {
    const showLabel = visibleLabelIds.has(point.id);
    const laneGroup =
      point.labelSide === 'below'
        ? `below-${point.labelLane}`
        : `above-${point.labelLane}`;
    return {
      id: point.id,
      start: point.forecastDate,
      type: 'point',
      content: showLabel ? point.shortLabel : '',
      title: `${point.name} (${point.id}): прогноз ${formatDateRu(point.forecastDate)}`,
      className: executiveTimelineRagClassName(point.rag),
      labelSide: point.labelSide,
      labelLane: point.labelLane,
      showLabel,
      kind: 'milestone',
      group: laneGroup,
    };
  });

  const band = model.band;
  if (band.coincident) {
    items.push({
      id: 'MS-PS',
      start: band.forecastDate,
      type: 'point',
      content: 'ПС',
      title: `Запуск производства: ${formatDateRu(band.forecastDate)}, ${band.deltaLabel}`,
      className: `${psRagClass} executive-timeline-ps-coincident`,
      showLabel: true,
      kind: 'ps-point',
      labelSide: 'above',
      labelLane: 0,
      group: 'above-0',
    });
  } else {
    items.push({
      id: 'MS-PS-band',
      start: band.baselineDate,
      end: band.forecastDate,
      type: 'range',
      content: band.deltaLabel,
      title: `Запуск производства: план ${formatDateRu(band.baselineDate)} → прогноз ${formatDateRu(band.forecastDate)} (${band.deltaLabel})`,
      className: `${psRagClass} executive-timeline-ps-band`,
      showLabel: true,
      kind: 'ps-band',
      group: 'ps',
    });
  }

  return items;
}

function milestoneTemplate(item: VisMilestoneItem): string {
  if (item.kind === 'ps-band') {
    return `<span class="vis-ps-band-label">${item.content ?? ''}</span>`;
  }

  const side = item.labelSide === 'below' ? 'below' : 'above';
  const lane = item.labelLane ?? 0;
  const labelHtml =
    item.showLabel === false
      ? ''
      : `<span class="vis-ms-label vis-ms-label-lane-${lane}">${item.content ?? ''}</span>`;

  return `<div class="vis-ms-wrap vis-ms-${side}" data-vis-milestone="${String(item.id)}"><span class="vis-ms-dot" aria-hidden="true"></span>${labelHtml}</div>`;
}

const VIS_TIMELINE_OVERRIDES = `
.executive-timeline-vis-host {
  min-height: var(--executive-timeline-vis-height, 240px);
}
.executive-timeline-vis-host .vis-timeline {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 11px;
  color: var(--text);
}
.executive-timeline-vis-host .vis-panel.vis-center,
.executive-timeline-vis-host .vis-panel.vis-bottom,
.executive-timeline-vis-host .vis-panel.vis-left,
.executive-timeline-vis-host .vis-panel.vis-right,
.executive-timeline-vis-host .vis-panel.vis-background {
  border-color: transparent;
  background: transparent;
}
.executive-timeline-vis-host .vis-labelset .vis-label,
.executive-timeline-vis-host .vis-foreground .vis-group {
  border-color: transparent;
}
.executive-timeline-vis-host .vis-labelset {
  display: none;
}
.executive-timeline-vis-host .vis-left {
  display: none;
  min-width: 0 !important;
  width: 0 !important;
}
.executive-timeline-vis-host .vis-time-axis .vis-text {
  color: var(--text-muted);
}
.executive-timeline-vis-host .vis-time-axis .vis-grid.vis-minor,
.executive-timeline-vis-host .vis-time-axis .vis-grid.vis-major {
  border-color: color-mix(in srgb, var(--border-subtle) 55%, transparent);
}
.executive-timeline-vis-host .vis-item {
  background: transparent !important;
  border-color: transparent !important;
  color: var(--text);
  box-shadow: none !important;
}
.executive-timeline-vis-host .vis-item .vis-item-content {
  padding: 0;
  background: transparent !important;
}
.executive-timeline-vis-host .vis-ms-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  pointer-events: none;
}
.executive-timeline-vis-host .vis-ms-wrap.vis-ms-above {
  flex-direction: column-reverse;
  transform: translateY(-0.35rem);
}
.executive-timeline-vis-host .vis-ms-wrap.vis-ms-below {
  transform: translateY(0.15rem);
}
.executive-timeline-vis-host .vis-ms-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 9999px;
  border: 1px solid var(--text);
  flex-shrink: 0;
  background: var(--status-ok-border);
}
.executive-timeline-vis-host .vis-item.executive-timeline-rag-red .vis-ms-dot {
  background: var(--status-danger-border);
}
.executive-timeline-vis-host .vis-ms-label {
  margin: 0.15rem 0;
  max-width: 5.5rem;
  color: var(--text);
  font-size: 10px;
  font-weight: 600;
  line-height: 1.15;
  text-align: center;
  white-space: normal;
  text-shadow:
    0 0 2px var(--surface-raised),
    0 0 4px var(--surface-raised);
}
.executive-timeline-vis-host .vis-ms-label-lane-1 {
  margin-block: 0.55rem;
}
.executive-timeline-vis-host .vis-ms-label-lane-2 {
  margin-block: 0.95rem;
}
.executive-timeline-vis-host .vis-item.executive-timeline-ps-band {
  background: color-mix(in srgb, var(--status-info-border) 18%, transparent) !important;
  border: 1px solid var(--status-info-border) !important;
  border-radius: 4px;
  z-index: 1;
}
.executive-timeline-vis-host .vis-item.executive-timeline-ps-band.executive-timeline-rag-red {
  background: color-mix(in srgb, var(--status-danger-border) 22%, transparent) !important;
  border-color: var(--status-danger-border) !important;
}
.executive-timeline-vis-host .vis-ps-band-label {
  display: inline-block;
  padding: 0 0.35rem;
  color: var(--text);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  text-shadow:
    0 0 2px var(--surface-raised),
    0 0 4px var(--surface-raised);
}
.executive-timeline-vis-host .vis-custom-time.${SNAPSHOT_CUSTOM_TIME_ID} {
  background-color: var(--primary);
  width: 2px;
}
`;

type Props = {
  model: ExecutiveTimelineExperimentModel;
};

export function ExecutiveTimelineVis({ model }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<Timeline | null>(null);
  const itemsRef = useRef<DataSet<VisMilestoneItem> | null>(null);
  const modelRef = useRef(model);
  modelRef.current = model;
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const visible = selectVisibleMilestoneLabelIds(model.ordinaryPoints, {
      narrow: container.clientWidth < EXPERIMENT_NARROW_LABEL_WIDTH_PX,
    });
    const items = new DataSet<VisMilestoneItem>(
      buildExecutiveTimelineVisItems(model, visible),
    );
    itemsRef.current = items;

    /**
     * Vertical lanes mirror strip labelSide/labelLane so close milestones
     * do not share one horizontal band (vis default).
     */
    const groups = new DataSet([
      { id: 'above-2', content: '', order: 1 },
      { id: 'above-1', content: '', order: 2 },
      { id: 'above-0', content: '', order: 3 },
      { id: 'ps', content: '', order: 4 },
      { id: 'below-0', content: '', order: 5 },
      { id: 'below-1', content: '', order: 6 },
      { id: 'below-2', content: '', order: 7 },
    ]);

    const options: TimelineOptions = {
      height: `${TIMELINE_HEIGHT_PX}px`,
      editable: false,
      zoomable: false,
      moveable: false,
      showCurrentTime: false,
      horizontalScroll: false,
      verticalScroll: false,
      stack: false,
      selectable: true,
      multiselect: false,
      locale: 'ru',
      tooltip: { followMouse: true },
      groupHeightMode: 'fixed',
      template: (item) => milestoneTemplate(item as VisMilestoneItem),
    };

    const timeline = new Timeline(container, items, groups, options);

    timeline.setWindow(model.horizonStart, model.horizonEnd, {
      animation: false,
    });
    timeline.addCustomTime(model.scenarioAsOfDate, SNAPSHOT_CUSTOM_TIME_ID);
    timeline.setCustomTimeTitle(
      `Дата снимка: ${formatDateRu(model.scenarioAsOfDate)}`,
      SNAPSHOT_CUSTOM_TIME_ID,
    );
    (
      timeline as Timeline & {
        setCustomTimeMarker: (
          title: string,
          id?: string,
          editable?: boolean,
        ) => void;
      }
    ).setCustomTimeMarker('', SNAPSHOT_CUSTOM_TIME_ID, false);

    timelineRef.current = timeline;

    const syncItems = () => {
      const hostWidth = container.clientWidth;
      const isNarrow = hostWidth < EXPERIMENT_NARROW_LABEL_WIDTH_PX;
      setNarrow(isNarrow);
      const nextVisible = selectVisibleMilestoneLabelIds(
        modelRef.current.ordinaryPoints,
        { narrow: isNarrow },
      );
      items.clear();
      items.add(
        buildExecutiveTimelineVisItems(modelRef.current, nextVisible),
      );
      timeline.setWindow(
        modelRef.current.horizonStart,
        modelRef.current.horizonEnd,
        { animation: false },
      );
      timeline.setCustomTime(
        modelRef.current.scenarioAsOfDate,
        SNAPSHOT_CUSTOM_TIME_ID,
      );
      timeline.setCustomTimeTitle(
        `Дата снимка: ${formatDateRu(modelRef.current.scenarioAsOfDate)}`,
        SNAPSHOT_CUSTOM_TIME_ID,
      );
      timeline.redraw();
    };

    const resizeObserver = new ResizeObserver(() => {
      syncItems();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      timeline.destroy();
      timelineRef.current = null;
      itemsRef.current = null;
    };
    // Mount once; model updates go through the second effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only Timeline
  }, []);

  useEffect(() => {
    const timeline = timelineRef.current;
    const items = itemsRef.current;
    const container = containerRef.current;
    if (!timeline || !items || !container) return;

    const isNarrow = container.clientWidth < EXPERIMENT_NARROW_LABEL_WIDTH_PX;
    setNarrow(isNarrow);
    const visible = selectVisibleMilestoneLabelIds(model.ordinaryPoints, {
      narrow: isNarrow,
    });
    items.clear();
    items.add(buildExecutiveTimelineVisItems(model, visible));
    timeline.setWindow(model.horizonStart, model.horizonEnd, {
      animation: false,
    });
    timeline.setCustomTime(model.scenarioAsOfDate, SNAPSHOT_CUSTOM_TIME_ID);
    timeline.setCustomTimeTitle(
      `Дата снимка: ${formatDateRu(model.scenarioAsOfDate)}`,
      SNAPSHOT_CUSTOM_TIME_ID,
    );
    timeline.redraw();
  }, [model]);

  return (
    <>
      <style>{VIS_TIMELINE_OVERRIDES}</style>
      <div
        className="executive-timeline-vis-host w-full min-w-0"
        style={
          {
            '--executive-timeline-vis-height': `${TIMELINE_HEIGHT_PX}px`,
          } as CSSProperties
        }
        data-timeline-renderer="vis"
        data-timeline-labels-narrow={narrow ? 'true' : 'false'}
      >
        <p className="sr-only">{model.textSummary}</p>
        <ExecutiveTimelineSnapshotChrome
          scenarioAsOfDate={model.scenarioAsOfDate}
        />
        <div ref={containerRef} className="w-full" aria-hidden="true" />
      </div>
    </>
  );
}
