import type { WorkstreamId } from '@/lib/api-client';

/**
 * FE mirror of apps/api PROGRAM_CATALOG + WORKSTREAM_BRIDGES.
 * User-facing filter is 7 programs, not 8 workstream tags.
 */
export type ProgramFilterId =
  | 'all'
  | 'PRG-DSN'
  | 'PRG-CON'
  | 'PRG-ENG'
  | 'PRG-EQP'
  | 'PRG-DIG'
  | 'PRG-STA'
  | 'PRG-ORG';

export const PROGRAM_FILTER_OPTIONS: Array<{
  id: ProgramFilterId;
  label: string;
  workstreams: WorkstreamId[];
}> = [
  { id: 'all', label: 'Все программы', workstreams: [] },
  {
    id: 'PRG-DSN',
    label: 'Проектирование и разрешения',
    workstreams: [],
  },
  {
    id: 'PRG-CON',
    label: 'Строительство',
    workstreams: ['WS-BLD', 'WS-CLN'],
  },
  {
    id: 'PRG-ENG',
    label: 'Инженерия',
    workstreams: ['WS-HVAC', 'WS-UTL'],
  },
  {
    id: 'PRG-EQP',
    label: 'Оборудование',
    workstreams: ['WS-PRD', 'WS-PKG'],
  },
  {
    id: 'PRG-DIG',
    label: 'Цифра',
    workstreams: ['WS-AUT'],
  },
  {
    id: 'PRG-STA',
    label: 'Запуск',
    workstreams: ['WS-QC'],
  },
  {
    id: 'PRG-ORG',
    label: 'Организация и люди',
    workstreams: [],
  },
];

export function matchesProgramFilter(
  filter: ProgramFilterId,
  workstream: string | null | undefined,
): boolean {
  if (filter === 'all') return true;
  const opt = PROGRAM_FILTER_OPTIONS.find((o) => o.id === filter);
  if (!opt) return true;
  if (opt.workstreams.length === 0) {
    // Programs without demo WS tags: only match untagged items when filtering them.
    return !workstream;
  }
  return Boolean(
    workstream && opt.workstreams.includes(workstream as WorkstreamId),
  );
}

export function programFilterLabel(id: ProgramFilterId): string {
  return PROGRAM_FILTER_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

/** Map legacy workstream tag → program label for register columns. */
export function programLabelForWorkstream(
  workstream: string | null | undefined,
): string {
  if (!workstream) return '—';
  const hit = PROGRAM_FILTER_OPTIONS.find(
    (o) =>
      o.id !== 'all' &&
      o.workstreams.includes(workstream as WorkstreamId),
  );
  return hit?.label ?? workstream;
}
