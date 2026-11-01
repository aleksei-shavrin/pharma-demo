/* OpenAPI document typings from @nestjs/swagger are intentionally loose. */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

type JsonSchema = {
  $ref?: string;
  enum?: string[];
  default?: string;
  properties?: Record<string, unknown>;
};

type OpenApiParam = {
  name?: string;
  required?: boolean;
  schema?: JsonSchema;
};

describe('OpenAPI contract (I2/I3/I4/I5)', () => {
  it('publishes response DTOs, snapshot query, dashboard, register and detail paths', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    const config = new DocumentBuilder()
      .setTitle('Pharma Project Control API')
      .setVersion('0.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);

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
    expect(snapshotParam?.schema?.enum).toEqual(
      expect.arrayContaining(['A', 'B', 'C']),
    );
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

    await app.close();
  });
});
