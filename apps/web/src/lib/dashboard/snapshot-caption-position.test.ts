import { describe, expect, it } from 'vitest';
import {
  ECHARTS_PLOT_INSET_PX,
  snapshotCaptionLeft,
} from './snapshot-caption-position';

describe('snapshotCaptionLeft', () => {
  it('без отступа шкалы ставит подпись на долю ширины', () => {
    expect(snapshotCaptionLeft(0.5)).toBe('50%');
    expect(snapshotCaptionLeft(0)).toBe('0%');
  });

  it('с отступом ECharts делит ту же внутреннюю ширину, что и линия', () => {
    expect(snapshotCaptionLeft(0, ECHARTS_PLOT_INSET_PX)).toBe(
      'calc(10px + (100% - 20px) * 0)',
    );
    expect(snapshotCaptionLeft(1, ECHARTS_PLOT_INSET_PX)).toBe(
      'calc(10px + (100% - 20px) * 1)',
    );
  });
});
