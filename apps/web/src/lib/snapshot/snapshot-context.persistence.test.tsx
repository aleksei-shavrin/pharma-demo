/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { TopAppBar } from '@/components/shell/top-app-bar';
import { SnapshotProvider, useSnapshot } from './snapshot-context';
import {
  SNAPSHOT_SESSION_KEY,
  writeSessionSnapshot,
} from './snapshot-session';

const fetchDashboardOverview = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...args: unknown[]) =>
      fetchDashboardOverview(...args),
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

function dash(snapshotId: 'A' | 'B' | 'C'): DashboardOverview {
  const delayed = snapshotId !== 'A';
  return {
    snapshotId,
    scenarioAsOfDate:
      snapshotId === 'A'
        ? '2027-02-15'
        : snapshotId === 'B'
          ? '2027-03-01'
          : '2027-03-02',
    project: {
      id: 'PRJ-01',
      name: 'Строительство фармацевтического завода',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: delayed ? '2027-10-06' : '2027-09-15',
      productionStartVariance: {
        subject: 'production_start',
        baselineDate: '2027-09-15',
        forecastDate: delayed ? '2027-10-06' : '2027-09-15',
        deltaDays: delayed ? 21 : 0,
      },
    },
    equipment: {
      id: 'EQ-HVAC-01',
      critical: true,
      status: delayed ? 'Delayed' : 'OnTrack',
      baselineDelivery: '2027-05-15',
      forecastDelivery: delayed ? '2027-06-05' : '2027-05-15',
      deliveryVariance: {
        subject: 'equipment_delivery',
        baselineDate: '2027-05-15',
        forecastDate: delayed ? '2027-06-05' : '2027-05-15',
        deltaDays: delayed ? 21 : 0,
      },
    },
    issue: null,
    risk: {
      id: 'RISK-001',
      rag: delayed ? 'Red' : 'Green',
      equipmentId: 'EQ-HVAC-01',
      milestoneId: 'MS-PS',
      issueId: null,
    },
    milestone: {
      id: 'MS-PS',
      name: 'Ready for production',
      rag: delayed ? 'Red' : 'Green',
      baselineDate: '2027-09-15',
      forecastDate: delayed ? '2027-10-06' : '2027-09-15',
    },
    decisionPanelState: 'absent',
    decision: null,
    directEdges: [],
    derivedImpact: {
      rule: 'BR-004',
      equipmentDeliveryDeltaDays: delayed ? 21 : 0,
      productionStartDeltaDays: delayed ? 21 : 0,
      kind: delayed ? 'aligned_slip' : 'none',
    },
    decisionHonesty: null,
  };
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
    async (_id: string, snapshot: 'A' | 'B' | 'C') => dash(snapshot),
  );
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
    expect(
      screen.getByRole('radio', { name: /Снимок A, активный/ }),
    ).toBeChecked();
  });

  it('storage B → bootstrap/commit B; API never sees invalid', async () => {
    writeSessionSnapshot('B');
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('dash-snap')).toHaveTextContent('B');
    });
    expect(fetchDashboardOverview.mock.calls.map((c) => c[1])).toEqual(['B']);
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('B');
    expect(
      screen.getByRole('radio', { name: /Снимок B, активный/ }),
    ).toBeChecked();
  });

  it('storage C → bootstrap/commit C', async () => {
    writeSessionSnapshot('C');
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('dash-snap')).toHaveTextContent('C');
    });
    expect(fetchDashboardOverview.mock.calls.map((c) => c[1])).toEqual(['C']);
    expect(
      screen.getByRole('radio', { name: /Снимок C, активный/ }),
    ).toBeChecked();
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
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('A');

    await user.click(screen.getByRole('radio', { name: /^Снимок B$/ }));
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок B, активный/ }),
      ).toBeChecked(),
    );
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('B');
  });

  it('failed switch does not change persisted committed snapshot', async () => {
    const user = userEvent.setup();
    fetchDashboardOverview.mockImplementationOnce(async () => dash('A'));
    fetchDashboardOverview.mockImplementationOnce(async () => {
      throw new Error('network');
    });

    renderApp();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('A');

    await user.click(screen.getByRole('radio', { name: /^Снимок B$/ }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByTestId('dash-snap')).toHaveTextContent('A');
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('A');
  });

  it('stale success does not change storage', async () => {
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
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );

    await user.click(screen.getByRole('button', { name: 'goto-B' }));
    await waitFor(() => expect(pending.length).toBe(1));
    await user.click(screen.getByRole('button', { name: 'goto-C' }));
    await waitFor(() => expect(pending.length).toBe(2));

    pending[0](dash('B'));
    await Promise.resolve();
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('A');
    expect(screen.getByTestId('dash-snap')).toHaveTextContent('A');

    pending[1](dash('C'));
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок C, активный/ }),
      ).toBeChecked(),
    );
    expect(sessionStorage.getItem(SNAPSHOT_SESSION_KEY)).toBe('C');
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
    const radios = screen.getAllByRole('radio');
    for (const r of radios) {
      expect(r).not.toBeChecked();
      expect(r.getAttribute('aria-label') ?? '').not.toMatch(/активный/);
    }
    expect(
      screen.queryByText((_, el) => el?.textContent === 'Снимок A'),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText(/Загрузка снимка B/).length).toBeGreaterThan(0);

    for (const resolve of pending) {
      resolve(dash('B'));
    }
    await waitFor(() => {
      expect(
        screen.getByRole('radio', { name: /Снимок B, активный/ }),
      ).toBeChecked();
    });
    expect(
      screen.getByText((_, el) => el?.textContent === 'Снимок B'),
    ).toBeInTheDocument();
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
    expect(
      screen.getByRole('radio', { name: /Снимок B, активный/ }),
    ).toBeChecked();
  });
});
