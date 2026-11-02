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
  fromType: 'equipment' | 'issue' | 'risk' | 'milestone' | 'decision';
  fromId: string;
  toType: 'equipment' | 'issue' | 'risk' | 'milestone' | 'decision';
  toId: string;
};

export type DecisionPanelState = 'absent' | 'needed' | 'recorded';
export type WorkstreamId =
  | 'WS-BLD'
  | 'WS-CLN'
  | 'WS-HVAC'
  | 'WS-UTL'
  | 'WS-PRD'
  | 'WS-PKG'
  | 'WS-QC'
  | 'WS-AUT';

export type ProjectStatus = 'Green' | 'Yellow' | 'Red';

/** Collection-shaped Dashboard contract (E1+). */
export type DashboardOverview = {
  snapshotId: SnapshotId;
  scenarioAsOfDate: string;
  projectStatus: ProjectStatus;
  project: {
    id: string;
    name: string;
    baselineProductionStart: string;
    forecastProductionStart: string;
    productionStartVariance: VarianceDto;
  };
  equipment: {
    id: string;
    name: string;
    critical: boolean;
    status: 'OnTrack' | 'Delayed';
    workstream: WorkstreamId;
    baselineDelivery: string;
    forecastDelivery: string;
    deliveryVariance: VarianceDto;
  }[];
  issues: {
    id: string;
    title: string;
    status: 'Open' | 'Mitigating' | 'Closed';
    workstream: WorkstreamId;
    equipmentId: string;
    milestoneId: string | null;
  }[];
  risks: {
    id: string;
    title: string;
    rag: 'Green' | 'Red';
    workstream: WorkstreamId;
    equipmentId: string | null;
    milestoneId: string | null;
    issueId: string | null;
  }[];
  milestones: {
    id: string;
    name: string;
    rag: 'Green' | 'Red';
    workstream: WorkstreamId | null;
    baselineDate: string;
    forecastDate: string;
  }[];
  decisions: {
    id: string;
    projectId: string;
    milestoneId: string | null;
    type: 'PrioritizeRecovery' | 'AcceptDateSlip';
    ownerRole: string;
    dueDate: string | null;
    note: string;
  }[];
  workstreamRollups: { workstream: WorkstreamId; status: ProjectStatus }[];
  topExceptions: {
    id: string;
    title: string;
    causeImpact: string;
    links: { type: 'equipment' | 'issue' | 'risk' | 'milestone'; id: string }[];
    /** Read-model curated order only — not Domain. */
    priority: number;
  }[];
  trend: {
    better: string[];
    worse: string[];
    unchangedCritical: string[];
  };
  decisionPanelState: DecisionPanelState;
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

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 404;
}

function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
}

