import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('I1 API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', service: 'ppc-api' });
  });

  it('GET /v1/projects/PRJ-01 (Snapshot A default)', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01')
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe('PRJ-01');
        expect(res.body.snapshotId).toBe('A');
        expect(res.body.forecastProductionStart).toBe('2027-09-15');
      });
  });
});
