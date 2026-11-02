/** @vitest-environment jsdom */
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { ThemeProvider } from '@/lib/theme/theme-context';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { AppShell } from './app-shell';

const fetchDashboardOverview = vi.fn();
const fetchNotifications = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...args: unknown[]) =>
      fetchDashboardOverview(...args),
    fetchNotifications: (...args: unknown[]) => fetchNotifications(...args),
  };
});

beforeEach(() => {
  sessionStorage.clear();
  fetchDashboardOverview.mockImplementation(
    async (_id: string, snapshot: SnapshotId) =>
      dashboardOverviewFixture(snapshot),
  );
  fetchNotifications.mockResolvedValue({
    snapshotId: 'A',
    scenarioAsOfDate: '2027-02-15',
    projectId: 'PRJ-01',
    items: [],
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  delete (globalThis as { __testPathname?: string }).__testPathname;
});

async function renderShell(pathname: string) {
  (globalThis as { __testPathname?: string }).__testPathname = pathname;
  const view = render(
    <ThemeProvider>
      <SnapshotProvider>
        <AppShell>
          <div>x</div>
        </AppShell>
      </SnapshotProvider>
    </ThemeProvider>,
  );
  await waitFor(() => {
    expect(fetchDashboardOverview).toHaveBeenCalled();
  });
  return view;
}

describe('AppShell Page Surface vs Dashboard canvas', () => {
  it('Dashboard `/` uses canvas without Page Surface', async () => {
    await renderShell('/');
    expect(document.querySelector('[data-dashboard-canvas="true"]')).toBeTruthy();
    expect(document.querySelector('[data-page-surface]')).toBeNull();
  });

  it('non-Dashboard routes keep Page Surface', async () => {
    await renderShell('/schedule');
    expect(document.querySelector('[data-dashboard-canvas="true"]')).toBeNull();
    expect(document.querySelector('[data-page-surface]')).toBeTruthy();
  });

  it('shell uses bounded dvh height (viewport chain for Schedule)', async () => {
    const { container } = await renderShell('/schedule');
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/h-dvh/);
    expect(root.className).toMatch(/overflow-hidden/);
  });
});
