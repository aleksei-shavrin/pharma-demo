/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EquipmentDetailPage from '@/app/equipment/[id]/page';
import IssueDetailPage from '@/app/issues/[id]/page';
import MilestoneDetailPage from '@/app/milestones/[id]/page';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';
import { ApiClientError } from '@/lib/api-client';
import type { EntityImpact, EntityLink } from '@/lib/api-client';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';

const fetchDashboardOverview = vi.fn();
const fetchEquipmentDetail = vi.fn();
const fetchIssueDetail = vi.fn();
const fetchMilestoneDetail = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...a: unknown[]) => fetchDashboardOverview(...a),
    fetchEquipmentDetail: (...a: unknown[]) => fetchEquipmentDetail(...a),
    fetchIssueDetail: (...a: unknown[]) => fetchIssueDetail(...a),
    fetchMilestoneDetail: (...a: unknown[]) => fetchMilestoneDetail(...a),
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
    decision:
      snapshotId === 'C'
        ? {
            id: 'DEC-001',
            type: 'PrioritizeRecovery' as const,
            ownerRole: 'SH-006',
            dueDate: '2027-03-20',
            note: 'Expedite vendor / alternate lane',
          }
        : null,
    directEdges: [],
    derivedImpact: {
      rule: 'BR-004' as const,
      equipmentDeliveryDeltaDays: delayed ? 21 : 0,
      productionStartDeltaDays: delayed ? 21 : 0,
      kind: delayed ? ('aligned_slip' as const) : ('none' as const),
    },
    decisionHonesty:
      snapshotId === 'C' ? { recoveryExecuted: false as const } : null,
  };
}

function impact(snapshotId: SnapshotId) {
  const d = dash(snapshotId);
  return {
    kind: d.derivedImpact.kind,
    equipmentDeliveryDeltaDays: d.derivedImpact.equipmentDeliveryDeltaDays,
    productionStartDeltaDays: d.derivedImpact.productionStartDeltaDays,
    equipmentStatus: d.equipment.status,
    equipmentForecastDelivery: d.equipment.forecastDelivery,
    issueId: d.issue?.id ?? null,
    issueStatus: d.issue?.status ?? null,
    riskId: d.risk.id,
    riskRag: d.risk.rag,
    milestoneId: d.milestone.id,
    milestoneName: d.milestone.name,
    milestoneRag: d.milestone.rag,
    productionStartForecast: d.project.forecastProductionStart,
    decisionState: d.decisionPanelState,
    decision: d.decision,
    recoveryExecuted: d.decisionHonesty?.recoveryExecuted ?? null,
  } satisfies EntityImpact;
}

function eqDetail(snapshotId: SnapshotId) {
  const delayed = snapshotId !== 'A';
  const links: EntityLink[] = delayed
    ? [
        {
          targetType: 'issue',
          targetId: 'ISS-001',
          displayName: 'HVAC long-lead delivery slip',
        },
        { targetType: 'risk', targetId: 'RISK-001', displayName: 'RISK-001' },
      ]
    : [{ targetType: 'risk', targetId: 'RISK-001', displayName: 'RISK-001' }];
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    entity: {
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
    links,
    impact: impact(snapshotId),
  };
}

function issueDetail(snapshotId: SnapshotId) {
  if (snapshotId === 'A') {
    throw new ApiClientError('Issue ISS-001 not found', 404);
  }
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    entity: {
      id: 'ISS-001',
      title: 'HVAC long-lead delivery slip',
      status:
        snapshotId === 'C' ? ('Mitigating' as const) : ('Open' as const),
      owner: 'SH-002',
    },
    links: [
      {
        targetType: 'equipment' as const,
        targetId: 'EQ-HVAC-01',
        displayName: 'EQ-HVAC-01',
      },
      {
        targetType: 'risk' as const,
        targetId: 'RISK-001',
        displayName: 'RISK-001',
      },
      {
        targetType: 'milestone' as const,
        targetId: 'MS-PS',
        displayName: 'Ready for production',
      },
    ],
    impact: impact(snapshotId),
  };
}

function msDetail(snapshotId: SnapshotId) {
  const delayed = snapshotId !== 'A';
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    entity: {
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
    links: delayed
      ? [
          {
            targetType: 'issue' as const,
            targetId: 'ISS-001',
            displayName: 'HVAC long-lead delivery slip',
          },
          {
            targetType: 'risk' as const,
            targetId: 'RISK-001',
            displayName: 'RISK-001',
          },
        ]
      : [
          {
            targetType: 'risk' as const,
            targetId: 'RISK-001',
            displayName: 'RISK-001',
          },
        ],
    impact: impact(snapshotId),
  };
}

