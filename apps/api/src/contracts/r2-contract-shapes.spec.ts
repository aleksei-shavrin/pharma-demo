import { SNAPSHOT_IDS } from '../snapshot/snapshot-id';
import { WORKSTREAM_IDS, WORKSTREAM_NAME_RU, WORKSTREAM_SORT_ORDER } from '../data/workstream-ids';
import {
  DEMO_PROJECT_BAC_RUB,
  DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
} from './money';
import { R2_CONTRACT_EXTRA_MODELS } from './r2-extra-models';
import { NOTIFICATION_SEVERITIES, NOTIFICATION_TAXONOMIES } from './dto/notification.dto';
import type { PersonDto, PersonListDto, PersonDetailDto } from './dto/person.dto';
import type {
  WorkstreamCatalogItemDto,
  WorkstreamDetailDto,
  WorkstreamListDto,
} from './dto/workstream.dto';
import type {
  EquipmentCostDto,
  ProjectCostDto,
  ProjectCostsOverviewDto,
  WorkstreamCostDto,
} from './dto/cost.dto';
import type { NotificationDto, NotificationListDto } from './dto/notification.dto';

describe('R2-C1 contract shapes', () => {
  it('registers OpenAPI extraModels for R2 entities', () => {
    expect(R2_CONTRACT_EXTRA_MODELS.length).toBeGreaterThanOrEqual(13);
    const names = R2_CONTRACT_EXTRA_MODELS.map((c) => c.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'PersonDto',
        'WorkstreamDetailDto',
        'ProjectCostsOverviewDto',
        'NotificationListDto',
      ]),
    );
  });

  it('Workstream catalog contract: eight ids with RU names + sortOrder', () => {
    expect(WORKSTREAM_IDS).toHaveLength(8);
    const items: WorkstreamCatalogItemDto[] = WORKSTREAM_IDS.map((id) => ({
      id,
      nameRu: WORKSTREAM_NAME_RU[id],
      leadPersonId: null,
      sortOrder: WORKSTREAM_SORT_ORDER[id],
    }));
    const list: WorkstreamListDto = {
      snapshotId: 'A',
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      items,
    };
    expect(list.items.map((i) => i.id)).toEqual([...WORKSTREAM_IDS]);
    expect(list.items.every((i) => i.nameRu.length > 0)).toBe(true);
  });

  it('Workstream detail contract shape (membership via ids, not causal edges)', () => {
    const detail: WorkstreamDetailDto = {
      snapshotId: 'C',
      scenarioAsOfDate: '2027-03-01',
      projectId: 'PRJ-01',
      workstream: {
        id: 'WS-HVAC',
        nameRu: WORKSTREAM_NAME_RU['WS-HVAC'],
        leadPersonId: 'PER-08' as const,
        sortOrder: 3,
      },
      leadFullNameRu: 'Смирнов Павел Андреевич',
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
    expect(detail.equipmentIds).toContain('EQ-HVAC-01');
    expect(detail.milestoneIds).not.toContain('MS-PS');
    expect(detail.workstream.leadPersonId).toBe('PER-08');
  });

  it('Person contract shape uses PersonId + WorkstreamId[] leads', () => {
    const person: PersonDto = {
      id: 'PER-01',
      fullNameRu: 'Иванов Алексей Петрович',
      roleTitleRu: 'Директор проекта',
      primaryWorkstreamId: null,
      active: true,
    };
    const list: PersonListDto = {
      snapshotId: 'A',
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      items: [person],
    };
    const detail: PersonDetailDto = {
      snapshotId: 'A',
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      person,
      issueIds: [],
      decisionIds: [],
      equipmentIds: [],
      leadWorkstreamIds: ['WS-HVAC'],
    };
    expect(list.items[0].id).toBe('PER-01');
    expect(detail.leadWorkstreamIds).toEqual(['WS-HVAC']);
    expect(detail.person.primaryWorkstreamId).toBeNull();
  });

  it('Cost contract shape: project/WS/selective EQ integer RUB', () => {
    const project: ProjectCostDto = {
      approvedBudgetRub: DEMO_PROJECT_BAC_RUB,
      actualCostRub: 0,
      committedCostRub: 0,
      etcRub: DEMO_PROJECT_BAC_RUB,
      eacRub: DEMO_PROJECT_BAC_RUB,
      vacRub: 0,
      contingencyTotalRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
      contingencyConsumedRub: 0,
      contingencyRemainingRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
    };
    const ws: WorkstreamCostDto = {
      workstream: 'WS-HVAC',
      approvedControlBudgetRub: 880_000_000,
      actualCostRub: 0,
      committedCostRub: 0,
      etcRub: 880_000_000,
      eacRub: 880_000_000,
      vacRub: 0,
    };
    const eq: EquipmentCostDto = {
      equipmentId: 'EQ-HVAC-01',
      approvedCostRub: 120_000_000,
    };
    const overview: ProjectCostsOverviewDto = {
      snapshotId: 'A',
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      project,
      workstreams: [ws],
      equipment: [eq],
      reconciliation: {
        workstreamEacSumRub: 5_850_000_000,
        projectLevelForecastRub: DEMO_PROJECT_CONTINGENCY_TOTAL_RUB,
      },
    };
    expect(overview.project.eacRub).toBe(overview.project.actualCostRub + overview.project.etcRub);
    expect(overview.project.eacRub).toBe(
      overview.reconciliation.workstreamEacSumRub +
        overview.reconciliation.projectLevelForecastRub,
    );
    expect(Object.values(overview.project).every((v) => Number.isInteger(v))).toBe(
      true,
    );
  });

  it('Notification contract shape: read-model only', () => {
    expect(NOTIFICATION_TAXONOMIES).toEqual(
      expect.arrayContaining(['critical_risk', 'cost', 'readiness']),
    );
    expect(NOTIFICATION_SEVERITIES).toEqual(['critical', 'attention', 'info']);
    const item: NotificationDto = {
      id: 'NTF-C-001',
      snapshotId: 'C',
      severity: 'critical',
      taxonomy: 'critical_risk',
      titleRu: 'Критический сдвиг Production Start',
      bodyRu: null,
      href: '/risks/RISK-001',
      entityRefs: [{ type: 'risk', id: 'RISK-001' }],
    };
    const list: NotificationListDto = {
      snapshotId: 'C',
      scenarioAsOfDate: '2027-03-01',
      projectId: 'PRJ-01',
      items: [item],
    };
    expect(list.items[0].snapshotId).toBe('C');
    expect(SNAPSHOT_IDS).toContain(list.snapshotId);
  });
});
