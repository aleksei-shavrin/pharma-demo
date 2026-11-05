/* OpenAPI document typings from @nestjs/swagger are intentionally loose. */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { R2_CONTRACT_EXTRA_MODELS } from './contracts/r2-extra-models';
import { SNAPSHOT_IDS } from './snapshot/snapshot-id';

type JsonSchema = {
  $ref?: string;
  enum?: string[];
  default?: string;
  pattern?: string;
  nullable?: boolean;
  type?: string | string[];
  properties?: Record<string, unknown>;
  items?: JsonSchema;
};

/** Minimal OpenAPI shapes for contract assertions (avoid $ref vs object unions). */
type ParameterObject = {
  name: string;
  in?: string;
  required?: boolean;
  schema?: JsonSchema;
};

type OperationLike = {
  parameters?: unknown[];
  responses?: Record<string, unknown>;
};

function jsonResponseSchema(
  operation: OperationLike | undefined,
  statusCode = '200',
): JsonSchema | undefined {
  const response = operation?.responses?.[statusCode];
  if (!response || typeof response !== 'object' || response === null) {
    return undefined;
  }
  if ('$ref' in response) {
    return undefined;
  }
  const content = (
    response as { content?: Record<string, { schema?: JsonSchema }> }
  ).content;
  return content?.['application/json']?.schema;
}

function findQueryParam(
  operation: OperationLike | undefined,
  name: string,
): ParameterObject | undefined {
  for (const parameter of operation?.parameters ?? []) {
    if (!parameter || typeof parameter !== 'object' || '$ref' in parameter) {
      continue;
    }
    const candidate = parameter as ParameterObject;
    if (candidate.name === name) {
      return candidate;
    }
  }
  return undefined;
}

function paramSchema(
  parameter: ParameterObject | undefined,
): JsonSchema | undefined {
  return parameter?.schema;
}

