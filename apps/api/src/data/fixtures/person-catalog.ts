import type { PersonId } from '../../contracts/person-id';
import { WORKSTREAM_IDS, type WorkstreamId } from '../workstream-ids';

export type PersonFixture = {
  id: PersonId;
  fullNameRu: string;
  roleTitleRu: string;
  primaryWorkstreamId: WorkstreamId | null;
  active: boolean;
};

/**
 * Demo Person catalogue (DOC-PROD-025) — fictional RU names; not HRIS.
 * R2-P1 closes fullNameRu authoring.
 */
export const PERSON_CATALOG: readonly PersonFixture[] = [
  {
    id: 'PER-01',
    fullNameRu: 'Соколов Андрей Викторович',
    roleTitleRu: 'Директор проекта',
    primaryWorkstreamId: null,
    active: true,
  },
  {
    id: 'PER-02',
    fullNameRu: 'Морозова Елена Сергеевна',
    roleTitleRu: 'Руководитель проекта (PM)',
    primaryWorkstreamId: null,
    active: true,
  },
  {
    id: 'PER-03',
    fullNameRu: 'Кузнецов Дмитрий Игоревич',
    roleTitleRu: 'Планирование и контроль проекта',
    primaryWorkstreamId: null,
    active: true,
  },
  {
    id: 'PER-04',
    fullNameRu: 'Новикова Анна Павловна',
    roleTitleRu: 'Закупки',
    primaryWorkstreamId: null,
    active: true,
  },
  {
    id: 'PER-05',
    fullNameRu: 'Орлов Максим Алексеевич',
    roleTitleRu: 'Пусконаладка и готовность',
    primaryWorkstreamId: null,
    active: true,
  },
  {
    id: 'PER-06',
    fullNameRu: 'Васильев Игорь Николаевич',
    roleTitleRu: 'Ответственный по направлению (legacy tag) «Строительство»',
    primaryWorkstreamId: 'WS-BLD',
    active: true,
  },
  {
    id: 'PER-07',
    fullNameRu: 'Лебедева Ольга Викторовна',
    roleTitleRu: 'Ответственный по направлению (legacy tag) «Чистые помещения»',
    primaryWorkstreamId: 'WS-CLN',
    active: true,
  },
  {
    id: 'PER-08',
    fullNameRu: 'Смирнов Павел Андреевич',
    roleTitleRu: 'Ответственный по направлению (legacy tag) HVAC',
    primaryWorkstreamId: 'WS-HVAC',
    active: true,
  },
  {
    id: 'PER-09',
    fullNameRu: 'Фёдоров Сергей Михайлович',
    roleTitleRu:
      'Ответственный по направлению (legacy tag) «Инженерные системы»',
    primaryWorkstreamId: 'WS-UTL',
    active: true,
  },
  {
    id: 'PER-10',
    fullNameRu: 'Козлова Наталья Ивановна',
    roleTitleRu: 'Ответственный по направлению (legacy tag) «Производство»',
    primaryWorkstreamId: 'WS-PRD',
    active: true,
  },
  {
    id: 'PER-11',
    fullNameRu: 'Попов Алексей Дмитриевич',
    roleTitleRu: 'Ответственный по направлению (legacy tag) «Упаковка»',
    primaryWorkstreamId: 'WS-PKG',
    active: true,
  },
  {
    id: 'PER-12',
    fullNameRu: 'Никитина Мария Александровна',
    roleTitleRu: 'Ответственный по направлению (legacy tag) QC',
    primaryWorkstreamId: 'WS-QC',
    active: true,
  },
  {
    id: 'PER-13',
    fullNameRu: 'Григорьев Артём Владимирович',
    roleTitleRu: 'Ответственный по направлению (legacy tag) «Автоматизация»',
    primaryWorkstreamId: 'WS-AUT',
    active: true,
  },
  {
    id: 'PER-14',
    fullNameRu: 'Белова Екатерина Юрьевна',
    roleTitleRu: 'Ответственный QA проекта',
    primaryWorkstreamId: 'WS-QC',
    active: true,
  },
  {
    id: 'PER-15',
    fullNameRu: 'Тихонов Роман Олегович',
    roleTitleRu: 'Заместитель по готовности',
    primaryWorkstreamId: null,
    active: true,
  },
] as const;

export const PERSON_BY_ID: ReadonlyMap<PersonId, PersonFixture> = new Map(
  PERSON_CATALOG.map((p) => [p.id, p]),
);

/** Exactly one lead per Workstream (DOC-PROD-025). */
export const WORKSTREAM_LEAD_PERSON: Readonly<Record<WorkstreamId, PersonId>> =
  {
    'WS-BLD': 'PER-06',
    'WS-CLN': 'PER-07',
    'WS-HVAC': 'PER-08',
    'WS-UTL': 'PER-09',
    'WS-PRD': 'PER-10',
    'WS-PKG': 'PER-11',
    'WS-QC': 'PER-12',
    'WS-AUT': 'PER-13',
  };

export function personFullNameRu(id: PersonId): string {
  const p = PERSON_BY_ID.get(id);
  if (!p) throw new Error(`Unknown Person ${id}`);
  return p.fullNameRu;
}

export function leadPersonIdForWorkstream(ws: WorkstreamId): PersonId {
  return WORKSTREAM_LEAD_PERSON[ws];
}

export function leadWorkstreamIdsForPerson(id: PersonId): WorkstreamId[] {
  return WORKSTREAM_IDS.filter((ws) => WORKSTREAM_LEAD_PERSON[ws] === id);
}

/** Story-driven optional Equipment responsibility (critical / long-lead). */
export const EQUIPMENT_RESPONSIBLE_PERSON: Readonly<
  Partial<Record<string, PersonId>>
> = {
  'EQ-HVAC-01': 'PER-08',
  'EQ-HVAC-02': 'PER-08',
  'EQ-PKG-01': 'PER-11',
  'EQ-UTL-01': 'PER-09',
  'EQ-AUT-01': 'PER-13',
  'EQ-PRD-01': 'PER-10',
  'EQ-BLD-02': 'PER-06',
  'EQ-CLN-01': 'PER-07',
  'EQ-QC-01': 'PER-12',
};
