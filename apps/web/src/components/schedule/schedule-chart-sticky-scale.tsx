'use client';

import { useEffect, useState, useRef, type RefObject } from 'react';
import { SCHEDULE_HEADER_HEIGHT_PX } from '@/lib/schedule/schedule-geometry';
import {
  SCHEDULE_CHART_HSCROLL_EVENT,
  SCHEDULE_CHART_HSCROLL_REQUEST,
  SCHEDULE_CHART_SCALE_EVENT,
  type GanttMonthScaleGeometry,
} from '@/lib/schedule/gantt-month-scale-geometry';

type Props = {
  /** Root that contains both this header and the gantt host (chart pane). */
  syncRootRef: RefObject<HTMLElement | null>;
};

const HOST_SELECTOR = '.ppc-gantt-host[data-gantt-fit-vertical="true"]';

/** Bounded wait for the host to mount (the chart pane may render after this header). */
const HOST_DISCOVERY_INTERVAL_MS = 250;
const HOST_DISCOVERY_MAX_ATTEMPTS = 20;

function readGeometry(root: HTMLElement): GanttMonthScaleGeometry | null {
  const host = root.querySelector<HTMLElement>(HOST_SELECTOR);
  const raw = host?.getAttribute('data-schedule-chart-scale-geometry');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GanttMonthScaleGeometry;
  } catch {
    return null;
  }
}

/**
 * Month scale sticky to [data-schedule-scroll-owner], outside DHTMLX overflow.
 * H position follows vendor `.gantt_hor_scroll` / `gantt.scrollTo` — not data_area.
 */
