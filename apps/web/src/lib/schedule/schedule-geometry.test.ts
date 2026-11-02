import { describe, expect, it } from 'vitest';
import type { ScheduleItem } from '@/lib/api-client';
import {
  SCHEDULE_ROW_HEIGHT_PX,
  buildScheduleHorizon,
  isScheduleAttention,
  markerGeometry,
  monthLabelSpans,
  sortScheduleItems,
} from './schedule-geometry';

const eqC: ScheduleItem = {
  kind: 'equipment_delivery',
  id: 'EQ-HVAC-01',
  name: 'Центральный AHU',
  workstream: 'WS-HVAC',
  critical: true,
  status: 'Delayed',
  baselineDate: '2027-05-15',
  forecastDate: '2027-06-05',
  dateVariance: {
    baselineDate: '2027-05-15',
    forecastDate: '2027-06-05',
    deltaDays: 21,
  },
};

const msC: ScheduleItem = {
  kind: 'milestone',
  id: 'MS-PS',
  name: 'Ready for production',
  workstream: null,
  rag: 'Red',
  baselineDate: '2027-09-15',
  forecastDate: '2027-10-06',
  dateVariance: {
    baselineDate: '2027-09-15',
    forecastDate: '2027-10-06',
    deltaDays: 21,
  },
};

const eqA: ScheduleItem = {
  ...eqC,
  status: 'OnTrack',
  forecastDate: '2027-05-15',
  dateVariance: {
    baselineDate: '2027-05-15',
    forecastDate: '2027-05-15',
    deltaDays: 0,
  },
};

describe('schedule geometry / row contract', () => {
  it('exports fixed compact row height', () => {
    expect(SCHEDULE_ROW_HEIGHT_PX).toBe(48);
  });

  it('Δ0: no baseline ghost; Δ≠0: connector + baseline', () => {
    const horizon = buildScheduleHorizon([eqA, msC]);
    const calm = markerGeometry(eqA, horizon);
    expect(calm.showBaseline).toBe(false);
    expect(calm.connectorWidthPct).toBe(0);

    const shifted = markerGeometry(eqC, horizon);
    expect(shifted.showBaseline).toBe(true);
    expect(shifted.connectorWidthPct).toBeGreaterThan(0);
    expect(shifted.forecastXPct).toBeGreaterThan(shifted.baselineXPct);
  });

  it('sorts distinct items deterministically by forecast then kind then id', () => {
    const eqEarly: ScheduleItem = {
      ...eqA,
      id: 'EQ-BLD-02',
      forecastDate: '2027-02-01',
      baselineDate: '2027-02-01',
      dateVariance: {
        baselineDate: '2027-02-01',
        forecastDate: '2027-02-01',
        deltaDays: 0,
      },
    };
    const sorted = sortScheduleItems([msC, eqC, eqEarly]);
    expect(sorted.map((i) => i.id)).toEqual([
      'EQ-BLD-02',
      'EQ-HVAC-01',
      'MS-PS',
    ]);
  });

  it('attention from backend status/RAG only', () => {
    expect(isScheduleAttention(eqC)).toBe(true);
    expect(isScheduleAttention(eqA)).toBe(false);
    expect(isScheduleAttention(msC)).toBe(true);
  });

  it('horizon covers C HVAC and MS-PS dates', () => {
    const h = buildScheduleHorizon([eqC, msC]);
    expect(h.startIso <= '2027-05-15').toBe(true);
    expect(h.endIso >= '2027-10-06').toBe(true);
    expect(h.months.length).toBeGreaterThan(3);
    expect(h.widthPx).toBeGreaterThanOrEqual(480);
  });

  it('month label spans cover 0–100 without boundary-centered first/last ticks', () => {
    const h = buildScheduleHorizon([eqC, msC]);
    const spans = monthLabelSpans(h.months);
    expect(spans.length).toBe(h.months.length);
    expect(spans[0].leftPct).toBeGreaterThanOrEqual(0);
    expect(spans[0].widthPct).toBeGreaterThan(0);
    const last = spans[spans.length - 1];
    expect(last.leftPct + last.widthPct).toBeCloseTo(100, 5);
    // First span starts at first tick (may be >0); cell layout keeps label inside.
    expect(spans.every((s) => s.widthPct >= 0)).toBe(true);
  });
});
