import { describe, expect, it } from 'vitest';
import {
  DEMO_PROJECT_BAC_RUB,
  DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
  DEMO_WORKSTREAM_BUDGETS_SUM_RUB,
  PERSON_ID_PATTERN_SOURCE,
  isPersonId,
  type NotificationList,
  type PersonDetail,
  type PersonId,
  type PersonList,
  type ProjectCostsOverview,
  type WorkstreamDetail,
  type WorkstreamId,
  type WorkstreamList,
} from './api-client';
import { SNAPSHOT_IDS } from './snapshot/snapshot-id';

describe('FE R2-C1-R1 api-client contract types', () => {
  it('freezes Demo BAC constants aligned with API', () => {
    expect(DEMO_PROJECT_BAC_RUB).toBe(6_200_000_000);
    expect(DEMO_WORKSTREAM_BUDGETS_SUM_RUB + DEMO_PROJECT_CONTINGENCY_TOTAL_RUB).toBe(
      DEMO_PROJECT_BAC_RUB,
    );
  });

  it('PersonId runtime mirror matches API pattern', () => {
    expect(PERSON_ID_PATTERN_SOURCE).toBe(String.raw`^PER-\d{2,}$`);
    expect(isPersonId('PER-01')).toBe(true);
    expect(isPersonId('PER-12')).toBe(true);
    expect(isPersonId('SH-DIR-01')).toBe(false);
    expect(isPersonId('PER-1')).toBe(false);
    expect(isPersonId('PER-ABC')).toBe(false);
  });

  it('Workstream / Person / Cost / Notification shapes use branded ids', () => {
    const lead: PersonId = 'PER-08';
    const leads: WorkstreamId[] = ['WS-HVAC'];
    const workstreams: WorkstreamList = {
      snapshotId: 'A',
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      items: [
        {
          id: 'WS-HVAC',
          nameRu: 'HVAC',
          leadPersonId: lead,
          sortOrder: 3,
          rag: 'Green',
        },
      ],
    };
    const detail: WorkstreamDetail = {
      snapshotId: 'C',
      scenarioAsOfDate: '2027-03-01',
      projectId: 'PRJ-01',
      workstream: {
        id: 'WS-HVAC',
        nameRu: 'HVAC',
        leadPersonId: lead,
        sortOrder: 3,
      },
      rag: 'Red',
      attention: {
        redRiskCount: 1,
        delayedCriticalEquipmentCount: 1,
        openOrMitigatingIssueCount: 1,
      },
      equipmentIds: ['EQ-HVAC-01'],
      milestoneIds: [],
      issueIds: ['ISS-001'],
      riskIds: ['RISK-001'],
      decisionIds: [],
      equipment: [],
      milestones: [],
      issues: [],
      risks: [],
      decisions: [],
      cost: null,
    };
    const people: PersonList = {
      snapshotId: 'A',
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      items: [
        {
          id: 'PER-01',
          fullNameRu: 'Иванов',
          roleTitleRu: 'Директор',
          primaryWorkstreamId: null,
          active: true,
        },
      ],
    };
    const personDetail: PersonDetail = {
      snapshotId: 'A',
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      person: people.items[0],
      issueIds: [],
      decisionIds: [],
      equipmentIds: [],
      leadWorkstreamIds: leads,
    };
    const costs: ProjectCostsOverview = {
      snapshotId: 'A',
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      project: {
        approvedBudgetRub: DEMO_PROJECT_BAC_RUB,
        actualCostRub: 0,
        committedCostRub: 0,
        etcRub: DEMO_PROJECT_BAC_RUB,
        eacRub: DEMO_PROJECT_BAC_RUB,
        vacRub: 0,
        contingencyTotalRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
        contingencyConsumedRub: 0,
        contingencyRemainingRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
      },
      workstreams: [],
      equipment: [],
      reconciliation: {
        workstreamEacSumRub: 5_850_000_000,
        projectLevelForecastRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
      },
    };
    const notifications: NotificationList = {
      snapshotId: 'C',
      scenarioAsOfDate: '2027-03-01',
      projectId: 'PRJ-01',
      items: [],
    };
    expect(workstreams.items).toHaveLength(1);
    expect(detail.workstream.leadPersonId).toBe('PER-08');
    expect(personDetail.leadWorkstreamIds).toEqual(['WS-HVAC']);
    expect(isPersonId(people.items[0].id)).toBe(true);
    expect(costs.project.eacRub).toBe(costs.project.actualCostRub + costs.project.etcRub);
    expect(SNAPSHOT_IDS).toContain(notifications.snapshotId);
  });
});
