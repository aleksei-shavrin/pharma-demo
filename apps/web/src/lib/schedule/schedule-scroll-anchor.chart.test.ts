/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import {
  captureChartPaneScroll,
  restoreChartPaneScroll,
} from './schedule-scroll-anchor';

function mountChartPane(scrollTop: number): HTMLElement {
  const pane = document.createElement('div');
  pane.innerHTML = `
    <div class="gantt_ver_scroll"></div>
    <div class="gantt_task">
      <div class="gantt_task_row" task_id="work:a"></div>
    </div>
    <div class="gantt_data_area"></div>
  `;
  const bar = pane.querySelector<HTMLElement>('.gantt_ver_scroll')!;
  Object.defineProperty(bar, 'scrollHeight', { configurable: true, value: 2000 });
  Object.defineProperty(bar, 'clientHeight', { configurable: true, value: 200 });
  Object.defineProperty(bar, 'scrollTop', {
    configurable: true,
    writable: true,
    value: scrollTop,
  });
  const data = pane.querySelector<HTMLElement>('.gantt_data_area')!;
  Object.defineProperty(data, 'scrollTop', {
    configurable: true,
    writable: true,
    value: 0,
  });
  document.body.appendChild(pane);
  return pane;
}

describe('chart-only scroll capture/restore', () => {
  it('captures verticalScrollTop from .gantt_ver_scroll', () => {
    const pane = mountChartPane(640);
    const captured = captureChartPaneScroll(pane);
    expect(captured?.verticalScrollTop).toBe(640);
    pane.remove();
  });

  it('restores verticalScrollTop onto a fresh chart pane', () => {
    const first = mountChartPane(640);
    const captured = captureChartPaneScroll(first)!;
    first.remove();

    const second = mountChartPane(0);
    restoreChartPaneScroll(
      second,
      captured.verticalScrollTop,
      captured.rowKey,
      captured.rowOffsetPx,
    );
    const bar = second.querySelector<HTMLElement>('.gantt_ver_scroll')!;
    expect(bar.scrollTop).toBe(640);
    const data = second.querySelector<HTMLElement>('.gantt_data_area')!;
    expect(data.scrollTop).toBe(640);
    second.remove();
  });
});
