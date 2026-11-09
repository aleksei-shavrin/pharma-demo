'use client';

import {
  resolveSnapshotLabelAlign,
  snapshotDateCaption,
  type SnapshotLabelAlign,
} from '@/lib/dashboard/executive-timeline-experiment-labels';
import {
  snapshotCaptionLeft,
  type PlotInsets,
} from '@/lib/dashboard/snapshot-caption-position';
import { TIMELINE_SNAPSHOT_CAPTION_TOP_PX } from '@/lib/dashboard/timeline-caption-gap';
import { formatDateRu } from '@/lib/format/ru';

/**
 * «Дата снимка» overlay aligned to as-of on the padded plot domain.
 * Vertical `top` is measured so the block **bottom** matches the PS forecast
 * label bottom (passed as `captionTopPx`); X uses plotRatio / grid insets.
 */
export function ExecutiveTimelineSnapshotChrome({
  scenarioAsOfDate,
  plotInsetPx = 0,
  plotInsets,
  /** Precomputed ratio on the same domain as ECharts xAxis. */
  plotRatio,
  overlay = false,
  /** Measured overlay top (px) for bottom-baseline alignment with forecast. */
  captionTopPx,
  alignOverride,
  maxWidthPx,
}: {
  scenarioAsOfDate: string;
  plotInsetPx?: number;
  plotInsets?: PlotInsets;
  plotRatio: number;
  /** Absolute overlay inside chart host. */
  overlay?: boolean;
  captionTopPx?: number;
  alignOverride?: SnapshotLabelAlign;
  maxWidthPx?: number;
}) {
  const align = alignOverride ?? resolveSnapshotLabelAlign(plotRatio);
  const caption = snapshotDateCaption(formatDateRu(scenarioAsOfDate));
  const [title, datePart] = caption.split(': ');
  const leftStyle = snapshotCaptionLeft(plotRatio, plotInsets ?? plotInsetPx);
  const topPx =
    captionTopPx ?? (overlay ? TIMELINE_SNAPSHOT_CAPTION_TOP_PX : 0);
  const maxW = maxWidthPx ?? 144;

  return (
    <div
      className={
        overlay
          ? 'pointer-events-none absolute inset-x-0 top-0 z-10 w-full min-w-0 overflow-visible'
          : 'relative mb-0 w-full min-w-0 overflow-visible'
      }
      data-timeline-snapshot-chrome
      data-snapshot-overlay={overlay ? 'true' : 'false'}
    >
      <div
        className={`absolute z-10 text-[10px] leading-tight text-[var(--primary)] ${
          align === 'end'
            ? 'translate-x-[-100%] text-right'
            : align === 'start'
              ? 'text-left'
              : '-translate-x-1/2 text-center'
        }`}
        style={{
          left: leftStyle,
          top: topPx,
          maxWidth: maxW,
        }}
        data-snapshot-label
        data-label-align={align}
        data-snapshot-caption-left={leftStyle}
        data-snapshot-plot-ratio={String(plotRatio)}
        data-snapshot-caption-top={String(topPx)}
        data-snapshot-caption-max-w={String(maxW)}
      >
        <span className="font-semibold">{title}</span>
        <br />
        {datePart ?? formatDateRu(scenarioAsOfDate)}
      </div>
    </div>
  );
}
