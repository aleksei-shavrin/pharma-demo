import { describe, expect, it } from 'vitest';
import { NAV_ITEMS, crumbForPath, entityIdFromPath } from './navigation';

describe('navigation', () => {
  it('labels people as Участники in nav and crumbs', () => {
    const people = NAV_ITEMS.find((item) => item.href === '/people');
    expect(people?.label).toBe('Участники');
    expect(people?.crumb).toBe('Участники');
    expect(crumbForPath('/people')).toBe('Участники');
    expect(crumbForPath('/people/P-1')).toBe('Участники');
  });

  it('resolves section crumbs and entity ids', () => {
    expect(crumbForPath('/schedule')).toBe('Календарный план');
    expect(crumbForPath('/programs')).toBe('Программы');
    expect(crumbForPath('/workstreams/WS-1')).toBe('Программы');
    expect(crumbForPath('/decisions')).toBe('Решения');
    expect(entityIdFromPath('/people/P%2F1')).toBe('P/1');
    expect(entityIdFromPath('/programs/PRG-1')).toBe('PRG-1');
    expect(entityIdFromPath('/')).toBeNull();
  });

  it('includes decisions register in primary nav after milestones', () => {
    const decisions = NAV_ITEMS.find((item) => item.href === '/decisions');
    expect(decisions?.label).toBe('Решения');
    const milestonesIdx = NAV_ITEMS.findIndex((i) => i.href === '/milestones');
    const decisionsIdx = NAV_ITEMS.findIndex((i) => i.href === '/decisions');
    const peopleIdx = NAV_ITEMS.findIndex((i) => i.href === '/people');
    expect(decisionsIdx).toBe(milestonesIdx + 1);
    expect(peopleIdx).toBe(decisionsIdx + 1);
  });
});
