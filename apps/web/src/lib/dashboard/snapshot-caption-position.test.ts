import { describe, expect, it } from 'vitest';
import {
  ECHARTS_GRID_LEFT_PX,
  ECHARTS_GRID_RIGHT_PX,
  ECHARTS_PLOT_INSET_PX,
  ECHARTS_PLOT_INSETS,
  snapshotCaptionLeft,
} from './snapshot-caption-position';

describe('snapshotCaptionLeft', () => {
  it('без отступа шкалы ставит подпись на долю ширины', () => {
    expect(snapshotCaptionLeft(0.5)).toBe('50%');
    expect(snapshotCaptionLeft(0)).toBe('0%');
  });

  it('с симметричным отступом ECharts делит ту же внутреннюю ширину, что и линия', () => {
    expect(snapshotCaptionLeft(0, ECHARTS_PLOT_INSET_PX)).toBe(
      'calc(10px + (100% - 20px) * 0)',
    );
    expect(snapshotCaptionLeft(1, ECHARTS_PLOT_INSET_PX)).toBe(
      'calc(10px + (100% - 20px) * 1)',
    );
  });

  it('с асимметричным grid (left 128 / right 10) совпадает с densify ECharts', () => {
    expect(ECHARTS_PLOT_INSETS).toEqual({
      leftPx: ECHARTS_GRID_LEFT_PX,
      rightPx: ECHARTS_GRID_RIGHT_PX,
    });
    expect(snapshotCaptionLeft(0, ECHARTS_PLOT_INSETS)).toBe(
      `calc(${ECHARTS_GRID_LEFT_PX}px + (100% - ${ECHARTS_GRID_LEFT_PX + ECHARTS_GRID_RIGHT_PX}px) * 0)`,
    );
    expect(snapshotCaptionLeft(0.5, ECHARTS_PLOT_INSETS)).toBe(
      `calc(${ECHARTS_GRID_LEFT_PX}px + (100% - ${ECHARTS_GRID_LEFT_PX + ECHARTS_GRID_RIGHT_PX}px) * 0.5)`,
    );
    expect(snapshotCaptionLeft(1, ECHARTS_PLOT_INSETS)).toBe(
      `calc(${ECHARTS_GRID_LEFT_PX}px + (100% - ${ECHARTS_GRID_LEFT_PX + ECHARTS_GRID_RIGHT_PX}px) * 1)`,
    );
  });
});
