import { describe, expect, it } from 'vitest';
import {
  entityDetailHref,
  hrefForUiRouteRef,
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
    expect(registerHrefForEntity('equipment')).toBe('/equipment');
    expect(registerHrefForEntity('issue')).toBe('/issues-risks');
    expect(registerHrefForEntity('risk')).toBe('/issues-risks');
    expect(registerCtaLabel('issue')).toBe('К проблемам и рискам');
    expect(registerCtaLabel('risk')).toBe('К проблемам и рискам');
    expect(registerCtaLabel('equipment')).toBe('К оборудованию');
    expect(registerCtaLabel('milestone')).toBe('К вехам');
  });
});

describe('hrefForUiRouteRef canonical builder', () => {
  it('maps typed EntityRefType via entityDetailHref', () => {
    expect(hrefForUiRouteRef('equipment', 'EQ-HVAC-01')).toBe(
      '/equipment/EQ-HVAC-01',
    );
    expect(hrefForUiRouteRef('issue', 'ISS-001')).toBe('/issues/ISS-001');
    expect(hrefForUiRouteRef('risk', 'RISK-001')).toBe('/risks/RISK-001');
    expect(hrefForUiRouteRef('milestone', 'MS-PS')).toBe('/milestones/MS-PS');
    expect(hrefForUiRouteRef('person', 'PER-01')).toBe('/people/PER-01');
  });

  it('maps UI-only portfolio / workstream routes', () => {
    expect(hrefForUiRouteRef('program', 'PRG-01')).toBe('/programs/PRG-01');
    expect(hrefForUiRouteRef('project', 'AN-20')).toBe('/projects/AN-20');
    expect(hrefForUiRouteRef('workstream', 'WS-HVAC')).toBe(
      '/workstreams/WS-HVAC',
    );
  });

  it('decision uses list filter q=; empty/KT unsupported → null', () => {
    expect(hrefForUiRouteRef('decision', 'DEC-001')).toBe(
      '/decisions?q=DEC-001',
    );
    expect(hrefForUiRouteRef('milestone', 'KT-IMP-01')).toBeNull();
    expect(hrefForUiRouteRef('equipment', '')).toBeNull();
    expect(hrefForUiRouteRef('issue', '   ')).toBeNull();
  });
});
