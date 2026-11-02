/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EquipmentPage from '@/app/equipment/page';
import IssuesRisksPage from '@/app/issues-risks/page';
import MilestonesPage from '@/app/milestones/page';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import type { WorkstreamId } from '@/lib/api-client';
import { selectDemoSnapshot } from '@/lib/test/select-snapshot';

const fetchDashboardOverview = vi.fn();
const fetchEquipmentRegister = vi.fn();
const fetchIssuesRisksRegister = vi.fn();
const fetchMilestonesRegister = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...a: unknown[]) => fetchDashboardOverview(...a),
    fetchEquipmentRegister: (...a: unknown[]) => fetchEquipmentRegister(...a),
    fetchIssuesRisksRegister: (...a: unknown[]) =>
      fetchIssuesRisksRegister(...a),
    fetchMilestonesRegister: (...a: unknown[]) => fetchMilestonesRegister(...a),
  };
});

function dash(snapshotId: SnapshotId) {
  return dashboardOverviewFixture(snapshotId);
}

function equipment(snapshotId: SnapshotId) {
  const hvacDelayed =
    snapshotId === 'C' || snapshotId === 'G' || snapshotId === 'H';
  const hvacDelta =
    snapshotId === 'C' ? 21 : snapshotId === 'G' || snapshotId === 'H' ? 14 : 0;
  const pkgDelayed = snapshotId === 'B';
  const items = [
    {
      id: 'EQ-HVAC-01',
      name: 'Центральный AHU чистых зон',
      critical: true,
      workstream: 'WS-HVAC' as WorkstreamId,
      status: hvacDelayed ? ('Delayed' as const) : ('OnTrack' as const),
      baselineDelivery: '2027-05-15',
      forecastDelivery: hvacDelayed
        ? hvacDelta === 21
          ? '2027-06-05'
          : '2027-05-29'
        : '2027-05-15',
      deliveryVariance: {
        baselineDate: '2027-05-15',
        forecastDate: hvacDelayed
          ? hvacDelta === 21
            ? '2027-06-05'
            : '2027-05-29'
          : '2027-05-15',
        deltaDays: hvacDelta,
      },
      relatedActiveIssueIds:
        snapshotId === 'C' || snapshotId === 'G' || snapshotId === 'H'
          ? ['ISS-001']
          : [],
      relatedRedRiskIds:
        snapshotId === 'C' || snapshotId === 'G' || snapshotId === 'H'
          ? ['RISK-001']
          : [],
    },
    {
      id: 'EQ-PKG-01',
      name: 'Линия первичной упаковки',
      critical: true,
      workstream: 'WS-PKG' as WorkstreamId,
      status: pkgDelayed ? ('Delayed' as const) : ('OnTrack' as const),
      baselineDelivery: '2027-06-20',
      forecastDelivery: pkgDelayed ? '2027-06-30' : '2027-06-20',
      deliveryVariance: {
        baselineDate: '2027-06-20',
        forecastDate: pkgDelayed ? '2027-06-30' : '2027-06-20',
        deltaDays: pkgDelayed ? 10 : 0,
      },
      relatedActiveIssueIds: pkgDelayed ? ['ISS-PKG-01'] : [],
      relatedRedRiskIds: [] as string[],
    },
    {
      id: 'EQ-BLD-02',
      name: 'Технические двери оболочки',
      critical: false,
      workstream: 'WS-BLD' as WorkstreamId,
      status: 'OnTrack' as const,
      baselineDelivery: '2027-03-01',
      forecastDelivery: '2027-03-01',
      deliveryVariance: {
        baselineDate: '2027-03-01',
        forecastDate: '2027-03-01',
        deltaDays: 0,
      },
      relatedActiveIssueIds: [] as string[],
      relatedRedRiskIds: [] as string[],
    },
  ];
  // Pad to enriched density signal without inventing Domain.
  while (items.length < 23) {
    const n = items.length + 1;
    items.push({
      id: `EQ-PAD-${String(n).padStart(2, '0')}`,
      name: `Оборудование демо ${n}`,
      critical: false,
      workstream: 'WS-UTL' as WorkstreamId,
      status: 'OnTrack' as const,
      baselineDelivery: '2027-04-01',
      forecastDelivery: '2027-04-01',
      deliveryVariance: {
        baselineDate: '2027-04-01',
        forecastDate: '2027-04-01',
        deltaDays: 0,
      },
      relatedActiveIssueIds: [],
      relatedRedRiskIds: [],
    });
  }
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    items,
  };
}

