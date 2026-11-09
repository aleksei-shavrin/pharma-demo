import type { EntityRefType } from '@/lib/api-client';

/**
 * UI-only linkable refs beyond API EntityRefType.
 * Does not widen EntityRefType / Nest contracts.
 */
export type UiRouteRefType =
  | EntityRefType
  | 'program'
  | 'project'
  | 'workstream'
  | 'decision';

/** FE typed detail routes — no generic /entity/[type]/[id]. */
export function entityDetailHref(type: EntityRefType, id: string): string {
  switch (type) {
    case 'equipment':
      return `/equipment/${encodeURIComponent(id)}`;
    case 'issue':
      return `/issues/${encodeURIComponent(id)}`;
    case 'risk':
      return `/risks/${encodeURIComponent(id)}`;
    case 'milestone':
      return `/milestones/${encodeURIComponent(id)}`;
    case 'person':
      return `/people/${encodeURIComponent(id)}`;
  }
}

/**
 * Canonical UI href for registers / soft links.
 * Empty / invalid / unsupported (e.g. KT-* milestones) → null (no fake href).
 * Decision → list filter `?q=` (no detail card in Demo v1).
 */
export function hrefForUiRouteRef(
  type: UiRouteRefType,
  id: string,
): string | null {
  const trimmed = id?.trim() ?? '';
  if (!trimmed) return null;

  switch (type) {
    case 'equipment':
    case 'issue':
    case 'risk':
    case 'person':
      return entityDetailHref(type, trimmed);
    case 'milestone':
      // Catalog cards are MS-*; imported KT-* checkpoints are not detail routes.
      if (trimmed.startsWith('KT-')) return null;
      return entityDetailHref('milestone', trimmed);
    case 'program':
      return `/programs/${encodeURIComponent(trimmed)}`;
    case 'project':
      return `/projects/${encodeURIComponent(trimmed)}`;
    case 'workstream':
      return `/workstreams/${encodeURIComponent(trimmed)}`;
    case 'decision':
      return `/decisions?q=${encodeURIComponent(trimmed)}`;
    default:
      return null;
  }
}

export function registerHrefForEntity(type: EntityRefType): string {
  switch (type) {
    case 'equipment':
      return '/equipment';
    case 'issue':
    case 'risk':
      return '/issues-risks';
    case 'milestone':
      return '/milestones';
    case 'person':
      return '/people';
  }
}

export function registerCtaLabel(type: EntityRefType): string {
  switch (type) {
    case 'equipment':
      return 'К оборудованию';
    case 'issue':
    case 'risk':
      return 'К проблемам и рискам';
    case 'milestone':
      return 'К вехам';
    case 'person':
      return 'К участникам';
  }
}
