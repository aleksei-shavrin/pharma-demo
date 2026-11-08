/**
 * Semantic mapping WorkstreamId → analyst projects → programs.
 * WorkstreamId remains an internal compatibility tag — not a user entity.
 * certainty: assumption (demo taxonomy bridge).
 */
import type { ProgramId, AnalystProjectId } from './analyst-portfolio';
import type { WorkstreamId } from './workstream-ids';
import { EQUIPMENT_CATALOG } from './fixtures/catalog';

export type WorkstreamBridge = {
  workstreamId: WorkstreamId;
  primaryProjectId: AnalystProjectId | null;
  projectIds: readonly AnalystProjectId[];
  programId: ProgramId;
  redirect: 'project' | 'program';
  /** Honest note when no 1:1 analyst project exists. */
  note?: string;
};

/**
 * Explicit WS→AN→PRG from actual source titles.
 * No packaging / QC-lab project in the 25 — do not pretend AN-14/AN-20 are those.
 */
export const WORKSTREAM_BRIDGES: readonly WorkstreamBridge[] = [
  {
    workstreamId: 'WS-BLD',
    primaryProjectId: 'AN-06',
    projectIds: ['AN-06', 'AN-07'],
    programId: 'PRG-CON',
    redirect: 'program',
  },
  {
    workstreamId: 'WS-CLN',
    primaryProjectId: 'AN-08',
    projectIds: ['AN-08'],
    programId: 'PRG-CON',
    redirect: 'project',
  },
  {
    workstreamId: 'WS-HVAC',
    primaryProjectId: 'AN-09',
    projectIds: ['AN-09'],
    programId: 'PRG-ENG',
    redirect: 'project',
  },
  {
    workstreamId: 'WS-UTL',
    primaryProjectId: 'AN-24',
    projectIds: ['AN-24'],
    programId: 'PRG-ENG',
    redirect: 'project',
    note: 'Water/pipes/power as AN-10/11/12 are separate ENG projects; UTL tag primary is AN-24',
  },
  {
    workstreamId: 'WS-PRD',
    primaryProjectId: 'AN-13',
    projectIds: ['AN-13'],
    programId: 'PRG-EQP',
    redirect: 'project',
  },
  {
    workstreamId: 'WS-PKG',
    primaryProjectId: null,
    projectIds: [],
    programId: 'PRG-EQP',
    redirect: 'program',
    note: 'No packaging project in analyst 25; EQ mapped via EQUIPMENT_PRIMARY_PROJECT',
  },
  {
    workstreamId: 'WS-QC',
    primaryProjectId: 'AN-20',
    projectIds: ['AN-20'],
    programId: 'PRG-STA',
    redirect: 'project',
    note: 'No QC-lab root in analyst 25; WS-QC is a legacy quality tag mapped as program-level supplement under qualification AN-20 (PRG-STA), not cleanrooms AN-08',
  },
  {
    workstreamId: 'WS-AUT',
    primaryProjectId: 'AN-16',
    projectIds: ['AN-16'],
    programId: 'PRG-DIG',
    redirect: 'project',
    note: 'IT/MES/CSV are AN-15/17/18; AUT tag primary is AN-16',
  },
] as const;

export function bridgeForWorkstream(id: string): WorkstreamBridge | null {
  return WORKSTREAM_BRIDGES.find((b) => b.workstreamId === id) ?? null;
}

export function workstreamsForProject(
  projectId: AnalystProjectId,
): WorkstreamId[] {
  return WORKSTREAM_BRIDGES.filter((b) => b.projectIds.includes(projectId)).map(
    (b) => b.workstreamId,
  );
}

export function workstreamsForProgram(programId: ProgramId): WorkstreamId[] {
  return WORKSTREAM_BRIDGES.filter((b) => b.programId === programId).map(
    (b) => b.workstreamId,
  );
}

export function primaryWorkstreamForProject(
  projectId: AnalystProjectId,
): WorkstreamId | null {
  const hit = WORKSTREAM_BRIDGES.find((b) => b.primaryProjectId === projectId);
  return hit?.workstreamId ?? null;
}