function issuesRisks(snapshotId: SnapshotId) {
  const rows = [];
  if (snapshotId === 'B') {
    rows.push({
      type: 'Issue' as const,
      id: 'ISS-PKG-01',
      title: 'Прогноз срыва срока FAT первичной упаковки',
      workstream: 'WS-PKG' as WorkstreamId,
      issueStatus: 'Open' as const,
      rag: null,
      equipmentId: 'EQ-PKG-01',
      linkedIssueId: null,
      linkedRiskId: 'RISK-PKG-01',
      milestoneId: 'MS-PKG-SAT',
    });
    rows.push({
      type: 'Issue' as const,
      id: 'ISS-PKG-CLOSED',
      title: 'Локальное замечание по упаковке (закрыто)',
      workstream: 'WS-PKG' as WorkstreamId,
      issueStatus: 'Closed' as const,
      rag: null,
      equipmentId: 'EQ-PKG-01',
      linkedIssueId: null,
      linkedRiskId: null,
      milestoneId: null,
    });
  }
  if (snapshotId === 'C' || snapshotId === 'G' || snapshotId === 'H') {
    rows.push({
      type: 'Issue' as const,
      id: 'ISS-001',
      title: 'Прогноз сдвига поставки long-lead AHU',
      workstream: 'WS-HVAC' as WorkstreamId,
      issueStatus:
        snapshotId === 'C' ? ('Open' as const) : ('Mitigating' as const),
      rag: null,
      equipmentId: 'EQ-HVAC-01',
      linkedIssueId: null,
      linkedRiskId: 'RISK-001',
      milestoneId: 'MS-PS',
    });
  }
  rows.push({
    type: 'Risk' as const,
    id: 'RISK-001',
    title: 'Срыв окна монтажа HVAC → сдвиг старта производства',
    workstream: 'WS-HVAC' as WorkstreamId,
    issueStatus: null,
    rag:
      snapshotId === 'C' || snapshotId === 'G' || snapshotId === 'H'
        ? ('Red' as const)
        : ('Green' as const),
    equipmentId: 'EQ-HVAC-01',
    linkedIssueId:
      snapshotId === 'C' || snapshotId === 'G' || snapshotId === 'H'
        ? 'ISS-001'
        : null,
    linkedRiskId: null,
    milestoneId: 'MS-PS',
  });
  // RISK-COM-01 enters fixtures at E+ (approved orphan Red without Issue).
  if (snapshotId === 'E' || snapshotId === 'G' || snapshotId === 'H') {
    rows.push({
      type: 'Risk' as const,
      id: 'RISK-COM-01',
      title: 'Накопительный риск срыва общего демо-гейта (IQ)',
      workstream: 'WS-AUT' as WorkstreamId,
      issueStatus: null,
      rag: 'Red' as const,
      equipmentId: null,
      linkedIssueId: null,
      linkedRiskId: null,
      milestoneId: 'MS-COM-IQ',
    });
  }
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    rows,
  };
}

