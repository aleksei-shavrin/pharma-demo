/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import {
  spineDecision,
  spineEquipment,
  spineIssue,
  spineMilestone,
  spineRisk,
} from './spine';

describe('dashboard spine (no silent substitution)', () => {
  it('spineDecision is DEC-001 or null — never another Decision', () => {
    const other = dashboardOverviewFixture('01', {
      decisions: [
        {
          id: 'DEC-OTHER',
          projectId: 'PRT-01',
          milestoneId: null,
          type: 'AcceptDateSlip',
          ownerPersonId: 'PER-01' as const,
          ownerFullNameRu: 'Иванов',
          dueDate: null,
          note: 'Other',
        },
      ],
    });
    expect(spineDecision(other)).toBeNull();

    const withDec = dashboardOverviewFixture('03', {
      decisions: [
        {
          id: 'DEC-OTHER',
          projectId: 'PRT-01',
          milestoneId: null,
          type: 'AcceptDateSlip',
          ownerPersonId: 'PER-01' as const,
          ownerFullNameRu: 'Иванов',
          dueDate: null,
          note: 'First',
        },
        {
          id: 'DEC-001',
          projectId: 'PRT-01',
          milestoneId: 'MS-PS',
          type: 'PrioritizeRecovery',
          ownerPersonId: 'PER-01' as const,
          ownerFullNameRu: 'Иванов',
          dueDate: '2027-03-20',
          note: 'Canonical',
        },
      ],
    });
    expect(spineDecision(withDec)?.id).toBe('DEC-001');
  });

  it('missing ISS-001 / DEC-001 → null', () => {
    const a = dashboardOverviewFixture('01');
    expect(spineIssue(a)).toBeNull();
    expect(spineDecision(a)).toBeNull();
  });

  it('unrelated first array entries do not replace canonical EQ/Risk/MS', () => {
    const data = dashboardOverviewFixture('01', {
      equipment: [
        {
          id: 'EQ-OTHER',
          name: 'Other',
          critical: true,
          status: 'Delayed',
          workstream: 'WS-BLD',
          baselineDelivery: '2027-01-01',
          forecastDelivery: '2027-01-02',
          deliveryVariance: {
            subject: 'equipment_delivery',
            baselineDate: '2027-01-01',
            forecastDate: '2027-01-02',
            deltaDays: 1,
          },
        },
        ...dashboardOverviewFixture('01').equipment,
      ],
      risks: [
        {
          id: 'RISK-OTHER',
          title: 'Other',
          rag: 'Red',
          workstream: 'WS-BLD',
          equipmentId: null,
          milestoneId: 'MS-PS',
          issueId: null,
        },
        ...dashboardOverviewFixture('01').risks,
      ],
      milestones: [
        {
          id: 'MS-OTHER',
          name: 'Other',
          rag: 'Red',
          workstream: 'WS-BLD',
          baselineDate: '2027-01-01',
          forecastDate: '2027-01-01',
        },
        ...dashboardOverviewFixture('01').milestones,
      ],
    });
    expect(spineEquipment(data).id).toBe('EQ-HVAC-01');
    expect(spineRisk(data).id).toBe('RISK-001');
    expect(spineMilestone(data).id).toBe('MS-PS');
  });

  it('missing canonical EQ-HVAC-01 throws', () => {
    const data = dashboardOverviewFixture('01', {
      equipment: [
        {
          id: 'EQ-OTHER',
          name: 'Other',
          critical: true,
          status: 'OnTrack',
          workstream: 'WS-BLD',
          baselineDelivery: '2027-01-01',
          forecastDelivery: '2027-01-01',
          deliveryVariance: {
            subject: 'equipment_delivery',
            baselineDate: '2027-01-01',
            forecastDate: '2027-01-01',
            deltaDays: 0,
          },
        },
      ],
    });
    expect(() => spineEquipment(data)).toThrow(/EQ-HVAC-01/);
  });
});