describe('OpenAPI contract (I2–I6 + R2-C1)', () => {
  it('publishes response DTOs, snapshot query, dashboard, register, detail and schedule paths', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    const config = new DocumentBuilder()
      .setTitle('Pharma Demo API')
      .setVersion('0.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [...R2_CONTRACT_EXTRA_MODELS],
    });

    const health = document.paths['/health']?.get;
    expect(health).toBeDefined();
    expect(jsonResponseSchema(health)).toEqual({
      $ref: '#/components/schemas/HealthResponseDto',
    });

    const project = document.paths['/v1/projects/{id}']?.get;
    expect(project).toBeDefined();
    expect(jsonResponseSchema(project)).toEqual({
      $ref: '#/components/schemas/ProjectStubDto',
    });

    const snapshotParam = findQueryParam(project, 'snapshot');
    expect(snapshotParam).toBeDefined();
    expect(snapshotParam?.required).toBe(false);
    expect(paramSchema(snapshotParam)?.enum).toEqual([...SNAPSHOT_IDS]);
    expect(paramSchema(snapshotParam)?.enum).not.toContain('T');
    expect(paramSchema(snapshotParam)?.default).toBe('A');

    const projectSchema = document.components?.schemas?.ProjectStubDto as
      JsonSchema | undefined;
    expect(projectSchema?.properties).toEqual(
      expect.objectContaining({
        id: expect.any(Object),
        name: expect.any(Object),
        baselineProductionStart: expect.any(Object),
        forecastProductionStart: expect.any(Object),
        snapshotId: expect.any(Object),
        scenarioAsOfDate: expect.any(Object),
      }),
    );

    const dashboard = document.paths['/v1/projects/{id}/dashboard']?.get;
    expect(dashboard).toBeDefined();
    expect(jsonResponseSchema(dashboard)).toEqual({
      $ref: '#/components/schemas/DashboardOverviewDto',
    });
    expect(paramSchema(findQueryParam(dashboard, 'snapshot'))?.enum).toEqual(
      expect.arrayContaining(['A', 'B', 'C']),
    );

    for (const path of [
      '/v1/projects/{id}/equipment',
      '/v1/projects/{id}/issues-risks',
      '/v1/projects/{id}/milestones',
    ] as const) {
      const op = document.paths[path]?.get;
      expect(op).toBeDefined();
      expect(jsonResponseSchema(op)?.$ref).toMatch(
        /#\/components\/schemas\//,
      );
      const snap = findQueryParam(op, 'snapshot');
      expect(paramSchema(snap)?.enum).toEqual(
        expect.arrayContaining(['A', 'B', 'C']),
      );
      expect(paramSchema(snap)?.default).toBe('A');
    }

    expect(document.components?.schemas?.EquipmentRegisterDto).toBeDefined();
    expect(document.components?.schemas?.IssuesRisksRegisterDto).toBeDefined();
    expect(document.components?.schemas?.MilestonesRegisterDto).toBeDefined();

    for (const path of [
      '/v1/projects/{id}/equipment/{entityId}',
      '/v1/projects/{id}/issues/{entityId}',
      '/v1/projects/{id}/risks/{entityId}',
      '/v1/projects/{id}/milestones/{entityId}',
    ] as const) {
      const op = document.paths[path]?.get;
      expect(op).toBeDefined();
      expect(jsonResponseSchema(op)?.$ref).toMatch(
        /#\/components\/schemas\//,
      );
      const snap = findQueryParam(op, 'snapshot');
      expect(paramSchema(snap)?.enum).toEqual(
        expect.arrayContaining(['A', 'B', 'C']),
      );
      expect(paramSchema(snap)?.default).toBe('A');
    }

    expect(document.components?.schemas?.EquipmentDetailDto).toBeDefined();
    expect(document.components?.schemas?.IssueDetailDto).toBeDefined();
    expect(document.components?.schemas?.RiskDetailDto).toBeDefined();
    expect(document.components?.schemas?.MilestoneDetailDto).toBeDefined();
    expect(document.components?.schemas?.EntityLinkDto).toBeDefined();
    expect(document.components?.schemas?.EntityImpactDto).toBeDefined();

    const eqDetail = document.components?.schemas?.EquipmentDetailDto as
      | JsonSchema
      | undefined;
    expect(eqDetail?.properties).toEqual(
      expect.objectContaining({
        entity: expect.any(Object),
        links: expect.any(Object),
        impact: expect.any(Object),
      }),
    );

    const schedule = document.paths['/v1/projects/{id}/schedule']?.get;
    expect(schedule).toBeDefined();
    expect(jsonResponseSchema(schedule)).toEqual({
      $ref: '#/components/schemas/ScheduleDto',
    });
    const scheduleSnap = findQueryParam(schedule, 'snapshot');
    expect(paramSchema(scheduleSnap)?.enum).toEqual(
      expect.arrayContaining(['A', 'B', 'C']),
    );
    expect(paramSchema(scheduleSnap)?.default).toBe('A');
    expect(document.components?.schemas?.ScheduleDto).toBeDefined();
    expect(
      document.components?.schemas?.ScheduleEquipmentItemDto,
    ).toBeDefined();
    expect(
      document.components?.schemas?.ScheduleMilestoneItemDto,
    ).toBeDefined();

    const costs = document.paths['/v1/projects/{id}/costs']?.get;
    expect(costs).toBeDefined();
    expect(jsonResponseSchema(costs)).toEqual({
      $ref: '#/components/schemas/ProjectCostsOverviewDto',
    });
    const costsSnap = findQueryParam(costs, 'snapshot');
    expect(paramSchema(costsSnap)?.enum).toEqual(
      expect.arrayContaining(['A', 'S']),
    );
    expect(paramSchema(costsSnap)?.default).toBe('A');

    const wsList = document.paths['/v1/projects/{id}/workstreams']?.get;
    expect(wsList).toBeDefined();
    expect(jsonResponseSchema(wsList)).toEqual({
      $ref: '#/components/schemas/WorkstreamListDto',
    });
    const wsDetail =
      document.paths['/v1/projects/{id}/workstreams/{workstreamId}']?.get;
    expect(wsDetail).toBeDefined();
    expect(jsonResponseSchema(wsDetail)).toEqual({
      $ref: '#/components/schemas/WorkstreamDetailDto',
    });
    expect(paramSchema(findQueryParam(wsDetail, 'snapshot'))?.enum).toEqual(
      expect.arrayContaining(['A', 'S']),
    );

    const peopleList = document.paths['/v1/projects/{id}/people']?.get;
    expect(peopleList).toBeDefined();
    expect(jsonResponseSchema(peopleList)).toEqual({
      $ref: '#/components/schemas/PersonListDto',
    });
    const peopleDetail =
      document.paths['/v1/projects/{id}/people/{personId}']?.get;
    expect(peopleDetail).toBeDefined();
    expect(jsonResponseSchema(peopleDetail)).toEqual({
      $ref: '#/components/schemas/PersonDetailDto',
    });

    const notificationsList =
      document.paths['/v1/projects/{id}/notifications']?.get;
    expect(notificationsList).toBeDefined();
    expect(jsonResponseSchema(notificationsList)).toEqual({
      $ref: '#/components/schemas/NotificationListDto',
    });
    expect(
      paramSchema(findQueryParam(notificationsList, 'snapshot'))?.enum,
    ).toEqual([...SNAPSHOT_IDS]);

    for (const name of [
      'PersonDto',
      'PersonListDto',
      'PersonDetailDto',
      'WorkstreamCatalogItemDto',
      'WorkstreamListDto',
      'WorkstreamDetailDto',
      'ProjectCostDto',
      'WorkstreamCostDto',
      'EquipmentCostDto',
      'ProjectCostsOverviewDto',
      'NotificationDto',
      'NotificationListDto',
    ] as const) {
      expect(document.components?.schemas?.[name]).toBeDefined();
    }

    const projectCost = document.components?.schemas?.ProjectCostDto as
      | JsonSchema
      | undefined;
    expect(projectCost?.properties).toEqual(
      expect.objectContaining({
        approvedBudgetRub: expect.any(Object),
        actualCostRub: expect.any(Object),
        committedCostRub: expect.any(Object),
        etcRub: expect.any(Object),
        eacRub: expect.any(Object),
        vacRub: expect.any(Object),
        contingencyTotalRub: expect.any(Object),
        contingencyConsumedRub: expect.any(Object),
        contingencyRemainingRub: expect.any(Object),
      }),
    );
    expect(document.components?.schemas?.CostReconciliationDto).toBeDefined();
    const costsOverview = document.components?.schemas
      ?.ProjectCostsOverviewDto as JsonSchema | undefined;
    expect(costsOverview?.properties).toEqual(
      expect.objectContaining({
        reconciliation: expect.any(Object),
      }),
    );

    const personDto = document.components?.schemas?.PersonDto as
      | JsonSchema
      | undefined;
    const personIdSchema = personDto?.properties?.id as JsonSchema | undefined;
    expect(personIdSchema?.pattern).toBe('^PER-\\d{2,}$');

    const wsCatalog = document.components?.schemas?.WorkstreamCatalogItemDto as
      | JsonSchema
      | undefined;
    const leadPerson = wsCatalog?.properties?.leadPersonId as
      | JsonSchema
      | undefined;
    expect(leadPerson?.pattern).toBe('^PER-\\d{2,}$');
    expect(leadPerson?.nullable).toBe(true);

    const personDetail = document.components?.schemas?.PersonDetailDto as
      | JsonSchema
      | undefined;
    const leadWs = personDetail?.properties?.leadWorkstreamIds as
      | JsonSchema
      | undefined;
    expect(leadWs?.type).toBe('array');
    expect(leadWs?.items?.enum).toEqual(
      expect.arrayContaining(['WS-HVAC', 'WS-BLD']),
    );

    await app.close();
  });
});
