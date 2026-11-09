import type { NotificationEntityRef } from '@/lib/api-client';
import { hrefForUiRouteRef } from '@/lib/entity-routes';

/**
 * Soft navigation only — Decision has no detail route in Demo v1 N1
 * (register list filter is separate; notifications stay unlinked for decision).
 */
export function hrefForEntityRef(
  ref: NotificationEntityRef,
): string | null {
  if (ref.type === 'decision') return null;
  return hrefForUiRouteRef(ref.type, ref.id);
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
