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
import {
  spineDecision,
  spineEquipment,
  spineIssue,
  spineMilestone,
  spineRisk,
} from '@/lib/dashboard/spine';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { selectDemoSnapshot } from '@/lib/test/select-snapshot';

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
  return dashboardOverviewFixture(snapshotId);
}

function impact(snapshotId: SnapshotId) {
  const d = dash(snapshotId);
  const equipment = spineEquipment(d);
  const issue = spineIssue(d);
  const risk = spineRisk(d);
  const milestone = spineMilestone(d);
  const decision = spineDecision(d);
  return {
    kind: d.derivedImpact.kind,
    equipmentDeliveryDeltaDays: d.derivedImpact.equipmentDeliveryDeltaDays,
    productionStartDeltaDays: d.derivedImpact.productionStartDeltaDays,
    equipmentStatus: equipment.status,
    equipmentForecastDelivery: equipment.forecastDelivery,
    issueId: issue?.id ?? null,
    issueStatus: issue?.status ?? null,
    riskId: risk.id,
    riskRag: risk.rag,
    milestoneId: milestone.id,
    milestoneName: milestone.name,
    milestoneRag: milestone.rag,
    productionStartForecast: d.project.forecastProductionStart,
    decisionState: d.decisionPanelState,
    decision: decision
      ? {
          id: decision.id,
          type: decision.type,
          ownerRole: decision.ownerRole,
          dueDate: decision.dueDate,
          note: decision.note,
        }
      : null, // E1: Decision type includes AcceptDateSlip; dueDate nullable
    recoveryExecuted: d.decisionHonesty?.recoveryExecuted ?? null,
  } satisfies EntityImpact;
}

function eqDetail(snapshotId: SnapshotId) {
  const delayed = ['C', 'D', 'E', 'F'].includes(snapshotId);
  const residual = snapshotId === 'G' || snapshotId === 'H';
  const delta = residual ? 14 : delayed ? 21 : 0;
  const forecast =
    delta === 21 ? '2027-06-05' : delta === 14 ? '2027-05-29' : '2027-05-15';
  const links: EntityLink[] =
    delayed || residual
      ? [
          {
            targetType: 'issue',
            targetId: 'ISS-001',
            displayName: 'Прогноз сдвига поставки long-lead AHU',
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
      name: 'Приточная установка AHU (long-lead)',
      workstream: 'WS-HVAC' as const,
      critical: true,
      status: delta > 0 ? ('Delayed' as const) : ('OnTrack' as const),
      baselineDelivery: '2027-05-15',
      forecastDelivery: forecast,
      deliveryVariance: {
        baselineDate: '2027-05-15',
        forecastDate: forecast,
        deltaDays: delta,
      },
    },
    links,
    impact: impact(snapshotId),
  };
}

function issueDetail(snapshotId: SnapshotId) {
  if (snapshotId === 'A' || snapshotId === 'B') {
    throw new ApiClientError('Issue ISS-001 not found', 404);
  }
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    entity: {
      id: 'ISS-001',
      title: 'Прогноз сдвига поставки long-lead AHU',
      status: 'Open' as const,
      workstream: 'WS-HVAC' as const,
      owner: 'SH-PM-01',
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
  const delayed = ['C', 'D', 'E', 'F'].includes(snapshotId);
  const residual = snapshotId === 'G' || snapshotId === 'H';
  const delta = residual ? 14 : delayed ? 21 : 0;
  const forecast =
    delta === 21 ? '2027-10-06' : delta === 14 ? '2027-09-29' : '2027-09-15';
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRJ-01',
    entity: {
      id: 'MS-PS',
      name: 'Ready for production',
      workstream: null,
      rag: delta > 0 ? ('Red' as const) : ('Green' as const),
      baselineDate: '2027-09-15',
      forecastDate: forecast,
      dateVariance: {
        baselineDate: '2027-09-15',
        forecastDate: forecast,
        deltaDays: delta,
      },
    },
    links:
      delta > 0
        ? [
            {
              targetType: 'issue' as const,
              targetId: 'ISS-001',
              displayName: 'Прогноз сдвига поставки long-lead AHU',
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
  sessionStorage.clear();
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

describe('Entity Detail (E6 density + E7 A–H)', () => {
  it('Equipment C: Overview density; Links Issue+Risk, no Milestone; Impact +21', async () => {
    const user = userEvent.setup();
    (globalThis as { __testParams?: Record<string, string> }).__testParams = {
      id: 'EQ-HVAC-01',
    };
    render(wrap(<EquipmentDetailPage />));
    await selectDemoSnapshot(user, 'C');
    await waitFor(() => {
      expect(screen.getAllByText('Задержка').length).toBeGreaterThan(0);
    });
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Приточная установка AHU (long-lead)',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('EQ-HVAC-01').length).toBeGreaterThan(0);
    expect(screen.getByText('HVAC')).toBeInTheDocument();
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
    expect(screen.queryByText(/\bOnTrack\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bDelayed\b/)).not.toBeInTheDocument();
  });

  it('Equipment G: residual +14 Overview', async () => {
    const user = userEvent.setup();
    (globalThis as { __testParams?: Record<string, string> }).__testParams = {
      id: 'EQ-HVAC-01',
    };
    render(wrap(<EquipmentDetailPage />));
    await selectDemoSnapshot(user, 'G');
    await waitFor(() => {
      expect(screen.getAllByText(/\+14 /).length).toBeGreaterThan(0);
    });
    expect(screen.getByText('29.05.2027')).toBeInTheDocument();
  });

  it('Issue C Open; A EmptyState; B absent; no DEC honesty on C', async () => {
    const user = userEvent.setup();
    (globalThis as { __testParams?: Record<string, string> }).__testParams = {
      id: 'ISS-001',
    };
    render(wrap(<IssueDetailPage />));
    await selectDemoSnapshot(user, 'C');
    await waitFor(() => {
      expect(screen.getAllByText('Открыта').length).toBeGreaterThan(0);
    });
    await selectDemoSnapshot(user, 'A');
    await waitFor(() => {
      expect(
        screen.getByText('Проблема отсутствует в снимке A.'),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('link', { name: 'К проблемам и рискам' }),
    ).toHaveAttribute('href', '/issues-risks');

    await selectDemoSnapshot(user, 'B');
    await waitFor(() => {
      expect(
        screen.getByText('Проблема отсутствует в снимке B.'),
      ).toBeInTheDocument();
    });

    await selectDemoSnapshot(user, 'C');
    await waitFor(() => {
      expect(screen.getAllByText('Открыта').length).toBeGreaterThan(0);
    });
    expect(screen.queryByText('DEC-001')).not.toBeInTheDocument();
    expect(screen.queryByText(/ссылка/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Связи' }));
    expect(screen.getByRole('link', { name: /MS-PS/ })).toHaveAttribute(
      'href',
      '/milestones/MS-PS',
    );
    expect(screen.getByRole('link', { name: /EQ-HVAC-01/ })).toBeInTheDocument();
  });

  it('Milestone C: Links Issue+Risk, no Equipment', async () => {
    const user = userEvent.setup();
    (globalThis as { __testParams?: Record<string, string> }).__testParams = {
      id: 'MS-PS',
    };
    render(wrap(<MilestoneDetailPage />));
    await selectDemoSnapshot(user, 'C');
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
