/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { SCHEDULE_MONTH_COL_PX } from './schedule-geometry';
import {
  SCHEDULE_GANTT_MIN_COLUMN_WIDTH_PX,
  formatMonthScaleCellHtml,
  formatMonthScaleFull,
  formatMonthScaleShort,
  scheduleMonthScaleEntry,
} from './schedule-month-scale';

describe('schedule-month-scale', () => {
  it('краткая подпись — RU short + yy, полная — месяц YYYY', () => {
    const d = new Date(2027, 0, 15);
    expect(formatMonthScaleShort(d)).toBe('янв 27');
    expect(formatMonthScaleFull(d)).toBe('январь 2027');
  });

  it('HTML ячейки несёт title с полным именем и не использует %F %Y', () => {
    const html = formatMonthScaleCellHtml(new Date(2027, 2, 1));
    expect(html).toContain('мар 27');
    expect(html).toContain('title="март 2027"');
    expect(html).not.toMatch(/%F|%Y/);
  });

  it('HTML — span с title, без сырого %F/%Y', () => {
    const html = formatMonthScaleCellHtml(new Date(2026, 11, 1));
    expect(html).toBe('<span title="декабрь 2026">дек 26</span>');
    expect(html).not.toMatch(/%F|%Y/);
  });

  it('min column width шкалы = SCHEDULE_MONTH_COL_PX (72)', () => {
    expect(SCHEDULE_GANTT_MIN_COLUMN_WIDTH_PX).toBe(SCHEDULE_MONTH_COL_PX);
    expect(SCHEDULE_GANTT_MIN_COLUMN_WIDTH_PX).toBe(72);
  });

  it('scheduleMonthScaleEntry отдаёт month/1 и format-функцию, не %F %Y', () => {
    const entry = scheduleMonthScaleEntry();
    expect(entry.unit).toBe('month');
    expect(entry.step).toBe(1);
    expect(typeof entry.format).toBe('function');
    expect(entry.format(new Date(2027, 5, 1))).toContain('июн 27');
  });
});
