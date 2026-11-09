import { NotFoundException } from '@nestjs/common';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import { PERSON_CATALOG } from '../data/fixtures/person-catalog';
import { isPersonId } from '../contracts/person-id';
import { PeopleService } from './people.service';

describe('PeopleService (R2-P1)', () => {
  const service = new PeopleService(new MockDemoDataSource());

  it('lists 15 people with PER ids on A/O/S', () => {
    for (const snap of ['01', '15', '19'] as const) {
      const list = service.list('PRT-01', snap);
      expect(list.snapshotId).toBe(snap);
      expect(list.items).toHaveLength(15);
      expect(list.items.map((p) => p.id)).toEqual(
        PERSON_CATALOG.map((p) => p.id),
      );
      expect(list.items.every((p) => isPersonId(p.id))).toBe(true);
      expect(list.items.every((p) => p.fullNameRu.length > 0)).toBe(true);
      expect(JSON.stringify(list)).not.toMatch(/SH-/);
    }
  });

  it('rejects unknown project', () => {
    expect(() => service.list('PRJ-NOPE', '03')).toThrow(NotFoundException);
  });

  it('returns HVAC lead detail on C without legacy ENG bulk ownership', () => {
    const d = service.getDetail('PRT-01', 'PER-08', '03');
    expect(d.person.id).toBe('PER-08');
    expect(d.person.fullNameRu).toBe('Смирнов Павел Андреевич');
    expect(d.person.roleTitleRu).toBe(
      'Ответственный по направлению (legacy tag) HVAC',
    );
    expect(d.leadWorkstreamIds).toEqual(['WS-HVAC']);
    // Snapshot 03: HVAC issues first appear later (ISS-HVAC-02 @ D); empty Issues OK.
    expect(d.issueIds).not.toContain('ISS-BLD-01');
    expect(d.issueIds).not.toContain('ISS-BLD-02');
    expect(d.issueIds).not.toContain('ISS-001');
    expect(d.equipmentIds).toContain('EQ-HVAC-01');
    expect(JSON.stringify(d)).not.toMatch(/SH-/);
  });

  it('PM owns ISS-001 on Snapshot C', () => {
    const d = service.getDetail('PRT-01', 'PER-02', '03');
    expect(d.issueIds).toContain('ISS-001');
  });

  it('BLD lead owns BLD issues; UTL lead owns WFI recovery decision', () => {
    const bld = service.getDetail('PRT-01', 'PER-06', '03');
    expect(bld.issueIds).toContain('ISS-BLD-01');
    expect(bld.issueIds).toContain('ISS-BLD-02');
    const utl = service.getDetail('PRT-01', 'PER-09', '07');
    expect(utl.decisionIds).toContain('DEC-UTL-01');
    const hvac = service.getDetail('PRT-01', 'PER-08', '07');
    expect(hvac.decisionIds).not.toContain('DEC-UTL-01');
  });

  it('404 for unknown person', () => {
    expect(() => service.getDetail('PRT-01', 'PER-99', '03')).toThrow(
      NotFoundException,
    );
    expect(() => service.getDetail('PRT-01', 'SH-ENG-01', '03')).toThrow(
      NotFoundException,
    );
  });

  it('snapshot-aware decision projections without changing identity', () => {
    const onA = service.getDetail('PRT-01', 'PER-01', '01');
    const onF = service.getDetail('PRT-01', 'PER-01', '06');
    expect(onA.person.fullNameRu).toBe(onF.person.fullNameRu);
    expect(onA.decisionIds.length).toBeLessThan(onF.decisionIds.length);
    expect(onF.decisionIds).toContain('DEC-001');
  });
});
