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
  const delayed = snapshotId !== 'A';
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
      forecastProductionStart: delayed ? '2027-10-06' : '2027-09-15',
      productionStartVariance: {
        subject: 'production_start' as const,
        baselineDate: '2027-09-15',
        forecastDate: delayed ? '2027-10-06' : '2027-09-15',
        deltaDays: delayed ? 21 : 0,
      },
    },
    equipment: {
      id: 'EQ-HVAC-01',
      critical: true,
      status: delayed ? ('Delayed' as const) : ('OnTrack' as const),
      baselineDelivery: '2027-05-15',
      forecastDelivery: delayed ? '2027-06-05' : '2027-05-15',
      deliveryVariance: {
        subject: 'equipment_delivery' as const,
        baselineDate: '2027-05-15',
        forecastDate: delayed ? '2027-06-05' : '2027-05-15',
        deltaDays: delayed ? 21 : 0,
      },
    },
    issue:
      snapshotId === 'A'
        ? null
        : {
            id: 'ISS-001',
            title: 'HVAC long-lead delivery slip',
            status:
              snapshotId === 'C'
                ? ('Mitigating' as const)
                : ('Open' as const),
            equipmentId: 'EQ-HVAC-01',
            milestoneId: 'MS-PS',
          },
    risk: {
      id: 'RISK-001',
      rag: delayed ? ('Red' as const) : ('Green' as const),
      equipmentId: 'EQ-HVAC-01',
      milestoneId: 'MS-PS',
      issueId: snapshotId === 'A' ? null : 'ISS-001',
    },
    milestone: {
      id: 'MS-PS',
      name: 'Ready for production',
      rag: delayed ? ('Red' as const) : ('Green' as const),
      baselineDate: '2027-09-15',
      forecastDate: delayed ? '2027-10-06' : '2027-09-15',
    },
    decisionPanelState:
      snapshotId === 'C'
        ? ('recorded' as const)
        : delayed
          ? ('needed' as const)
          : ('absent' as const),
    decision: null,
    directEdges: [],
    derivedImpact: {
      rule: 'BR-004' as const,
      equipmentDeliveryDeltaDays: delayed ? 21 : 0,
      productionStartDeltaDays: delayed ? 21 : 0,
      kind: delayed ? ('aligned_slip' as const) : ('none' as const),
    },
    decisionHonesty: null,
  };
}

function equipment(snapshotId: SnapshotId) {
  const delayed = snapshotId !== 'A';
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    items: [
      {
        id: 'EQ-HVAC-01',
        critical: true,
        status: delayed ? ('Delayed' as const) : ('OnTrack' as const),
        baselineDelivery: '2027-05-15',
        forecastDelivery: delayed ? '2027-06-05' : '2027-05-15',
        deliveryVariance: {
          baselineDate: '2027-05-15',
          forecastDate: delayed ? '2027-06-05' : '2027-05-15',
          deltaDays: delayed ? 21 : 0,
        },
      },
    ],
  };
}

function issuesRisks(snapshotId: SnapshotId) {
  const delayed = snapshotId !== 'A';
  const rows = [];
  if (snapshotId !== 'A') {
    rows.push({
      type: 'Issue' as const,
      id: 'ISS-001',
      title: 'HVAC long-lead delivery slip',
      issueStatus:
        snapshotId === 'C'
          ? ('Mitigating' as const)
          : ('Open' as const),
      rag: null,
    });
  }
  rows.push({
    type: 'Risk' as const,
    id: 'RISK-001',
    title: 'RISK-001',
    issueStatus: null,
    rag: delayed ? ('Red' as const) : ('Green' as const),
  });
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    rows,
  };
}

function milestones(snapshotId: SnapshotId) {
  const delayed = snapshotId !== 'A';
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    items: [
      {
        id: 'MS-PS',
        name: 'Ready for production',
        rag: delayed ? ('Red' as const) : ('Green' as const),
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

describe('I4 registers presentation', () => {
  it('Equipment A/B: RU status + deltas; no Ready for production leak', async () => {
    const user = userEvent.setup();
    render(wrap(<EquipmentPage />));
    await waitFor(() => {
      expect(screen.getByText('По плану')).toBeInTheDocument();
    });
    expect(screen.getByText('без отклонения')).toBeInTheDocument();
    expect(screen.getAllByText('15.05.2027').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'EQ-HVAC-01' })).toHaveAttribute(
      'href',
      '/equipment/EQ-HVAC-01',
    );

    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() => {
      expect(screen.getByText('Задержка')).toBeInTheDocument();
    });
    expect(screen.getByText('+21 день')).toBeInTheDocument();
    expect(screen.getByText('05.06.2027')).toBeInTheDocument();
    expect(screen.queryByText(/\bOnTrack\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bDelayed\b/)).not.toBeInTheDocument();
  });

  it('Issues & Risks A/B/C: single table, RU labels, no Pending', async () => {
    const user = userEvent.setup();
    render(wrap(<IssuesRisksPage />));
    await waitFor(() => {
      expect(screen.getByText('Риск: зелёный')).toBeInTheDocument();
    });
    expect(screen.queryByText('ISS-001')).not.toBeInTheDocument();
    expect(screen.queryByText(/BA-OQ-006/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Demo v1/)).not.toBeInTheDocument();
    expect(screen.queryByText(/рабочее допущение/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'RISK-001' })).toHaveAttribute(
      'href',
      '/risks/RISK-001',
    );

    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() => {
      expect(screen.getByText('Открыта')).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Задержка поставки HVAC с длительным сроком изготовления/),
    ).toBeInTheDocument();
    expect(screen.getByText('Риск: красный')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ISS-001' })).toHaveAttribute(
      'href',
      '/issues/ISS-001',
    );

    await user.click(screen.getByRole('radio', { name: /^Снимок C$/ }));
    await waitFor(() => {
      expect(screen.getByText('Выполняются меры')).toBeInTheDocument();
    });
    expect(screen.queryByText(/\bPending\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/HVAC long-lead/)).not.toBeInTheDocument();
  });

  it('Milestones A/C: RU name + RAG + dates', async () => {
    const user = userEvent.setup();
    render(wrap(<MilestonesPage />));
    await waitFor(() => {
      expect(screen.getByText('Готовность к производству')).toBeInTheDocument();
    });
    expect(screen.getByText('Веха: зелёная')).toBeInTheDocument();
    expect(screen.getByText('без отклонения')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'MS-PS' })).toHaveAttribute(
      'href',
      '/milestones/MS-PS',
    );

    await user.click(screen.getByRole('radio', { name: /^Снимок C$/ }));
    await waitFor(() => {
      expect(screen.getByText('Веха: красная')).toBeInTheDocument();
    });
    expect(screen.getByText('+21 день')).toBeInTheDocument();
    expect(screen.getByText('06.10.2027')).toBeInTheDocument();
    expect(screen.queryByText(/Ready for production/)).not.toBeInTheDocument();
  });
});
