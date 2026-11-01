import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CalendarRange,
  Flag,
  LayoutDashboard,
  Wrench,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  crumb: string;
};

/** Approved IA (DOC-UX-002 / Implementation Plan I2) — exactly five sections. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, crumb: 'Dashboard' },
  {
    href: '/schedule',
    label: 'Schedule',
    icon: CalendarRange,
    crumb: 'Schedule',
  },
  {
    href: '/equipment',
    label: 'Equipment',
    icon: Wrench,
    crumb: 'Equipment',
  },
  {
    href: '/issues-risks',
    label: 'Issues & Risks',
    icon: AlertTriangle,
    crumb: 'Issues & Risks',
  },
  {
    href: '/milestones',
    label: 'Milestones',
    icon: Flag,
    crumb: 'Milestones',
  },
];

export function crumbForPath(pathname: string): string {
  const item = NAV_ITEMS.find((n) => n.href === pathname);
  return item?.crumb ?? 'Demo v1';
}
