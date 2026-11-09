import type { DashboardOverview } from '@/lib/api-client';

type ExceptionItem = DashboardOverview['topExceptions'][number];
type ExceptionLink = ExceptionItem['links'][number];

export type ExceptionCriticalAssessment = {
  critical: boolean;
  /** PS Δ chip only when linked to confirmed typed PS driver and Δ>0. */
  showPsDelta: boolean;
  primaryLink: ExceptionLink | null;
};

/** Exact typed PS-driver spine — id alone is not enough. */
const PS_DRIVER: ReadonlyArray<{ type: ExceptionLink['type']; id: string }> = [
  { type: 'equipment', id: 'EQ-HVAC-01' },
  { type: 'risk', id: 'RISK-001' },
  { type: 'milestone', id: 'MS-PS' },
];

function isTypedPsDriver(link: ExceptionLink): boolean {
  return PS_DRIVER.some((d) => d.type === link.type && d.id === link.id);
}

/**
 * Critical from linked snapshot facts only — not priority/index/regex.
 * Resolve typed entity first; broken refs never contribute evidence or primary.
 */
export function assessTopExceptionCritical(
  ex: ExceptionItem,
  data: DashboardOverview,
): ExceptionCriticalAssessment {
  let critical = false;
  let psDriverLinked = false;
  let primaryLink: ExceptionLink | null = null;

  for (const link of ex.links) {
    if (link.type === 'risk') {
      const risk = data.risks.find((r) => r.id === link.id);
      if (!risk) continue;
      if (isTypedPsDriver(link)) psDriverLinked = true;
      if (risk.rag === 'Red') {
        critical = true;
        primaryLink ??= link;
      }
      continue;
    }
    if (link.type === 'milestone') {
      const ms = data.milestones.find((m) => m.id === link.id);
      if (!ms) continue;
      if (isTypedPsDriver(link)) psDriverLinked = true;
      if (ms.rag === 'Red') {
        critical = true;
        primaryLink ??= link;
      }
      continue;
    }
    if (link.type === 'equipment') {
      const eq = data.equipment.find((e) => e.id === link.id);
      if (!eq) continue;
      if (isTypedPsDriver(link)) psDriverLinked = true;
      if (eq.critical && eq.status === 'Delayed') {
        critical = true;
        primaryLink ??= link;
      }
      continue;
    }
    if (link.type === 'issue') {
      const issue = data.issues.find((i) => i.id === link.id);
      if (!issue) continue;
      // Issue alone is not criticalEvidence; keep as navigable primary if nothing else.
      primaryLink ??= link;
    }
  }

  const psDelta = data.project.productionStartVariance?.deltaDays ?? 0;
  const showPsDelta = critical && psDriverLinked && psDelta > 0;

  return {
    critical,
    showPsDelta,
    // Never fall back to an unresolved/broken authored link.
    primaryLink,
  };
}
