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
import { DASHBOARD_LOWER_GRID_ATTR } from '@/lib/dashboard/dashboard-layout';
import { formatDateRu } from '@/lib/format/ru';

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
        void loader().then((mod) => {
          const resolved =
            typeof mod === 'function' ? mod : mod.default;
          setComp(() => resolved);
        });
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
      <div data-timeline-ps-legend="true">
        План запуска: {formatDateRu(model.band.baselineDate)} Прогноз:{' '}
        {formatDateRu(model.band.forecastDate)} Δ: {model.band.deltaLabel}
        {model.band.coincident ? ' По плану' : ''}
      </div>
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
      projectId: 'PRJ-01',
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
    snapshotId: 'A',
    scenarioAsOfDate: '2027-02-15',
    projectId: 'PRJ-01',
    items: [],
  });
});

describe('Dashboard R2-U1-R2 IA / lifecycle', () => {
  it('executive overview → timeline → lower-cards (Exceptions → Decision → Attention → Changes)', () => {
    renderView('C');
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
    const lowerChildren = [...lower.children];
    expect(lowerChildren).toHaveLength(4);
    expect(
      lowerChildren.map((el) => el.getAttribute('data-dashboard-block')),
    ).toEqual(['top-exceptions', 'decisions', 'management-attention', 'trend']);
    expect(lower).toHaveAttribute('data-dashboard-layout', 'two-col-auto-flow');
    expect(lower).toHaveAttribute('data-dashboard-grid', DASHBOARD_LOWER_GRID_ATTR);
    expect(lower.className).toMatch(/\bgrid\b/);
    expect(lower.className).toMatch(/\bgrid-cols-1\b/);
    expect(lower.className).toMatch(/\blg:grid-cols-2\b/);

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
    renderView('A');
    expect(document.querySelector('[data-top-exceptions="empty"]')).toBeTruthy();
    expect(screen.getByText(/Нет активных управленческих сигналов/)).toBeTruthy();
  });

  it('cost signal A: EAC=BAC VAC=0; S: EAC 6.28B VAC -80M', () => {
    renderView('A');
    const signal = document.querySelector('[data-cost-signal]')!;
    expect(signal).toHaveAttribute('data-eac', '6200000000');
    expect(signal).toHaveAttribute('data-vac', '0');
    cleanup();
    renderView('S');
    const s = document.querySelector('[data-cost-signal]')!;
    expect(s).toHaveAttribute('data-eac', '6280000000');
    expect(s).toHaveAttribute('data-vac', '-80000000');
  });

  it('program rows: Red/Yellow persistent surfaces; Green neutral', () => {
    renderView('C');
    const matrix = document.querySelector(
      '[data-program-layout="compact-rag"]',
    );
    expect(matrix).toBeTruthy();
    for (const cell of document.querySelectorAll('[data-program]')) {
      expect(cell.className).toMatch(/cursor-pointer/);
      const status = cell.getAttribute('data-program-status');
      expect(['Red', 'Yellow', 'Green']).toContain(status);
      if (status === 'Red') {
        expect(cell).toHaveAttribute('data-rag-surface', 'persistent');
        expect(cell.className).toMatch(/status-danger-bg/);
      } else if (status === 'Yellow') {
        expect(cell).toHaveAttribute('data-rag-surface', 'persistent');
        expect(cell.className).toMatch(/status-warn-bg/);
      } else {
        expect(cell).toHaveAttribute('data-rag-surface', 'neutral');
        expect(cell.className).not.toMatch(/status-ok-bg/);
        expect(cell.className).toMatch(/bg-transparent/);
      }
    }
  });

  it('program readiness orders Red before Yellow and keeps catalog order', () => {
    const data = dashboardOverviewFixture('C');
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
    renderView('O');
    expect(
      document.querySelector('[data-ps-delta]')?.textContent,
    ).toMatch(/\+7/);
    expect(screen.getByText('Красный')).toBeInTheDocument();
    cleanup();

    renderView('P');
    expect(screen.getByText('Красный')).toBeInTheDocument();
    cleanup();

    renderView('Q');
    expect(screen.getByText('Жёлтый')).toBeInTheDocument();
    expect(
      document.querySelector('[data-ps-baseline-passed]'),
    ).toBeTruthy();
    cleanup();

    renderView('R');
    expect(screen.getByText('Жёлтый')).toBeInTheDocument();
    cleanup();

    renderView('S');
    const status = document.querySelector(
      '[data-dashboard-block="project-status"]',
    )!;
    expect(
      within(status as HTMLElement).getByText('Зелёный'),
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

    for (const snap of ['A', 'O', 'S'] as const) {
      const points = resolveExecutiveMilestones(
        dashboardOverviewFixture(snap),
      );
      expect(points.map((p) => p.id).sort()).toEqual([...expected].sort());
      expect(points).toHaveLength(12);
    }

    renderView('A');
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
    expect(stripA.textContent).toMatch(/Предпроект|План запуска/);
    expect(stripA.textContent).not.toMatch(/Go\/No-Go/);
    cleanup();

    renderView('O');
    const strip = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    )!;
    await waitFor(() => {
      expect(
        strip.querySelector('[data-timeline-ps-legend="true"]'),
      ).toBeTruthy();
    });
    expect(strip.querySelector('[data-timeline-ps-legend]')?.textContent).toMatch(
      /\+7/,
    );

    const points = resolveExecutiveMilestones(dashboardOverviewFixture('A'));
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

  it('R2-U1-R9: PS legend on S — historical +7, Green project', async () => {
    renderView('S');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(document.querySelector('[data-snapshot-label]')).toBeTruthy();
    const legend = document.querySelector('[data-timeline-ps-legend]')!;
    expect(legend.textContent).toMatch(/15\.09\.2027/);
    expect(legend.textContent).toMatch(/22\.09\.2027/);
    expect(legend.textContent).toMatch(/\+7/);
    const band = resolveProductionStartBand(dashboardOverviewFixture('S'));
    expect(band.deltaDays).toBe(7);
    expect(
      document.querySelector('[data-summary-zone="condition"]')?.textContent,
    ).toMatch(/Зелён/i);
  });

  it('R2-U1-R9: O delayed PS legend — forecast +7', async () => {
    renderView('O');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-ps-legend]'),
      ).toBeTruthy();
    });
    const legend = document.querySelector('[data-timeline-ps-legend]')!;
    expect(legend.textContent).toMatch(/15\.09\.2027/);
    expect(legend.textContent).toMatch(/22\.09\.2027/);
    expect(legend.textContent).toMatch(/\+7/);
    const band = resolveProductionStartBand(dashboardOverviewFixture('O'));
    expect(band.coincident).toBe(false);
    expect(band.deltaDays).toBe(7);
    const points = resolveExecutiveMilestones(dashboardOverviewFixture('O'));
    expect(points.some((p) => p.id === 'MS-COM-GO')).toBe(true);
  });

  it('R2-U1-R9: coincident A — по плану, no +0', async () => {
    renderView('A');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-ps-legend]'),
      ).toBeTruthy();
    });
    const legend = document.querySelector('[data-timeline-ps-legend]')!;
    expect(legend.textContent).toMatch(/По плану|по плану/i);
    expect(legend.textContent).toMatch(/15\.09\.2027/);
    expect(legend.textContent).not.toMatch(/\+0/);
    const band = resolveProductionStartBand(dashboardOverviewFixture('A'));
    expect(band.coincident).toBe(true);
  });

  it('R2-U1-R7: single lower grid siblings + fill pair scroll', () => {
    renderView('C');
    expect(
      document.querySelector('[data-attention-layout="matrix-2x2"]'),
    ).toBeTruthy();

    const lower = document.querySelector('[data-dashboard-block="lower-cards"]')!;

    expect(lower.children).toHaveLength(4);
    for (const child of lower.children) {
      expect(child.parentElement).toBe(lower);
    }

    expect(lower.className).toMatch(/\blg:grid-cols-2\b/);
    expect(lower.className).toMatch(/\bgrid-cols-1\b/);

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
    renderView('G');
    const decCard = document.querySelector(
      '[data-dashboard-block="decisions"]',
    );
    const decisions = document.querySelector('[data-decisions="list"]');
    expect(decCard?.className).toMatch(/max-h-\[28rem\]/);
    expect(decisions).toHaveAttribute('data-decisions-scroll', 'fill');
    expect(decisions?.className).toMatch(/overflow-y-auto/);
    expect(decisions?.className).toMatch(/flex-1/);
    expect(decisions?.className).toMatch(/min-h-0/);
    expect(decisions?.getAttribute('style') ?? '').not.toMatch(/14\.25rem/);
  });
});

