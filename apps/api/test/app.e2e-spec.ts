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

  it('snapshot=B keeps baseline PS (local attention only)', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01?snapshot=B')
      .expect(200)
      .expect((res) => {
        const body = res.body as ProjectBody;
        expect(body.snapshotId).toBe('B');
        expect(body.forecastProductionStart).toBe('2027-09-15');
        expect(body.scenarioAsOfDate).toBe('2027-02-28');
        expect(body.baselineProductionStart).toBe('2027-09-15');
      });
  });

  it('snapshot=C shifts PS +21 with C asOf', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01?snapshot=C')
      .expect(200)
      .expect((res) => {
        const body = res.body as ProjectBody;
        expect(body.snapshotId).toBe('C');
        expect(body.forecastProductionStart).toBe('2027-10-06');
        expect(body.scenarioAsOfDate).toBe('2027-03-01');
      });
  });

  it('unknown machine snapshot letter → 400 (no silent fallback)', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01?snapshot=Z')
      .expect(400);
  });

  it('populated snapshots D–H return 200; Z remains 400', () => {
    const server = app.getHttpServer();
    return Promise.all(
      (['D', 'E', 'F', 'G', 'H'] as const).map((id) =>
        request(server).get(`/v1/projects/PRJ-01?snapshot=${id}`).expect(200),
      ),
    )
      .then(() =>
        request(server)
          .get('/v1/projects/PRJ-01/dashboard?snapshot=F')
          .expect(200)
          .expect((res) => {
            const body = res.body as {
              decisions: { id: string }[];
              project: { forecastProductionStart: string };
              projectStatus: string;
              decisionHonesty: { recoveryExecuted: boolean } | null;
            };
            expect(body.decisions.some((d) => d.id === 'DEC-001')).toBe(true);
            expect(body.project.forecastProductionStart).toBe('2027-10-06');
            expect(body.projectStatus).toBe('Red');
            expect(body.decisionHonesty).toEqual({ recoveryExecuted: false });
          }),
      )
      .then(() =>
        request(server)
          .get('/v1/projects/PRJ-01/dashboard?snapshot=G')
          .expect(200)
          .expect((res) => {
            const body = res.body as {
              project: { forecastProductionStart: string };
              equipment: { id: string; forecastDelivery: string }[];
              risks: { id: string; rag: string }[];
              milestones: { id: string; rag: string }[];
            };
            expect(body.project.forecastProductionStart).toBe('2027-09-29');
            expect(
              body.equipment.find((e) => e.id === 'EQ-HVAC-01')!
                .forecastDelivery,
            ).toBe('2027-05-29');
            expect(body.risks.find((r) => r.id === 'RISK-001')!.rag).toBe(
              'Red',
            );
            expect(body.milestones.find((m) => m.id === 'MS-PS')!.rag).toBe(
              'Red',
            );
          }),
      )
      .then(() =>
        request(server).get('/v1/projects/PRJ-01?snapshot=Z').expect(400),
      );
  });

  it('GET dashboard A: on-track, no decision', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/dashboard')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          snapshotId: string;
          projectStatus: string;
          decisionPanelState: string;
          equipment: { id: string; deliveryVariance: { deltaDays: number } }[];
          project: { productionStartVariance: { deltaDays: number } };
          workstreamRollups: unknown[];
          topExceptions: unknown[];
          trend: {
            better: string[];
            worse: string[];
            unchangedCritical: string[];
          };
        };
        expect(body.snapshotId).toBe('A');
        expect(body.projectStatus).toBe('Green');
        expect(body.decisionPanelState).toBe('absent');
        const hvac = body.equipment.find((e) => e.id === 'EQ-HVAC-01')!;
        expect(hvac.deliveryVariance.deltaDays).toBe(0);
        expect(body.project.productionStartVariance.deltaDays).toBe(0);
        expect(body.workstreamRollups.length).toBe(8);
        expect(body.topExceptions).toEqual([]);
        expect(body.trend).toEqual({
          better: [],
          worse: [],
          unchangedCritical: [],
        });
      });
  });

  it('GET dashboard B: Yellow local PKG; HVAC/PS calm; no DEC', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/dashboard?snapshot=B')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          projectStatus: string;
          issues: { id: string; status: string }[];
          risks: { id: string; rag: string }[];
          milestones: { id: string; rag: string }[];
          project: {
            forecastProductionStart: string;
            productionStartVariance: { deltaDays: number };
          };
          equipment: { id: string; status: string; forecastDelivery: string }[];
          decisions: unknown[];
          decisionPanelState: string;
          topExceptions: { priority: number }[];
        };
        expect(body.projectStatus).toBe('Yellow');
        expect(body.equipment.find((e) => e.id === 'EQ-HVAC-01')!.status).toBe(
          'OnTrack',
        );
        expect(body.equipment.find((e) => e.id === 'EQ-PKG-01')!.status).toBe(
          'Delayed',
        );
        expect(body.issues.some((i) => i.id === 'ISS-001')).toBe(false);
        expect(
          body.issues.some((i) => i.id === 'ISS-PKG-01' && i.status === 'Open'),
        ).toBe(true);
        expect(body.risks.find((r) => r.id === 'RISK-001')!.rag).toBe('Green');
        expect(body.milestones.find((m) => m.id === 'MS-PS')!.rag).toBe(
          'Green',
        );
        expect(body.project.forecastProductionStart).toBe('2027-09-15');
        expect(body.project.productionStartVariance.deltaDays).toBe(0);
        expect(body.decisionPanelState).toBe('absent');
        expect(body.decisions).toEqual([]);
        expect(body.topExceptions[0]?.priority).toBe(1);
        expect(JSON.stringify(body.equipment)).not.toMatch(/"priority"/);
      });
  });

  it('GET dashboard C: Red HVAC +21; ISS Open; DEC absent; needed', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/dashboard?snapshot=C')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          projectStatus: string;
          decisions: unknown[];
          issues: { id: string; status: string }[];
          risks: { id: string; rag: string }[];
          milestones: { id: string; rag: string }[];
          equipment: { id: string; forecastDelivery: string }[];
          project: {
            forecastProductionStart: string;
            productionStartVariance: { deltaDays: number };
          };
          decisionPanelState: string;
          decisionHonesty: { recoveryExecuted: boolean } | null;
          derivedImpact: { kind: string };
          directEdges: { fromType: string; toType: string }[];
        };
        expect(body.projectStatus).toBe('Red');
        expect(body.decisions).toEqual([]);
        expect(body.decisionPanelState).toBe('needed');
        expect(body.decisionHonesty).toBeNull();
        expect(
          body.equipment.find((e) => e.id === 'EQ-HVAC-01')!.forecastDelivery,
        ).toBe('2027-06-05');
        expect(body.issues.find((i) => i.id === 'ISS-001')?.status).toBe(
          'Open',
        );
        expect(body.risks.find((r) => r.id === 'RISK-001')!.rag).toBe('Red');
        expect(body.milestones.find((m) => m.id === 'MS-PS')!.rag).toBe('Red');
        expect(body.project.forecastProductionStart).toBe('2027-10-06');
        expect(body.project.productionStartVariance.deltaDays).toBe(21);
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

  it('GET equipment A/B + invalid snapshot', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/equipment')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          snapshotId: string;
          items: {
            id: string;
            status: string;
            deliveryVariance: { deltaDays: number };
          }[];
        };
        expect(body.snapshotId).toBe('A');
        expect(body.items.length).toBeGreaterThanOrEqual(2);
        const hvac = body.items.find((i) => i.id === 'EQ-HVAC-01')!;
        expect(hvac.status).toBe('OnTrack');
        expect(hvac.deliveryVariance.deltaDays).toBe(0);
      })
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/equipment?snapshot=B')
          .expect(200)
          .expect((res) => {
            const body = res.body as {
              items: {
                id: string;
                status: string;
                forecastDelivery: string;
                deliveryVariance: { deltaDays: number };
              }[];
            };
            const hvac = body.items.find((i) => i.id === 'EQ-HVAC-01')!;
            const pkg = body.items.find((i) => i.id === 'EQ-PKG-01')!;
            expect(hvac.status).toBe('OnTrack');
            expect(pkg.status).toBe('Delayed');
            expect(pkg.deliveryVariance.deltaDays).toBe(10);
          }),
      )
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/equipment?snapshot=C')
          .expect(200)
          .expect((res) => {
            const body = res.body as {
              items: {
                id: string;
                status: string;
                forecastDelivery: string;
                deliveryVariance: { deltaDays: number };
              }[];
            };
            const hvac = body.items.find((i) => i.id === 'EQ-HVAC-01')!;
            expect(hvac.status).toBe('Delayed');
            expect(hvac.forecastDelivery).toBe('2027-06-05');
            expect(hvac.deliveryVariance.deltaDays).toBe(21);
          }),
      )
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/equipment?snapshot=Z')
          .expect(400),
      );
  });

  it('GET issues-risks A/B/C', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/issues-risks?snapshot=A')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          rows: {
            id: string;
            type: string;
            rag: string | null;
            issueStatus: string | null;
          }[];
        };
        expect(body.rows.some((r) => r.type === 'Issue')).toBe(false);
        expect(body.rows.find((r) => r.id === 'RISK-001')?.rag).toBe('Green');
      })
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/issues-risks?snapshot=B')
          .expect(200)
          .expect((res) => {
            const body = res.body as {
              rows: {
                id: string;
                type: string;
                issueStatus: string | null;
                rag: string | null;
              }[];
            };
            expect(body.rows.some((r) => r.id === 'ISS-001')).toBe(false);
            expect(
              body.rows.find((r) => r.id === 'ISS-PKG-01')?.issueStatus,
            ).toBe('Open');
            expect(body.rows.find((r) => r.id === 'RISK-001')?.rag).toBe(
              'Green',
            );
            expect(JSON.stringify(body)).not.toMatch(/Pending/);
          }),
      )
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/issues-risks?snapshot=C')
          .expect(200)
          .expect((res) => {
            const body = res.body as {
              rows: {
                id: string;
                issueStatus: string | null;
                rag: string | null;
              }[];
            };
            expect(body.rows.find((r) => r.id === 'ISS-001')?.issueStatus).toBe(
              'Open',
            );
            expect(body.rows.find((r) => r.id === 'RISK-001')?.rag).toBe('Red');
          }),
      );
  });

  it('GET milestones A/C', () => {
    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/milestones')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          items: {
            id: string;
            rag: string;
            dateVariance: { deltaDays: number };
          }[];
        };
        expect(body.items.length).toBeGreaterThanOrEqual(2);
        const ps = body.items.find((i) => i.id === 'MS-PS')!;
        expect(ps.rag).toBe('Green');
        expect(ps.dateVariance.deltaDays).toBe(0);
      })
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/milestones?snapshot=C')
          .expect(200)
          .expect((res) => {
            const body = res.body as {
              items: {
                id: string;
                rag: string;
                forecastDate: string;
                dateVariance: { deltaDays: number };
              }[];
            };
            const ps = body.items.find((i) => i.id === 'MS-PS')!;
            expect(ps.rag).toBe('Red');
            expect(ps.forecastDate).toBe('2027-10-06');
            expect(ps.dateVariance.deltaDays).toBe(21);
          }),
      );
  });

  it('GET entity detail A/B + missing issue + invalid snapshot', () => {
    type DetailBody = {
      snapshotId: string;
      links: { targetType: string; targetId: string }[];
      impact: {
        kind: string;
        productionStartDeltaDays: number;
        recoveryExecuted: false | null;
      };
      entity: Record<string, unknown>;
    };

    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/equipment/EQ-HVAC-01')
      .expect(200)
      .expect((res) => {
        const body = res.body as DetailBody;
        expect(body.snapshotId).toBe('A');
        expect(body.entity.status).toBe('OnTrack');
        expect(body.links.filter((l) => l.targetType === 'risk').length).toBe(
          2,
        );
        expect(body.links.map((l) => l.targetId).sort()).toEqual([
          'RISK-001',
          'RISK-HVAC-02',
        ]);
        expect(body.links.some((l) => l.targetType === 'milestone')).toBe(
          false,
        );
        expect(body.impact.kind).toBe('none');
      })
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/issues/ISS-001?snapshot=A')
          .expect(404),
      )
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/issues/ISS-001?snapshot=B')
          .expect(404),
      )
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/issues/ISS-001?snapshot=C')
          .expect(200)
          .expect((res) => {
            const body = res.body as DetailBody;
            expect(body.entity.status).toBe('Open');
            expect(
              body.links.map((l) => `${l.targetType}:${l.targetId}`).sort(),
            ).toEqual([
              'equipment:EQ-HVAC-01',
              'milestone:MS-PS',
              'risk:RISK-001',
            ]);
            expect(body.impact.productionStartDeltaDays).toBe(21);
          }),
      )
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/milestones/MS-PS?snapshot=C')
          .expect(200)
          .expect((res) => {
            const body = res.body as DetailBody;
            expect(body.links.some((l) => l.targetType === 'equipment')).toBe(
              false,
            );
          }),
      )
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/equipment/EQ-HVAC-01?snapshot=Z')
          .expect(400),
      )
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/equipment/EQ-UNKNOWN?snapshot=A')
          .expect(404),
      );
  });

  it('GET schedule A/B + invalid snapshot', () => {
    type ScheduleBody = {
      snapshotId: string;
      items: {
        kind: string;
        id: string;
        forecastDate: string;
        dateVariance: { deltaDays: number };
        status?: string;
        rag?: string;
      }[];
    };

    return request(app.getHttpServer())
      .get('/v1/projects/PRJ-01/schedule')
      .expect(200)
      .expect((res) => {
        const body = res.body as ScheduleBody;
        expect(body.snapshotId).toBe('A');
        expect(body.items.length).toBeGreaterThanOrEqual(2);
        expect(
          body.items.every(
            (i) => i.kind === 'equipment_delivery' || i.kind === 'milestone',
          ),
        ).toBe(true);
        const eq = body.items.find((i) => i.id === 'EQ-HVAC-01')!;
        expect(eq.dateVariance.deltaDays).toBe(0);
        expect(eq.status).toBe('OnTrack');
      })
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/schedule?snapshot=B')
          .expect(200)
          .expect((res) => {
            const body = res.body as ScheduleBody;
            const eq = body.items.find((i) => i.id === 'EQ-HVAC-01')!;
            const ms = body.items.find((i) => i.id === 'MS-PS')!;
            expect(eq.status).toBe('OnTrack');
            expect(ms.forecastDate).toBe('2027-09-15');
            expect(ms.rag).toBe('Green');
          }),
      )
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/schedule?snapshot=C')
          .expect(200)
          .expect((res) => {
            const body = res.body as ScheduleBody;
            const eq = body.items.find((i) => i.id === 'EQ-HVAC-01')!;
            const ms = body.items.find((i) => i.id === 'MS-PS')!;
            expect(eq.forecastDate).toBe('2027-06-05');
            expect(eq.dateVariance.deltaDays).toBe(21);
            expect(ms.forecastDate).toBe('2027-10-06');
            expect(ms.rag).toBe('Red');
            expect(ms.dateVariance.deltaDays).toBe(21);
          }),
      )
      .then(() =>
        request(app.getHttpServer())
          .get('/v1/projects/PRJ-01/schedule?snapshot=Z')
          .expect(400),
      );
  });
});
