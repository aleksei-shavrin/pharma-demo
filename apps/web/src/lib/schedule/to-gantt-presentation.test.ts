/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import type { ScheduleItem } from '@/lib/api-client';
import {
  computeTimelineVisibleRange,
  forecastPresentationId,
  logicalPresentationId,
  presentationIdToSelectionKey,
  toGanttPresentation,
} from './to-gantt-presentation';

const eqA: ScheduleItem = {
  kind: 'equipment_delivery',
  id: 'EQ-HVAC-01',
  name: 'Центральный AHU',
  workstream: 'WS-HVAC',
  critical: true,
  status: 'OnTrack',
  baselineDate: '2027-05-15',
  forecastDate: '2027-05-15',
  dateVariance: {
    baselineDate: '2027-05-15',
    forecastDate: '2027-05-15',
    deltaDays: 0,
  },
};

const eqB: ScheduleItem = {
  ...eqA,
  status: 'Delayed',
  forecastDate: '2027-06-05',
  dateVariance: {
    baselineDate: '2027-05-15',
    forecastDate: '2027-06-05',
    deltaDays: 21,
  },
};

const msA: ScheduleItem = {
  kind: 'milestone',
  id: 'MS-PS',
  name: 'Ready for production',
  workstream: null,
  rag: 'Green',
  baselineDate: '2027-09-15',
  forecastDate: '2027-09-15',
  dateVariance: {
    baselineDate: '2027-09-15',
    forecastDate: '2027-09-15',
    deltaDays: 0,
  },
};

const msB: ScheduleItem = {
  ...msA,
  rag: 'Red',
  forecastDate: '2027-10-06',
  dateVariance: {
    baselineDate: '2027-09-15',
    forecastDate: '2027-10-06',
    deltaDays: 21,
  },
};

describe('toGanttPresentation (one logical row)', () => {
  it('A: exactly 2 logical rows; duration 0; no task type', () => {
    const p = toGanttPresentation([eqA, msA]);
    expect(p.links).toEqual([]);
    expect(p.data).toHaveLength(2);
    expect(p.data.every((t) => t.type === 'milestone')).toBe(true);
    expect(p.data.every((t) => t.duration === 0)).toBe(true);
    expect(p.data.every((t) => t.showBaselineGhost === false)).toBe(true);
    expect(p.data.map((t) => [t.id, t.start_date])).toEqual([
      ['equipment_delivery:EQ-HVAC-01', '2027-05-15'],
      ['milestone:MS-PS', '2027-09-15'],
    ]);
    expect(p.data.some((t) => (t as { type: string }).type === 'task')).toBe(
      false,
    );
    expect(JSON.stringify(p)).not.toMatch(/"duration":\s*21/);
  });

  it('B: exactly 2 logical rows; each owns baseline+forecast; no duration from delta', () => {
    const p = toGanttPresentation([eqB, msB]);
    expect(p.data).toHaveLength(2);
    expect(p.data.every((t) => t.type === 'milestone')).toBe(true);
    expect(p.data.every((t) => t.duration === 0)).toBe(true);
    expect(p.data.every((t) => t.showBaselineGhost)).toBe(true);
    expect(p.data.map((t) => ({
      id: t.id,
      baseline: t.baselineDate,
      forecast: t.forecastDate,
      start: t.start_date,
    }))).toEqual([
      {
        id: 'equipment_delivery:EQ-HVAC-01',
        baseline: '2027-05-15',
        forecast: '2027-06-05',
        start: '2027-06-05',
      },
      {
        id: 'milestone:MS-PS',
        baseline: '2027-09-15',
        forecast: '2027-10-06',
        start: '2027-10-06',
      },
    ]);
    expect(p.links).toEqual([]);
    expect(p.data.some((t) => t.duration === 21)).toBe(false);
  });

  it('C: same delayed forecasts as B; no recovery heal; still 2 rows', () => {
    const p = toGanttPresentation([eqB, msB]);
    expect(p.data).toHaveLength(2);
    expect(p.data[0].forecastDate).toBe('2027-06-05');
    expect(p.data[1].forecastDate).toBe('2027-10-06');
  });

  it('logical row id maps to ScheduleSelectionKey; legacy role suffixes still parse', () => {
    const eqKey = { kind: 'equipment_delivery' as const, entityId: 'EQ-HVAC-01' };
    expect(presentationIdToSelectionKey('equipment_delivery:EQ-HVAC-01')).toEqual(
      eqKey,
    );
    expect(
      presentationIdToSelectionKey('equipment_delivery:EQ-HVAC-01:baseline'),
    ).toEqual(eqKey);
    expect(
      presentationIdToSelectionKey('equipment_delivery:EQ-HVAC-01:forecast'),
    ).toEqual(eqKey);
    expect(logicalPresentationId(eqKey)).toBe('equipment_delivery:EQ-HVAC-01');
    expect(forecastPresentationId(eqKey)).toBe('equipment_delivery:EQ-HVAC-01');
  });
});

describe('computeTimelineVisibleRange', () => {
  it('A range covers May and September with padding', () => {
    const r = computeTimelineVisibleRange([eqA, msA]);
    expect(r.coveredDates).toEqual(['2027-05-15', '2027-09-15']);
    expect(r.start <= '2027-05-15').toBe(true);
    expect(r.end > '2027-09-15').toBe(true);
    expect(r.start).toBe('2027-05-01');
    expect(r.end).toBe('2027-09-30');
  });

  it('B/C range covers May through October canonical dates', () => {
    const r = computeTimelineVisibleRange([eqB, msB]);
    for (const d of [
      '2027-05-15',
      '2027-06-05',
      '2027-09-15',
      '2027-10-06',
    ]) {
      expect(r.coveredDates).toContain(d);
      expect(r.start <= d).toBe(true);
      expect(r.end > d).toBe(true);
    }
    expect(r.start).toBe('2027-05-01');
    expect(r.end).toBe('2027-10-21');
  });

  it('selection does not alter the data range (pure function of items)', () => {
    const a = computeTimelineVisibleRange([eqB, msB]);
    const b = computeTimelineVisibleRange([eqB, msB]);
    expect(a).toEqual(b);
  });

  it('snapshot switch recomputes range atomically (A vs B)', () => {
    const a = computeTimelineVisibleRange([eqA, msA]);
    const b = computeTimelineVisibleRange([eqB, msB]);
    expect(a.end).not.toEqual(b.end);
    expect(b.coveredDates).toContain('2027-10-06');
    expect(a.coveredDates).not.toContain('2027-10-06');
  });
});
