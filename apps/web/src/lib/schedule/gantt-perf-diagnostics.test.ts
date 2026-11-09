/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import {
  bumpGanttPerf,
  enableGanttPerfDiagnostics,
  publishGanttDebugToWindow,
  publishGanttPerfToWindow,
  readGanttPerfCounters,
  registerGanttDebugHost,
  resetGanttPerfCounters,
} from './gantt-perf-diagnostics';

describe('gantt-perf-diagnostics', () => {
  afterEach(() => {
    enableGanttPerfDiagnostics(false);
    resetGanttPerfCounters();
    registerGanttDebugHost(null);
    const w = window as unknown as {
      __ppcGanttPerf?: unknown;
      __ppcGanttDebug?: unknown;
      __PPC_GANTT_PERF__?: unknown;
    };
    delete w.__ppcGanttPerf;
    delete w.__ppcGanttDebug;
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

  it('publishes posFromDate debug probe when perf enabled', () => {
    enableGanttPerfDiagnostics(true);
    registerGanttDebugHost({
      posFromDate: (d) => d.getFullYear() * 100 + d.getMonth() + 1,
      dateFromPos: () => new Date(2027, 8, 15),
      isTaskExists: (id) => id === 'work:1.2.2',
      getTask: () => ({
        id: 'work:1.2.2',
        start_date: new Date(2026, 7, 1),
        end_date: new Date(2026, 7, 15),
      }),
      getTaskPosition: () => ({ left: 120, width: 40, top: 10 }),
    });
    publishGanttDebugToWindow();
    const dbg = (
      window as unknown as {
        __ppcGanttDebug?: {
          posFromDate: (iso: string) => number | null;
          dateFromPos: (x: number) => string | null;
          barDatePosition: (
            id: string,
          ) => { left: number | null; nativeLeft: number | null } | null;
          headerCellAnchors: () => { text: string; width: number }[];
        };
      }
    ).__ppcGanttDebug;
    expect(dbg?.posFromDate('2027-09-15')).toBe(202709);
    expect(dbg?.dateFromPos(0)).toBe('2027-09-15');
    expect(dbg?.barDatePosition('missing')).toBeNull();
    expect(dbg?.barDatePosition('work:1.2.2')?.left).toBe(202608);
    expect(dbg?.barDatePosition('work:1.2.2')?.nativeLeft).toBe(120);
    // Header anchors need a host scale in DOM.
    document.body.innerHTML =
      '<div class="ppc-gantt-host"><div class="gantt_task_scale"><div class="gantt_scale_cell">авг 26</div></div></div>';
    const cells = dbg?.headerCellAnchors() ?? [];
    expect(cells.length).toBe(1);
    expect(cells[0]?.text).toBe('авг 26');
  });

  it('debug probe returns nulls when host methods throw or missing', () => {
    enableGanttPerfDiagnostics(true);
    registerGanttDebugHost({
      posFromDate: () => {
        throw new Error('boom');
      },
      getTask: () => {
        throw new Error('boom');
      },
    });
    publishGanttDebugToWindow();
    const dbg = (
      window as unknown as {
        __ppcGanttDebug?: {
          posFromDate: (iso: string) => number | null;
          barDatePosition: (id: string) => unknown;
          headerCellAnchors: () => unknown[];
        };
      }
    ).__ppcGanttDebug;
    expect(dbg?.posFromDate('2027-01-01')).toBeNull();
    expect(dbg?.barDatePosition('work:1.2.2')).toBeNull();
    document.body.innerHTML = '';
    expect(dbg?.headerCellAnchors()).toEqual([]);
  });
});
