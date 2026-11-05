/** @vitest-environment jsdom */
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { WorkstreamStatusMatrix } from '@/components/dashboard/workstream-readiness';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { projectCostFixture } from '@/lib/test/project-cost-fixture';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { WORKSTREAM_DISPLAY_ORDER } from '@/lib/ui-labels';
import {
  EXECUTIVE_TIMELINE_SHORT_LABEL,
  requireExecutiveShortLabel,
} from '@/lib/dashboard/executive-timeline-ids';
import { resolveExecutiveMilestones } from '@/lib/dashboard/executive-timeline';

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
  it('executive overview → timeline → exceptions|decisions → attention|changes', () => {
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
      overview.querySelector('[data-dashboard-block="workstream-readiness"]'),
    ).toBeTruthy();
    expect(
      overview.querySelector('[data-overview-stretch="full-height"]'),
    ).toBeTruthy();
    expect(
      overview.querySelector('[data-summary-grid="stretch"]'),
    ).toBeTruthy();

    const row1 = root.querySelector(
      '[data-dashboard-block="exceptions-decisions"]',
    )!;
    const row1Children = [...row1.children];
    expect(row1Children).toHaveLength(2);
    expect(row1Children[0]).toHaveAttribute(
      'data-dashboard-block',
      'top-exceptions',
    );
    expect(row1Children[1]).toHaveAttribute(
      'data-dashboard-block',
      'decisions',
    );
    expect(row1).toHaveAttribute('data-dashboard-layout', 'two-col');
    expect(row1.className).toMatch(/\bgrid\b/);
    expect(row1.className).toMatch(/\bgrid-cols-1\b/);
    expect(row1.className).toMatch(/\blg:grid-cols-2\b/);

    const row2 = root.querySelector(
      '[data-dashboard-block="attention-changes"]',
    )!;
    const row2Children = [...row2.children];
    expect(row2Children).toHaveLength(2);
    expect(row2Children[0]).toHaveAttribute(
      'data-dashboard-block',
      'management-attention',
    );
    expect(row2Children[1]).toHaveAttribute('data-dashboard-block', 'trend');
    expect(row2).toHaveAttribute('data-dashboard-layout', 'two-col');
    expect(row2.className).toBe(row1.className);

    const blocks = [
      ...root.querySelectorAll('[data-dashboard-block]'),
    ].map((el) => el.getAttribute('data-dashboard-block'));

    expect(blocks.indexOf('executive-overview')).toBeLessThan(
      blocks.indexOf('executive-timeline')!,
    );
    expect(blocks.indexOf('executive-timeline')).toBeLessThan(
      blocks.indexOf('exceptions-decisions')!,
    );
    expect(blocks.indexOf('exceptions-decisions')).toBeLessThan(
      blocks.indexOf('attention-changes')!,
    );
    expect(blocks.indexOf('workstream-readiness')).toBeLessThan(
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

  it('workstream: Red/Yellow persistent surfaces; Green neutral + indicator', () => {
    renderView('C');
    const matrix = document.querySelector(
      '[data-workstream-layout="compact-rag"]',
    );
    expect(matrix).toBeTruthy();
    for (const id of WORKSTREAM_DISPLAY_ORDER) {
      const cell = document.querySelector(`[data-workstream="${id}"]`);
      expect(cell?.getAttribute('href')).toBe(`/workstreams/${id}`);
      expect(cell).toHaveAttribute('data-workstream-interactive', 'true');
      expect(cell?.className).toMatch(/cursor-pointer/);
      expect(cell?.className).toMatch(/hover:/);
      expect(cell?.className).toMatch(/focus-visible:/);
      const status = cell?.getAttribute('data-workstream-status');
      expect(['Red', 'Yellow', 'Green']).toContain(status);
      if (status === 'Red') {
        expect(cell).toHaveAttribute('data-rag-surface', 'persistent');
        expect(cell?.className).toMatch(/status-danger-bg/);
      } else if (status === 'Yellow') {
        expect(cell).toHaveAttribute('data-rag-surface', 'persistent');
        expect(cell?.className).toMatch(/status-warn-bg/);
      } else {
        expect(cell).toHaveAttribute('data-rag-surface', 'neutral');
        expect(cell?.className).not.toMatch(/status-ok-bg/);
        expect(cell?.className).toMatch(/bg-transparent/);
      }
    }
  });

  it('workstream readiness orders Red → Yellow → Green with catalog stability', () => {
    const data = dashboardOverviewFixture('C', {
      workstreamRollups: [
        { workstream: 'WS-BLD', status: 'Green' },
        { workstream: 'WS-CLN', status: 'Yellow' },
        { workstream: 'WS-HVAC', status: 'Red' },
        { workstream: 'WS-UTL', status: 'Green' },
        { workstream: 'WS-PRD', status: 'Yellow' },
        { workstream: 'WS-PKG', status: 'Red' },
        { workstream: 'WS-QC', status: 'Green' },
        { workstream: 'WS-AUT', status: 'Green' },
      ],
    });
    render(
      <SnapshotProvider>
        <WorkstreamStatusMatrix data={data} />
      </SnapshotProvider>,
    );
    const ids = [
      ...document.querySelectorAll('[data-workstream]'),
    ].map((el) => el.getAttribute('data-workstream'));
    expect(ids).toEqual([
      'WS-HVAC',
      'WS-PKG',
      'WS-CLN',
      'WS-PRD',
      'WS-BLD',
      'WS-UTL',
      'WS-QC',
      'WS-AUT',
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
      'MS-BLD-FND',
      'MS-BLD-STR',
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

  it('R2-U1-R7: structural two-col siblings + bounded pair scroll', () => {
    renderView('C');
    expect(
      document.querySelector('[data-attention-layout="matrix-2x2"]'),
    ).toBeTruthy();

    const row1 = document.querySelector(
      '[data-dashboard-block="exceptions-decisions"]',
    )!;
    const row2 = document.querySelector(
      '[data-dashboard-block="attention-changes"]',
    )!;

    // Same container — direct children, not nested wrappers.
    expect(row1.children).toHaveLength(2);
    expect(row1.children[0]?.parentElement).toBe(row1);
    expect(row1.children[1]?.parentElement).toBe(row1);
    expect(row2.children).toHaveLength(2);
    expect(row2.children[0]?.parentElement).toBe(row2);
    expect(row2.children[1]?.parentElement).toBe(row2);

    expect(row1.className).toMatch(/\blg:grid-cols-2\b/);
    expect(row1.className).toMatch(/\bgrid-cols-1\b/);
    expect(row2.className).toBe(row1.className);

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
