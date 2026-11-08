/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { extractGanttMonthScaleGeometry } from './gantt-month-scale-geometry';

/** Linear mock: 1 day = 1px from range start. */
function mockGantt(start: Date, end: Date, pxPerDay = 1) {
  const origin = start.getTime();
  return {
    config: { start_date: start, end_date: end },
    posFromDate: (d: Date) =>
      ((d.getTime() - origin) / 86400000) * pxPerDay,
    dateFromPos: (x: number) =>
      new Date(origin + (x / pxPerDay) * 86400000),
  };
}

describe('extractGanttMonthScaleGeometry', () => {
  it('matches vendor origin/width/range for a multi-month span', () => {
    const start = new Date(2027, 4, 1); // 1 May
    const end = new Date(2027, 7, 1); // 1 Aug
    const gantt = mockGantt(start, end, 2);
    const geo = extractGanttMonthScaleGeometry(gantt);
    expect(geo).not.toBeNull();
    expect(geo!.rangeStartIso).toBe('2027-05-01');
    expect(geo!.rangeEndIso).toBe('2027-08-01');
    expect(geo!.totalWidthPx).toBe(gantt.posFromDate(end) - gantt.posFromDate(start));
    expect(geo!.months.map((m) => m.label)).toEqual([
      'май 27',
      'июн 27',
      'июл 27',
    ]);
    // May cell starts at 0; June at posFromDate(Jun 1).
    expect(geo!.months[0].leftPx).toBe(0);
    expect(geo!.months[1].leftPx).toBe(gantt.posFromDate(new Date(2027, 5, 1)));
    const sumWidths = geo!.months.reduce((s, m) => s + m.widthPx, 0);
    expect(sumWidths).toBeCloseTo(geo!.totalWidthPx, 5);
  });

  it('handles mid-month range start without inventing a fixed column width', () => {
    const start = new Date(2027, 4, 15);
    const end = new Date(2027, 6, 10);
    const gantt = mockGantt(start, end, 3);
    const geo = extractGanttMonthScaleGeometry(gantt)!;
    expect(geo.months[0].leftPx).toBe(0);
    expect(geo.months[0].label).toBe('май 27');
    // First cell width = May 15 → Jun 1
    expect(geo.months[0].widthPx).toBe(
      gantt.posFromDate(new Date(2027, 5, 1)) - gantt.posFromDate(start),
    );
  });

  it('returns null when dateFromPos drifts from start_date', () => {
    const start = new Date(2027, 0, 1);
    const end = new Date(2027, 2, 1);
    const gantt = {
      config: { start_date: start, end_date: end },
      posFromDate: (d: Date) => (d.getTime() - start.getTime()) / 86400000,
      dateFromPos: () => new Date(2030, 0, 1),
    };
    expect(extractGanttMonthScaleGeometry(gantt)).toBeNull();
  });

  it('prefers getScale() trace_x/left/width over posFromDate', () => {
    const start = new Date(2027, 4, 1);
    const end = new Date(2027, 7, 1);
    const gantt = {
      config: { start_date: start, end_date: end },
      // Must not be used while getScale exists.
      posFromDate: () => {
        throw new Error('posFromDate must not be called');
      },
      getScale: () => ({
        trace_x: [new Date(2027, 4, 1), new Date(2027, 5, 1), new Date(2027, 6, 1)],
        left: [0, 110, 250],
        width: [110, 140, 90],
        full_width: 340,
      }),
    };
    const geo = extractGanttMonthScaleGeometry(gantt);
    expect(geo).not.toBeNull();
    expect(geo!.totalWidthPx).toBe(340);
    expect(geo!.rangeStartIso).toBe('2027-05-01');
    expect(geo!.rangeEndIso).toBe('2027-08-01');
    expect(geo!.months.map((m) => [m.iso, m.leftPx, m.widthPx])).toEqual([
      ['2027-05-01', 0, 110],
      ['2027-06-01', 110, 140],
      ['2027-07-01', 250, 90],
    ]);
    expect(geo!.months.map((m) => m.label)).toEqual(['май 27', 'июн 27', 'июл 27']);
  });

  it('derives left from cumulative width when left[] is absent', () => {
    const geo = extractGanttMonthScaleGeometry({
      config: {},
      getScale: () => ({
        trace_x: [new Date(2027, 0, 1), new Date(2027, 1, 1)],
        width: [100, 80],
      }),
    });
    expect(geo!.months.map((m) => [m.leftPx, m.widthPx])).toEqual([
      [0, 100],
      [100, 80],
    ]);
    expect(geo!.totalWidthPx).toBe(180);
  });

  it('accepts an explicit cells array', () => {
    const geo = extractGanttMonthScaleGeometry({
      config: {},
      getScale: () => ({
        cells: [
          { date: new Date(2027, 2, 1), left: 0, width: 75 },
          { date: new Date(2027, 3, 1), left: 75, width: 60 },
        ],
      }),
    });
    expect(geo!.months.map((m) => [m.iso, m.leftPx, m.widthPx])).toEqual([
      ['2027-03-01', 0, 75],
      ['2027-04-01', 75, 60],
    ]);
    expect(geo!.totalWidthPx).toBe(135);
  });

  it('groups sub-month scale cells (weeks) into calendar months', () => {
    const geo = extractGanttMonthScaleGeometry({
      config: {},
      getScale: () => ({
        trace_x: [
          new Date(2027, 4, 3),
          new Date(2027, 4, 10),
          new Date(2027, 5, 7),
          new Date(2027, 5, 14),
        ],
        left: [0, 20, 40, 60],
        width: [20, 20, 20, 20],
        full_width: 80,
      }),
    });
    expect(geo!.months.map((m) => [m.iso, m.leftPx, m.widthPx])).toEqual([
      ['2027-05-01', 0, 40],
      ['2027-06-01', 40, 40],
    ]);
  });

  it('returns null (no posFromDate fallback) when getScale exists but has no cells', () => {
    const start = new Date(2027, 0, 1);
    const end = new Date(2027, 2, 1);
    const posFromDate = (d: Date) => (d.getTime() - start.getTime()) / 86400000;
    expect(
      extractGanttMonthScaleGeometry({
        config: { start_date: start, end_date: end },
        posFromDate,
        getScale: () => null,
      }),
    ).toBeNull();
    expect(
      extractGanttMonthScaleGeometry({
        config: { start_date: start, end_date: end },
        posFromDate,
        getScale: () => ({ trace_x: [] }),
      }),
    ).toBeNull();
  });
});