function wrap(node: ReactNode) {
  return (
    <SnapshotProvider>
      <SnapshotSelector />
      {node}
    </SnapshotProvider>
  );
}

afterEach(() => {
  cleanup();
  delete (globalThis as { __testParams?: unknown }).__testParams;
});

beforeEach(() => {
  fetchDashboardOverview.mockImplementation(async (_id: string, s: SnapshotId) =>
    dash(s),
  );
  fetchEquipmentDetail.mockImplementation(
    async (_p: string, _id: string, s: SnapshotId) => eqDetail(s),
  );
  fetchIssueDetail.mockImplementation(
    async (_p: string, _id: string, s: SnapshotId) => issueDetail(s),
  );
  fetchMilestoneDetail.mockImplementation(
    async (_p: string, _id: string, s: SnapshotId) => msDetail(s),
  );
});

describe('Entity Detail I5', () => {
  it('Equipment B: Links Issue+Risk, no Milestone; Impact +21; RU labels', async () => {
    const user = userEvent.setup();
    (globalThis as { __testParams?: Record<string, string> }).__testParams = {
      id: 'EQ-HVAC-01',
    };
    render(wrap(<EquipmentDetailPage />));
    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() => {
      expect(screen.getAllByText('Задержка').length).toBeGreaterThan(0);
    });
    await user.click(screen.getByRole('tab', { name: 'Связи' }));
    expect(screen.getByRole('link', { name: /ISS-001/ })).toHaveAttribute(
      'href',
      '/issues/ISS-001',
    );
    expect(screen.getByRole('link', { name: /RISK-001/ })).toHaveAttribute(
      'href',
      '/risks/RISK-001',
    );
    expect(screen.queryByRole('link', { name: /MS-PS/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Влияние' }));
    expect(screen.getByRole('heading', { name: 'Влияние' })).toBeInTheDocument();
    expect(screen.getAllByText(/\+21 день/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/BR-004/)).not.toBeInTheDocument();
    expect(screen.queryByText(/derivedImpact/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bOnTrack\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bDelayed\b/)).not.toBeInTheDocument();
  });

  it('Issue B→A EmptyState same route; A→C Mitigating; C honesty', async () => {
    const user = userEvent.setup();
    (globalThis as { __testParams?: Record<string, string> }).__testParams = {
      id: 'ISS-001',
    };
    render(wrap(<IssueDetailPage />));
    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() => {
      expect(screen.getAllByText('Открыта').length).toBeGreaterThan(0);
    });
    await user.click(screen.getByRole('radio', { name: /Снимок A/ }));
    await waitFor(() => {
      expect(
        screen.getByText('Проблема отсутствует в снимке A.'),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText(/Сущность/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Маршрут сохранён/)).not.toBeInTheDocument();
    expect(screen.queryByText(/данные другого снимка/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'К проблемам и рискам' }),
    ).toHaveAttribute('href', '/issues-risks');
    expect(screen.queryByText('Открыта')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /^Снимок C$/ }));
    await waitFor(() => {
      expect(screen.getAllByText('Выполняются меры').length).toBeGreaterThan(0);
    });
    await user.click(screen.getByRole('tab', { name: 'Влияние' }));
    expect(
      screen.getByText(/восстановление прогноза ещё не произошло/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/восстановление.*выполнен/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/BA-OQ/)).not.toBeInTheDocument();
  });

  it('Milestone B: Links Issue+Risk, no Equipment', async () => {
    const user = userEvent.setup();
    (globalThis as { __testParams?: Record<string, string> }).__testParams = {
      id: 'MS-PS',
    };
    render(wrap(<MilestoneDetailPage />));
    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() => {
      expect(screen.getAllByText('Веха: красная').length).toBeGreaterThan(0);
    });
    await user.click(screen.getByRole('tab', { name: 'Связи' }));
    const linksPanel = screen.getByRole('tabpanel');
    expect(within(linksPanel).getByRole('link', { name: /ISS-001/ })).toHaveAttribute(
      'href',
      '/issues/ISS-001',
    );
    expect(within(linksPanel).queryByRole('link', { name: /EQ-HVAC/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Ready for production/)).not.toBeInTheDocument();
  });
});
