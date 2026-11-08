import {
  EQUIPMENT_PRIMARY_PROJECT,
  bridgeForWorkstream,
  primaryProjectForEquipment,
  primaryWorkstreamForProject,
  workstreamsForProgram,
  workstreamsForProject,
} from './ws-program-mapping';
import { EQUIPMENT_CATALOG } from './fixtures/catalog';

describe('ws-program-mapping', () => {
  it('maps WS-QC to AN-20 / PRG-STA, not AN-08', () => {
    const b = bridgeForWorkstream('WS-QC');
    expect(b?.primaryProjectId).toBe('AN-20');
    expect(b?.programId).toBe('PRG-STA');
    expect(primaryWorkstreamForProject('AN-20')).toBe('WS-QC');
    expect(workstreamsForProject('AN-08')).toEqual(['WS-CLN']);
  });

  it('maps WS-PKG to PRG-EQP without packaging AN project', () => {
    const b = bridgeForWorkstream('WS-PKG');
    expect(b?.primaryProjectId).toBeNull();
    expect(b?.programId).toBe('PRG-EQP');
    expect(workstreamsForProgram('PRG-EQP')).toEqual(
      expect.arrayContaining(['WS-PRD', 'WS-PKG']),
    );
  });

  it('assigns each EQ a unique primary project without broadcast', () => {
    const ids = Object.keys(EQUIPMENT_CATALOG);
    expect(ids.length).toBe(52);
    for (const id of ids) {
      const primary = primaryProjectForEquipment(id);
      expect(primary).toBeTruthy();
      expect(EQUIPMENT_PRIMARY_PROJECT[id]).toBe(primary);
    }
    const qcEq = ids.filter(
      (id) =>
        EQUIPMENT_CATALOG[id as keyof typeof EQUIPMENT_CATALOG].workstream ===
        'WS-QC',
    );
    for (const id of qcEq) {
      expect(EQUIPMENT_PRIMARY_PROJECT[id]).toBe('AN-20');
    }
    const pkgEq = ids.filter(
      (id) =>
        EQUIPMENT_CATALOG[id as keyof typeof EQUIPMENT_CATALOG].workstream ===
        'WS-PKG',
    );
    for (const id of pkgEq) {
      expect(EQUIPMENT_PRIMARY_PROJECT[id]).toBe('AN-13');
    }
  });

  it('returns null for unknown workstream / equipment / project bridges', () => {
    expect(bridgeForWorkstream('WS-NOPE')).toBeNull();
    expect(primaryProjectForEquipment('EQ-NOPE')).toBeNull();
    expect(primaryWorkstreamForProject('AN-01')).toBeNull();
    expect(workstreamsForProgram('PRG-DSN')).toEqual([]);
    expect(workstreamsForProject('AN-22')).toEqual([]);
  });
});
