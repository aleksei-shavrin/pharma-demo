import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SNAPSHOT_IDS } from '../snapshot/snapshot-id';
import { SnapshotQueryPipe } from '../snapshot/snapshot-query.pipe';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import { NotificationsService } from './notifications.service';

describe('NotificationsService (R2-N1)', () => {
  const service = new NotificationsService(new MockDemoDataSource());
  const pipe = new SnapshotQueryPipe();

  it('lists authored notifications for every snapshot 01–19', () => {
    for (const snap of SNAPSHOT_IDS) {
      const list = service.list('PRT-01', snap);
      expect(list.snapshotId).toBe(snap);
      expect(list.projectId).toBe('PRT-01');
      expect(Array.isArray(list.items)).toBe(true);
      expect(list.items.every((n) => n.snapshotId === snap)).toBe(true);
      expect(JSON.stringify(list)).not.toMatch(/SH-/);
    }
  });

  it('rejects unknown project with 404', () => {
    expect(() => service.list('PRJ-NOPE', '03')).toThrow(NotFoundException);
  });

  it('SnapshotQueryPipe rejects invalid snapshot with 400', () => {
    expect(() => pipe.transform('20')).toThrow(BadRequestException);
    expect(() => pipe.transform('Z')).toThrow(BadRequestException);
  });

  it('orders C notifications deterministically (critical first)', () => {
    const list = service.list('PRT-01', '03');
    expect(list.items.length).toBeGreaterThanOrEqual(3);
    expect(list.items[0]?.severity).toBe('critical');
    const ids = list.items.map((n) => n.id);
    expect(service.list('PRT-01', '03').items.map((n) => n.id)).toEqual(ids);
    expect(ids[0]).toBe('NTF-03-001');
  });

  it('C story: HVAC / PS / RISK-001 / ISS-001', () => {
    const list = service.list('PRT-01', '03');
    const blob = JSON.stringify(list.items);
    expect(blob).toMatch(/RISK-001/);
    expect(blob).toMatch(/ISS-001/);
    expect(blob).toMatch(/Production Start/);
    expect(blob).toMatch(/EQ-HVAC-01|HVAC/);
    expect(list.items.some((n) => n.taxonomy === 'critical_risk')).toBe(true);
  });

  it('O recovery story: +7 HVAC and PS; not automatic Decision effect', () => {
    const list = service.list('PRT-01', '15');
    const recovery = list.items.find((n) => n.taxonomy === 'recovery');
    expect(recovery?.bodyRu ?? '').toMatch(/\+7/);
    expect(recovery?.bodyRu ?? '').toMatch(
      /не автоматический эффект управленческого решения/i,
    );
    expect(JSON.stringify(list.items)).toMatch(/RISK-001/);
  });

  it('Q honesty: baseline Production Start date passed without start', () => {
    const list = service.list('PRT-01', '17');
    expect(list.items.some((n) => n.titleRu.includes('Базовая дата'))).toBe(
      true,
    );
    expect(JSON.stringify(list.items)).toMatch(/без запуска|не достигнут/i);
  });

  it('S: Production Start achieved', () => {
    const list = service.list('PRT-01', '19');
    expect(
      list.items.some((n) => n.titleRu.includes('Production Start достигнут')),
    ).toBe(true);
    expect(JSON.stringify(list.items)).toMatch(/22\.09\.2027/);
  });

  it('Decision wording does not imply automatic schedule/cost fix', () => {
    const f = service.list('PRT-01', '06');
    const decision = f.items.find((n) => n.taxonomy === 'decision');
    expect(decision?.bodyRu ?? '').toMatch(/не означает автоматическое/i);
    expect(decision?.href).toBeNull();
    expect(decision?.entityRefs.some((r) => r.type === 'decision')).toBe(true);
  });

  it('routable refs expose href; decision refs stay unroutable', () => {
    const c = service.list('PRT-01', '03');
    const risk = c.items.find((n) =>
      n.entityRefs.some((r) => r.type === 'risk'),
    );
    expect(risk?.href).toMatch(/^\/risks\//);
    const f = service.list('PRT-01', '06');
    const dec = f.items.find((n) => n.taxonomy === 'decision');
    expect(dec?.href).toBeNull();
  });
});