function milestones(snapshotId: SnapshotId) {
  const delayed =
    snapshotId === 'C' || snapshotId === 'G' || snapshotId === 'H';
  const delta =
    snapshotId === 'C' ? 21 : snapshotId === 'G' || snapshotId === 'H' ? 14 : 0;
  const forecast =
    snapshotId === 'C'
      ? '2027-10-06'
      : snapshotId === 'G' || snapshotId === 'H'
        ? '2027-09-29'
        : '2027-09-15';
  const items = [
    {
      id: 'MS-PS',
      name: 'Ready for production',
      workstream: null as WorkstreamId | null,
      rag: delayed ? ('Red' as const) : ('Green' as const),
      baselineDate: '2027-09-15',
      forecastDate: forecast,
      dateVariance: {
        baselineDate: '2027-09-15',
        forecastDate: forecast,
        deltaDays: delta,
      },
      relatedActiveIssueIds:
        snapshotId === 'C' || snapshotId === 'G' || snapshotId === 'H'
          ? ['ISS-001']
          : ([] as string[]),
      relatedRedRiskIds:
        snapshotId === 'C' || snapshotId === 'G' || snapshotId === 'H'
          ? ['RISK-001']
          : ([] as string[]),
    },
  ];
  while (items.length < 14) {
    const n = items.length + 1;
    items.push({
      id: `MS-PAD-${String(n).padStart(2, '0')}`,
      name: `Веха демо ${n}`,
      workstream: 'WS-UTL' as WorkstreamId,
      rag: 'Green' as const,
      baselineDate: '2027-05-01',
      forecastDate: '2027-05-01',
      dateVariance: {
        baselineDate: '2027-05-01',
        forecastDate: '2027-05-01',
        deltaDays: 0,
      },
      relatedActiveIssueIds: [],
      relatedRedRiskIds: [],
    });
  }
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    items,
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
  sessionStorage.clear();
  fetchDashboardOverview.mockImplementation(
    async (_id: string, s: SnapshotId) => dash(s),
  );
  fetchEquipmentRegister.mockImplementation(
    async (_id: string, s: SnapshotId) => equipment(s),
  );
  fetchIssuesRisksRegister.mockImplementation(
    async (_id: string, s: SnapshotId) => issuesRisks(s),
  );
  fetchMilestonesRegister.mockImplementation(
    async (_id: string, s: SnapshotId) => milestones(s),
  );
});

describe('E4 Equipment register', () => {
  it('renders enriched density, HVAC +21 on C, filters and detail link', async () => {
    const user = userEvent.setup();
    render(wrap(<EquipmentPage />));
    await waitFor(() => {
      expect(screen.getByText(/Показано/)).toBeInTheDocument();
    });
    expect(screen.getByText('23 / 23')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Центральный AHU чистых зон' }),
    ).toHaveAttribute('href', '/equipment/EQ-HVAC-01');
    expect(screen.getByText('EQ-HVAC-01')).toBeInTheDocument();
    expect(screen.getAllByText('HVAC').length).toBeGreaterThan(0);

    await selectDemoSnapshot(user, 'C');
    await waitFor(() => {
      expect(screen.getByText('+21 день')).toBeInTheDocument();
    });
    expect(screen.getByText('Задержка')).toBeInTheDocument();
    expect(screen.getByText('05.06.2027')).toBeInTheDocument();
    expect(screen.getByText(/ISS-001/)).toBeInTheDocument();
    expect(screen.queryByText(/\bOnTrack\b/)).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Фильтр внимания'), 'attention');
    await waitFor(() => {
      expect(screen.getByText(/Показано/)).toHaveTextContent(/1/);
    });
    expect(screen.getByText('EQ-HVAC-01')).toBeInTheDocument();
    expect(screen.queryByText('EQ-PAD-04')).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText('Фильтр направления'),
      'WS-PKG',
    );
    await waitFor(() => {
      expect(screen.getByText(/Нет записей, соответствующих/)).toBeInTheDocument();
    });
    const emptyReset = screen
      .getByText(/Нет записей, соответствующих/)
      .closest('[data-register-filtered-empty="true"]')!
      .querySelector('button')!;
    await user.click(emptyReset);
    await waitFor(() => {
      expect(screen.getByText('23 / 23')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/Поиск/), 'EQ-HVAC');
    await waitFor(() => {
      expect(screen.getByText('EQ-HVAC-01')).toBeInTheDocument();
    });
    expect(screen.queryByText('EQ-PKG-01')).not.toBeInTheDocument();
  });

  it('G/H residual HVAC +14 shape is available from register contract', () => {
    for (const id of ['G', 'H'] as SnapshotId[]) {
      const hvac = equipment(id).items.find((i) => i.id === 'EQ-HVAC-01')!;
      expect(hvac.deliveryVariance.deltaDays).toBe(14);
      expect(hvac.status).toBe('Delayed');
      expect(hvac.relatedRedRiskIds).toContain('RISK-001');
    }
  });
});

