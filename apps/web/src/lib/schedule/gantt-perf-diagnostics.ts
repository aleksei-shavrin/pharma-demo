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

export type GanttDebugProbe = {
  posFromDate: (isoDate: string) => number | null;
  dateFromPos: (x: number) => string | null;
  barDatePosition: (taskId: string) => {
    id: string;
    start: string | null;
    end: string | null;
    left: number | null;
    width: number | null;
    top: number | null;
    nativeLeft: number | null;
  } | null;
  headerCellAnchors: () => {
    text: string;
    left: number;
    width: number;
    center: number;
  }[];
};

type GanttDebugHost = {
  posFromDate?: (date: Date) => number;
  dateFromPos?: (x: number) => Date;
  isTaskExists?: (id: string) => boolean;
  getTask?: (id: string) =>
    | {
        start_date?: Date | string;
        end_date?: Date | string;
        id?: string | number;
      }
    | undefined;
  getTaskPosition?: (
    task: {
      start_date?: Date | string;
      end_date?: Date | string;
      id?: string | number;
    },
    start?: Date,
    end?: Date,
  ) => { left?: number; width?: number; top?: number };
};

let debugHost: GanttDebugHost | null = null;

/** Test-only: bind live dhtmlx instance for Playwright geometry probes. */
export function registerGanttDebugHost(host: GanttDebugHost | null): void {
  debugHost = host;
  if (typeof window === 'undefined') return;
  if (!isGanttPerfDiagnosticsEnabled()) return;
  publishGanttDebugToWindow();
}

function parseIsoLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function isoLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildGanttDebugProbe(): GanttDebugProbe {
  return {
    posFromDate(isoDate) {
      const g = debugHost;
      if (!g?.posFromDate) return null;
      try {
        return g.posFromDate(parseIsoLocal(isoDate));
      } catch {
        return null;
      }
    },
    dateFromPos(x) {
      const g = debugHost;
      if (!g?.dateFromPos) return null;
      try {
        const d = g.dateFromPos(x);
        return d instanceof Date && !Number.isNaN(d.getTime())
          ? isoLocal(d)
          : null;
      } catch {
        return null;
      }
    },
    barDatePosition(taskId) {
      const g = debugHost;
      if (!g?.getTask || !g.posFromDate) return null;
      try {
        // Avoid dhtmlx modal "Task not found" — check existence first.
        if (typeof g.isTaskExists === 'function' && !g.isTaskExists(taskId)) {
          return null;
        }
        const task = g.getTask(taskId);
        if (!task?.start_date) return null;
        const start =
          task.start_date instanceof Date
            ? task.start_date
            : parseIsoLocal(String(task.start_date).slice(0, 10));
        const endRaw = task.end_date ?? task.start_date;
        const end =
          endRaw instanceof Date
            ? endRaw
            : parseIsoLocal(String(endRaw).slice(0, 10));
        const left = g.posFromDate(start);
        const right = g.posFromDate(end);
        let nativeLeft: number | null = null;
        let width: number | null = right - left;
        let top: number | null = null;
        if (g.getTaskPosition) {
          const pos = g.getTaskPosition(task, start, end);
          nativeLeft = typeof pos.left === 'number' ? pos.left : null;
          width = typeof pos.width === 'number' ? pos.width : width;
          top = typeof pos.top === 'number' ? pos.top : null;
        }
        return {
          id: String(task.id ?? taskId),
          start: isoLocal(start),
          end: isoLocal(end),
          left,
          width,
          top,
          nativeLeft,
        };
      } catch {
        return null;
      }
    },
    headerCellAnchors() {
      if (typeof document === 'undefined') return [];
      const scale = document.querySelector(
        '.ppc-gantt-host .gantt_task_scale, .ppc-gantt-host .gantt_scale_line',
      );
      if (!scale) return [];
      const sr = scale.getBoundingClientRect();
      return [...scale.querySelectorAll('.gantt_scale_cell')].map((cell) => {
        const r = cell.getBoundingClientRect();
        return {
          text: (cell.textContent || '').trim(),
          left: r.left - sr.left,
          width: r.width,
          center: r.left - sr.left + r.width / 2,
        };
      });
    },
  };
}

/** Expose geometry probe for Playwright (perf flag only). */
export function publishGanttDebugToWindow(): void {
  if (typeof window === 'undefined') return;
  if (!isGanttPerfDiagnosticsEnabled()) return;
  const w = window as unknown as { __ppcGanttDebug?: GanttDebugProbe };
  w.__ppcGanttDebug = buildGanttDebugProbe();
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
  if (isGanttPerfDiagnosticsEnabled()) publishGanttDebugToWindow();
}
