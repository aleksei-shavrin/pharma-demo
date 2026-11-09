/** @vitest-environment jsdom */
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { useEffect, useState, type ComponentType } from 'react';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { WorkstreamStatusMatrix } from '@/components/dashboard/workstream-readiness';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { projectCostFixture } from '@/lib/test/project-cost-fixture';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import {
  EXECUTIVE_TIMELINE_SHORT_LABEL,
  requireExecutiveShortLabel,
} from '@/lib/dashboard/executive-timeline-ids';
import {
  resolveExecutiveMilestones,
  resolveProductionStartBand,
} from '@/lib/dashboard/executive-timeline';
import {
  DASHBOARD_LOWER_GRID_ATTR,
  DASHBOARD_LOWER_LAYOUT_ATTR,
} from '@/lib/dashboard/dashboard-layout';

const fetchDashboardOverview = vi.fn();
const fetchProjectCosts = vi.fn();
const fetchNotifications = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>(
      '@/lib/api-client',
    );
  return {
    ...actual,
    fetchDashboardOverview: (...args: unknown[]) =>
      fetchDashboardOverview(...args),
    fetchProjectCosts: (...args: unknown[]) => fetchProjectCosts(...args),
    fetchNotifications: (...args: unknown[]) => fetchNotifications(...args),
    fetchHealth: vi.fn(),
  };
});

vi.mock('next/dynamic', () => ({
  default: (
    loader: () => Promise<
      | ComponentType<{ model: { snapshotId: string; band: { deltaLabel: string; baselineDate: string; forecastDate: string; coincident: boolean } }; milestoneMeta: unknown }>
      | {
          default: ComponentType<{
            model: {
              snapshotId: string;
              band: {
                deltaLabel: string;
                baselineDate: string;
                forecastDate: string;
                coincident: boolean;
              };
            };
            milestoneMeta: unknown;
          }>;
        }
    >,
  ) => {
    function Lazy(props: {
      model: {
        snapshotId: string;
        band: {
          deltaLabel: string;
          baselineDate: string;
          forecastDate: string;
          coincident: boolean;
        };
      };
      milestoneMeta: unknown;
    }) {
      const [Comp, setComp] = useState<ComponentType<{
        model: typeof props.model;
        milestoneMeta: unknown;
      }> | null>(null);
      useEffect(() => {
        let cancelled = false;
        void loader().then((mod) => {
          if (cancelled) return;
          const resolved =
            typeof mod === 'function' ? mod : mod.default;
          setComp(() => resolved);
        });
        return () => {
          cancelled = true;
        };
      }, []);
      if (!Comp) return <div data-testid="dynamic-loading" />;
      return <Comp {...props} />;
    }
    return Lazy;
  },
}));

vi.mock('./executive-timeline-echarts', () => ({
  ExecutiveTimelineEcharts: ({
    model,
  }: {
    model: {
      snapshotId: string;
      band: {
        deltaLabel: string;
        baselineDate: string;
        forecastDate: string;
        coincident: boolean;
      };
      textSummary?: string;
    };
  }) => (
    <div
      data-timeline-renderer="echarts"
      data-timeline-layout="experiment-echarts-lanes"
      data-testid="echarts-renderer"
    >
      <div data-snapshot-label>Дата снимка</div>
      <div role="img" aria-label={model.textSummary ?? `echarts:${model.snapshotId}`} />
    </div>
  ),
}));

function renderView(snapshotId: SnapshotId) {
  return render(
    <SnapshotProvider>
      <DashboardView
        data={dashboardOverviewFixture(snapshotId)}
        projectCost={projectCostFixture(snapshotId)}
      />
    </SnapshotProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  sessionStorage.clear();
  fetchDashboardOverview.mockImplementation(
    async (_id: string, snapshot: SnapshotId) =>
      dashboardOverviewFixture(snapshot),
  );
  fetchProjectCosts.mockImplementation(
    async (_id: string, snapshot: SnapshotId) => ({
      snapshotId: snapshot,
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRT-01',
      project: projectCostFixture(snapshot),
      workstreams: [],
      equipment: [],
      reconciliation: {
        workstreamEacSumRub: 0,
        projectLevelForecastRub: 0,
      },
    }),
  );
  fetchNotifications.mockResolvedValue({
    snapshotId: '01',
    scenarioAsOfDate: '2027-02-15',
    projectId: 'PRT-01',
    items: [],
  });
});