describe('E4 Issues & Risks register', () => {
  it('typed combined register: Open/Closed/RISK-001/RISK-COM-01; Closed not attention', async () => {
    const user = userEvent.setup();
    render(wrap(<IssuesRisksPage />));
    await waitFor(() => {
      expect(screen.getByText('Риск: зелёный')).toBeInTheDocument();
    });

    await selectDemoSnapshot(user, 'B');
    await waitFor(() => {
      expect(screen.getByText('Закрыта')).toBeInTheDocument();
    });
    expect(screen.getByText('Открыта')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Фильтр внимания'), 'attention');
    await waitFor(() => {
      expect(screen.getByText('ISS-PKG-01')).toBeInTheDocument();
    });
    expect(screen.queryByText('ISS-PKG-CLOSED')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    await selectDemoSnapshot(user, 'C');
    await waitFor(() => {
      expect(screen.getByText('Открыта')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('link', {
        name: /Прогноз сдвига поставки long-lead AHU/,
      }),
    ).toHaveAttribute('href', '/issues/ISS-001');
    expect(screen.getAllByText('RISK-001').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MS-PS/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Риск: красный').length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByLabelText('Фильтр типа'), 'Risk');
    await waitFor(() => {
      expect(screen.queryByText('ISS-001')).not.toBeInTheDocument();
    });
    expect(screen.getAllByText('RISK-001').length).toBeGreaterThan(0);

    // Approved orphan Red Risk without Issue (fixture E+) — contract shape.
    const com = issuesRisks('E').rows.find((r) => r.id === 'RISK-COM-01')!;
    expect(com.type).toBe('Risk');
    expect(com.linkedIssueId).toBeNull();
    expect(com.rag).toBe('Red');
  });
});

describe('E4 Milestones register', () => {
  it('MS-PS A calm / C +21 Red / detail link; G/H residual shape', async () => {
    const user = userEvent.setup();
    render(wrap(<MilestonesPage />));
    await waitFor(() => {
      expect(screen.getByText('Готовность к производству')).toBeInTheDocument();
    });
    expect(screen.getByText('14 / 14')).toBeInTheDocument();
    expect(screen.getAllByText('Веха: зелёная').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('link', { name: 'Готовность к производству' }),
    ).toHaveAttribute('href', '/milestones/MS-PS');

    await selectDemoSnapshot(user, 'C');
    await waitFor(() => {
      expect(screen.getAllByText('Веха: красная').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('+21 день')).toBeInTheDocument();
    expect(screen.getByText('06.10.2027')).toBeInTheDocument();
    expect(screen.getByText('15.09.2027')).toBeInTheDocument();
    expect(screen.getAllByText(/RISK-001/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Ready for production/)).not.toBeInTheDocument();

    const g = milestones('G');
    const h = milestones('H');
    expect(g.items.find((i) => i.id === 'MS-PS')!.dateVariance.deltaDays).toBe(
      14,
    );
    expect(h.items.find((i) => i.id === 'MS-PS')!.rag).toBe('Red');
    expect(g.items.find((i) => i.id === 'MS-PS')!.forecastDate).toBe(
      '2027-09-29',
    );
  });
});
