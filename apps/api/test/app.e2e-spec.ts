import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

type ProjectBody = {
  snapshotId: string;
  forecastProductionStart: string;
  scenarioAsOfDate: string;
  baselineProductionStart: string;
};

describe('I2 API snapshot (e2e)', () => {
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

  it('omitted snapshot defaults to A', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01')
      .expect(200)
      .expect((res) => {
        const body = res.body as ProjectBody;
        expect(body.snapshotId).toBe('A');
        expect(body.forecastProductionStart).toBe('2027-09-15');
        expect(body.scenarioAsOfDate).toBe('2027-02-15');
      });
  });

  it('explicit snapshot=A', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01?snapshot=A')
      .expect(200)
      .expect((res) => {
        const body = res.body as ProjectBody;
        expect(body.snapshotId).toBe('A');
        expect(body.forecastProductionStart).toBe('2027-09-15');
      });
  });

  it('snapshot=B returns delayed forecast / asOf', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01?snapshot=B')
      .expect(200)
      .expect((res) => {
        const body = res.body as ProjectBody;
        expect(body.snapshotId).toBe('B');
        expect(body.forecastProductionStart).toBe('2027-10-06');
        expect(body.scenarioAsOfDate).toBe('2027-03-01');
        expect(body.baselineProductionStart).toBe('2027-09-15');
      });
  });

  it('snapshot=C keeps B forecasts with C asOf', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01?snapshot=C')
      .expect(200)
      .expect((res) => {
        const body = res.body as ProjectBody;
        expect(body.snapshotId).toBe('C');
        expect(body.forecastProductionStart).toBe('2027-10-06');
        expect(body.scenarioAsOfDate).toBe('2027-03-02');
      });
  });

  it('invalid snapshot → 400 (no silent fallback)', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01?snapshot=D')
      .expect(400);
  });
});
