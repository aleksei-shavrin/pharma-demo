'use client';

import {
  timelineProgramLabel,
  timelineProgramVisualTopDownIds,
} from '@/lib/dashboard/timeline-program-labels';
import type { TimelineUniverseScope } from '@/lib/dashboard/timeline-universe-scope';

type ToolbarProps = {
  totalCount: number;
  shownCount: number;
  scope: TimelineUniverseScope;
  programFilter: string;
  programIds: string[];
  onScopeChange: (scope: TimelineUniverseScope) => void;
  onProgramFilterChange: (programId: string) => void;
};

const SCOPE_OPTIONS: { value: TimelineUniverseScope; label: string }[] = [
  { value: 'all', label: 'Все 189 вех' },
  { value: 'overview', label: 'Фильтр: обзор ключевых (12)' },
];

/** Compact header controls: counter + scope/program selects (no visible field labels). */
export function ExecutiveTimelineUniverseToolbar({
  totalCount,
  shownCount,
  scope,
  programFilter,
  programIds,
  onScopeChange,
  onProgramFilterChange,
}: ToolbarProps) {
  const orderedPrograms = timelineProgramVisualTopDownIds(programIds);
  const scopeLabel =
    SCOPE_OPTIONS.find((o) => o.value === scope)?.label ?? scope;
  const programLabel =
    programFilter === 'all'
      ? 'Все программы'
      : timelineProgramLabel(programFilter);

  return (
    <div
      className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-x-1.5 gap-y-1 text-xs"
      data-timeline-universe-toolbar="true"
    >
      <span
        className="shrink-0 text-[var(--text-muted)]"
        data-timeline-shown-count
      >
        Показано{' '}
        <span className="font-semibold tabular-nums text-[var(--text)]">
          {shownCount}
        </span>{' '}
        / {totalCount}
      </span>
      <div
        className="flex shrink-0 items-center gap-1.5"
        data-timeline-select-pair="true"
      >
        <select
          className="h-7 w-[8rem] max-w-[8rem] truncate rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-1.5"
          value={scope}
          title={scopeLabel}
          aria-label="Объём"
          onChange={(e) =>
            onScopeChange(e.target.value as TimelineUniverseScope)
          }
          data-timeline-scope-filter="true"
        >
          {SCOPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="h-7 w-[8rem] max-w-[8rem] truncate rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-1.5"
          value={programFilter}
          title={programLabel}
          aria-label="Программа"
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
      </div>
    </div>
  );
}