describe('B11 lower cards — single auto-flow grid', () => {
  it('Snapshot A: one grid, three dense cards, no separate row hole', () => {
    renderView('A');
    const grids = document.querySelectorAll(
      `[data-dashboard-grid="${DASHBOARD_LOWER_GRID_ATTR}"]`,
    );
    expect(grids).toHaveLength(1);
    expect(
      document.querySelector('[data-dashboard-block="exceptions-decisions"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-dashboard-block="attention-changes"]'),
    ).toBeNull();

    const grid = grids[0]!;
    expect(grid).toHaveAttribute('data-dashboard-block', 'lower-cards');
    const blocks = [...grid.children].map((el) =>
      el.getAttribute('data-dashboard-block'),
    );
    expect(blocks).toEqual(['top-exceptions', 'management-attention', 'trend']);
    expect(document.querySelector('[data-dashboard-block="decisions"]')).toBeNull();
  });

  it('Snapshot C: four cards Exceptions → Decision → Attention → Changes', () => {
    renderView('C');
    const grid = document.querySelector('[data-dashboard-block="lower-cards"]')!;
    expect(
      [...grid.children].map((el) => el.getAttribute('data-dashboard-block')),
    ).toEqual(['top-exceptions', 'decisions', 'management-attention', 'trend']);
  });

  it('Snapshot G: four cards in canonical order', () => {
    renderView('G');
    const grid = document.querySelector('[data-dashboard-block="lower-cards"]')!;
    expect(
      [...grid.children].map((el) => el.getAttribute('data-dashboard-block')),
    ).toEqual(['top-exceptions', 'decisions', 'management-attention', 'trend']);
  });
});
