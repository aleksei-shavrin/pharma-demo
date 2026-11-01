import type { DashboardOverview } from '@/lib/api-client';

/** BR-004 / Live Presentation spine ids (unchanged). */
export const PS_DRIVER_EQUIPMENT_ID = 'EQ-HVAC-01';
export const PS_MILESTONE_ID = 'MS-PS';
export const PS_RISK_ID = 'RISK-001';
export const PS_ISSUE_ID = 'ISS-001';
export const PS_DECISION_ID = 'DEC-001';

function requireSpine<T>(
  value: T | undefined,
  id: string,
): T {
  if (value === undefined) {
    throw new Error(`Dashboard missing canonical spine entity ${id}`);
  }
  return value;
}

/** Primary HVAC equipment — EQ-HVAC-01 only (no array[0] fallback). */
export function spineEquipment(data: DashboardOverview) {
  return requireSpine(
    data.equipment.find((e) => e.id === PS_DRIVER_EQUIPMENT_ID),
    PS_DRIVER_EQUIPMENT_ID,
  );
}

export function spineMilestone(data: DashboardOverview) {
  return requireSpine(
    data.milestones.find((m) => m.id === PS_MILESTONE_ID),
    PS_MILESTONE_ID,
  );
}

export function spineRisk(data: DashboardOverview) {
  return requireSpine(
    data.risks.find((r) => r.id === PS_RISK_ID),
    PS_RISK_ID,
  );
}

/** Optional — null when ISS-001 absent. */
export function spineIssue(data: DashboardOverview) {
  return data.issues.find((i) => i.id === PS_ISSUE_ID) ?? null;
}

/** Optional — DEC-001 only; never another Decision. */
export function spineDecision(data: DashboardOverview) {
  return data.decisions.find((d) => d.id === PS_DECISION_ID) ?? null;
}
