import { describe, expect, it } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { assessTopExceptionCritical } from './top-exception-critical';

function baseData(
  overrides: Partial<DashboardOverview> = {},
): DashboardOverview {
  return {
    snapshotId: '06',
    scenarioAsOfDate: '2027-04-20',
    projectStatus: 'Red',
    executiveMilestoneIds: ['MS-PS'],
    project: {
      id: 'PRT-01',
      name: 'Plant',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: '2027-10-06',
      productionStartVariance: {
        subject: 'production_start',
        baselineDate: '2027-09-15',
        forecastDate: '2027-10-06',
        deltaDays: 21,
      },
    },
    equipment: [
      {
        id: 'EQ-HVAC-01',
        name: 'AHU',
        critical: true,
        status: 'Delayed',
        workstream: 'WS-HVAC',
        baselineDelivery: '2027-05-15',
        forecastDelivery: '2027-06-05',
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: '2027-05-15',
          forecastDate: '2027-06-05',
          deltaDays: 21,
        },
      },
    ],
    issues: [],
    risks: [
      { id: 'RISK-001', title: 'PS risk', rag: 'Red', workstream: 'WS-HVAC' },
      { id: 'RISK-UTL-01', title: 'WFI', rag: 'Red', workstream: 'WS-UTL' },
      { id: 'RISK-GREEN', title: 'ok', rag: 'Green', workstream: 'WS-HVAC' },
    ],
    milestones: [
      {
        id: 'MS-PS',
        name: 'PS',
        rag: 'Red',
        workstream: null,
        baselineDate: '2027-09-15',
        forecastDate: '2027-10-06',
      },
      {
        id: 'MS-UTL-WFI',
        name: 'WFI',
        rag: 'Red',
        workstream: 'WS-UTL',
        baselineDate: '2027-06-01',
        forecastDate: '2027-06-19',
      },
    ],
    decisions: [],
    workstreamRollups: [],
    programs: [],
    topExceptions: [],
    trend: { better: [], worse: [], unchangedCritical: [] },
    decisionPanelState: 'recorded',
    directEdges: [],
    derivedImpact: {
      rule: 'BR-004',
      equipmentDeliveryDeltaDays: 21,
      productionStartDeltaDays: 21,
      kind: 'aligned_slip',
    },
    decisionHonesty: {
      recoveryExecuted: false,
      forecastDeviation: 'deviation_persists',
    },
    ...overrides,
  } as DashboardOverview;
}

describe('assessTopExceptionCritical', () => {
  it('marks critical from linked Red risk; PS Δ only for typed driver links', () => {
    const data = baseData();
    const ps = assessTopExceptionCritical(
      {
        id: 'TEX-PS',
        title: 'PS',
        causeImpact: 'text without plus digits',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 2,
      },
      data,
    );
    expect(ps.critical).toBe(true);
    expect(ps.showPsDelta).toBe(true);

    const wfi = assessTopExceptionCritical(
      {
        id: 'TEX-WFI',
        title: 'WFI',
        causeImpact: 'Δ остаётся +21 fake',
        links: [
          { type: 'risk', id: 'RISK-UTL-01' },
          { type: 'milestone', id: 'MS-UTL-WFI' },
        ],
        priority: 1,
      },
      data,
    );
    expect(wfi.critical).toBe(true);
    expect(wfi.showPsDelta).toBe(false);
  });

  it('broken refs stay non-critical and have no primaryLink', () => {
    const data = baseData();
    const broken = assessTopExceptionCritical(
      {
        id: 'TEX-X',
        title: 'broken',
        causeImpact: 'запуск +99',
        links: [{ type: 'risk', id: 'RISK-MISSING' }],
        priority: 1,
      },
      data,
    );
    expect(broken.critical).toBe(false);
    expect(broken.showPsDelta).toBe(false);
    expect(broken.primaryLink).toBeNull();
  });

  it('mismatched type+id does not count as PS driver even if id matches', () => {
    const data = baseData();
    // RISK-001 id on wrong type (issue) — must not unlock PS delta.
    const mismatched = assessTopExceptionCritical(
      {
        id: 'TEX-MIS',
        title: 'mis',
        causeImpact: 'x',
        links: [
          { type: 'issue', id: 'RISK-001' },
          { type: 'risk', id: 'RISK-UTL-01' },
        ],
        priority: 1,
      },
      data,
    );
    expect(mismatched.critical).toBe(true);
    expect(mismatched.showPsDelta).toBe(false);
  });

  it('broken PS-looking id + unrelated critical risk does not show PS delta', () => {
    const data = baseData();
    const mixed = assessTopExceptionCritical(
      {
        id: 'TEX-MIX',
        title: 'mix',
        causeImpact: 'x',
        links: [
          { type: 'milestone', id: 'MS-PS' }, // would be driver if resolved — remove MS-PS from data
          { type: 'risk', id: 'RISK-UTL-01' },
        ],
        priority: 1,
      },
      {
        ...data,
        milestones: data.milestones.filter((m) => m.id !== 'MS-PS'),
      },
    );
    expect(mixed.critical).toBe(true);
    expect(mixed.showPsDelta).toBe(false);
    expect(mixed.primaryLink?.id).toBe('RISK-UTL-01');
  });

  it('green linked risk is not critical; priority/index ignored', () => {
    const data = baseData();
    const green = assessTopExceptionCritical(
      {
        id: 'TEX-G',
        title: 'g',
        causeImpact: 'x',
        links: [{ type: 'risk', id: 'RISK-GREEN' }],
        priority: 1,
      },
      data,
    );
    expect(green.critical).toBe(false);
  });

  it('multiple critical rows stay independent (no index severity)', () => {
    const data = baseData();
    const a = assessTopExceptionCritical(
      {
        id: 'T1',
        title: 'a',
        causeImpact: 'x',
        links: [{ type: 'risk', id: 'RISK-UTL-01' }],
        priority: 9,
      },
      data,
    );
    const b = assessTopExceptionCritical(
      {
        id: 'T2',
        title: 'b',
        causeImpact: 'x',
        links: [
          { type: 'risk', id: 'RISK-001' },
          { type: 'milestone', id: 'MS-PS' },
        ],
        priority: 1,
      },
      data,
    );
    expect(a.critical).toBe(true);
    expect(b.critical).toBe(true);
    expect(a.showPsDelta).toBe(false);
    expect(b.showPsDelta).toBe(true);
  });
});
