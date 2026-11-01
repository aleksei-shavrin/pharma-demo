/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import DashboardPage from '@/app/page';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';

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

function overview(
  snapshotId: 'A' | 'B' | 'C',
  overrides: Partial<DashboardOverview> = {},
): DashboardOverview {
  return dashboardOverviewFixture(snapshotId, overrides);
}

function renderDashboard() {
  return render(
    <SnapshotProvider>
      <SnapshotSelector />
      <DashboardPage />
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
    async (_id: string, snapshot: 'A' | 'B' | 'C') => overview(snapshot),
  );
});

describe('Dashboard narratives (E1-R1 A/B/C)', () => {
  it('A: по плану, без DEC, без exception-chain', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(
        screen.getByText(/Поставка оборудования: без отклонения/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Запуск производства: без отклонения/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/решение не требуется/i)).toBeInTheDocument();
    expect(screen.queryByText('DEC-001')).not.toBeInTheDocument();
    expect(screen.getByText('По плану')).toBeInTheDocument();
    expect(
      screen.getAllByText(/Готовность к производству/).length,
    ).toBeGreaterThan(0);
  });

  it('B: локальное внимание; PS без сдвига; HVAC по плану; без DEC', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );
    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() => {
      expect(
        screen.getByText(/Поставка оборудования: без отклонения/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Запуск производства: без отклонения/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/решение не требуется/i)).toBeInTheDocument();
    expect(screen.queryByText('ISS-001')).not.toBeInTheDocument();
    expect(screen.queryByText('DEC-001')).not.toBeInTheDocument();
    expect(screen.getByText('Риск: зелёный')).toBeInTheDocument();
    expect(screen.getByText('Веха: зелёная')).toBeInTheDocument();
  });

  it('C: +21 день, открыта, красный, решение требуется; без DEC-001', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );
    await user.click(screen.getByRole('radio', { name: /^Снимок C$/ }));
    await waitFor(() => {
      expect(
        screen.getByText(/Поставка оборудования: \+21 день/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Запуск производства: \+21 день/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Открыта')).toBeInTheDocument();
    expect(
      screen.getAllByText(/Прогноз сдвига поставки long-lead AHU/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Риск: красный')).toBeInTheDocument();
    expect(screen.getByText('Веха: красная')).toBeInTheDocument();
    expect(
      screen.getByText(/Требуется управленческое решение/i),
    ).toBeInTheDocument();
    expect(screen.queryByText('DEC-001')).not.toBeInTheDocument();
    expect(screen.queryByText(/\bPending\b/)).not.toBeInTheDocument();
  });

  it('failed switch keeps previous Dashboard (no mixed state)', async () => {
    const user = userEvent.setup();
    fetchDashboardOverview.mockImplementationOnce(async () => overview('A'));
    let rejectB!: (e: Error) => void;
    fetchDashboardOverview.mockImplementationOnce(
      () =>
        new Promise<DashboardOverview>((_r, rej) => {
          rejectB = rej;
        }),
    );

    renderDashboard();
    await waitFor(() => {
      expect(
        screen.getByText(/Поставка оборудования: без отклонения/i),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() => {
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-busy', 'true');
    });
    expect(
      screen.getByRole('radio', { name: /Снимок A, активный/ }),
    ).toBeChecked();

    rejectB(new Error('network'));
    await waitFor(() => {
      expect(
        screen.getByText(/Не удалось переключить снимок/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('radio', { name: /Снимок A, активный/ }),
    ).toBeChecked();
    expect(
      screen.getByText(/Поставка оборудования: без отклонения/i),
    ).toBeInTheDocument();
  });
});
