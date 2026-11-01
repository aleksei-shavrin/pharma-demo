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

describe('OpenAPI contract (I2)', () => {
  it('publishes response DTOs and snapshot query enum', async () => {
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

    await app.close();
  });
});
