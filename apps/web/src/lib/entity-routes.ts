import type { EntityRefType } from '@/lib/api-client';

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
