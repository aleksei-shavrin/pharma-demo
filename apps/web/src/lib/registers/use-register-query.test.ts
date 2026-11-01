/** @vitest-environment jsdom */
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { useRegisterQuery } from './use-register-query';

const fetchDashboardOverview = vi.fn();
const fetchRegister = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...args: unknown[]) =>
      fetchDashboardOverview(...args),
  };
});

function dash(snapshotId: SnapshotId) {
  return {
    snapshotId,
    scenarioAsOfDate: '2027-02-15',
    project: {
      id: 'PRJ-01',
      name: 'Строительство фармацевтического завода',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: '2027-09-15',
      productionStartVariance: {
        subject: 'production_start' as const,
        baselineDate: '2027-09-15',
        forecastDate: '2027-09-15',
        deltaDays: 0,
      },
    },
    equipment: {
      id: 'EQ-HVAC-01',
      critical: true,
      status: 'OnTrack' as const,
      baselineDelivery: '2027-05-15',
      forecastDelivery: '2027-05-15',
      deliveryVariance: {
        subject: 'equipment_delivery' as const,
        baselineDate: '2027-05-15',
        forecastDate: '2027-05-15',
        deltaDays: 0,
      },
    },
    issue: null,
    risk: {
      id: 'RISK-001',
      rag: 'Green' as const,
      equipmentId: 'EQ-HVAC-01',
      milestoneId: 'MS-PS',
      issueId: null,
    },
    milestone: {
      id: 'MS-PS',
      name: 'Ready for production',
      rag: 'Green' as const,
      baselineDate: '2027-09-15',
      forecastDate: '2027-09-15',
    },
    decisionPanelState: 'absent' as const,
    decision: null,
    directEdges: [],
    derivedImpact: {
      rule: 'BR-004' as const,
      equipmentDeliveryDeltaDays: 0,
      productionStartDeltaDays: 0,
      kind: 'none' as const,
    },
    decisionHonesty: null,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('useRegisterQuery', () => {
  it('does not expose payload when snapshotId mismatches active', async () => {
    fetchDashboardOverview.mockResolvedValue(dash('A'));
    fetchRegister.mockResolvedValue({
      snapshotId: 'B',
      scenarioAsOfDate: '2027-03-01',
      projectId: 'PRJ-01',
      items: [],
    });

    const { result } = renderHook(() => useRegisterQuery(fetchRegister), {
      wrapper: SnapshotProvider,
    });

    await waitFor(() => {
      expect(fetchRegister).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.data).toBeNull();
  });

  it('commits coherent payload for active snapshot', async () => {
    fetchDashboardOverview.mockResolvedValue(dash('A'));
    fetchRegister.mockResolvedValue({
      snapshotId: 'A',
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      items: [{ id: 'EQ-HVAC-01' }],
    });

    const { result } = renderHook(() => useRegisterQuery(fetchRegister), {
      wrapper: SnapshotProvider,
    });

    await waitFor(() => {
      expect(result.current.data?.snapshotId).toBe('A');
    });
    expect(result.current.status).toBe('idle');
  });
});
