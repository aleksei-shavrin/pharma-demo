/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import {
  bumpGanttPerf,
  enableGanttPerfDiagnostics,
  publishGanttPerfToWindow,
  readGanttPerfCounters,
  resetGanttPerfCounters,
} from './gantt-perf-diagnostics';

describe('gantt-perf-diagnostics', () => {
  afterEach(() => {
    enableGanttPerfDiagnostics(false);
    resetGanttPerfCounters();
    const w = window as unknown as {
      __ppcGanttPerf?: unknown;
      __PPC_GANTT_PERF__?: unknown;
    };
    delete w.__ppcGanttPerf;
    delete w.__PPC_GANTT_PERF__;
  });

  it('ignores bumps when disabled', () => {
    enableGanttPerfDiagnostics(false);
    bumpGanttPerf('parse');
    expect(readGanttPerfCounters().parse).toBe(0);
  });

  it('counts bumps when enabled and publishes window bridge', () => {
    enableGanttPerfDiagnostics(true);
    bumpGanttPerf('parse');
    bumpGanttPerf('parse');
    bumpGanttPerf('clearAll');
    expect(readGanttPerfCounters()).toMatchObject({ parse: 2, clearAll: 1 });
    publishGanttPerfToWindow();
    const bridge = (
      window as unknown as {
        __ppcGanttPerf?: { read: () => { parse: number }; reset: () => void };
      }
    ).__ppcGanttPerf;
    expect(bridge?.read().parse).toBe(2);
    bridge?.reset();
    expect(readGanttPerfCounters().parse).toBe(0);
  });
});