export function ScheduleChartStickyScale({ syncRootRef }: Props) {
  const headerHRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);
  const [geometry, setGeometry] = useState<GanttMonthScaleGeometry | null>(null);

  useEffect(() => {
    const root = syncRootRef.current;
    if (!root) return;

    const apply = (geo: GanttMonthScaleGeometry | null) => {
      if (geo) setGeometry(geo);
    };

    const onScale = (event: Event) => {
      const detail = (event as CustomEvent<GanttMonthScaleGeometry>).detail;
      if (detail?.months) apply(detail);
    };

    root.addEventListener(SCHEDULE_CHART_SCALE_EVENT, onScale);
    apply(readGeometry(root));

    // Host resize re-reads the published geometry (vendor republishes on render too).
    let observer: ResizeObserver | null = null;
    let observed: HTMLElement | null = null;
    const attachHostObserver = (): boolean => {
      const host = root.querySelector<HTMLElement>(HOST_SELECTOR);
      if (!host) return false;
      if (host !== observed && typeof ResizeObserver !== 'undefined') {
        observer?.disconnect();
        observer = new ResizeObserver(() => apply(readGeometry(root)));
        observer.observe(host);
      }
      observed = host;
      return true;
    };

    // Short fallback only until the host exists; no steady-state polling.
    let attempts = 0;
    let timer = 0;
    const discover = () => {
      attempts += 1;
      const found = attachHostObserver();
      if (found) apply(readGeometry(root));
      if (found || attempts >= HOST_DISCOVERY_MAX_ATTEMPTS) {
        window.clearInterval(timer);
      }
    };
    if (!attachHostObserver()) {
      timer = window.setInterval(discover, HOST_DISCOVERY_INTERVAL_MS);
    }

    return () => {
      root.removeEventListener(SCHEDULE_CHART_SCALE_EVENT, onScale);
      window.clearInterval(timer);
      observer?.disconnect();
    };
  }, [syncRootRef]);

  useEffect(() => {
    const root = syncRootRef.current;
    const header = headerHRef.current;
    if (!root || !header) return;

    const host = () =>
      root.querySelector<HTMLElement>(
        '.ppc-gantt-host[data-gantt-fit-vertical="true"]',
      );
    const hor = () =>
      root.querySelector<HTMLElement>(
        '[data-schedule-chart-hor-scroll="true"], .gantt_hor_scroll',
      );

    const onHeaderScroll = () => {
      if (syncing.current) return;
      syncing.current = true;
      const x = header.scrollLeft;
      const horEl = hor();
      if (horEl && horEl.scrollLeft !== x) horEl.scrollLeft = x;
      host()?.dispatchEvent(
        new CustomEvent(SCHEDULE_CHART_HSCROLL_REQUEST, {
          bubbles: true,
          detail: { x },
        }),
      );
      syncing.current = false;
    };

    const onVendorHScroll = (event: Event) => {
      if (syncing.current) return;
      const x = Number((event as CustomEvent<{ x: number }>).detail?.x);
      if (!Number.isFinite(x)) return;
      syncing.current = true;
      if (header.scrollLeft !== x) header.scrollLeft = x;
      syncing.current = false;
    };

    const onHorDomScroll = () => {
      if (syncing.current) return;
      const horEl = hor();
      if (!horEl) return;
      syncing.current = true;
      header.scrollLeft = horEl.scrollLeft;
      syncing.current = false;
    };

    header.addEventListener('scroll', onHeaderScroll, { passive: true });
    root.addEventListener(SCHEDULE_CHART_HSCROLL_EVENT, onVendorHScroll);

    let horEl = hor();
    horEl?.addEventListener('scroll', onHorDomScroll, { passive: true });

    const timer = window.setInterval(() => {
      const next = hor();
      if (next && next !== horEl) {
        horEl?.removeEventListener('scroll', onHorDomScroll);
        horEl = next;
        horEl.setAttribute('data-schedule-chart-hor-scroll', 'true');
        horEl.addEventListener('scroll', onHorDomScroll, { passive: true });
        header.scrollLeft = horEl.scrollLeft;
      }
    }, 200);

    return () => {
      window.clearInterval(timer);
      header.removeEventListener('scroll', onHeaderScroll);
      root.removeEventListener(SCHEDULE_CHART_HSCROLL_EVENT, onVendorHScroll);
      horEl?.removeEventListener('scroll', onHorDomScroll);
    };
  }, [syncRootRef, geometry?.totalWidthPx]);

  const widthPx = geometry?.totalWidthPx ?? 0;

  return (
    <div
      className="sticky top-0 z-20 bg-[var(--surface-sunken)]"
      data-schedule-chart-sticky-header="true"
      data-schedule-chart-scale-source={geometry ? 'vendor' : 'pending'}
      style={{ height: SCHEDULE_HEADER_HEIGHT_PX }}
    >
      <div
        ref={headerHRef}
        className="overflow-x-auto overflow-y-hidden"
        data-schedule-chart-header-hscroll="true"
        aria-label="Горизонтальная прокрутка шкалы месяцев"
      >
        <div
          className="relative border-b border-[var(--border)]"
          style={{
            width: widthPx,
            minWidth: widthPx,
            height: SCHEDULE_HEADER_HEIGHT_PX,
          }}
          data-schedule-chart-sticky-scale="true"
          data-schedule-chart-scale-width={widthPx || undefined}
          data-schedule-chart-scale-start={geometry?.rangeStartIso}
          data-schedule-chart-scale-end={geometry?.rangeEndIso}
        >
          {(geometry?.months ?? []).map((month) => (
            <div
              key={`${month.iso}-${month.leftPx}`}
              className="absolute top-0 box-border flex items-center justify-center border-r border-[var(--border-subtle)] px-1 text-center text-xs text-[var(--text-muted)]"
              style={{
                left: month.leftPx,
                width: month.widthPx,
                height: SCHEDULE_HEADER_HEIGHT_PX,
              }}
              title={month.title}
              data-schedule-chart-month={month.iso}
              data-schedule-chart-month-left={month.leftPx}
              data-schedule-chart-month-width={month.widthPx}
            >
              {month.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
