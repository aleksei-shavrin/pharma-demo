/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';

const useSnapshotMock = vi.fn();
const retryLastSwitch = vi.fn(async () => undefined);

vi.mock('@/lib/snapshot/snapshot-context', () => ({
  useSnapshot: () => useSnapshotMock(),
}));

vi.mock('@/components/dashboard/dashboard-view', () => ({
  DashboardView: ({ data }: { data: DashboardOverview }) => (
    <div data-testid="dashboard-view-stub" data-snapshot={data.snapshotId}>
      Dashboard loaded {data.snapshotId}
    </div>
  ),
}));

import DashboardPage from './page';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  retryLastSwitch.mockClear();
});

describe('DashboardPage', () => {
  it('shows consistent loading label when dashboard is absent', () => {
    useSnapshotMock.mockReturnValue({
      dashboard: null,
      status: 'loading',
      error: null,
      retryLastSwitch,
      active: '03',
    });
    render(<DashboardPage />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'data-page-state',
      'loading',
    );
    expect(screen.getByText('Загрузка дашборда')).toBeInTheDocument();
  });

  it('uses same loading label when status is idle but data missing', () => {
    useSnapshotMock.mockReturnValue({
      dashboard: null,
      status: 'idle',
      error: null,
      retryLastSwitch,
      active: '01',
    });
    render(<DashboardPage />);
    expect(screen.getByText('Загрузка дашборда')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('error shows ordinal snapshot 03 and retries', async () => {
    const user = userEvent.setup();
    useSnapshotMock.mockReturnValue({
      dashboard: null,
      status: 'error',
      error: 'сеть недоступна',
      retryLastSwitch,
      active: '03',
    });
    render(<DashboardPage />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('data-page-state', 'error');
    expect(alert).toHaveTextContent(/Не удалось загрузить снимок 03/);
    expect(alert).not.toHaveTextContent(/снимок C\b/);
    expect(alert).toHaveTextContent(/сеть недоступна/);
    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(retryLastSwitch).toHaveBeenCalledTimes(1);
  });

  it('renders dashboard view when data is loaded', () => {
    const data = dashboardOverviewFixture('03');
    useSnapshotMock.mockReturnValue({
      dashboard: data,
      status: 'ready',
      error: null,
      retryLastSwitch,
      active: '03',
    });
    render(<DashboardPage />);
    expect(screen.getByTestId('dashboard-view-stub')).toHaveAttribute(
      'data-snapshot',
      '03',
    );
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
