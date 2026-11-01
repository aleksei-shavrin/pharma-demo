/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SchedulePage from '@/app/schedule/page';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';
import type { ScheduleReadModel } from '@/lib/api-client';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';

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

function dash(snapshotId: SnapshotId) {
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
      forecastProductionStart:
        snapshotId === 'A' ? '2027-09-15' : '2027-10-06',
      productionStartVariance: {
        subject: 'production_start' as const,
        baselineDate: '2027-09-15',
        forecastDate: snapshotId === 'A' ? '2027-09-15' : '2027-10-06',
        deltaDays: snapshotId === 'A' ? 0 : 21,
      },
    },
    equipment: {
      id: 'EQ-HVAC-01',
      critical: true,
      status: snapshotId === 'A' ? ('OnTrack' as const) : ('Delayed' as const),
      baselineDelivery: '2027-05-15',
      forecastDelivery: snapshotId === 'A' ? '2027-05-15' : '2027-06-05',
      deliveryVariance: {
        subject: 'equipment_delivery' as const,
        baselineDate: '2027-05-15',
        forecastDate: snapshotId === 'A' ? '2027-05-15' : '2027-06-05',
        deltaDays: snapshotId === 'A' ? 0 : 21,
      },
    },
    issue: null,
    risk: {
      id: 'RISK-001',
      rag: snapshotId === 'A' ? ('Green' as const) : ('Red' as const),
      equipmentId: 'EQ-HVAC-01',
      milestoneId: 'MS-PS',
      issueId: null,
    },
    milestone: {
      id: 'MS-PS',
      name: 'Ready for production',
      rag: snapshotId === 'A' ? ('Green' as const) : ('Red' as const),
      baselineDate: '2027-09-15',
      forecastDate: snapshotId === 'A' ? '2027-09-15' : '2027-10-06',
    },
    decisionPanelState: 'absent' as const,
    decision: null,
    directEdges: [],
    derivedImpact: {
      rule: 'BR-004' as const,
      equipmentDeliveryDeltaDays: snapshotId === 'A' ? 0 : 21,
      productionStartDeltaDays: snapshotId === 'A' ? 0 : 21,
      kind: snapshotId === 'A' ? ('none' as const) : ('aligned_slip' as const),
    },
    decisionHonesty: null,
  };
}

function schedule(snapshotId: SnapshotId): ScheduleReadModel {
  const delayed = snapshotId !== 'A';
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
    <SnapshotProvider>
      <SnapshotSelector />
      {ui}
    </SnapshotProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  fetchDashboardOverview.mockImplementation(
    async (_id: string, s: SnapshotId) => dash(s),
  );
  fetchSchedule.mockImplementation(async (_id: string, s: SnapshotId) =>
    schedule(s),
  );
});

describe('I6 Schedule Table + Split', () => {
  it('A: canonical rows, RU labels, typed detail links, Δ0', async () => {
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('Оборудование')).toBeInTheDocument();
    });
    expect(screen.getByText('Веха')).toBeInTheDocument();
    expect(screen.getByText('Готовность к производству')).toBeInTheDocument();
    expect(screen.getByText('По плану')).toBeInTheDocument();
    expect(screen.getByText('Веха: зелёная')).toBeInTheDocument();
    expect(screen.getAllByText('без отклонения')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'EQ-HVAC-01' })).toHaveAttribute(
      'href',
      '/equipment/EQ-HVAC-01',
    );
    expect(screen.getByRole('link', { name: 'MS-PS' })).toHaveAttribute(
      'href',
      '/milestones/MS-PS',
    );
    expect(screen.queryByText(/\bequipment_delivery\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bOnTrack\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bGreen\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ready for production/)).not.toBeInTheDocument();
    expect(document.querySelector('[data-schedule-layout="table"]')).toBeTruthy();
    expect(screen.queryByLabelText('Область временной шкалы')).not.toBeInTheDocument();
  });

  it('B→C: +21 preserved; no recovery heal; full-width Table only', async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('По плану')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() => {
      expect(screen.getByText('Задержка')).toBeInTheDocument();
    });
    expect(screen.getByText('05.06.2027')).toBeInTheDocument();
    expect(screen.getByText('06.10.2027')).toBeInTheDocument();
    expect(screen.getAllByText('+21 день')).toHaveLength(2);
    expect(screen.getByText('Веха: красная')).toBeInTheDocument();
    expect(screen.queryByText(/\bDelayed\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bRed\b/)).not.toBeInTheDocument();
    expect(document.querySelector('[data-schedule-layout="table"]')).toBeTruthy();
    expect(document.querySelector('[data-schedule-layout="split"]')).toBeNull();
    expect(screen.queryByLabelText('Область временной шкалы')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'EQ-HVAC-01' })).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /^Снимок C$/ }));
    await waitFor(() => {
      expect(screen.getAllByText('+21 день')).toHaveLength(2);
    });
    expect(screen.getByText('05.06.2027')).toBeInTheDocument();
    expect(screen.getByText('06.10.2027')).toBeInTheDocument();
    expect(screen.getByText('Веха: красная')).toBeInTheDocument();
    expect(screen.queryByText(/восстановлен/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recovery/i)).not.toBeInTheDocument();
  });

  it('Split and Timeline disabled; Table selected; selection off by default', async () => {
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('Оборудование')).toBeInTheDocument();
    });
    const tableMode = screen.getByRole('button', { name: 'Таблица' });
    const split = screen.getByRole('button', { name: 'Разделение' });
    const timeline = screen.getByRole('button', { name: 'Временная шкала' });
    expect(tableMode).toBeEnabled();
    expect(tableMode).toHaveAttribute('aria-pressed', 'true');
    expect(split).toBeDisabled();
    expect(timeline).toBeDisabled();
    expect(split).toHaveAttribute(
      'title',
      'Будет доступно вместе с временной шкалой.',
    );
    expect(timeline).toHaveAttribute(
      'title',
      'Будет доступно вместе с временной шкалой.',
    );
    expect(document.querySelector('[data-schedule-layout="table"]')).toBeTruthy();
    expect(screen.queryByLabelText('Область временной шкалы')).not.toBeInTheDocument();
    expect(screen.queryByRole('row', { selected: true })).not.toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'График контрольных точек' });
    expect(within(table).queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('loading / error+retry / empty', async () => {
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
    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Не удалось загрузить/);
    });
    expect(screen.queryByText('EQ-HVAC-01')).not.toBeInTheDocument();

    fetchSchedule.mockResolvedValueOnce(schedule('B'));
    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    await waitFor(() => {
      expect(screen.getByText('Задержка')).toBeInTheDocument();
    });

    fetchSchedule.mockResolvedValueOnce({
      ...schedule('A'),
      items: [],
    });
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
    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
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
