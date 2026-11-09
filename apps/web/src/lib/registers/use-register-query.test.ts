/** @vitest-environment jsdom */
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
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
  return dashboardOverviewFixture(snapshotId);
}

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.clearAllMocks();
});

describe('useRegisterQuery', () => {
  it('does not expose payload when snapshotId mismatches active', async () => {
    sessionStorage.clear();
    fetchDashboardOverview.mockResolvedValue(dash('01'));
    fetchRegister.mockResolvedValue({
      snapshotId: '02',
      scenarioAsOfDate: '2027-03-01',
      projectId: 'PRT-01',
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
    fetchDashboardOverview.mockResolvedValue(dash('01'));
    fetchRegister.mockResolvedValue({
      snapshotId: '01',
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRT-01',
      items: [{ id: 'EQ-HVAC-01' }],
    });

    const { result } = renderHook(() => useRegisterQuery(fetchRegister), {
      wrapper: SnapshotProvider,
    });

    await waitFor(() => {
      expect(result.current.data?.snapshotId).toBe('01');
    });
    expect(result.current.status).toBe('idle');
  });
});
