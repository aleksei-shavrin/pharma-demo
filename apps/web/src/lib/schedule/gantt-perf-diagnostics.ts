/**
 * Optional schedule Gantt operation counters for Playwright BEFORE/AFTER.
 * Enabled only when URL has `ppcGanttPerf=1` (or window flag). Default OFF — no prod cost.
 * certainty: assumption — temporary diagnostic bridge; remove after wave evidence.
 */

export type GanttPerfCounters = {
  parse: number;
  clearAll: number;
  render: number;
  setSizes: number;
  onGanttRender: number;
  overlayPasses: number;
};

const EMPTY: GanttPerfCounters = {
  parse: 0,
  clearAll: 0,
  render: 0,
  setSizes: 0,
  onGanttRender: 0,
  overlayPasses: 0,
};

let enabled = false;
let counters: GanttPerfCounters = { ...EMPTY };

export function isGanttPerfDiagnosticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (enabled) return true;
  try {
    const flag = (window as unknown as { __PPC_GANTT_PERF__?: boolean })
      .__PPC_GANTT_PERF__;
    if (flag) return true;
    return new URLSearchParams(window.location.search).get('ppcGanttPerf') === '1';
  } catch {
    return false;
  }
}

export function enableGanttPerfDiagnostics(on = true): void {
  enabled = on;
  if (on) counters = { ...EMPTY };
}

export function resetGanttPerfCounters(): void {
  counters = { ...EMPTY };
}

export function bumpGanttPerf(
  key: keyof GanttPerfCounters,
  by = 1,
): void {
  if (!isGanttPerfDiagnosticsEnabled()) return;
  counters[key] += by;
}

export function readGanttPerfCounters(): GanttPerfCounters {
  return { ...counters };
}

/** Expose for Playwright page.evaluate. */
export function publishGanttPerfToWindow(): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as {
    __ppcGanttPerf?: {
      reset: () => void;
      read: () => GanttPerfCounters;
      enable: (on?: boolean) => void;
    };
  };
  w.__ppcGanttPerf = {
    reset: resetGanttPerfCounters,
    read: readGanttPerfCounters,
    enable: enableGanttPerfDiagnostics,
  };
}
