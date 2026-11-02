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
  it('executive overview → timeline → exceptions|attention row', () => {
    renderView('C');
    const root = document.querySelector('[data-dashboard="r2-u1"]')!;
    expect(root).toHaveAttribute('data-dashboard-ia', 'r2-u1-r4');

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

    const pair = root.querySelector(
      '[data-dashboard-block="exceptions-attention"]',
    )!;
    expect(
      pair.querySelector('[data-dashboard-block="top-exceptions"]'),
    ).toBeTruthy();
    expect(
      pair.querySelector('[data-dashboard-block="management-attention"]'),
    ).toBeTruthy();
    expect(pair.className).toMatch(/xl:grid-cols-/);

    const blocks = [
      ...root.querySelectorAll('[data-dashboard-block]'),
    ].map((el) => el.getAttribute('data-dashboard-block'));

    expect(blocks.indexOf('executive-overview')).toBeLessThan(
      blocks.indexOf('executive-timeline')!,
    );
    expect(blocks.indexOf('executive-timeline')).toBeLessThan(
      blocks.indexOf('exceptions-attention')!,
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

  it('workstream cells link to /workstreams/:id with RAG surface + hover contract', () => {
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
      const status = cell?.getAttribute('data-workstream-status');
      expect(['Red', 'Yellow', 'Green']).toContain(status);
      if (status === 'Red') {
        expect(cell?.className).toMatch(/status-danger-bg/);
      } else if (status === 'Yellow') {
        expect(cell?.className).toMatch(/status-warn-bg/);
      } else {
        expect(cell?.className).toMatch(/status-ok-bg/);
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
    expect(stripA.textContent).toMatch(/Go\/No-Go/);
    cleanup();

    renderView('O');
    const strip = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    )!;
    expect(strip.querySelector('[data-milestone-label="MS-BLD-EXC"]')).toBeTruthy();
    expect(strip.querySelector('[data-milestone-label="MS-PS"]')).toBeTruthy();
    expect(
      strip.querySelector('[data-milestone-label="MS-COM-GO"]'),
    ).toBeTruthy();

    const points = resolveExecutiveMilestones(dashboardOverviewFixture('A'));
    for (const p of points) {
      expect(requireExecutiveShortLabel(p.id)).toBe(p.shortLabel);
      expect(p.shortLabel).not.toMatch(/\.\.\./);
    }
    expect(EXECUTIVE_TIMELINE_SHORT_LABEL['MS-BLD-ENCL']).toBe('Контур здания');
  });

  it('R2-U1-R3 late S timeline exposes lane attrs; no horizontal track scroll', () => {
    renderView('S');
    const track = document.querySelector('[data-timeline-track]')!;
    expect(track).toHaveAttribute('data-timeline-layout', 'r2-u1-r3');
    expect(track.className).toMatch(/overflow-x-hidden/);
    expect(track.className).not.toMatch(/overflow-x-auto/);

    const snap = document.querySelector('[data-snapshot-label]')!;
    expect(snap).toHaveAttribute('data-label-lane', '1');
    expect(snap).toHaveAttribute('data-label-side', 'above');

    const forecast = document.querySelector(
      '[data-timeline-marker="ps-forecast"]',
    )!;
    expect(forecast).toHaveAttribute('data-label-lane', '1');
    expect(forecast).toHaveAttribute('data-label-side', 'below');

    const baseline = document.querySelector(
      '[data-timeline-marker="ps-baseline"]',
    )!;
    expect(baseline).toHaveAttribute('data-label-side', 'below');
    expect(baseline).toHaveAttribute('data-label-lane', '0');
  });
});
