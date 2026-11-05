/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { useEntityDetailQuery } from './use-entity-detail-query';

const fetchDashboardOverview = vi.fn(async (...args: [string, SnapshotId]) => {
  void args;
  return dashboardOverviewFixture('A');
});

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (
      ...args: Parameters<typeof actual.fetchDashboardOverview>
    ) => fetchDashboardOverview(...args),
  };
});

function wrap({ children }: { children: ReactNode }) {
  return React.createElement(SnapshotProvider, null, children);
}

type DetailStub = {
  snapshotId: SnapshotId;
  entity: { id: string };
};

describe('useEntityDetailQuery', () => {
  it('maps 404 to absent', async () => {
    sessionStorage.clear();
    const fetchDetail = vi.fn(
      async (...args: [string, string, SnapshotId]): Promise<DetailStub> => {
        void args;
        throw new ApiClientError('missing', 404);
      },
    );

    const { result } = renderHook(
      () => useEntityDetailQuery('ISS-001', fetchDetail),
      { wrapper: wrap },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('absent');
    });
    expect(result.current.data).toBeNull();
  });

  it('keeps coherent payload only for active snapshot', async () => {
    sessionStorage.clear();
    const fetchDetail = vi.fn(
      async (
        projectId: string,
        entityId: string,
        snapshot: SnapshotId,
      ): Promise<DetailStub> => {
        void projectId;
        void entityId;
        return {
          snapshotId: snapshot,
          entity: { id: 'EQ-HVAC-01' },
        };
      },
    );

    const { result } = renderHook(
      () => useEntityDetailQuery('EQ-HVAC-01', fetchDetail),
      { wrapper: wrap },
    );

    await waitFor(() => {
      expect(result.current.status).toBe('idle');
    });
    expect(result.current.data?.snapshotId).toBe('A');
  });
});
