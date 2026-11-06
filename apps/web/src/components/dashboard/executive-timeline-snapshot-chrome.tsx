'use client';

import {
  resolveSnapshotLabelAlign,
  snapshotDateCaption,
} from '@/lib/dashboard/executive-timeline-experiment-labels';
import { dateToRatio } from '@/lib/dashboard/executive-timeline';
import { snapshotCaptionLeft } from '@/lib/dashboard/snapshot-caption-position';
import { formatDateRu } from '@/lib/format/ru';

/**
 * External «Дата снимка» chrome shared by experimental renderers (C12–C13).
 * Keeps the full caption readable at edges; the chart keeps only the as-of line.
 */
export function ExecutiveTimelineSnapshotChrome({
  scenarioAsOfDate,
  plotInsetPx = 0,
}: {
  scenarioAsOfDate: string;
  /** Side inset of the plot, when the line is not drawn across the full host. */
  plotInsetPx?: number;
}) {
  const ratio = dateToRatio(scenarioAsOfDate);
  const align = resolveSnapshotLabelAlign(ratio);
  const caption = snapshotDateCaption(formatDateRu(scenarioAsOfDate));
  const [title, datePart] = caption.split(': ');

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
        style={{ left: snapshotCaptionLeft(ratio, plotInsetPx) }}
        data-snapshot-label
        data-label-align={align}
      >
        <span className="font-semibold">{title}</span>
        <br />
        {datePart ?? formatDateRu(scenarioAsOfDate)}
      </div>
    </div>
  );
}
