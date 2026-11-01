/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SchedulePage from '@/app/schedule/page';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';
import type { ScheduleReadModel } from '@/lib/api-client';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { ThemeProvider } from '@/lib/theme/theme-context';

const fetchDashboardOverview = vi.fn();
const fetchSchedule = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...a: unknown[]) => fetchDashboardOverview(...a),
    fetchSchedule: (...a: unknown[]) => fetchSchedule(...a),
  };
});

vi.mock('next/dynamic', () => ({
  default: () =>
    function MockTimelineStub(props: {
      items: unknown[];
      selected: unknown;
      onSelect: (k: unknown) => void;
    }) {
      return (
        <div data-testid="timeline-host" data-schedule-timeline="live">
          <button
            type="button"
            onClick={() =>
              props.onSelect({
                kind: 'equipment_delivery',
                entityId: 'EQ-HVAC-01',
              })
            }
          >
            mock-select-eq
          </button>
          <span data-testid="timeline-selected">
            {props.selected
              ? JSON.stringify(props.selected)
              : 'none'}
          </span>
        </div>
      );
    },
}));

function dash(snapshotId: SnapshotId) {
  return dashboardOverviewFixture(snapshotId);
}

function schedule(snapshotId: SnapshotId): ScheduleReadModel {
  const delayed = snapshotId === 'C';
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    items: [
      {
        kind: 'equipment_delivery',
        id: 'EQ-HVAC-01',
        critical: true,
        status: delayed ? 'Delayed' : 'OnTrack',
        baselineDate: '2027-05-15',
        forecastDate: delayed ? '2027-06-05' : '2027-05-15',
        dateVariance: {
          baselineDate: '2027-05-15',
          forecastDate: delayed ? '2027-06-05' : '2027-05-15',
          deltaDays: delayed ? 21 : 0,
        },
      },
      {
        kind: 'milestone',
        id: 'MS-PS',
        name: 'Ready for production',
        rag: delayed ? 'Red' : 'Green',
        baselineDate: '2027-09-15',
        forecastDate: delayed ? '2027-10-06' : '2027-09-15',
        dateVariance: {
          baselineDate: '2027-09-15',
          forecastDate: delayed ? '2027-10-06' : '2027-09-15',
          deltaDays: delayed ? 21 : 0,
        },
      },
    ],
  };
}

function wrap(ui: ReactNode) {
  return (
    <ThemeProvider>
      <SnapshotProvider>
        <SnapshotSelector />
        {ui}
      </SnapshotProvider>
    </ThemeProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  sessionStorage.clear();
  fetchDashboardOverview.mockImplementation(
    async (_id: string, s: SnapshotId) => dash(s),
  );
  fetchSchedule.mockImplementation(async (_id: string, s: SnapshotId) =>
    schedule(s),
  );
});

describe('I7 Schedule Table + Split + Timeline', () => {
  it('default Table; Split/Timeline enabled; no readiness; selection none', async () => {
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('Оборудование')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Таблица' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Разделение' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Временная шкала' }),
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Таблица' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(document.querySelector('[data-schedule-layout="table"]')).toBeTruthy();
    expect(screen.queryByLabelText('Область временной шкалы')).not.toBeInTheDocument();
    expect(screen.queryByText(/следующей версии/)).not.toBeInTheDocument();
    expect(screen.queryByRole('row', { selected: true })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'EQ-HVAC-01' })).toHaveAttribute(
      'href',
      '/equipment/EQ-HVAC-01',
    );
    expect(screen.queryByText(/\bOnTrack\b/)).not.toBeInTheDocument();
  });

  it('Split shows table + live timeline; Table→Timeline selection sync', async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('Оборудование')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Разделение' }));
    expect(document.querySelector('[data-schedule-layout="split"]')).toBeTruthy();
    expect(screen.getByTestId('timeline-host')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-selected')).toHaveTextContent('none');

    await user.click(screen.getByText('Оборудование'));
    await waitFor(() => {
      expect(screen.getByRole('row', { selected: true })).toBeInTheDocument();
    });
    expect(screen.getByTestId('timeline-selected')).toHaveTextContent(
      'EQ-HVAC-01',
    );
  });

  it('Timeline→Table selection sync; snapshot clears selection', async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('Оборудование')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Разделение' }));
    await user.click(screen.getByRole('button', { name: 'mock-select-eq' }));
    await waitFor(() => {
      expect(screen.getByRole('row', { selected: true })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('radio', { name: /^Снимок C$/ }));
    await waitFor(() => {
      expect(screen.getByText('Задержка')).toBeInTheDocument();
    });
    expect(screen.queryByRole('row', { selected: true })).not.toBeInTheDocument();
    expect(screen.getByTestId('timeline-selected')).toHaveTextContent('none');
    expect(screen.getAllByText('+21 день')).toHaveLength(2);
  });

  it('A→C: +21 HVAC path; Timeline mode; no recovery', async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('По плану')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('radio', { name: /^Снимок C$/ }));
    await waitFor(() => {
      expect(screen.getByText('05.06.2027')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Временная шкала' }));
    expect(document.querySelector('[data-schedule-layout="gantt"]')).toBeTruthy();
    expect(screen.getByTestId('timeline-host')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText(/восстановлен/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ready for production/)).not.toBeInTheDocument();
  });

  it('loading / error+retry / empty still work', async () => {
    const user = userEvent.setup();
    let resolveLoad: ((v: ScheduleReadModel) => void) | null = null;
    fetchSchedule.mockImplementationOnce(
      () =>
        new Promise<ScheduleReadModel>((resolve) => {
          resolveLoad = resolve;
        }),
    );
    render(wrap(<SchedulePage />));
    expect(screen.getByText(/Загрузка данных снимка/)).toBeInTheDocument();
    resolveLoad?.(schedule('A'));
    await waitFor(() => {
      expect(screen.getByText('Оборудование')).toBeInTheDocument();
    });

    fetchSchedule.mockRejectedValueOnce(new Error('boom'));
    await user.click(screen.getByRole('radio', { name: /^Снимок C$/ }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Не удалось загрузить/);
    });

    fetchSchedule.mockResolvedValueOnce(schedule('C'));
    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    await waitFor(() => {
      expect(screen.getByText('Задержка')).toBeInTheDocument();
    });

    fetchSchedule.mockResolvedValueOnce({ ...schedule('A'), items: [] });
    await user.click(screen.getByRole('radio', { name: /^Снимок A$/ }));
    await waitFor(() => {
      expect(screen.getByText(/Нет записей в этом снимке/)).toBeInTheDocument();
    });
  });

  it('stale response discarded under new active snapshot', async () => {
    let finishA: ((v: ScheduleReadModel) => void) | null = null;
    fetchSchedule.mockImplementationOnce(
      () =>
        new Promise<ScheduleReadModel>((resolve) => {
          finishA = resolve;
        }),
    );
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    expect(screen.getByText(/Загрузка данных снимка/)).toBeInTheDocument();

    fetchSchedule.mockImplementation(async (_id: string, s: SnapshotId) =>
      schedule(s),
    );
    await user.click(screen.getByRole('radio', { name: /^Снимок C$/ }));
    await waitFor(() => {
      expect(screen.getByText('Задержка')).toBeInTheDocument();
    });

    finishA?.(schedule('A'));
    await waitFor(() => {
      expect(screen.getByText('Задержка')).toBeInTheDocument();
    });
    expect(screen.queryByText('По плану')).not.toBeInTheDocument();
    expect(screen.getByText('05.06.2027')).toBeInTheDocument();
  });
});
