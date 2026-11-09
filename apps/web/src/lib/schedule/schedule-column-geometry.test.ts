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
    // Prior 1300 with name=160; name 160→240 adds +80 → 1380
    expect(SCHEDULE_COL_NAME_PX).toBe(240);
    expect(wideTableMinWidthPx('forecast')).toBe(1380);
  });

  it('actual добавляет 4×120 + gaps к формуле', () => {
    const forecast = wideTableMinWidthPx('forecast');
    const actual = wideTableMinWidthPx('actual');
    const extraCols = 4;
    const extra =
      extraCols * SCHEDULE_COL_FACT_PX + extraCols * SCHEDULE_COL_GAP_PX;
    expect(actual).toBe(forecast + extra);
    expect(actual).toBe(1908);
    expect(wideTableColumnWidths('actual').filter((w) => w === SCHEDULE_COL_FACT_PX)).toHaveLength(
      4,
    );
  });

  it('scheduleColBoxStyle фиксирует width/min/max для жёстких колонок', () => {
    expect(scheduleColBoxStyle(160)).toEqual({
      width: 160,
      minWidth: 160,
      maxWidth: 160,
      flex: '0 0 auto',
    });
  });

  it('name/object columns flex-grow from min width', () => {
    expect(scheduleColBoxStyle(SCHEDULE_COL_NAME_PX, 'name')).toEqual({
      width: undefined,
      minWidth: SCHEDULE_COL_NAME_PX,
      maxWidth: undefined,
      flex: `1 1 ${SCHEDULE_COL_NAME_PX}px`,
    });
    expect(scheduleColBoxStyle(SCHEDULE_COL_OBJECT_PX, 'object').flex).toMatch(
      /^1 1 /,
    );
  });
});
