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

type OpenApiParam = {
  name?: string;
  required?: boolean;
  schema?: JsonSchema;
};

describe('OpenAPI contract (I2–I6 + R2-C1)', () => {
  it('publishes response DTOs, snapshot query, dashboard, register, detail and schedule paths', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    const config = new DocumentBuilder()
      .setTitle('Pharma Project Control API')
      .setVersion('0.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [...R2_CONTRACT_EXTRA_MODELS],
    });

    const health = document.paths['/health']?.get;
    expect(health).toBeDefined();
    const healthContent = health?.responses?.['200']?.content;
    const healthSchema = healthContent?.['application/json']?.schema as
      JsonSchema | undefined;
    expect(healthSchema).toEqual({
      $ref: '#/components/schemas/HealthResponseDto',
    });

    const project = document.paths['/v1/projects/{id}']?.get;
    expect(project).toBeDefined();
    const projectContent = project?.responses?.['200']?.content;
    const projectRespSchema = projectContent?.['application/json']?.schema as
      JsonSchema | undefined;
    expect(projectRespSchema).toEqual({
      $ref: '#/components/schemas/ProjectStubDto',
    });

    const snapshotParam = (project?.parameters ?? []).find(
      (p): p is OpenApiParam =>
        typeof p === 'object' &&
        p !== null &&
        'name' in p &&
        p.name === 'snapshot',
    );
    expect(snapshotParam).toBeDefined();
    expect(snapshotParam?.required).toBe(false);
    expect(snapshotParam?.schema?.enum).toEqual([...SNAPSHOT_IDS]);
    expect(snapshotParam?.schema?.enum).not.toContain('T');
    expect(snapshotParam?.schema?.default).toBe('A');

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
    const dashSchema = dashboard?.responses?.['200']?.content?.[
      'application/json'
    ]?.schema as JsonSchema | undefined;
    expect(dashSchema).toEqual({
      $ref: '#/components/schemas/DashboardOverviewDto',
    });
    const dashSnap = (dashboard?.parameters ?? []).find(
      (p): p is OpenApiParam =>
        typeof p === 'object' &&
        p !== null &&
        'name' in p &&
        p.name === 'snapshot',
    );
    expect(dashSnap?.schema?.enum).toEqual(
      expect.arrayContaining(['A', 'B', 'C']),
    );

    for (const path of [
      '/v1/projects/{id}/equipment',
      '/v1/projects/{id}/issues-risks',
      '/v1/projects/{id}/milestones',
    ] as const) {
      const op = document.paths[path]?.get;
      expect(op).toBeDefined();
      const schema = op?.responses?.['200']?.content?.['application/json']
        ?.schema as JsonSchema | undefined;
      expect(schema?.$ref).toMatch(/#\/components\/schemas\//);
      const snap = (op?.parameters ?? []).find(
        (p): p is OpenApiParam =>
          typeof p === 'object' &&
          p !== null &&
          'name' in p &&
          p.name === 'snapshot',
      );
      expect(snap?.schema?.enum).toEqual(
        expect.arrayContaining(['A', 'B', 'C']),
      );
      expect(snap?.schema?.default).toBe('A');
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
      const schema = op?.responses?.['200']?.content?.['application/json']
        ?.schema as JsonSchema | undefined;
      expect(schema?.$ref).toMatch(/#\/components\/schemas\//);
      const snap = (op?.parameters ?? []).find(
        (p): p is OpenApiParam =>
          typeof p === 'object' &&
          p !== null &&
          'name' in p &&
          p.name === 'snapshot',
      );
      expect(snap?.schema?.enum).toEqual(
        expect.arrayContaining(['A', 'B', 'C']),
      );
      expect(snap?.schema?.default).toBe('A');
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
    const scheduleSchema = schedule?.responses?.['200']?.content?.[
      'application/json'
    ]?.schema as JsonSchema | undefined;
    expect(scheduleSchema).toEqual({
      $ref: '#/components/schemas/ScheduleDto',
    });
    const scheduleSnap = (schedule?.parameters ?? []).find(
      (p): p is OpenApiParam =>
        typeof p === 'object' &&
        p !== null &&
        'name' in p &&
        p.name === 'snapshot',
    );
    expect(scheduleSnap?.schema?.enum).toEqual(
      expect.arrayContaining(['A', 'B', 'C']),
    );
    expect(scheduleSnap?.schema?.default).toBe('A');
    expect(document.components?.schemas?.ScheduleDto).toBeDefined();
    expect(
      document.components?.schemas?.ScheduleEquipmentItemDto,
    ).toBeDefined();
    expect(
      document.components?.schemas?.ScheduleMilestoneItemDto,
    ).toBeDefined();

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
