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

  it('GET dashboard A: on-track, no decision', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/dashboard')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          snapshotId: string;
          decisionPanelState: string;
          equipment: { deliveryVariance: { deltaDays: number } };
          project: { productionStartVariance: { deltaDays: number } };
        };
        expect(body.snapshotId).toBe('A');
        expect(body.decisionPanelState).toBe('absent');
        expect(body.equipment.deliveryVariance.deltaDays).toBe(0);
        expect(body.project.productionStartVariance.deltaDays).toBe(0);
      });
  });

  it('GET dashboard B: +21 Open Red needed', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/dashboard?snapshot=B')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          issue: { status: string } | null;
          risk: { rag: string };
          milestone: { rag: string };
          project: {
            forecastProductionStart: string;
            productionStartVariance: { deltaDays: number };
          };
          equipment: { forecastDelivery: string };
          decisionPanelState: string;
          decision: unknown;
        };
        expect(body.equipment.forecastDelivery).toBe('2027-06-05');
        expect(body.issue?.status).toBe('Open');
        expect(body.risk.rag).toBe('Red');
        expect(body.milestone.rag).toBe('Red');
        expect(body.project.forecastProductionStart).toBe('2027-10-06');
        expect(body.project.productionStartVariance.deltaDays).toBe(21);
        expect(body.decisionPanelState).toBe('needed');
        expect(body.decision).toBeNull();
      });
  });

  it('GET dashboard C: DEC-001 + Mitigating + unrecovered forecasts', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/dashboard?snapshot=C')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          decision: { id: string; type: string; dueDate: string } | null;
          issue: { status: string } | null;
          risk: { rag: string };
          milestone: { rag: string };
          project: {
            forecastProductionStart: string;
            productionStartVariance: { deltaDays: number };
          };
          decisionHonesty: { recoveryExecuted: boolean } | null;
          derivedImpact: { kind: string };
          directEdges: { fromType: string; toType: string }[];
        };
        expect(body.decision?.id).toBe('DEC-001');
        expect(body.decision?.type).toBe('PrioritizeRecovery');
        expect(body.decision?.dueDate).toBe('2027-03-20');
        expect(body.issue?.status).toBe('Mitigating');
        expect(body.risk.rag).toBe('Red');
        expect(body.milestone.rag).toBe('Red');
        expect(body.project.forecastProductionStart).toBe('2027-10-06');
        expect(body.project.productionStartVariance.deltaDays).toBe(21);
        expect(body.decisionHonesty).toEqual({ recoveryExecuted: false });
        expect(body.derivedImpact.kind).toBe('aligned_slip');
        expect(
          body.directEdges.some(
            (e) => e.fromType === 'equipment' && e.toType === 'milestone',
          ),
        ).toBe(false);
      });
  });

  it('invalid dashboard snapshot → 400', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/dashboard?snapshot=Z')
      .expect(400);
  });
});
