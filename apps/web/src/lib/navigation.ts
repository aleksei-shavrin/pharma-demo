import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CalendarRange,
  Flag,
  LayoutDashboard,
  Users,
  Wrench,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  crumb: string;
};

/** Demo IA: Overview, Schedule, registers, People (R2-P1). No Workstreams top-level. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Обзор', icon: LayoutDashboard, crumb: 'Обзор' },
  {
    href: '/schedule',
    label: 'График',
    icon: CalendarRange,
    crumb: 'График',
  },
  {
    href: '/equipment',
    label: 'Оборудование',
    icon: Wrench,
    crumb: 'Оборудование',
  },
  {
    href: '/issues-risks',
    label: 'Проблемы и риски',
    icon: AlertTriangle,
    crumb: 'Проблемы и риски',
  },
  {
    href: '/milestones',
    label: 'Вехи',
    icon: Flag,
    crumb: 'Вехи',
  },
  {
    href: '/people',
    label: 'Люди',
    icon: Users,
    crumb: 'Люди',
  },
];

export function crumbForPath(pathname: string): string {
  const exact = NAV_ITEMS.find((n) => n.href === pathname);
  if (exact) return exact.crumb;
  if (pathname.startsWith('/equipment')) return 'Оборудование';
  if (
    pathname.startsWith('/issues-risks') ||
    pathname.startsWith('/issues') ||
    pathname.startsWith('/risks')
  ) {
    return 'Проблемы и риски';
  }
  if (pathname.startsWith('/milestones')) return 'Вехи';
  if (pathname.startsWith('/schedule')) return 'График';
  if (pathname.startsWith('/workstreams')) return 'Направление';
  if (pathname.startsWith('/people')) return 'Люди';
  return 'Обзор';
}

/** Optional entity id segment for detail breadcrumbs (Section / EntityId). */
export function entityIdFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;
  const [section, id] = segments;
  if (
    (section === 'equipment' ||
      section === 'issues' ||
      section === 'risks' ||
      section === 'milestones' ||
      section === 'workstreams' ||
      section === 'people') &&
    id
  ) {
    return decodeURIComponent(id);
  }
  return null;
}
