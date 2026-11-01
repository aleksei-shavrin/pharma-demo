/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@/lib/api-client';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { useEntityDetailQuery } from './use-entity-detail-query';

const fetchDashboardOverview = vi.fn(async () => ({
  snapshotId: 'A',
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
}));

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...a: unknown[]) => fetchDashboardOverview(...a),
  };
});

function wrap({ children }: { children: ReactNode }) {
  return React.createElement(SnapshotProvider, null, children);
}

describe('useEntityDetailQuery', () => {
  it('maps 404 to absent', async () => {
    const fetchDetail = vi.fn(async () => {
      throw new ApiClientError('missing', 404);
    });

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
    const fetchDetail = vi.fn(
      async (_p: string, _id: string, snapshot: string) => ({
        snapshotId: snapshot,
        entity: { id: 'EQ-HVAC-01' },
      }),
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
