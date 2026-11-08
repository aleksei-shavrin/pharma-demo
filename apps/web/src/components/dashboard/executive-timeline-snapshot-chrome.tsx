'use client';

import {
  resolveSnapshotLabelAlign,
  snapshotDateCaption,
} from '@/lib/dashboard/executive-timeline-experiment-labels';
import { dateToRatio } from '@/lib/dashboard/executive-timeline';
import {
  snapshotCaptionLeft,
  type PlotInsets,
} from '@/lib/dashboard/snapshot-caption-position';
import { formatDateRu } from '@/lib/format/ru';

/**
 * External «Дата снимка» chrome for the portfolio ECharts timeline.
 * Keeps the full caption readable at edges; the chart keeps only the as-of line.
 */
export function ExecutiveTimelineSnapshotChrome({
  scenarioAsOfDate,
  plotInsetPx = 0,
  plotInsets,
}: {
  scenarioAsOfDate: string;
  /** Symmetric side inset (vis / legacy). Prefer plotInsets when asymmetric. */
  plotInsetPx?: number;
  /** Asymmetric grid insets matching ECharts grid.left / grid.right. */
  plotInsets?: PlotInsets;
}) {
  const ratio = dateToRatio(scenarioAsOfDate);
  const align = resolveSnapshotLabelAlign(ratio);
  const caption = snapshotDateCaption(formatDateRu(scenarioAsOfDate));
  const [title, datePart] = caption.split(': ');
  const leftStyle = snapshotCaptionLeft(ratio, plotInsets ?? plotInsetPx);

  return (
    <div
      className="relative mb-1 h-8 w-full min-w-0"
      data-timeline-snapshot-chrome
    >
      <div
        className={`absolute z-10 max-w-[9rem] text-[10px] leading-tight text-[var(--primary)] ${
          align === 'end'
            ? 'translate-x-[-100%] text-right'
            : align === 'start'
              ? 'text-left'
              : '-translate-x-1/2 text-center'
        }`}
        style={{ left: leftStyle }}
        data-snapshot-label
        data-label-align={align}
        data-snapshot-caption-left={leftStyle}
      >
        <span className="font-semibold">{title}</span>
        <br />
        {datePart ?? formatDateRu(scenarioAsOfDate)}
      </div>
    </div>
  );
}
