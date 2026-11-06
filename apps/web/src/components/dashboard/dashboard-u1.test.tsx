/** @vitest-environment jsdom */
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
import { resolveExecutiveMilestones } from '@/lib/dashboard/executive-timeline';
import { DASHBOARD_LOWER_GRID_ATTR } from '@/lib/dashboard/dashboard-layout';

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

  it('stable executive map A/O/S: same 12 IDs + deliberate short labels', () => {
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
    expect(stripA.querySelector('[data-milestone-label="MS-BLD-EXC"]')).toBeTruthy();
    expect(stripA.querySelector('[data-milestone-label="MS-COM-GO"]')).toBeTruthy();
    expect(stripA.querySelector('[data-milestone-label="MS-PS"]')).toBeTruthy();
    expect(stripA.textContent).toMatch(/Котлован/);
    expect(stripA.textContent).toMatch(/Контур здания/);
    expect(stripA.textContent).toMatch(/Решение о запуске/);
    expect(stripA.textContent).not.toMatch(/Go\/No-Go/);
    expect(stripA.textContent).toMatch(/Готовность HVAC/);
    expect(stripA.textContent).toMatch(/Вода WFI/);
    expect(stripA.textContent).toMatch(/SAT упаковки/);
    expect(stripA.textContent).toMatch(/Квалификация OQ/);
    expect(stripA.textContent).toMatch(/Запуск производства/);
    cleanup();

    renderView('O');
    const strip = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    )!;
    expect(strip.querySelector('[data-milestone-label="MS-BLD-EXC"]')).toBeTruthy();
    expect(strip.querySelector('[data-ps-cluster]')).toBeTruthy();
    expect(strip.querySelector('[data-milestone-label="MS-PS"]')).toBeTruthy();
    expect(
      strip.querySelector('[data-milestone-label="MS-COM-GO"]'),
    ).toBeTruthy();
    expect(strip.querySelector('[data-marker-stem="true"]')).toBeTruthy();
    expect(strip.querySelector('[data-stem-attached="marker"]')).toBeTruthy();

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

  it('R2-U1-R9: PS cluster on S — actual, historical +7, Green project', () => {
    renderView('S');
    const track = document.querySelector('[data-timeline-track]')!;
    expect(track).toHaveAttribute('data-timeline-layout', 'r2-u1-r9');
    expect(track.className).toMatch(/overflow-x-hidden/);
    expect(track.className).not.toMatch(/overflow-x-auto/);

    const snap = document.querySelector('[data-snapshot-label]')!;
    expect(snap).toHaveAttribute('data-label-lane', '2');
    expect(snap).toHaveAttribute('data-label-side', 'above');

    const clusters = document.querySelectorAll('[data-ps-cluster]');
    expect(clusters).toHaveLength(1);
    const cluster = clusters[0]!;
    expect(cluster).toHaveAttribute('data-ps-cluster-state', 'actual');
    expect(cluster).toHaveAttribute('data-ps-delta-tone', 'historical');
    expect(cluster.textContent).toMatch(/Запуск производства/);
    expect(cluster.textContent).toMatch(/План 15\.09\.2027/);
    expect(cluster.textContent).toMatch(/факт 22\.09\.2027/);
    expect(cluster.textContent).toMatch(/\+7 дней/);
    expect(cluster.textContent).not.toMatch(/прогноз/i);
    expect(
      document.querySelectorAll('[data-timeline-marker="ps-baseline"]'),
    ).toHaveLength(0);
    expect(
      document.querySelectorAll('[data-timeline-marker="ps-forecast"]'),
    ).toHaveLength(0);
    expect(
      document.querySelector('[data-ps-connector="baseline-current"]'),
    ).toBeTruthy();
    const stem = document.querySelector('[data-ps-cluster-stem]');
    expect(stem).toBeTruthy();
    expect(stem).toHaveAttribute('data-ps-leader-attached', 'current');
    expect(
      document.querySelector('[data-milestone-label="MS-COM-GO"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-ps-delta-line]')?.className,
    ).not.toMatch(/status-danger/);
    // Achieved S remains overall Green — historical +7 must not read as active danger.
    expect(
      document.querySelector('[data-summary-zone="condition"]')?.textContent,
    ).toMatch(/Зелён/i);
  });

  it('R2-U1-R9: O delayed PS cluster — forecast, connector, leader attached', () => {
    renderView('O');
    const clusters = document.querySelectorAll('[data-ps-cluster]');
    expect(clusters).toHaveLength(1);
    const cluster = clusters[0]!;
    expect(cluster).toHaveAttribute('data-ps-cluster-state', 'forecast');
    expect(cluster).toHaveAttribute('data-ps-delta-tone', 'active');
    expect(cluster.textContent).toMatch(/Запуск производства/);
    expect(cluster.textContent).toMatch(/План 15\.09\.2027/);
    expect(cluster.textContent).toMatch(/прогноз 22\.09\.2027/);
    expect(cluster.textContent).toMatch(/\+7 дней/);
    expect(document.querySelector('[data-ps-baseline-marker="true"]')).toBeTruthy();
    expect(document.querySelector('[data-ps-current-marker="true"]')).toBeTruthy();
    expect(document.querySelector('[data-ps-forecast-marker="true"]')).toBeTruthy();
    expect(
      document.querySelector('[data-ps-connector="baseline-current"]'),
    ).toBeTruthy();
    const stem = document.querySelector('[data-ps-cluster-stem]');
    expect(stem).toHaveAttribute('data-ps-leader-attached', 'current');
    expect(document.querySelector('[data-ps-cluster-label]')).toBeTruthy();
    expect(document.querySelector('[data-ps-delta-label]')?.textContent).toMatch(
      /\+7 дней/,
    );
    expect(document.querySelector('[data-timeline-marker="ps-baseline"]')).toBeNull();
    expect(document.querySelector('[data-timeline-marker="ps-forecast"]')).toBeNull();
    expect(
      document.querySelector('[data-milestone-label="MS-COM-GO"]')?.textContent,
    ).toMatch(/Решение о запуске/);
    expect(
      document.querySelector('[data-milestone-label="MS-COM-GO"]'),
    ).toHaveAttribute('data-label-side', 'above');
  });

  it('R2-U1-R9: coincident A — one point, no connector, По плану, no +0', () => {
    renderView('A');
    const cluster = document.querySelector('[data-ps-cluster]')!;
    expect(cluster).toHaveAttribute('data-ps-cluster-state', 'baseline');
    expect(cluster).toHaveAttribute('data-ps-delta-tone', 'none');
    expect(cluster.textContent).toMatch(/Запуск производства/);
    expect(cluster.textContent).toMatch(/По плану/);
    expect(cluster.textContent).toMatch(/15\.09\.2027/);
    expect(cluster.textContent).not.toMatch(/\+0/);
    expect(document.querySelector('[data-ps-connector]')).toBeNull();
    expect(document.querySelectorAll('[data-ps-current-marker]')).toHaveLength(1);
    expect(
      document.querySelector('[data-ps-forecast-marker="coincident"]'),
    ).toBeTruthy();
  });

  it('R2-U1-R7: single lower grid siblings + bounded pair scroll', () => {
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

    const exList = document.querySelector('[data-top-exceptions="list"]');
    expect(exList).toHaveAttribute('data-exceptions-scroll', 'bounded');
    expect(exList?.className).toMatch(/overflow-y-auto/);
    expect(exList?.getAttribute('style')).toMatch(/14\.25rem/);

    cleanup();
    renderView('G');
    const decisions = document.querySelector('[data-decisions="list"]');
    expect(decisions).toHaveAttribute('data-decisions-scroll', 'bounded');
    expect(decisions?.className).toMatch(/overflow-y-auto/);
    expect(decisions?.getAttribute('style')).toMatch(/14\.25rem/);
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
