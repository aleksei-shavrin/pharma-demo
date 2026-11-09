/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import {
  expectActiveSnapshot,
  selectDemoSnapshot,
} from '@/lib/test/select-snapshot';
import {
  SELECTABLE_SNAPSHOT_IDS,
  type SnapshotId,
} from '@/lib/snapshot/snapshot-id';
import { snapshotOptionLabel } from '@/lib/snapshot/snapshot-meta';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { SnapshotSelector } from './snapshot-selector';

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

function dash(snapshotId: SnapshotId): DashboardOverview {
  return dashboardOverviewFixture(snapshotId);
}

function renderSelector() {
  return render(
    <SnapshotProvider>
      <SnapshotSelector />
    </SnapshotProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  fetchDashboardOverview.mockImplementation(
    async (_id: string, snapshot: SnapshotId) => dash(snapshot),
  );
});

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe('SnapshotSelector 01–19 disclosure (R2-U1)', () => {
  it('trigger shows committed active; listbox exposes 19 01–19 with phases', async () => {
    const user = userEvent.setup();
    renderSelector();
    await expectActiveSnapshot('01');

    await user.click(screen.getByRole('button', { name: /Снимок 01.*активный/ }));
    const list = screen.getByRole('listbox', { name: 'Демо-снимок' });
    expect(list).toHaveAttribute('data-snapshot-listbox', 'true');
    expect(list).toHaveAttribute('data-snapshot-count', '19');
    expect(SELECTABLE_SNAPSHOT_IDS).toHaveLength(19);
    expect(within(list).getAllByRole('option')).toHaveLength(19);
    expect(list.querySelectorAll('[data-snapshot-phase-header]').length).toBe(
      6,
    );
    for (const id of SELECTABLE_SNAPSHOT_IDS) {
      expect(
        within(list).getByRole('option', { name: snapshotOptionLabel(id) }),
      ).toBeInTheDocument();
    }
    expect(
      within(list).getByRole('option', { name: snapshotOptionLabel('01') }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('selects G and H; trigger reflects committed API date', async () => {
    const user = userEvent.setup();
    renderSelector();
    await expectActiveSnapshot('01');
    await selectDemoSnapshot(user, '07');
    await expectActiveSnapshot('07');
    expect(
      screen.getByRole('button', {
        name: /Снимок 07, 15\.05\.2027.*активный/,
      }),
    ).toBeInTheDocument();

    await selectDemoSnapshot(user, '08');
    await expectActiveSnapshot('08');
    expect(
      screen.getByRole('button', {
        name: /Снимок 08, 01\.06\.2027.*активный/,
      }),
    ).toBeInTheDocument();
  });

  it('keyboard: ArrowDown/Up, Home/End, Enter, Space, Escape, Tab', async () => {
    const user = userEvent.setup();
    renderSelector();
    await expectActiveSnapshot('01');

    const trigger = screen.getByRole('button', { name: /Снимок 01.*активный/ });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    const list = screen.getByRole('listbox');
    within(list).getByRole('option', { name: snapshotOptionLabel('01') }).focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    await expectActiveSnapshot('02');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    const listEnd = await screen.findByRole('listbox');
    within(listEnd)
      .getByRole('option', { name: snapshotOptionLabel('02') })
      .focus();
    await user.keyboard('{End}');
    await user.keyboard(' ');
    await expectActiveSnapshot('19');

    await user.click(trigger);
    const listHome = await screen.findByRole('listbox');
    within(listHome)
      .getByRole('option', { name: snapshotOptionLabel('19') })
      .focus();
    await user.keyboard('{Home}');
    await user.keyboard('{Enter}');
    await expectActiveSnapshot('01');

    await user.click(trigger);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.tab();
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('during loading: aria-busy; activation blocked; committed stays A', async () => {
    const user = userEvent.setup();
    let resolveB!: (p: DashboardOverview) => void;
    fetchDashboardOverview.mockImplementationOnce(async () => dash('01'));
    fetchDashboardOverview.mockImplementationOnce(
      () =>
        new Promise<DashboardOverview>((r) => {
          resolveB = r;
        }),
    );

    renderSelector();
    await expectActiveSnapshot('01');
    const trigger = screen.getByRole('button', {
      name: /Снимок 01.*активный/,
    });
    const triggerTopBefore = trigger.getBoundingClientRect().top;
    await user.click(trigger);
    await user.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: snapshotOptionLabel('02'),
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /Снимок 01.*активный.*загрузка снимка 02/,
        }),
      ).toHaveAttribute('aria-busy', 'true');
    });

    // Visible loading line must not appear (shifts TopAppBar); sr-only live ok.
    const live = screen.getByText(/Загрузка снимка 02/);
    expect(live.className).toMatch(/sr-only/);
    expect(live).toHaveAttribute('aria-live', 'polite');
    expect(trigger.getBoundingClientRect().top).toBe(triggerTopBefore);

    await user.click(
      screen.getByRole('button', { name: /Снимок 01.*загрузка снимка 02/ }),
    );
    for (const opt of within(screen.getByRole('listbox')).getAllByRole(
      'option',
    )) {
      expect(opt).toHaveAttribute('aria-disabled', 'true');
    }

    resolveB(dash('02'));
    await expectActiveSnapshot('02');
  });

  it('failed switch keeps committed A; retry reloads last attempt', async () => {
    const user = userEvent.setup();
    fetchDashboardOverview.mockImplementationOnce(async () => dash('01'));
    fetchDashboardOverview.mockImplementationOnce(async () => {
      throw new Error('network');
    });
    fetchDashboardOverview.mockImplementationOnce(async () => dash('03'));

    renderSelector();
    await expectActiveSnapshot('01');
    await selectDemoSnapshot(user, '03');
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    await expectActiveSnapshot('01');
    expect(screen.getByText(/Активный снимок остаётся 01/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    await expectActiveSnapshot('03');
  });

  it('click outside closes listbox', async () => {
    const user = userEvent.setup();
    renderSelector();
    await expectActiveSnapshot('01');
    const trigger = screen.getByRole('button', { name: /Снимок 01.*активный/ });
    await user.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(document.body);
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('длинная подпись обрезается, кнопка и доступное имя остаются', async () => {
    renderSelector();
    const trigger = await screen.findByRole('button', {
      name: /Снимок 01, .*активный/,
    });
    expect(trigger).toBeVisible();
    expect(trigger.className).toMatch(/max-w-/);
    const caption = trigger.querySelector('span.truncate');
    expect(caption).toBeTruthy();
    expect(caption?.className).toMatch(/max-w-/);
    expect(caption?.textContent).toMatch(/·/);
    expect(trigger).toHaveAttribute('aria-label', expect.stringMatching(/Снимок 01/));
  });

  it('re-selecting active A does not refetch', async () => {
    const user = userEvent.setup();
    renderSelector();
    await expectActiveSnapshot('01');
    expect(fetchDashboardOverview).toHaveBeenCalledTimes(1);
    await selectDemoSnapshot(user, '01');
    await expectActiveSnapshot('01');
    expect(fetchDashboardOverview).toHaveBeenCalledTimes(1);
  });
});
