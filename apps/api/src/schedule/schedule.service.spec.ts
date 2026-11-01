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

  it('A: equipment OnTrack Δ0; milestone Green Δ0; no Activity', () => {
    const s = service.getSchedule('PRJ-01', 'A');
    expect(s.snapshotId).toBe('A');
    expect(s.items).toHaveLength(2);
    expect(s.items.every((i) => i.kind !== ('activity' as string))).toBe(true);

    const eq = s.items.find((i) => i.kind === 'equipment_delivery');
    const ms = s.items.find((i) => i.kind === 'milestone');
    expect(eq).toMatchObject({
      id: 'EQ-HVAC-01',
      status: 'OnTrack',
      baselineDate: '2027-05-15',
      forecastDate: '2027-05-15',
      dateVariance: { deltaDays: 0 },
    });
    expect(ms).toMatchObject({
      id: 'MS-PS',
      rag: 'Green',
      baselineDate: '2027-09-15',
      forecastDate: '2027-09-15',
      dateVariance: { deltaDays: 0 },
    });
    expect(JSON.stringify(s)).not.toMatch(/equipmentMilestone|relatedMilestone/);
  });

  it('B: +21 Delayed/Red; chronological order by forecast', () => {
    const s = service.getSchedule('PRJ-01', 'B');
    expect(s.items.map((i) => i.id)).toEqual(['EQ-HVAC-01', 'MS-PS']);
    const eq = s.items[0];
    const ms = s.items[1];
    expect(eq.kind).toBe('equipment_delivery');
    expect(eq).toMatchObject({
      forecastDate: '2027-06-05',
      status: 'Delayed',
      dateVariance: { deltaDays: 21 },
    });
    expect(ms.kind).toBe('milestone');
    expect(ms).toMatchObject({
      forecastDate: '2027-10-06',
      rag: 'Red',
      dateVariance: { deltaDays: 21 },
    });
  });

  it('C: same delayed forecasts as B; no recovery heal', () => {
    const s = service.getSchedule('PRJ-01', 'C');
    const eq = s.items.find((i) => i.kind === 'equipment_delivery')!;
    const ms = s.items.find((i) => i.kind === 'milestone')!;
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
