import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CalendarRange,
  Flag,
  FolderKanban,
  LayoutDashboard,
  ListTree,
  Users,
  Wrench,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  crumb: string;
};

/** Demo IA: Dashboard, Schedule, registers, People (R2-P1). No Workstreams top-level. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Дашборд', icon: LayoutDashboard, crumb: 'Дашборд' },
  {
    href: '/programs',
    label: 'Программы',
    icon: FolderKanban,
    crumb: 'Программы',
  },
  {
    href: '/projects',
    label: 'Проекты',
    icon: ListTree,
    crumb: 'Проекты',
  },
  {
    href: '/schedule',
    label: 'Календарный план',
    icon: CalendarRange,
    crumb: 'Календарный план',
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
    label: 'Персоны',
    icon: Users,
    crumb: 'Персоны',
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
  if (pathname.startsWith('/schedule')) return 'Календарный план';
  if (pathname.startsWith('/programs')) return 'Программы';
  if (pathname.startsWith('/projects')) return 'Проекты';
  if (pathname.startsWith('/workstreams')) return 'Направление';
  if (pathname.startsWith('/people')) return 'Персоны';
  return 'Дашборд';
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
      section === 'people' ||
      section === 'programs' ||
      section === 'projects') &&
    id
  ) {
    return decodeURIComponent(id);
  }
  return null;
}
