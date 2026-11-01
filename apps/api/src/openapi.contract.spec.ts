import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

describe('OpenAPI contract (I1)', () => {
  it('publishes HealthResponseDto and ProjectStubDto response schemas', async () => {
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
    const healthRef =
      health?.responses?.['200']?.content?.['application/json']?.schema;
    expect(healthRef).toEqual({ $ref: '#/components/schemas/HealthResponseDto' });

    const project = document.paths['/v1/projects/{id}']?.get;
    expect(project).toBeDefined();
    const projectRef =
      project?.responses?.['200']?.content?.['application/json']?.schema;
    expect(projectRef).toEqual({
      $ref: '#/components/schemas/ProjectStubDto',
    });

    const healthSchema = document.components?.schemas?.HealthResponseDto as {
      properties?: Record<string, unknown>;
      required?: string[];
    };
    expect(healthSchema?.properties).toEqual(
      expect.objectContaining({
        status: expect.any(Object),
        service: expect.any(Object),
      }),
    );

    const projectSchema = document.components?.schemas?.ProjectStubDto as {
      properties?: Record<string, unknown>;
    };
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
