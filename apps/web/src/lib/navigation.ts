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
];

export function crumbForPath(pathname: string): string {
  const item = NAV_ITEMS.find((n) => n.href === pathname);
  return item?.crumb ?? 'Demo v1';
}
