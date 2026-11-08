/** @vitest-environment jsdom */
import { act, render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  SCHEDULE_CHART_SCALE_EVENT,
  type GanttMonthScaleGeometry,
} from '@/lib/schedule/gantt-month-scale-geometry';
import { ScheduleChartStickyScale } from './schedule-chart-sticky-scale';

const sample: GanttMonthScaleGeometry = {
  totalWidthPx: 300,
  rangeStartIso: '2027-05-01',
  rangeEndIso: '2027-08-01',
  months: [
    {
      iso: '2027-05-01',
      label: 'май 27',
      title: 'май 2027',
      leftPx: 0,
      widthPx: 100,
    },
    {
      iso: '2027-06-01',
      label: 'июн 27',
      title: 'июнь 2027',
      leftPx: 100,
      widthPx: 100,
    },
    {
      iso: '2027-07-01',
      label: 'июл 27',
      title: 'июль 2027',
      leftPx: 200,
      widthPx: 100,
    },
  ],
};

describe('ScheduleChartStickyScale', () => {
  it('renders vendor geometry (left/width/range), not a fixed-column approximation', async () => {
    const rootRef = createRef<HTMLDivElement>();
    const { container } = render(
      <div ref={rootRef}>
        <ScheduleChartStickyScale syncRootRef={rootRef} />
        <div
          className="ppc-gantt-host"
          data-gantt-fit-vertical="true"
          data-schedule-chart-scale-geometry={JSON.stringify(sample)}
        />
      </div>,
    );

    await waitFor(() => {
      expect(
        container.querySelector('[data-schedule-chart-scale-source="vendor"]'),
      ).toBeTruthy();
    });

    const scale = container.querySelector(
      '[data-schedule-chart-sticky-scale="true"]',
    );
    expect(scale?.getAttribute('data-schedule-chart-scale-width')).toBe('300');
    expect(scale?.getAttribute('data-schedule-chart-scale-start')).toBe(
      '2027-05-01',
    );
    expect(scale?.getAttribute('data-schedule-chart-scale-end')).toBe(
      '2027-08-01',
    );

    const jun = container.querySelector(
      '[data-schedule-chart-month="2027-06-01"]',
    ) as HTMLElement;
    expect(jun).toBeTruthy();
    expect(jun.getAttribute('data-schedule-chart-month-left')).toBe('100');
    expect(jun.getAttribute('data-schedule-chart-month-width')).toBe('100');
    expect(jun.style.left).toBe('100px');
    expect(jun.style.width).toBe('100px');

    // Sticky band is outside the gantt host.
    const sticky = container.querySelector(
      '[data-schedule-chart-sticky-header="true"]',
    );
    expect(
      container.querySelector('.ppc-gantt-host')?.contains(sticky as Node),
    ).toBe(false);
  });

  it('updates from SCHEDULE_CHART_SCALE_EVENT after gantt republishes', async () => {
    const rootRef = createRef<HTMLDivElement>();
    const { container } = render(
      <div ref={rootRef}>
        <ScheduleChartStickyScale syncRootRef={rootRef} />
        <div className="ppc-gantt-host" data-gantt-fit-vertical="true" />
      </div>,
    );

    const host = container.querySelector('.ppc-gantt-host')!;
    await act(async () => {
      host.setAttribute(
        'data-schedule-chart-scale-geometry',
        JSON.stringify(sample),
      );
      host.dispatchEvent(
        new CustomEvent(SCHEDULE_CHART_SCALE_EVENT, {
          bubbles: true,
          detail: sample,
        }),
      );
    });

    await waitFor(() => {
      expect(
        container.querySelector('[data-schedule-chart-month="2027-05-01"]'),
      ).toBeTruthy();
    });
  });

  it('re-reads host geometry on ResizeObserver without a polling interval', async () => {
    const callbacks: Array<() => void> = [];
    class FakeResizeObserver {
      constructor(cb: () => void) {
        callbacks.push(cb);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const setIntervalSpy = vi.spyOn(window, 'setInterval');

    const rootRef = createRef<HTMLDivElement>();
    const { container } = render(
      <div ref={rootRef}>
        <ScheduleChartStickyScale syncRootRef={rootRef} />
        <div className="ppc-gantt-host" data-gantt-fit-vertical="true" />
      </div>,
    );
    await waitFor(() => expect(callbacks.length).toBeGreaterThan(0));
    // Host already mounted: geometry discovery must not start an interval (only hscroll fallback may).
    const intervalDelays = setIntervalSpy.mock.calls.map((c) => c[1]);
    expect(intervalDelays).not.toContain(250);

    const host = container.querySelector('.ppc-gantt-host')!;
    host.setAttribute('data-schedule-chart-scale-geometry', JSON.stringify(sample));
    await act(async () => {
      for (const cb of callbacks) cb();
    });
    await waitFor(() => {
      expect(
        container.querySelector('[data-schedule-chart-month="2027-07-01"]'),
      ).toBeTruthy();
    });
    setIntervalSpy.mockRestore();
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
