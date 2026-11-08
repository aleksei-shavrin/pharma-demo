/** @vitest-environment jsdom */
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { SnapshotProvider, useSnapshot } from './snapshot-context';
import type { SnapshotId } from './snapshot-id';

const fetchDashboardOverview = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...args: unknown[]) =>
      fetchDashboardOverview(...args),
  };
});

function dash(snapshotId: SnapshotId): DashboardOverview {
  return dashboardOverviewFixture(snapshotId);
}

function Probe() {
  const { active, dashboard, status } = useSnapshot();
  return (
    <div>
      <span data-testid="active">{active}</span>
      <span data-testid="status">{status}</span>
      <span data-testid="dash">{dashboard?.snapshotId ?? 'none'}</span>
    </div>
  );
}

describe('SnapshotProvider login bootstrap skip', () => {
  beforeEach(() => {
    fetchDashboardOverview.mockReset();
    fetchDashboardOverview.mockImplementation(async (projectId, snapshotId) =>
      dash(snapshotId as SnapshotId),
    );
    (globalThis as { __testPathname?: string }).__testPathname = '/';
  });

  afterEach(() => {
    cleanup();
    delete (globalThis as { __testPathname?: string }).__testPathname;
  });

  it('does not fetch dashboard overview on anonymous /login', async () => {
    (globalThis as { __testPathname?: string }).__testPathname = '/login';
    render(
      <SnapshotProvider>
        <Probe />
      </SnapshotProvider>,
    );

    await waitFor(() => {
      expect(fetchDashboardOverview).not.toHaveBeenCalled();
    });
  });

  it('bootstraps dashboard overview on authenticated app routes', async () => {
    (globalThis as { __testPathname?: string }).__testPathname = '/schedule';
    render(
      <SnapshotProvider>
        <Probe />
      </SnapshotProvider>,
    );

    await waitFor(() => {
      expect(fetchDashboardOverview).toHaveBeenCalled();
    });
  });
});
