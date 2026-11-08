/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  SCHEDULE_COL_DATE_PX,
  SCHEDULE_COL_FACT_PX,
  SCHEDULE_COL_GAP_PX,
  SCHEDULE_COL_NAME_PX,
  SCHEDULE_COL_OBJECT_PX,
  SCHEDULE_COL_PAD_X_PX,
  SCHEDULE_COL_WBS_PX,
  scheduleColBoxStyle,
  wideTableColumnWidths,
  wideTableMinWidthPx,
} from './schedule-column-geometry';

describe('schedule-column-geometry', () => {
  it('forecast min-width = Σ widths + gaps + pad (без колонки №)', () => {
    const widths = wideTableColumnWidths('forecast');
    expect(widths[0]).toBe(SCHEDULE_COL_WBS_PX);
    expect(widths).toHaveLength(11);
    expect(widths).toContain(SCHEDULE_COL_NAME_PX);
    expect(widths).toContain(SCHEDULE_COL_OBJECT_PX);
    expect(widths).toContain(SCHEDULE_COL_DATE_PX);
    expect(widths).not.toContain(SCHEDULE_COL_FACT_PX);

    const gaps = (widths.length - 1) * SCHEDULE_COL_GAP_PX;
    const pad = SCHEDULE_COL_PAD_X_PX * 2;
    const expected = widths.reduce((a, b) => a + b, 0) + gaps + pad;
    expect(wideTableMinWidthPx('forecast')).toBe(expected);
    expect(wideTableMinWidthPx('forecast')).toBe(1264);
  });

  it('actual добавляет 4×120 + gaps к формуле', () => {
    const forecast = wideTableMinWidthPx('forecast');
    const actual = wideTableMinWidthPx('actual');
    const extraCols = 4;
    const extra =
      extraCols * SCHEDULE_COL_FACT_PX + extraCols * SCHEDULE_COL_GAP_PX;
    expect(actual).toBe(forecast + extra);
    expect(actual).toBe(1792);
    expect(wideTableColumnWidths('actual').filter((w) => w === SCHEDULE_COL_FACT_PX)).toHaveLength(
      4,
    );
  });

  it('scheduleColBoxStyle фиксирует width/min/max без flex-grow', () => {
    expect(scheduleColBoxStyle(160)).toEqual({
      width: 160,
      minWidth: 160,
      maxWidth: 160,
      flex: '0 0 auto',
    });
  });
});
