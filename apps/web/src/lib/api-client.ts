/**
 * Thin HTTP API client — narrative data only via Nest API (REQ-NFR-001).
 * Must not import apps/api or fixture modules.
 */

import type { SnapshotId } from '@/lib/snapshot/snapshot-id';

export type ProjectStub = {
  id: string;
  name: string;
  baselineProductionStart: string;
  forecastProductionStart: string;
  snapshotId: string;
  scenarioAsOfDate: string;
};

export type HealthResponse = {
  status: string;
  service: string;
};

export type VarianceDto = {
  subject: 'equipment_delivery' | 'production_start';
  baselineDate: string;
  forecastDate: string;
  deltaDays: number;
};

export type DirectEdgeDto = {
  kind: 'direct';
  fromType: 'equipment' | 'issue' | 'risk' | 'milestone';
  fromId: string;
  toType: 'equipment' | 'issue' | 'risk' | 'milestone';
  toId: string;
};

export type DecisionPanelState = 'absent' | 'needed' | 'recorded';

export type DashboardOverview = {
  snapshotId: SnapshotId;
  scenarioAsOfDate: string;
  project: {
    id: string;
    name: string;
    baselineProductionStart: string;
    forecastProductionStart: string;
    productionStartVariance: VarianceDto;
  };
  equipment: {
    id: string;
    critical: boolean;
    status: 'OnTrack' | 'Delayed';
    baselineDelivery: string;
    forecastDelivery: string;
    deliveryVariance: VarianceDto;
  };
  issue: {
    id: string;
    title: string;
    status: 'Open' | 'Mitigating';
    equipmentId: string;
    milestoneId: string;
  } | null;
  risk: {
    id: string;
    rag: 'Green' | 'Red';
    equipmentId: string;
    milestoneId: string;
    issueId: string | null;
  };
  milestone: {
    id: string;
    name: string;
    rag: 'Green' | 'Red';
    baselineDate: string;
    forecastDate: string;
  };
  decisionPanelState: DecisionPanelState;
  decision: {
    id: string;
    type: 'PrioritizeRecovery';
    ownerRole: string;
    dueDate: string;
    note: string;
  } | null;
  /** Machine-readable direct Domain edges; not shown as engineering graph in UI. */
  directEdges: DirectEdgeDto[];
  derivedImpact: {
    rule: 'BR-004';
    equipmentDeliveryDeltaDays: number;
    productionStartDeltaDays: number;
    kind: 'none' | 'aligned_slip';
  };
  decisionHonesty: { recoveryExecuted: false } | null;
};

function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
}

async function getJson<T>(path: string): Promise<T> {
  const url = `${apiBaseUrl()}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function fetchHealth(): Promise<HealthResponse> {
  return getJson<HealthResponse>('/health');
}

export function fetchProjectStub(
  projectId: string,
  snapshot: SnapshotId,
): Promise<ProjectStub> {
  const qs = new URLSearchParams({ snapshot });
  return getJson<ProjectStub>(
    `/v1/projects/${encodeURIComponent(projectId)}?${qs.toString()}`,
  );
}

export function fetchDashboardOverview(
  projectId: string,
  snapshot: SnapshotId,
): Promise<DashboardOverview> {
  const qs = new URLSearchParams({ snapshot });
  return getJson<DashboardOverview>(
    `/v1/projects/${encodeURIComponent(projectId)}/dashboard?${qs.toString()}`,
  );
}

export function projectStubFromDashboard(
  dashboard: DashboardOverview,
): ProjectStub {
  return {
    id: dashboard.project.id,
    name: dashboard.project.name,
    baselineProductionStart: dashboard.project.baselineProductionStart,
    forecastProductionStart: dashboard.project.forecastProductionStart,
    snapshotId: dashboard.snapshotId,
    scenarioAsOfDate: dashboard.scenarioAsOfDate,
  };
}
