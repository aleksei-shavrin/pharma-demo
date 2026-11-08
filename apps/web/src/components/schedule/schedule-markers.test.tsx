/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ScheduleControlPointItem, ScheduleWorkItem } from '@/lib/api-client';
import { ScheduleRowMarkers, ScheduleWorkBar } from './schedule-markers';

const horizon = {
  startMs: Date.parse('2027-01-01T00:00:00'),
  endMs: Date.parse('2027-12-31T00:00:00'),
  startIso: '2027-01-01',
  endIso: '2027-12-31',
  widthPx: 1200,
  months: [],
};

const work: ScheduleWorkItem = {
  kind: 'work',
  id: 'WK-01',
  name: 'Монтаж',
  startDate: '2027-02-20',
  endDate: '2027-02-24',
  baselineStart: '2027-02-10',
  baselineEnd: '2027-02-15',
  status: 'OnSchedule',
  progressPct: 40,
};

describe('ScheduleWorkBar / ScheduleRowMarkers', () => {
  it('baseline-only uses base bounds and skips gray overlay', () => {
    const { container } = render(
      <ScheduleWorkBar item={work} horizon={horizon} comparison="baseline" />,
    );
    expect(container.querySelector('[data-baseline-missing]')).toBeNull();
    expect(container.querySelector('[data-marker="work-baseline"]')).toBeNull();
    expect(container.querySelector('[data-marker="work-bar"]')).toBeTruthy();
  });

  it('missing baseline stays empty with tooltip', () => {
    const { container } = render(
      <ScheduleWorkBar
        item={{ ...work, baselineStart: null, baselineEnd: null }}
        horizon={horizon}
        comparison="baseline"
      />,
    );
    const missing = container.querySelector('[data-baseline-missing="true"]');
    expect(missing).toHaveAttribute('title', 'Базовый план не задан');
  });

  it('forecast keeps baseline overlay when dates differ', () => {
    const { container } = render(
      <ScheduleWorkBar item={work} horizon={horizon} comparison="forecast" />,
    );
    expect(container.querySelector('[data-marker="work-baseline"]')).toBeTruthy();
  });

  it('control point baseline-only uses baselineDate without ghost', () => {
    const item = {
      kind: 'equipment_delivery',
      id: 'EQ-HVAC',
      name: 'HVAC',
      forecastDate: '2027-03-01',
      baselineDate: '2027-02-15',
      status: 'OnTrack',
      dateVariance: { deltaDays: 14 },
    } as ScheduleControlPointItem;
    const { container } = render(
      <ScheduleRowMarkers item={item} horizon={horizon} comparison="baseline" />,
    );
    expect(container.querySelector('[data-marker="baseline-primary"]')).toBeTruthy();
    expect(container.querySelector('[data-marker="baseline"]')).toBeNull();
    expect(container.querySelector('[data-marker="forecast"]')).toBeNull();
  });
});
