/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { TopAppBar } from '@/components/shell/top-app-bar';
import {
  expectActiveSnapshot,
  selectDemoSnapshot,
} from '@/lib/test/select-snapshot';
import type { SnapshotId } from './snapshot-id';
import { SnapshotProvider, useSnapshot } from './snapshot-context';
import {
  SNAPSHOT_SESSION_KEY,
  writeSessionSnapshot,
} from './snapshot-session';

const fetchDashboardOverview = vi.fn();
const fetchNotifications = vi.fn();
const fetchProjectCosts = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...args: unknown[]) =>
      fetchDashboardOverview(...args),
    fetchNotifications: (...args: unknown[]) => fetchNotifications(...args),
    fetchProjectCosts: (...args: unknown[]) => fetchProjectCosts(...args),
    fetchHealth: vi.fn(),
  };
});

vi.mock('@/components/shell/breadcrumbs', () => ({
  Breadcrumbs: () => <nav aria-label="Навигационная цепочка" />,
}));

vi.mock('@/components/theme/theme-toggle', () => ({
  ThemeToggle: () => (
    <button type="button" aria-label="Переключить на тёмную тему">
      theme
    </button>
  ),
}));

function dash(snapshotId: SnapshotId): DashboardOverview {
  return dashboardOverviewFixture(snapshotId);
}

function Probe() {
  const { active, dashboard, switchSnapshot } = useSnapshot();
  return (
    <div>
      <span data-testid="active">{active}</span>
      <span data-testid="settled">{dashboard ? 'yes' : 'no'}</span>
      <span data-testid="dash-snap">{dashboard?.snapshotId ?? 'none'}</span>
      <button type="button" onClick={() => void switchSnapshot('B')}>
        goto-B
      </button>
      <button type="button" onClick={() => void switchSnapshot('C')}>
        goto-C
      </button>
      <button type="button" onClick={() => void switchSnapshot('G')}>
        goto-G
      </button>
    </div>
  );
}

function renderApp() {
  return render(
    <SnapshotProvider>
      <TopAppBar />
      <Probe />
    </SnapshotProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  fetchDashboardOverview.mockImplementation(
    async (_id: string, snapshot: SnapshotId) => dash(snapshot),
  );
  fetchNotifications.mockImplementation(
    async (_id: string, snapshot: SnapshotId) => ({
      snapshotId: snapshot,
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      items: [],
    }),
  );
  fetchProjectCosts.mockResolvedValue({
    snapshotId: 'A',
    scenarioAsOfDate: '2027-02-15',
    projectId: 'PRJ-01',
    project: {
      approvedBudgetRub: 6_200_000_000,
      actualCostRub: 0,
      committedCostRub: 0,
      etcRub: 6_200_000_000,
      eacRub: 6_200_000_000,
      vacRub: 0,
      contingencyTotalRub: 350_000_000,
      contingencyConsumedRub: 0,
      contingencyRemainingRub: 350_000_000,
    },
    workstreams: [],
    equipment: [],
    reconciliation: {
      workstreamEacSumRub: 0,
      projectLevelForecastRub: 0,
    },
  });
});

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe('SnapshotProvider session persistence', () => {
  it('empty storage → bootstrap A and writes A', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('dash-snap')).toHaveTextContent('A');
    });
    expect(fetchDashboardOverview.mock.calls.map((c) => c[1])).toEqual(['A']);
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('A');
    await expectActiveSnapshot('A');
  });

  it('storage G → bootstrap/commit G', async () => {
    writeSessionSnapshot('G');
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('dash-snap')).toHaveTextContent('G');
    });
    expect(fetchDashboardOverview.mock.calls.map((c) => c[1])).toEqual(['G']);
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('G');
    await expectActiveSnapshot('G');
  });

  it('storage H → bootstrap/commit H', async () => {
    writeSessionSnapshot('H');
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('dash-snap')).toHaveTextContent('H');
    });
    await expectActiveSnapshot('H');
  });

  it('invalid storage → A; never sent to API', async () => {
    sessionStorage.setItem(SNAPSHOT_SESSION_KEY, 'Z');
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('dash-snap')).toHaveTextContent('A');
    });
    const requested = fetchDashboardOverview.mock.calls.map((c) => c[1]);
    expect(requested).toEqual(['A']);
    expect(requested).not.toContain('Z');
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('A');
  });

  it('successful A→B writes B', async () => {
    const user = userEvent.setup();
    renderApp();
    await expectActiveSnapshot('A');
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('A');

    await selectDemoSnapshot(user, 'B');
    await expectActiveSnapshot('B');
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('B');
  });

  it('failed switch does not change persisted committed snapshot', async () => {
    const user = userEvent.setup();
    fetchDashboardOverview.mockImplementationOnce(async () => dash('A'));
    fetchDashboardOverview.mockImplementationOnce(async () => {
      throw new Error('network');
    });

    renderApp();
    await expectActiveSnapshot('A');
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('A');

    await selectDemoSnapshot(user, 'B');
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByTestId('dash-snap')).toHaveTextContent('A');
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('A');
    await expectActiveSnapshot('A');
  });

  it('stale success does not change storage; rapid C→G ends on G', async () => {
    const pending: Array<(p: DashboardOverview) => void> = [];

    fetchDashboardOverview.mockImplementationOnce(async () => dash('A'));
    fetchDashboardOverview.mockImplementation(
      () =>
        new Promise<DashboardOverview>((r) => {
          pending.push(r);
        }),
    );

    const user = userEvent.setup();
    renderApp();
    await expectActiveSnapshot('A');

    await user.click(screen.getByRole('button', { name: 'goto-C' }));
    await waitFor(() => expect(pending.length).toBe(1));
    await user.click(screen.getByRole('button', { name: 'goto-G' }));
    await waitFor(() => expect(pending.length).toBe(2));

    pending[0](dash('C'));
    await Promise.resolve();
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('A');
    expect(screen.getByTestId('dash-snap')).toHaveTextContent('A');

    pending[1](dash('G'));
    await expectActiveSnapshot('G');
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('G');
  });

  it('first paint with stored B does not present A as settled', async () => {
    writeSessionSnapshot('B');
    const pending: Array<(p: DashboardOverview) => void> = [];
    fetchDashboardOverview.mockImplementation(
      () =>
        new Promise<DashboardOverview>((r) => {
          pending.push(r);
        }),
    );

    renderApp();

    await waitFor(() => {
      expect(fetchDashboardOverview).toHaveBeenCalledWith('PRJ-01', 'B');
      expect(pending.length).toBeGreaterThan(0);
    });

    expect(screen.getByTestId('settled')).toHaveTextContent('no');
    const trigger = screen.getByRole('button', { name: /Снимок/ });
    expect(trigger.getAttribute('aria-label') ?? '').not.toMatch(/активный/);
    expect(trigger.getAttribute('aria-label') ?? '').toMatch(/загрузка/i);
    expect(screen.getAllByText(/Загрузка снимка B/).length).toBeGreaterThan(0);

    for (const resolve of pending) {
      resolve(dash('B'));
    }
    await expectActiveSnapshot('B');
  });

  it('Provider remount with stored B restores B (reload semantics)', async () => {
    writeSessionSnapshot('B');
    const { unmount } = renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('dash-snap')).toHaveTextContent('B');
    });
    unmount();

    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('dash-snap')).toHaveTextContent('B');
    });
    await expectActiveSnapshot('B');
  });
});
