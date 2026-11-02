import type { NotificationEntityRef } from '@/lib/api-client';

/** Soft navigation only — Decision has no detail route in Demo v1 N1. */
export function hrefForEntityRef(
  ref: NotificationEntityRef,
): string | null {
  switch (ref.type) {
    case 'equipment':
      return `/equipment/${encodeURIComponent(ref.id)}`;
    case 'issue':
      return `/issues/${encodeURIComponent(ref.id)}`;
    case 'risk':
      return `/risks/${encodeURIComponent(ref.id)}`;
    case 'milestone':
      return `/milestones/${encodeURIComponent(ref.id)}`;
    case 'person':
      return `/people/${encodeURIComponent(ref.id)}`;
    case 'workstream':
      return `/workstreams/${encodeURIComponent(ref.id)}`;
    case 'decision':
      return null;
    default:
      return null;
  }
}

export function resolveNotificationHref(
  href: string | null,
  entityRefs: NotificationEntityRef[],
): string | null {
  if (href && href.startsWith('/') && !href.startsWith('//')) {
    return href;
  }
  for (const ref of entityRefs) {
    const resolved = hrefForEntityRef(ref);
    if (resolved) return resolved;
  }
  return null;
}