/**
 * Catalog MS WBS aliases. Analyst display name is SoT.
 */
export const MILESTONE_WBS_ALIASES: Readonly<
  Record<string, { wbs: string; analystName: string }>
> = {
  'MS-CLN-PANEL': {
    wbs: '8.2.3',
    analystName: 'Ограждающие конструкции C/D готовы',
  },
  'MS-UTL-PWR': {
    wbs: '24.1.3',
    analystName: 'Энергоснабжение обеспечено',
  },
};

/**
 * Each equipment id → exactly one primary analyst project.
 * Secondary relations are not used for counts.
 */
const WS_DEFAULT_PRIMARY: Partial<Record<WorkstreamId, AnalystProjectId>> = {
  'WS-BLD': 'AN-06',
  'WS-CLN': 'AN-08',
  'WS-HVAC': 'AN-09',
  'WS-UTL': 'AN-24',
  'WS-PRD': 'AN-13',
  // Packaging: no AN project — park under equipment program project AN-13 (tech equipment), not warehouse.
  'WS-PKG': 'AN-13',
  // QC legacy tag → qualification AN-20 (not cleanrooms AN-08).
  'WS-QC': 'AN-20',
  'WS-AUT': 'AN-16',
};

export const EQUIPMENT_PRIMARY_PROJECT: Readonly<
  Record<string, AnalystProjectId>
> = Object.fromEntries(
  Object.entries(EQUIPMENT_CATALOG).map(([id, row]) => {
    const ws = row.workstream;
    const primary = WS_DEFAULT_PRIMARY[ws] ?? 'AN-13';
    return [id, primary];
  }),
);

export function primaryProjectForEquipment(
  equipmentId: string,
): AnalystProjectId | null {
  return EQUIPMENT_PRIMARY_PROJECT[equipmentId] ?? null;
}

/** Obsolete synthetic WBS — same code ≠ same semantics. */
export const LEGACY_WBS_AUDIT: readonly {
  legacyWbs: string;
  legacyName: string;
  resolution: 'retired_collision_code' | 'remapped' | 'kept_alias';
  analystWbs?: string;
  analystMeaning?: string;
  note: string;
}[] = [
  {
    legacyWbs: '1.1.1',
    legacyName: 'building synthetic leaf',
    resolution: 'retired_collision_code',
    analystWbs: '1.1.1',
    analystMeaning: 'Анализ продуктового портфеля и мощностей (URS)',
    note: 'Same code, different meaning — synthetic building retired; analyst URS kept',
  },
  {
    legacyWbs: '5.1.1',
    legacyName: 'production synthetic',
    resolution: 'retired_collision_code',
    analystWbs: '5.1.1',
    analystMeaning: 'permits/ГПЗУ leaf',
    note: 'Collision code; synthetic production retired',
  },
  {
    legacyWbs: '6.1.1',
    legacyName: 'packaging synthetic',
    resolution: 'retired_collision_code',
    analystWbs: '6.1.1',
    analystMeaning: 'earthworks/площадка',
    note: 'Collision code; synthetic packaging retired',
  },
  {
    legacyWbs: '7.1.1',
    legacyName: 'QC synthetic',
    resolution: 'retired_collision_code',
    analystWbs: '7.1.1',
    analystMeaning: 'monolithic frame',
    note: 'Collision code; synthetic QC retired',
  },
  {
    legacyWbs: '10.1.1',
    legacyName: 'automation synthetic',
    resolution: 'retired_collision_code',
    analystWbs: '10.1.1',
    analystMeaning: 'water URS',
    note: 'Collision code; synthetic automation retired',
  },
  {
    legacyWbs: '8.2.3',
    legacyName: 'MS-CLN-PANEL',
    resolution: 'kept_alias',
    analystWbs: '8.2.3',
    analystMeaning: 'Ограждающие конструкции C/D готовы',
    note: 'Catalogue MS aliased to analyst KT; analyst name wins',
  },
];