function projectStatusBlock() {
  return document.querySelector(
    '[data-dashboard-block="project-status"]',
  ) as HTMLElement;
}

describe('Dashboard R2-U1-R2 IA / lifecycle', () => {
  it('portfolio summary shows PRT-01 container id (not legacy PRJ-01)', () => {
    renderView('03');
    const block = projectStatusBlock();
    expect(block.textContent).toContain('PRT-01');
    expect(block.textContent).not.toContain('PRJ-01');
    expect(dashboardOverviewFixture('03').project.id).toBe('PRT-01');
  });

  it('executive overview → timeline → lower-cards (left People→Attention→Changes; right Exceptions→Decision)', () => {
    renderView('03');
    const root = document.querySelector('[data-dashboard="r2-u1"]')!;
    expect(root).toHaveAttribute('data-dashboard-ia', 'r2-u1-r7');

    const overview = root.querySelector(
      '[data-dashboard-block="executive-overview"]',
    )!;
    expect(
      overview.querySelector('[data-dashboard-block="project-status"]'),
    ).toBeTruthy();
    expect(
      overview.querySelector('[data-dashboard-block="program-readiness"]'),
    ).toBeTruthy();
    expect(
      overview.querySelector('[data-overview-stretch="full-height"]'),
    ).toBeTruthy();
    expect(
      overview.querySelector('[data-summary-grid="stretch"]'),
    ).toBeTruthy();

    const lower = root.querySelector('[data-dashboard-block="lower-cards"]')!;
    expect(lower).toHaveAttribute(
      'data-dashboard-layout',
      DASHBOARD_LOWER_LAYOUT_ATTR,
    );
    expect(lower).toHaveAttribute('data-dashboard-grid', DASHBOARD_LOWER_GRID_ATTR);
    expect(lower.className).toMatch(/\bgrid\b/);
    expect(lower.className).toMatch(/\bgrid-cols-1\b/);
    expect(lower.className).toMatch(/\blg:grid-cols-2\b/);
    expect(lower.className).toMatch(/\bitems-start\b/);

    const left = lower.querySelector('[data-dashboard-lower-column="left"]')!;
    const right = lower.querySelector('[data-dashboard-lower-column="right"]')!;
    expect(
      [...left.children].map((el) => el.getAttribute('data-dashboard-block')),
    ).toEqual(['people-focus', 'management-attention', 'trend']);
    expect(
      [...right.children].map((el) => el.getAttribute('data-dashboard-block')),
    ).toEqual(['top-exceptions', 'decisions']);
    // Narrow DOM order: left column before right → People before Exceptions.
    expect(
      [...lower.children].map((el) =>
        el.getAttribute('data-dashboard-lower-column'),
      ),
    ).toEqual(['left', 'right']);

    const blocks = [
      ...root.querySelectorAll('[data-dashboard-block]'),
    ].map((el) => el.getAttribute('data-dashboard-block'));

    expect(blocks.indexOf('executive-overview')).toBeLessThan(
      blocks.indexOf('executive-timeline')!,
    );
    expect(blocks.indexOf('executive-timeline')).toBeLessThan(
      blocks.indexOf('lower-cards')!,
    );
    expect(blocks.indexOf('program-readiness')).toBeGreaterThanOrEqual(0);
    expect(blocks.indexOf('program-readiness')).toBeLessThan(
      blocks.indexOf('executive-timeline')!,
    );
  });

  it('Snapshot A empty exceptions/attention stay compact', () => {
    renderView('01');
    expect(document.querySelector('[data-top-exceptions="empty"]')).toBeTruthy();
    expect(screen.getByText(/Нет активных управленческих сигналов/)).toBeTruthy();
  });

  it('cost signal 01: EAC=BAC VAC=0; 19: EAC 6.28B VAC -80M', () => {
    renderView('01');
    const signal = document.querySelector('[data-cost-signal]')!;
    expect(signal).toHaveAttribute('data-eac', '6200000000');
    expect(signal).toHaveAttribute('data-vac', '0');
    cleanup();
    renderView('19');
    const s = document.querySelector('[data-cost-signal]')!;
    expect(s).toHaveAttribute('data-eac', '6280000000');
    expect(s).toHaveAttribute('data-vac', '-80000000');
  });

  it('program rows: name|badge|progress; status on badge only (no row RAG fill)', () => {
    // Contract after dashboard-program-people-layout: data-program-layout=name-badge-progress
    // (replaces obsolete compact-rag row fills). Badge carries status tone; row stays neutral.
    renderView('03');
    const matrix = document.querySelector(
      '[data-program-layout="name-badge-progress"]',
    );
    expect(matrix).toBeTruthy();
    const cells = document.querySelectorAll('[data-program]');
    expect(cells.length).toBe(7);
    for (const cell of cells) {
      expect(cell.className).toMatch(/cursor-pointer/);
      expect(cell).toHaveAttribute('data-program-row', 'name-badge-progress');
      expect(cell).toHaveAttribute('data-rag-surface', 'neutral');
      expect(cell.className).not.toMatch(/status-danger-bg/);
      expect(cell.className).not.toMatch(/status-warn-bg/);
      const status = cell.getAttribute('data-program-status');
      expect(['Red', 'Yellow', 'Green']).toContain(status);
      const badge = cell.querySelector(
        `[data-program-status-badge="${status}"]`,
      );
      expect(badge).toBeTruthy();
      expect(badge).toHaveAttribute(
        'data-program-status-badge-compact',
        'true',
      );
      if (status === 'Red') {
        expect(badge?.className).toMatch(/status-danger-/);
      } else if (status === 'Yellow') {
        expect(badge?.className).toMatch(/status-warn-/);
      } else {
        expect(badge?.className).toMatch(/status-ok-/);
      }
      const progress = cell.querySelector('[data-program-progress="true"]');
      expect(progress).toBeTruthy();
      expect(progress).toHaveAttribute('data-program-progress-width', 'fixed');
    }
  });

  it('program readiness orders Red before Yellow and keeps catalog order', () => {
    const data = dashboardOverviewFixture('03');
    render(
      <SnapshotProvider>
        <WorkstreamStatusMatrix data={data} />
      </SnapshotProvider>,
    );
    const ids = [...document.querySelectorAll('[data-program]')].map((el) =>
      el.getAttribute('data-program'),
    );
    expect(ids).toEqual([
      'PRG-CON',
      'PRG-ENG',
      'PRG-DSN',
      'PRG-EQP',
      'PRG-DIG',
      'PRG-STA',
      'PRG-ORG',
    ]);
  });

  it('O recovery +7; P Red; Q Yellow baseline passed; R Yellow; S Green achieved', () => {
    renderView('15');
    expect(
      document.querySelector('[data-ps-delta]')?.textContent,
    ).toMatch(/\+7/);
    expect(
      within(projectStatusBlock()).getByText('Критично'),
    ).toBeInTheDocument();
    cleanup();

    renderView('16');
    expect(
      within(projectStatusBlock()).getByText('Критично'),
    ).toBeInTheDocument();
    cleanup();

    renderView('17');
    expect(
      within(projectStatusBlock()).getByText('Требует внимания'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-ps-baseline-passed]'),
    ).toBeTruthy();
    cleanup();

    renderView('18');
    expect(
      within(projectStatusBlock()).getByText('Требует внимания'),
    ).toBeInTheDocument();
    cleanup();

    renderView('19');
    const status = document.querySelector(
      '[data-dashboard-block="project-status"]',
    )!;
    expect(
      within(status as HTMLElement).getByText('В норме'),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-ps-achieved]')).toBeTruthy();
  });

  it('stable executive map A/O/S: same 12 IDs + deliberate short labels', async () => {
    const expected = [
      'MS-BLD-EXC',
      'MS-CLN-PANEL',
      'MS-UTL-PWR',
      'MS-BLD-ENCL',
      'MS-CLN-RDY',
      'MS-HVAC-IQ',
      'MS-UTL-WFI',
      'MS-PRD-INST',
      'MS-PKG-SAT',
      'MS-COM-OQ',
      'MS-COM-GO',
      'MS-PS',
    ];

    for (const snap of ['01', '15', '19'] as const) {
      const points = resolveExecutiveMilestones(
        dashboardOverviewFixture(snap),
      );
      expect(points.map((p) => p.id).sort()).toEqual([...expected].sort());
      expect(points).toHaveLength(12);
    }

    renderView('01');
    const stripA = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    )!;
    expect(stripA.querySelector('[data-timeline-scope-filter]')).toBeTruthy();
    await waitFor(() => {
      expect(
        stripA.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(stripA.querySelector('[data-timeline-renderer-toggle]')).toBeNull();
    expect(stripA.querySelector('[data-timeline-ps-legend]')).toBeNull();
    expect(stripA.querySelector('[data-timeline-meta-row]')).toBeNull();
    expect(stripA.textContent).not.toMatch(/Go\/No-Go/);
    expect(resolveProductionStartBand(dashboardOverviewFixture('01')).coincident).toBe(
      true,
    );
    cleanup();

    renderView('15');
    const strip = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    )!;
    await waitFor(() => {
      expect(
        strip.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(strip.querySelector('[data-timeline-ps-legend]')).toBeNull();
    expect(resolveProductionStartBand(dashboardOverviewFixture('15')).deltaDays).toBe(
      7,
    );

    const points = resolveExecutiveMilestones(dashboardOverviewFixture('01'));
    for (const p of points) {
      expect(requireExecutiveShortLabel(p.id)).toBe(p.shortLabel);
      expect(p.shortLabel).not.toMatch(/\.\.\./);
      expect(p.shortLabel).not.toMatch(/MS-/);
    }
    expect(EXECUTIVE_TIMELINE_SHORT_LABEL['MS-BLD-ENCL']).toBe('Контур здания');
    expect(EXECUTIVE_TIMELINE_SHORT_LABEL['MS-COM-GO']).toBe(
      'Решение о запуске',
    );
  });

  it('R2-U1-R9: PS band on S — historical +7, Green project (no DOM legend row)', async () => {
    renderView('19');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(document.querySelector('[data-snapshot-label]')).toBeTruthy();
    expect(document.querySelector('[data-timeline-ps-legend]')).toBeNull();
    const band = resolveProductionStartBand(dashboardOverviewFixture('19'));
    expect(band.deltaDays).toBe(7);
    expect(band.baselineDate).toBe('2027-09-15');
    expect(band.forecastDate).toBe('2027-09-22');
    expect(
      document.querySelector('[data-summary-zone="condition"]')?.textContent,
    ).toMatch(/В норме/i);
  });

  it('R2-U1-R9: O delayed PS band — forecast +7 (chart labels, no meta legend)', async () => {
    renderView('15');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(document.querySelector('[data-timeline-ps-legend]')).toBeNull();
    const band = resolveProductionStartBand(dashboardOverviewFixture('15'));
    expect(band.coincident).toBe(false);
    expect(band.deltaDays).toBe(7);
    expect(band.baselineDate).toBe('2027-09-15');
    expect(band.forecastDate).toBe('2027-09-22');
    const points = resolveExecutiveMilestones(dashboardOverviewFixture('15'));
    expect(points.some((p) => p.id === 'MS-COM-GO')).toBe(true);
  });

  it('R2-U1-R9: coincident A — по плану band, no +0, no meta legend', async () => {
    renderView('01');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(document.querySelector('[data-timeline-ps-legend]')).toBeNull();
    const band = resolveProductionStartBand(dashboardOverviewFixture('01'));
    expect(band.coincident).toBe(true);
    expect(band.deltaLabel).toMatch(/По плану|по плану/i);
    expect(band.baselineDate).toBe('2027-09-15');
    expect(band.deltaDays).toBe(0);
  });

  it('R2-U1-R7: independent columns + fill pair scroll caps', () => {
    renderView('03');
    expect(
      document.querySelector('[data-attention-layout="matrix-2x2"]'),
    ).toBeTruthy();

    const lower = document.querySelector('[data-dashboard-block="lower-cards"]')!;
    expect(lower.children).toHaveLength(2);
    expect(lower.className).toMatch(/\blg:grid-cols-2\b/);
    expect(lower.className).toMatch(/\bitems-start\b/);

    const exCard = document.querySelector(
      '[data-dashboard-block="top-exceptions"]',
    );
    const exList = document.querySelector('[data-top-exceptions="list"]');
    expect(exCard?.className).toMatch(/max-h-\[28rem\]/);
    expect(exList).toHaveAttribute('data-exceptions-scroll', 'fill');
    expect(exList?.className).toMatch(/overflow-y-auto/);
    expect(exList?.className).toMatch(/flex-1/);
    expect(exList?.className).toMatch(/min-h-0/);
    expect(exList?.getAttribute('style') ?? '').not.toMatch(/14\.25rem/);

    cleanup();
    renderView('07');
    const decCard = document.querySelector(
      '[data-dashboard-block="decisions"]',
    );
    expect(decCard).toBeTruthy();
    expect(decCard?.className).toMatch(/max-h-\[28rem\]/);
    expect(decCard?.className).toMatch(/min-h-0/);
    expect(decCard?.getAttribute('style') ?? '').not.toMatch(/14\.25rem/);
    expect(
      document.querySelector('[data-dashboard-block="people-focus"]'),
    ).toBeTruthy();
  });
});

describe('Lower cards — two independent columns', () => {
  it('Snapshot 01: left stack full; right exceptions only (no Decision hole)', () => {
    renderView('01');
    const grids = document.querySelectorAll(
      `[data-dashboard-grid="${DASHBOARD_LOWER_GRID_ATTR}"]`,
    );
    expect(grids).toHaveLength(1);
    const grid = grids[0]!;
    expect(grid).toHaveAttribute(
      'data-dashboard-layout',
      DASHBOARD_LOWER_LAYOUT_ATTR,
    );
    const left = grid.querySelector('[data-dashboard-lower-column="left"]')!;
    const right = grid.querySelector('[data-dashboard-lower-column="right"]')!;
    expect(
      [...left.children].map((el) => el.getAttribute('data-dashboard-block')),
    ).toEqual(['people-focus', 'management-attention', 'trend']);
    expect(
      [...right.children].map((el) => el.getAttribute('data-dashboard-block')),
    ).toEqual(['top-exceptions']);
    expect(
      document.querySelector('[data-dashboard-block="decisions"]'),
    ).toBeNull();
  });

  it('Snapshot 03: left People→Attention→Changes; right Exceptions→Decision', () => {
    renderView('03');
    const grid = document.querySelector('[data-dashboard-block="lower-cards"]')!;
    const left = grid.querySelector('[data-dashboard-lower-column="left"]')!;
    const right = grid.querySelector('[data-dashboard-lower-column="right"]')!;
    expect(
      [...left.children].map((el) => el.getAttribute('data-dashboard-block')),
    ).toEqual(['people-focus', 'management-attention', 'trend']);
    expect(
      [...right.children].map((el) => el.getAttribute('data-dashboard-block')),
    ).toEqual(['top-exceptions', 'decisions']);
  });

  it('Snapshot 07: same independent column order', () => {
    renderView('07');
    const grid = document.querySelector('[data-dashboard-block="lower-cards"]')!;
    const left = grid.querySelector('[data-dashboard-lower-column="left"]')!;
    const right = grid.querySelector('[data-dashboard-lower-column="right"]')!;
    expect(
      [...left.children].map((el) => el.getAttribute('data-dashboard-block')),
    ).toEqual(['people-focus', 'management-attention', 'trend']);
    expect(
      [...right.children].map((el) => el.getAttribute('data-dashboard-block')),
    ).toEqual(['top-exceptions', 'decisions']);
  });
});
