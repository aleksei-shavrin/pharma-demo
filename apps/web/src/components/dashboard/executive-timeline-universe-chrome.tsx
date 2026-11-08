'use client';

import { formatDateRu } from '@/lib/format/ru';
import { EXECUTION_PHASE_START } from '@/lib/dashboard/executive-timeline';
import {
  timelineProgramLabel,
  TIMELINE_PROGRAM_ORDER,
} from '@/lib/dashboard/timeline-program-labels';
import type { TimelineUniverseScope } from '@/lib/dashboard/timeline-universe-scope';

type Props = {
  totalCount: number;
  shownCount: number;
  scope: TimelineUniverseScope;
  programFilter: string;
  programIds: string[];
  onScopeChange: (scope: TimelineUniverseScope) => void;
  onProgramFilterChange: (programId: string) => void;
};

export function ExecutiveTimelineUniverseChrome({
  totalCount,
  shownCount,
  scope,
  programFilter,
  programIds,
  onScopeChange,
  onProgramFilterChange,
}: Props) {
  const orderedPrograms = TIMELINE_PROGRAM_ORDER.filter((id) =>
    programIds.includes(id),
  );

  return (
    <div data-timeline-universe-chrome="true">
      <p
        className="mt-2 text-sm text-[var(--text-secondary)]"
        data-timeline-phase-context="true"
      >
        Предпроект: до {formatDateRu(EXECUTION_PHASE_START)}. Основное
        исполнение: с {formatDateRu(EXECUTION_PHASE_START)}. Всего{' '}
        <span className="font-semibold tabular-nums text-[var(--text)]">
          {totalCount}
        </span>{' '}
        вех
        {scope === 'overview' ? (
          <span className="text-[var(--text-muted)]">
            {' '}
            (фильтр «Обзор ключевых»: {shownCount})
          </span>
        ) : null}
        .
      </p>

      <div
        className="mt-2 flex flex-wrap items-center gap-2 text-xs"
        data-timeline-universe-toolbar="true"
      >
        <span className="text-[var(--text-muted)]">
          Показано{' '}
          <span className="font-semibold tabular-nums text-[var(--text)]">
            {shownCount}
          </span>{' '}
          / {totalCount}
        </span>
        <label className="flex items-center gap-1">
          <span className="text-[var(--text-muted)]">Объём</span>
          <select
            className="h-7 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-1.5"
            value={scope}
            onChange={(e) =>
              onScopeChange(e.target.value as TimelineUniverseScope)
            }
            data-timeline-scope-filter="true"
          >
            <option value="all">Все 189 вех</option>
            <option value="overview">Фильтр: обзор ключевых (12)</option>
          </select>
        </label>
        <label className="flex items-center gap-1">
          <span className="text-[var(--text-muted)]">Программа</span>
          <select
            className="h-7 max-w-[16rem] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-1.5"
            value={programFilter}
            onChange={(e) => onProgramFilterChange(e.target.value)}
            data-timeline-program-filter="true"
          >
            <option value="all">Все программы</option>
            {orderedPrograms.map((p) => (
              <option key={p} value={p}>
                {timelineProgramLabel(p)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
