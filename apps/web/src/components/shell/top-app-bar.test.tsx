/** @vitest-environment jsdom */
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { ThemeProvider } from '@/lib/theme/theme-context';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { TopAppBar } from './top-app-bar';

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

vi.mock('./breadcrumbs', () => ({
  Breadcrumbs: () => <nav aria-label="Навигационная цепочка" />,
}));

beforeEach(() => {
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
});

function renderBar() {
  return render(
    <ThemeProvider>
      <SnapshotProvider>
        <TopAppBar />
      </SnapshotProvider>
    </ThemeProvider>,
  );
}

describe('TopAppBar (F04–F06)', () => {
  it('не показывает бейдж проекта/снимка справа', async () => {
    renderBar();
    await waitFor(() => expect(fetchDashboardOverview).toHaveBeenCalled());
    expect(
      document.querySelector('[title="Контекст демо-проекта"]'),
    ).toBeNull();
    expect(document.body.textContent).not.toMatch(/PRJ-01\s*·/);
  });

  it('фиксированная высота topbar без flex-wrap', () => {
    renderBar();
    const bar = document.querySelector('[data-top-app-bar]');
    expect(bar?.className).toMatch(/h-\[var\(--topbar-height\)\]/);
    expect(bar?.className).not.toMatch(/flex-wrap/);
    expect(bar?.className).not.toMatch(/min-h-/);
    expect(bar?.className).not.toMatch(/\bpy-/);
  });

  it('порядок справа: колокол → тема → снимок', async () => {
    renderBar();
    await waitFor(() =>
      expect(document.querySelector('[data-snapshot-trigger]')).toBeTruthy(),
    );
    const controls = document.querySelector('[data-top-app-bar-controls]');
    expect(controls).toBeTruthy();
    const slots = Array.from(controls!.children);
    expect(slots.length).toBe(3);
    expect(
      slots[0]?.querySelector('[data-notification-bell]'),
    ).toBeTruthy();
    expect(slots[1]?.matches('[data-theme-toggle]')).toBe(true);
    expect(
      slots[2]?.querySelector('[data-snapshot-trigger]'),
    ).toBeTruthy();
  });

  it('переключатель темы того же внешнего размера, что колокол', async () => {
    renderBar();
    await waitFor(() =>
      expect(document.querySelector('[data-notification-bell]')).toBeTruthy(),
    );
    const bell = document.querySelector('[data-notification-bell]');
    const theme = document.querySelector('[data-theme-toggle]');
    expect(bell?.className).toMatch(/\bh-9\b/);
    expect(bell?.className).toMatch(/\bw-9\b/);
    expect(theme?.className).toMatch(/\bh-9\b/);
    expect(theme?.className).toMatch(/\bw-9\b/);
  });
});
