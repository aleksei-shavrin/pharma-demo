import type { MilestoneId } from './fixtures/catalog';
import { EXECUTIVE_MILESTONE_SET_STABLE } from './fixtures/snapshot-states';

export type ProgramId =
  | 'PRG-DSN'
  | 'PRG-CON'
  | 'PRG-ENG'
  | 'PRG-EQP'
  | 'PRG-DIG'
  | 'PRG-STA'
  | 'PRG-ORG';

export type AnalystProjectId =
  | 'AN-01'
  | 'AN-02'
  | 'AN-03'
  | 'AN-04'
  | 'AN-05'
  | 'AN-06'
  | 'AN-07'
  | 'AN-08'
  | 'AN-09'
  | 'AN-10'
  | 'AN-11'
  | 'AN-12'
  | 'AN-13'
  | 'AN-14'
  | 'AN-15'
  | 'AN-16'
  | 'AN-17'
  | 'AN-18'
  | 'AN-19'
  | 'AN-20'
  | 'AN-21'
  | 'AN-22'
  | 'AN-23'
  | 'AN-24'
  | 'AN-25';

export type AnalystStatus = 'Green' | 'Yellow' | 'Red';
export type SourceAttention = 'lag' | 'none';

export type AnalystProjectCatalog = {
  id: AnalystProjectId;
  name: string;
  programId: ProgramId;
  sourceAttention: SourceAttention;
  /** Подробный сюжет показа. Тонкие строки не выдумывают недели. */
  depth: 'deep' | 'thin';
  ownerPersonId: string | null;
  /** Синтетический ход только у AN-06 и AN-07. */
  progressLabel: string;
};

export const PROGRAM_CATALOG: readonly {
  id: ProgramId;
  name: string;
}[] = [
  { id: 'PRG-DSN', name: 'Проектирование и разрешения' },
  { id: 'PRG-CON', name: 'Строительство' },
  { id: 'PRG-ENG', name: 'Инженерия' },
  { id: 'PRG-EQP', name: 'Оборудование' },
  { id: 'PRG-DIG', name: 'Цифра' },
  { id: 'PRG-STA', name: 'Запуск' },
  { id: 'PRG-ORG', name: 'Организация и люди' },
];

const ABSENT = 'по статусам исходника (якорь C)';
const UNASSIGNED = 'не назначен';

function row(
  id: AnalystProjectId,
  name: string,
  programId: ProgramId,
  sourceAttention: SourceAttention,
  depth: 'deep' | 'thin' = 'thin',
  ownerPersonId: string | null = null,
  progressLabel = ABSENT,
): AnalystProjectCatalog {
  return {
    id,
    name,
    programId,
    sourceAttention,
    depth,
    ownerPersonId,
    progressLabel,
  };
}

export const ANALYST_PROJECTS: readonly AnalystProjectCatalog[] = [
  row('AN-01', 'Предпроектные работы и URS', 'PRG-DSN', 'lag'),
  row('AN-02', 'Инженерные изыскания', 'PRG-DSN', 'lag'),
  row('AN-03', 'Концептуальный дизайн (FEED)', 'PRG-DSN', 'lag'),
  row('AN-04', 'Детальный дизайн и DQ', 'PRG-DSN', 'lag'),
  row('AN-05', 'Разрешительная документация и экспертиза', 'PRG-DSN', 'lag'),
  row(
    'AN-06',
    'Земляные работы и нулевой цикл',
    'PRG-CON',
    'lag',
    'deep',
    'PER-06',
    'запись показа без недель исходника',
  ),
  row(
    'AN-07',
    'Строительные конструкции и каркас',
    'PRG-CON',
    'lag',
    'deep',
    'PER-06',
    'запись показа без недель исходника',
  ),
  row(
    'AN-08',
    'Внутренняя отделка и чистые помещения',
    'PRG-CON',
    'lag',
    'deep',
    'PER-07',
    'по вехе панелей',
  ),
  row(
    'AN-09',
    'HVAC и системы подготовки воздуха',
    'PRG-ENG',
    'lag',
    'deep',
    'PER-08',
    'по сюжету HVAC',
  ),
  row('AN-10', 'Водоподготовка (PW/WFI/PS) и CIP/SIP', 'PRG-ENG', 'lag'),
  row('AN-11', 'Технологические трубопроводы и обвязка', 'PRG-ENG', 'lag'),
  row('AN-12', 'Электроснабжение и слаботочные системы', 'PRG-ENG', 'lag'),
  row(
    'AN-13',
    'Технологическое оборудование: закупка и монтаж',
    'PRG-EQP',
    'lag',
  ),
  row('AN-14', 'GMP-склад и логистика', 'PRG-EQP', 'lag'),
  row('AN-15', 'ИТ-инфраструктура и ЦОД', 'PRG-DIG', 'none'),
  row('AN-16', 'Автоматизация (BMS/EMS/DCS)', 'PRG-DIG', 'lag'),
  row('AN-17', 'MES/ERP/LIMS интеграция', 'PRG-DIG', 'lag'),
  row('AN-18', 'CSV — валидация компьютерных систем', 'PRG-DIG', 'lag'),
  row('AN-19', 'Комиссионирование (Commissioning/SAT)', 'PRG-STA', 'lag'),
  row('AN-20', 'Квалификация (IQ/OQ/PQ)', 'PRG-STA', 'none'),
  row('AN-21', 'Валидация процессов (PPQ)', 'PRG-STA', 'none'),
  row('AN-22', 'СМК и операционная готовность', 'PRG-ORG', 'lag'),
  row('AN-23', 'Персонал и обучение', 'PRG-ORG', 'none'),
  row(
    'AN-24',
    'Внешние сети и энергоснабжение',
    'PRG-ENG',
    'lag',
    'deep',
    'PER-09',
    'по вехе энергоснабжения',
  ),
  row('AN-25', 'Регуляторная подготовка и PAI', 'PRG-STA', 'none'),
];

