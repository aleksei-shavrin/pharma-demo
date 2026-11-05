import { describe, expect, it } from 'vitest';
import { resolveProductionStartBand } from './executive-timeline';
import { resolveProductionStartCluster } from './production-start-cluster';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';

describe('Production Start cluster presentation (R2-U1-R8/R9)', () => {
  it('coincident A → baseline state, single date, По плану, no +0', () => {
    const band = resolveProductionStartBand(dashboardOverviewFixture('A'));
    const cluster = resolveProductionStartCluster(band, {
      snapshotId: 'A',
      achieved: false,
    });
    expect(cluster.state).toBe('baseline');
    expect(cluster.coincident).toBe(true);
    expect(cluster.deltaTone).toBe('none');
    expect(cluster.lineRu).toMatch(/По плану/);
    expect(cluster.lineRu).toMatch(/15\.09\.2027/);
    expect(cluster.lineRu).not.toMatch(/→/);
    expect(cluster.deltaRu).toBe('');
    expect(cluster.deltaDays).toBe(0);
  });

  it('delayed O → forecast + active delta tone', () => {
    const band = resolveProductionStartBand(dashboardOverviewFixture('O'));
    const cluster = resolveProductionStartCluster(band, {
      snapshotId: 'O',
      achieved: false,
    });
    expect(cluster.state).toBe('forecast');
    expect(cluster.deltaTone).toBe('active');
    expect(cluster.lineRu).toBe(
      'План 15.09.2027 → прогноз 22.09.2027',
    );
    expect(cluster.deltaRu).toMatch(/\+7/);
    expect(cluster.lineRu).not.toMatch(/факт/);
  });

  it('achieved S → actual + historical delta tone (not active)', () => {
    const band = resolveProductionStartBand(dashboardOverviewFixture('S'));
    const cluster = resolveProductionStartCluster(band, {
      snapshotId: 'S',
      achieved: true,
    });
    expect(cluster.state).toBe('actual');
    expect(cluster.deltaTone).toBe('historical');
    expect(cluster.lineRu).toBe('План 15.09.2027 → факт 22.09.2027');
    expect(cluster.deltaRu).toMatch(/\+7/);
    expect(cluster.lineRu).not.toMatch(/прогноз/);
  });
});
