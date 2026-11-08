import { describe, expect, it } from 'vitest';
import {
  entityDetailHref,
  registerCtaLabel,
  registerHrefForEntity,
} from './entity-routes';
import { entityTypeLabel } from './ui-labels';

describe('entity-routes + labels for person', () => {
  it('maps person detail/register/cta/label', () => {
    expect(entityDetailHref('person', 'PER-01')).toBe('/people/PER-01');
    expect(registerHrefForEntity('person')).toBe('/people');
    expect(registerCtaLabel('person')).toBe('К участникам');
    expect(entityTypeLabel('person')).toBe('Участник');
  });

  it('keeps existing entity routes', () => {
    expect(entityDetailHref('equipment', 'EQ-1')).toBe('/equipment/EQ-1');
    expect(registerHrefForEntity('milestone')).toBe('/milestones');
    expect(registerCtaLabel('issue')).toBe('К проблемам и рискам');
  });
});
