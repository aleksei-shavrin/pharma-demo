import { SH_TO_PER, isPersonId } from '../../contracts/person-id';
import { SNAPSHOT_IDS } from '../../snapshot/snapshot-id';
import { WORKSTREAM_IDS } from '../workstream-ids';
import { ISSUE_CATALOG, DECISION_CATALOG } from './catalog';
import { SNAPSHOTS } from './index';
import {
  EQUIPMENT_RESPONSIBLE_PERSON,
  PERSON_BY_ID,
  PERSON_CATALOG,
  WORKSTREAM_LEAD_PERSON,
} from './person-catalog';

describe('Person catalogue integrity (R2-P1)', () => {
  it('has 15 unique PER-* people with required fields', () => {
    expect(PERSON_CATALOG).toHaveLength(15);
    const ids = PERSON_CATALOG.map((p) => p.id);
    expect(new Set(ids).size).toBe(15);
    for (const p of PERSON_CATALOG) {
      expect(isPersonId(p.id)).toBe(true);
      expect(p.fullNameRu.length).toBeGreaterThan(0);
      expect(p.roleTitleRu.length).toBeGreaterThan(0);
      expect(typeof p.active).toBe('boolean');
    }
  });

  it('maps all 8 Workstream leads to catalogue people', () => {
    expect(Object.keys(WORKSTREAM_LEAD_PERSON)).toHaveLength(8);
    for (const ws of WORKSTREAM_IDS) {
      const lead = WORKSTREAM_LEAD_PERSON[ws];
      expect(PERSON_BY_ID.has(lead)).toBe(true);
    }
  });

  it('resolves all Issue and Decision ownerPersonId refs', () => {
    for (const issue of Object.values(ISSUE_CATALOG)) {
      expect(isPersonId(issue.ownerPersonId)).toBe(true);
      expect(PERSON_BY_ID.has(issue.ownerPersonId)).toBe(true);
    }
    for (const dec of Object.values(DECISION_CATALOG)) {
      expect(isPersonId(dec.ownerPersonId)).toBe(true);
      expect(PERSON_BY_ID.has(dec.ownerPersonId)).toBe(true);
    }
  });

  it('resolves optional Equipment responsiblePersonId', () => {
    for (const [eqId, personId] of Object.entries(
      EQUIPMENT_RESPONSIBLE_PERSON,
    )) {
      expect(eqId.startsWith('EQ-')).toBe(true);
      expect(personId).toBeDefined();
      if (personId === undefined) {
        throw new Error(`EQUIPMENT_RESPONSIBLE_PERSON missing person for ${eqId}`);
      }
      expect(PERSON_BY_ID.has(personId)).toBe(true);
    }
  });

  it('SH_TO_PER covers legacy roles and public snapshots have no SH owners', () => {
    expect(Object.keys(SH_TO_PER).sort()).toEqual(
      [
        'SH-DIR-01',
        'SH-ENG-01',
        'SH-PKG-01',
        'SH-PM-01',
        'SH-QC-01',
      ].sort(),
    );
    // SH_TO_PER is migration aid only — not semantic ownership of all ENG records.
    expect(SH_TO_PER['SH-ENG-01']).toBe('PER-08');
    for (const id of SNAPSHOT_IDS) {
      const snap = SNAPSHOTS[id];
      for (const issue of snap.issues) {
        expect(issue.ownerPersonId.startsWith('PER-')).toBe(true);
        expect(issue.ownerPersonId.startsWith('SH-')).toBe(false);
      }
      for (const dec of snap.decisions) {
        expect(dec.ownerPersonId.startsWith('PER-')).toBe(true);
      }
      const blob = JSON.stringify({
        issues: snap.issues,
        decisions: snap.decisions,
        equipment: snap.equipment.map((e) => e.responsiblePersonId),
      });
      expect(blob).not.toMatch(/SH-/);
    }
  });

  it('fixture-authored semantic ownership (story-critical; R2-P1-R1)', () => {
    expect(ISSUE_CATALOG['ISS-001'].ownerPersonId).toBe('PER-02');
    expect(ISSUE_CATALOG['ISS-BLD-01'].ownerPersonId).toBe('PER-06');
    expect(ISSUE_CATALOG['ISS-BLD-02'].ownerPersonId).toBe('PER-06');
    expect(ISSUE_CATALOG['ISS-CLN-01'].ownerPersonId).toBe('PER-07');
    expect(ISSUE_CATALOG['ISS-HVAC-02'].ownerPersonId).toBe('PER-08');
    expect(ISSUE_CATALOG['ISS-UTL-01'].ownerPersonId).toBe('PER-09');
    expect(ISSUE_CATALOG['ISS-PRD-01'].ownerPersonId).toBe('PER-10');
    expect(ISSUE_CATALOG['ISS-PKG-01'].ownerPersonId).toBe('PER-11');
    expect(ISSUE_CATALOG['ISS-QC-01'].ownerPersonId).toBe('PER-12');
    expect(ISSUE_CATALOG['ISS-AUT-01'].ownerPersonId).toBe('PER-13');

    expect(DECISION_CATALOG['DEC-CLN-01'].ownerPersonId).toBe('PER-07');
    expect(DECISION_CATALOG['DEC-AUT-01'].ownerPersonId).toBe('PER-13');
    expect(DECISION_CATALOG['DEC-PRD-01'].ownerPersonId).toBe('PER-10');
    expect(DECISION_CATALOG['DEC-PKG-01'].ownerPersonId).toBe('PER-11');
    expect(DECISION_CATALOG['DEC-QC-01'].ownerPersonId).toBe('PER-12');

    // WFI recovery must not inherit mechanical SH-ENG→PER-08.
    expect(DECISION_CATALOG['DEC-UTL-01'].ownerPersonId).toBe('PER-09');
    expect(DECISION_CATALOG['DEC-UTL-01'].ownerPersonId).not.toBe('PER-08');
  });

  it('director-facing roleTitleRu stays RU-only (no EN role fragments)', () => {
    const blob = PERSON_CATALOG.map((p) => p.roleTitleRu).join('\n');
    expect(blob).not.toMatch(/Procurement/i);
    expect(blob).not.toMatch(/Project Controls/i);
  });
});