export type MilestoneMembership = {
  programId: ProgramId | null;
  projectId: AnalystProjectId | null;
  portfolioVisible: boolean;
};

const PORTFOLIO_SET = new Set<string>(EXECUTIVE_MILESTONE_SET_STABLE);

const MEMBERSHIP: Partial<
  Record<MilestoneId, Omit<MilestoneMembership, 'portfolioVisible'>>
> = {
  'MS-BLD-EXC': { programId: 'PRG-CON', projectId: 'AN-06' },
  'MS-BLD-ENCL': { programId: 'PRG-CON', projectId: 'AN-07' },
  'MS-CLN-PANEL': { programId: 'PRG-CON', projectId: 'AN-08' },
  'MS-CLN-RDY': { programId: 'PRG-CON', projectId: 'AN-08' },
  'MS-UTL-PWR': { programId: 'PRG-ENG', projectId: 'AN-24' },
  'MS-HVAC-IQ': { programId: 'PRG-ENG', projectId: 'AN-09' },
  'MS-UTL-WFI': { programId: 'PRG-ENG', projectId: 'AN-10' },
  'MS-PRD-INST': { programId: 'PRG-EQP', projectId: 'AN-13' },
  'MS-PKG-SAT': { programId: 'PRG-EQP', projectId: 'AN-14' },
  'MS-COM-OQ': { programId: 'PRG-STA', projectId: null },
  'MS-COM-GO': { programId: 'PRG-STA', projectId: null },
  'MS-PS': { programId: null, projectId: null },
};

export function milestoneMembership(id: string): MilestoneMembership {
  const member = MEMBERSHIP[id as MilestoneId];
  return {
    programId: member?.programId ?? null,
    projectId: member?.projectId ?? null,
    portfolioVisible: PORTFOLIO_SET.has(id),
  };
}

const RANK: Record<AnalystStatus, number> = { Red: 0, Yellow: 1, Green: 2 };

export function worstStatus(statuses: AnalystStatus[]): AnalystStatus {
  return statuses.reduce<AnalystStatus>(
    (worst, status) => (RANK[status] < RANK[worst] ? status : worst),
    'Green',
  );
}

export function analystProjectStatus(input: {
  project: AnalystProjectCatalog;
  panelRed: boolean;
  powerRed: boolean;
  hvacDelayed: boolean;
}): AnalystStatus {
  const { project, panelRed, powerRed, hvacDelayed } = input;
  if (project.id === 'AN-08') return panelRed ? 'Red' : 'Green';
  if (project.id === 'AN-09') return hvacDelayed ? 'Red' : 'Green';
  if (project.id === 'AN-24') return powerRed ? 'Red' : 'Green';
  if (project.id === 'AN-06' || project.id === 'AN-07') return 'Yellow';
  return project.sourceAttention === 'lag' ? 'Yellow' : 'Green';
}

export function programSummariesFor(input: {
  panelRed: boolean;
  powerRed: boolean;
  hvacDelayed: boolean;
}): { id: ProgramId; name: string; status: AnalystStatus }[] {
  return PROGRAM_CATALOG.map((program) => ({
    id: program.id,
    name: program.name,
    status: worstStatus(
      projectsOf(program.id).map((project) =>
        analystProjectStatus({ project, ...input }),
      ),
    ),
  }));
}

export function programById(id: string) {
  return PROGRAM_CATALOG.find((program) => program.id === id) ?? null;
}

export function projectById(id: string) {
  return ANALYST_PROJECTS.find((project) => project.id === id) ?? null;
}

export function projectsOf(programId: ProgramId): AnalystProjectCatalog[] {
  return ANALYST_PROJECTS.filter((project) => project.programId === programId);
}

export const NOT_FOUND_IN_SNAPSHOT = 'Запись не найдена в этом снимке';
export const OWNER_UNASSIGNED = UNASSIGNED;
export const DETAIL_ABSENT = ABSENT;
