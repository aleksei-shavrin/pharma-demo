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
