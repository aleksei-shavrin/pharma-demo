/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { ThemeProvider } from '@/lib/theme/theme-context';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import type { NotificationList } from '@/lib/api-client';
import { selectDemoSnapshot } from '@/lib/test/select-snapshot';
import {
  NOTIFICATION_POPUP_PREF_KEY,
  NOTIFICATION_READ_SESSION_KEY,
  isNotificationRead,
} from '@/lib/notifications/notification-storage';
import { TopAppBar } from '@/components/shell/top-app-bar';

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

function ntfList(snapshotId: SnapshotId, count: number): NotificationList {
  return {
    snapshotId,
    scenarioAsOfDate: '2027-03-01',
    projectId: 'PRJ-01',
    items: Array.from({ length: count }, (_, i) => ({
      id: `NTF-${snapshotId}-${String(i + 1).padStart(3, '0')}`,
      snapshotId,
      severity: i === 0 ? ('critical' as const) : ('attention' as const),
      taxonomy: i === 0 ? ('critical_risk' as const) : ('issue' as const),
      titleRu: `Уведомление ${snapshotId}-${i + 1}`,
      bodyRu:
        i === 1 && snapshotId === 'F'
          ? 'Решение зарегистрировано; это не означает автоматическое устранение задержки.'
          : `Текст ${i + 1}`,
      href: i === 1 && snapshotId === 'F' ? null : `/issues/ISS-001`,
      entityRefs:
        i === 1 && snapshotId === 'F'
          ? [{ type: 'decision' as const, id: 'DEC-001' }]
          : [{ type: 'issue' as const, id: 'ISS-001' }],
    })),
  };
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  fetchDashboardOverview.mockImplementation(
    async (_id: string, snapshot: SnapshotId) =>
      dashboardOverviewFixture(snapshot),
  );
  fetchNotifications.mockImplementation(
    async (_id: string, snapshot: SnapshotId) => ntfList(snapshot, 5),
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderBar() {
  const view = render(
    <ThemeProvider>
      <SnapshotProvider>
        <TopAppBar />
      </SnapshotProvider>
    </ThemeProvider>,
  );
  await waitFor(() => expect(fetchDashboardOverview).toHaveBeenCalled());
  await waitFor(() =>
    expect(document.querySelector('[data-notification-bell]')).toBeTruthy(),
  );
  return view;
}

describe('Notification bell / popover / toast (R2-N1)', () => {
  it('renders bell and unread count for current snapshot', async () => {
    await renderBar();
    await waitFor(() =>
      expect(
        document.querySelector('[data-notification-bell]')?.getAttribute(
          'data-unread-count',
        ),
      ).toBe('5'),
    );
  });

  it('opens popover with internal scroll contract and mark-all', async () => {
    await renderBar();
    fireEvent.click(screen.getByRole('button', { name: /Уведомления/ }));
    expect(screen.getByRole('dialog', { name: 'Уведомления' })).toBeTruthy();
    expect(
      document.querySelector('[data-notification-list-scroll]'),
    ).toBeTruthy();
    fireEvent.click(screen.getByText('Отметить все прочитанными'));
    await waitFor(() =>
      expect(
        document.querySelector('[data-notification-bell]')?.getAttribute(
          'data-unread-count',
        ),
      ).toBe('0'),
    );
    expect(sessionStorage.getItem(NOTIFICATION_READ_SESSION_KEY)).toContain(
      'NTF-A-001',
    );
  });

  it('popup preference persists in localStorage', async () => {
    await renderBar();
    fireEvent.click(screen.getByRole('button', { name: /Уведомления/ }));
    const pref = screen.getByRole('checkbox', {
      name: /Показывать уведомления при смене снимка/,
    }) as HTMLInputElement;
    expect(pref.checked).toBe(true);
    fireEvent.click(pref);
    expect(localStorage.getItem(NOTIFICATION_POPUP_PREF_KEY)).toBe('false');
  });

  it('shows ≤3 top-right semantic toasts after successful B→C commit; not on bootstrap', async () => {
    const user = userEvent.setup();
    await renderBar();
    expect(document.querySelector('[data-notification-toasts]')).toBeNull();
    await selectDemoSnapshot(user, 'C');
    await waitFor(() =>
      expect(document.querySelectorAll('[data-notification-toast]').length).toBe(
        3,
      ),
    );
    const host = document.querySelector('[data-notification-toasts]');
    expect(host).toHaveAttribute('data-toast-placement', 'top-right');
    expect(host?.className).not.toMatch(/bottom-/);
    expect(
      document.querySelectorAll('[data-notification-toast]').length,
    ).toBeLessThanOrEqual(3);
    expect(
      document.querySelector('[data-toast-tone]'),
    ).toBeTruthy();
    // toast does not auto-mark read
    expect(isNotificationRead('NTF-C-001')).toBe(false);
  });

  it('no toast when popup preference is off', async () => {
    const user = userEvent.setup();
    localStorage.setItem(NOTIFICATION_POPUP_PREF_KEY, 'false');
    await renderBar();
    await selectDemoSnapshot(user, 'C');
    await waitFor(() =>
      expect(fetchNotifications).toHaveBeenCalledWith('PRJ-01', 'C'),
    );
    expect(document.querySelector('[data-notification-toasts]')).toBeNull();
  });

  it('no toast on failed switch', async () => {
    const user = userEvent.setup();
    await renderBar();
    fetchDashboardOverview.mockImplementationOnce(async () => {
      throw new Error('network');
    });
    await selectDemoSnapshot(user, 'C');
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Снимок A.*активный/ }),
      ).toBeInTheDocument(),
    );
    expect(
      document.querySelector('[data-notification-toast="NTF-C-001"]'),
    ).toBeNull();
  });

  it('Decision notification has no broken link in popover', async () => {
    const user = userEvent.setup();
    fetchNotifications.mockImplementation(
      async (_id: string, snapshot: SnapshotId) => ntfList(snapshot, 2),
    );
    await renderBar();
    await selectDemoSnapshot(user, 'F');
    await waitFor(() =>
      expect(fetchNotifications).toHaveBeenCalledWith('PRJ-01', 'F'),
    );
    fireEvent.click(screen.getByRole('button', { name: /Уведомления/ }));
    const decisionRow = document.querySelector(
      '[data-notification-id="NTF-F-002"]',
    );
    expect(decisionRow).toBeTruthy();
    expect(decisionRow?.querySelector('a')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Отметить прочитанным' }),
    ).toBeTruthy();
  });

  it('uses theme tokens (no hard-coded hex on bell chrome)', async () => {
    await renderBar();
    const bell = document.querySelector('[data-notification-bell]');
    expect(bell?.className).toMatch(/var\(--/);
    expect(bell?.className).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });
});