async function getJson<T>(path: string): Promise<T> {
  const url = `${apiBaseUrl()}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new ApiClientError(
      `API ${path} failed: ${res.status} ${res.statusText}`,
      res.status,
    );
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

export type RegisterVariance = {
  baselineDate: string;
  forecastDate: string;
  deltaDays: number;
};

export type EquipmentRegister = {
  snapshotId: SnapshotId;
  scenarioAsOfDate: string;
  projectId: string;
  items: {
    id: string;
    name: string;
    critical: boolean;
    workstream: WorkstreamId;
    status: 'OnTrack' | 'Delayed';
    baselineDelivery: string;
    forecastDelivery: string;
    deliveryVariance: RegisterVariance;
    relatedActiveIssueIds: string[];
    relatedRedRiskIds: string[];
  }[];
};

export type IssuesRisksRegister = {
  snapshotId: SnapshotId;
  scenarioAsOfDate: string;
  projectId: string;
  rows: {
    type: 'Issue' | 'Risk';
    id: string;
    title: string;
    workstream: WorkstreamId;
    issueStatus: 'Open' | 'Mitigating' | 'Closed' | null;
    rag: 'Green' | 'Red' | null;
    equipmentId: string | null;
    linkedIssueId: string | null;
    linkedRiskId: string | null;
    milestoneId: string | null;
  }[];
};

export type MilestonesRegister = {
  snapshotId: SnapshotId;
  scenarioAsOfDate: string;
  projectId: string;
  items: {
    id: string;
    name: string;
    workstream: WorkstreamId | null;
    rag: 'Green' | 'Red';
    baselineDate: string;
    forecastDate: string;
    dateVariance: RegisterVariance;
    relatedActiveIssueIds: string[];
    relatedRedRiskIds: string[];
  }[];
};

export function fetchEquipmentRegister(
  projectId: string,
  snapshot: SnapshotId,
): Promise<EquipmentRegister> {
  const qs = new URLSearchParams({ snapshot });
  return getJson<EquipmentRegister>(
    `/v1/projects/${encodeURIComponent(projectId)}/equipment?${qs.toString()}`,
  );
}

export function fetchIssuesRisksRegister(
  projectId: string,
  snapshot: SnapshotId,
): Promise<IssuesRisksRegister> {
  const qs = new URLSearchParams({ snapshot });
  return getJson<IssuesRisksRegister>(
    `/v1/projects/${encodeURIComponent(projectId)}/issues-risks?${qs.toString()}`,
  );
}

export function fetchMilestonesRegister(
  projectId: string,
  snapshot: SnapshotId,
): Promise<MilestonesRegister> {
  const qs = new URLSearchParams({ snapshot });
  return getJson<MilestonesRegister>(
    `/v1/projects/${encodeURIComponent(projectId)}/milestones?${qs.toString()}`,
  );
}

export type EntityRefType = 'equipment' | 'issue' | 'risk' | 'milestone';

export type EntityLink = {
  targetType: EntityRefType;
  targetId: string;
  displayName: string;
};

export type EntityImpact = {
  kind: 'none' | 'aligned_slip';
  equipmentDeliveryDeltaDays: number;
  productionStartDeltaDays: number;
  equipmentStatus: 'OnTrack' | 'Delayed';
  equipmentForecastDelivery: string;
  issueId: string | null;
  issueStatus: 'Open' | 'Mitigating' | 'Closed' | null;
  riskId: string;
  riskRag: 'Green' | 'Red';
  milestoneId: string;
  milestoneName: string;
  milestoneRag: 'Green' | 'Red';
  productionStartForecast: string;
  decisionState: DecisionPanelState;
  decision: {
    id: string;
    type: 'PrioritizeRecovery' | 'AcceptDateSlip';
    ownerRole: string;
    dueDate: string | null;
    note: string;
  } | null;
  recoveryExecuted: false | null;
};

type DetailEnvelope<E> = {
  snapshotId: SnapshotId;
  scenarioAsOfDate: string;
  projectId: string;
  entity: E;
  links: EntityLink[];
  impact: EntityImpact;
};

export type EquipmentDetail = DetailEnvelope<{
  id: string;
  critical: boolean;
  status: 'OnTrack' | 'Delayed';
  baselineDelivery: string;
  forecastDelivery: string;
  deliveryVariance: RegisterVariance;
}>;

export type IssueDetail = DetailEnvelope<{
  id: string;
  title: string;
  status: 'Open' | 'Mitigating' | 'Closed';
  owner: string;
}>;

export type RiskDetail = DetailEnvelope<{
  id: string;
  rag: 'Green' | 'Red';
}>;

export type MilestoneDetail = DetailEnvelope<{
  id: string;
  name: string;
  rag: 'Green' | 'Red';
  baselineDate: string;
  forecastDate: string;
  dateVariance: RegisterVariance;
}>;

export function fetchEquipmentDetail(
  projectId: string,
  entityId: string,
  snapshot: SnapshotId,
): Promise<EquipmentDetail> {
  const qs = new URLSearchParams({ snapshot });
  return getJson<EquipmentDetail>(
    `/v1/projects/${encodeURIComponent(projectId)}/equipment/${encodeURIComponent(entityId)}?${qs.toString()}`,
  );
}

export function fetchIssueDetail(
  projectId: string,
  entityId: string,
  snapshot: SnapshotId,
): Promise<IssueDetail> {
  const qs = new URLSearchParams({ snapshot });
  return getJson<IssueDetail>(
    `/v1/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(entityId)}?${qs.toString()}`,
  );
}

export function fetchRiskDetail(
  projectId: string,
  entityId: string,
  snapshot: SnapshotId,
): Promise<RiskDetail> {
  const qs = new URLSearchParams({ snapshot });
  return getJson<RiskDetail>(
    `/v1/projects/${encodeURIComponent(projectId)}/risks/${encodeURIComponent(entityId)}?${qs.toString()}`,
  );
}

export function fetchMilestoneDetail(
  projectId: string,
  entityId: string,
  snapshot: SnapshotId,
): Promise<MilestoneDetail> {
  const qs = new URLSearchParams({ snapshot });
  return getJson<MilestoneDetail>(
    `/v1/projects/${encodeURIComponent(projectId)}/milestones/${encodeURIComponent(entityId)}?${qs.toString()}`,
  );
}

export type ScheduleEquipmentItem = {
  kind: 'equipment_delivery';
  id: string;
  name: string;
  workstream: WorkstreamId;
  critical: boolean;
  status: 'OnTrack' | 'Delayed';
  baselineDate: string;
  forecastDate: string;
  dateVariance: RegisterVariance;
};

export type ScheduleMilestoneItem = {
  kind: 'milestone';
  id: string;
  name: string;
  workstream: WorkstreamId | null;
  rag: 'Green' | 'Red';
  baselineDate: string;
  forecastDate: string;
  dateVariance: RegisterVariance;
};

export type ScheduleItem = ScheduleEquipmentItem | ScheduleMilestoneItem;

export type ScheduleReadModel = {
  snapshotId: SnapshotId;
  scenarioAsOfDate: string;
  projectId: string;
  items: ScheduleItem[];
};

export function fetchSchedule(
  projectId: string,
  snapshot: SnapshotId,
): Promise<ScheduleReadModel> {
  const qs = new URLSearchParams({ snapshot });
  return getJson<ScheduleReadModel>(
    `/v1/projects/${encodeURIComponent(projectId)}/schedule?${qs.toString()}`,
  );
}
