import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DEMO_DATA_SOURCE } from '../data/demo-data-source';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import { ScheduleService } from './schedule.service';

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ScheduleService,
        MockDemoDataSource,
        { provide: DEMO_DATA_SOURCE, useExisting: MockDemoDataSource },
      ],
    }).compile();
    service = moduleRef.get(ScheduleService);
  });

  it('A: multi control points; HVAC OnTrack; no Activity', () => {
    const s = service.getSchedule('PRJ-01', 'A');
    expect(s.snapshotId).toBe('A');
    expect(s.items.length).toBeGreaterThanOrEqual(2);
    expect(s.items.every((i) => i.kind !== ('activity' as string))).toBe(true);

    const eq = s.items.find(
      (i) => i.kind === 'equipment_delivery' && i.id === 'EQ-HVAC-01',
    );
    const ms = s.items.find((i) => i.kind === 'milestone' && i.id === 'MS-PS');
    expect(eq).toMatchObject({
      status: 'OnTrack',
      baselineDate: '2027-05-15',
      forecastDate: '2027-05-15',
      dateVariance: { deltaDays: 0 },
      workstream: 'WS-HVAC',
    });
    expect(eq && 'name' in eq && eq.name.length).toBeGreaterThan(0);
    expect(s.items).toHaveLength(37);
    expect(
      s.items.filter((i) => i.kind === 'equipment_delivery'),
    ).toHaveLength(23);
    expect(s.items.filter((i) => i.kind === 'milestone')).toHaveLength(14);
    expect(ms).toMatchObject({
      rag: 'Green',
      baselineDate: '2027-09-15',
      forecastDate: '2027-09-15',
      dateVariance: { deltaDays: 0 },
      workstream: null,
    });
    expect(JSON.stringify(s)).not.toMatch(/equipmentMilestone|relatedMilestone/);
  });

  it('B: HVAC calm; PKG Delayed; MS-PS Green', () => {
    const s = service.getSchedule('PRJ-01', 'B');
    const hvac = s.items.find(
      (i) => i.kind === 'equipment_delivery' && i.id === 'EQ-HVAC-01',
    )!;
    const pkg = s.items.find(
      (i) => i.kind === 'equipment_delivery' && i.id === 'EQ-PKG-01',
    )!;
    const ms = s.items.find((i) => i.kind === 'milestone' && i.id === 'MS-PS')!;
    expect(hvac.status).toBe('OnTrack');
    expect(pkg.status).toBe('Delayed');
    expect(ms).toMatchObject({
      forecastDate: '2027-09-15',
      rag: 'Green',
      dateVariance: { deltaDays: 0 },
    });
  });

  it('C: HVAC +21 Delayed; MS-PS Red +21; no recovery heal', () => {
    const s = service.getSchedule('PRJ-01', 'C');
    const eq = s.items.find(
      (i) => i.kind === 'equipment_delivery' && i.id === 'EQ-HVAC-01',
    )!;
    const ms = s.items.find((i) => i.kind === 'milestone' && i.id === 'MS-PS')!;
    expect(eq.forecastDate).toBe('2027-06-05');
    expect(eq.dateVariance.deltaDays).toBe(21);
    expect(ms.forecastDate).toBe('2027-10-06');
    expect(ms.rag).toBe('Red');
    expect(ms.dateVariance.deltaDays).toBe(21);
  });

  it('unknown project → 404', () => {
    expect(() => service.getSchedule('PRJ-99', 'A')).toThrow(NotFoundException);
  });
});
