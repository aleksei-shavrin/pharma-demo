import { NotFoundException } from '@nestjs/common';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import { PERSON_CATALOG } from '../data/fixtures/person-catalog';
import { isPersonId } from '../contracts/person-id';
import { PeopleService } from './people.service';

describe('PeopleService (R2-P1)', () => {
  const service = new PeopleService(new MockDemoDataSource());

  it('lists 15 people with PER ids on A/O/S', () => {
    for (const snap of ['A', 'O', 'S'] as const) {
      const list = service.list('PRJ-01', snap);
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
    expect(() => service.list('PRJ-NOPE', 'C')).toThrow(NotFoundException);
  });

  it('returns HVAC lead detail on C without legacy ENG bulk ownership', () => {
    const d = service.getDetail('PRJ-01', 'PER-08', 'C');
    expect(d.person.id).toBe('PER-08');
    expect(d.person.fullNameRu).toBe('Смирнов Павел Андреевич');
    expect(d.person.roleTitleRu).toBe(
      'Ответственный по направлению (legacy tag) HVAC',
    );
    expect(d.leadWorkstreamIds).toEqual(['WS-HVAC']);
    // Snapshot C: HVAC issues first appear later (ISS-HVAC-02 @ D); empty Issues OK.
    expect(d.issueIds).not.toContain('ISS-BLD-01');
    expect(d.issueIds).not.toContain('ISS-BLD-02');
    expect(d.issueIds).not.toContain('ISS-001');
    expect(d.equipmentIds).toContain('EQ-HVAC-01');
    expect(JSON.stringify(d)).not.toMatch(/SH-/);
  });

  it('PM owns ISS-001 on Snapshot C', () => {
    const d = service.getDetail('PRJ-01', 'PER-02', 'C');
    expect(d.issueIds).toContain('ISS-001');
  });

  it('BLD lead owns BLD issues; UTL lead owns WFI recovery decision', () => {
    const bld = service.getDetail('PRJ-01', 'PER-06', 'C');
    expect(bld.issueIds).toContain('ISS-BLD-01');
    expect(bld.issueIds).toContain('ISS-BLD-02');
    const utl = service.getDetail('PRJ-01', 'PER-09', 'G');
    expect(utl.decisionIds).toContain('DEC-UTL-01');
    const hvac = service.getDetail('PRJ-01', 'PER-08', 'G');
    expect(hvac.decisionIds).not.toContain('DEC-UTL-01');
  });

  it('404 for unknown person', () => {
    expect(() => service.getDetail('PRJ-01', 'PER-99', 'C')).toThrow(
      NotFoundException,
    );
    expect(() => service.getDetail('PRJ-01', 'SH-ENG-01', 'C')).toThrow(
      NotFoundException,
    );
  });

  it('snapshot-aware decision projections without changing identity', () => {
    const onA = service.getDetail('PRJ-01', 'PER-01', 'A');
    const onF = service.getDetail('PRJ-01', 'PER-01', 'F');
    expect(onA.person.fullNameRu).toBe(onF.person.fullNameRu);
    expect(onA.decisionIds.length).toBeLessThan(onF.decisionIds.length);
    expect(onF.decisionIds).toContain('DEC-001');
  });
});
