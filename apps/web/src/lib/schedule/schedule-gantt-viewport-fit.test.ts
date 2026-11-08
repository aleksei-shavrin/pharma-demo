/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import {
  applyFitHostBox,
  fitHostBoxNeedsUpdate,
  readGanttFitViewportBox,
  resolveGanttResizeObserveTarget,
} from './schedule-gantt-viewport-fit';

describe('resolveGanttResizeObserveTarget', () => {
  it('observes .ppc-gantt-viewport, not the fixed-height host', () => {
    const viewport = document.createElement('div');
    viewport.className = 'ppc-gantt-viewport';
    const host = document.createElement('div');
    host.className = 'ppc-gantt-host';
    viewport.appendChild(host);
    document.body.appendChild(viewport);

    expect(resolveGanttResizeObserveTarget(host)).toBe(viewport);
    expect(resolveGanttResizeObserveTarget(host)).not.toBe(host);

    viewport.remove();
  });

  it('falls back to host when viewport is missing', () => {
    const host = document.createElement('div');
    host.className = 'ppc-gantt-host';
    document.body.appendChild(host);
    expect(resolveGanttResizeObserveTarget(host)).toBe(host);
    host.remove();
  });

  it('observes data-schedule-pane=chart when class viewport is absent', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-schedule-pane', 'chart');
    const host = document.createElement('div');
    host.className = 'ppc-gantt-host';
    pane.appendChild(host);
    document.body.appendChild(pane);
    expect(resolveGanttResizeObserveTarget(host)).toBe(pane);
    pane.remove();
  });
});

describe('fitHostBoxNeedsUpdate + applyFitHostBox', () => {
  it('applies viewport height and skips idempotent reapply', () => {
    const viewport = document.createElement('div');
    viewport.className = 'ppc-gantt-viewport';
    Object.defineProperty(viewport, 'clientHeight', {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(viewport, 'clientWidth', {
      configurable: true,
      value: 800,
    });
    const host = document.createElement('div');
    host.className = 'ppc-gantt-host';
    viewport.appendChild(host);
    document.body.appendChild(viewport);

    const first = readGanttFitViewportBox(host);
    expect(first.height).toBe(500);
    expect(fitHostBoxNeedsUpdate(host, first.height, first.width)).toBe(true);
    applyFitHostBox(host, first.height, first.width);
    expect(host.style.height).toBe('500px');
    expect(host.style.maxHeight).toBe('500px');
    expect(fitHostBoxNeedsUpdate(host, first.height, first.width)).toBe(false);

    Object.defineProperty(viewport, 'clientHeight', {
      configurable: true,
      value: 700,
    });
    const grown = readGanttFitViewportBox(host);
    expect(grown.height).toBe(700);
    expect(fitHostBoxNeedsUpdate(host, grown.height, grown.width)).toBe(true);
    applyFitHostBox(host, grown.height, grown.width);
    expect(host.style.height).toBe('700px');
    expect(fitHostBoxNeedsUpdate(host, grown.height, grown.width)).toBe(false);

    // Width-only growth still requires setSizes (scale / H track).
    Object.defineProperty(viewport, 'clientWidth', {
      configurable: true,
      value: 1100,
    });
    const wider = readGanttFitViewportBox(host);
    expect(fitHostBoxNeedsUpdate(host, wider.height, wider.width)).toBe(true);

    viewport.remove();
  });

  it('reads height from data-schedule-pane chart box', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-schedule-pane', 'chart');
    Object.defineProperty(pane, 'clientHeight', {
      configurable: true,
      value: 640,
    });
    Object.defineProperty(pane, 'clientWidth', {
      configurable: true,
      value: 900,
    });
    const host = document.createElement('div');
    host.className = 'ppc-gantt-host';
    pane.appendChild(host);
    document.body.appendChild(pane);
    const box = readGanttFitViewportBox(host);
    expect(box.viewport).toBe(pane);
    expect(box.height).toBe(640);
    applyFitHostBox(host, box.height); // width omitted — still sets height attrs
    expect(host.getAttribute('data-gantt-fit-height')).toBe('640');
    expect(host.getAttribute('data-gantt-fit-width')).toBeNull();
    pane.remove();
  });

  it('floors height to 8 rows when viewport is collapsed', () => {
    const viewport = document.createElement('div');
    viewport.className = 'ppc-gantt-viewport';
    Object.defineProperty(viewport, 'clientHeight', {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(viewport, 'clientWidth', {
      configurable: true,
      value: 0,
    });
    const host = document.createElement('div');
    host.className = 'ppc-gantt-host';
    Object.defineProperty(host, 'clientWidth', { configurable: true, value: 0 });
    viewport.appendChild(host);
    document.body.appendChild(viewport);
    const box = readGanttFitViewportBox(host);
    expect(box.height).toBe(32 * 8);
    applyFitHostBox(host, box.height, box.width);
    expect(host.getAttribute('data-gantt-fit-height')).toBe(String(32 * 8));
    viewport.remove();
  });
});
