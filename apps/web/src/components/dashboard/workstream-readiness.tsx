'use client';

import Link from 'next/link';
import type { DashboardOverview, ProjectStatus } from '@/lib/api-client';
import { projectStatusLabel } from '@/lib/ui-labels';
import { SemanticProgressBar } from '@/components/progress/semantic-progress-bar';
import { ModuleSurface } from './module-surface';

const RAG_RANK: Record<ProjectStatus, number> = {
  Red: 0,
  Yellow: 1,
  Green: 2,
};

/**
 * Shared tracks: status col fits one-line «Требует внимания» at text-[10px];
 * progress stays fixed 96–128px. Auto per-row would drift with label length.
 */
const PROGRAM_ROW_GRID =
  'grid w-full grid-cols-[minmax(0,1fr)_8.75rem_minmax(6rem,8rem)] items-center gap-x-2';

/** Compact badge — matches people-focus / exception pills (not pill-full). */
const PROGRAM_STATUS_BADGE =
  'inline-flex w-full shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] border px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none uppercase tracking-wide';

const PROGRESS_TIP =
  'Процент выполнения работ; цвет полосы — календарное отклонение (отставание или сдвиг плана), не статус программы';

function badgeTone(status: ProjectStatus): string {
  if (status === 'Green') {
    return 'border-[var(--status-ok-border)] bg-[var(--status-ok-bg)] text-[var(--status-ok-fg)]';
  }
  if (status === 'Yellow') {
    return 'border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] text-[var(--status-warn-fg)]';
  }
  return 'border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]';
}

/**
 * B02: program statuses + canonical schedule progress (parity with /programs).
 * Dual-axis: badge = status; bar = progressFillTone. Shared column tracks.
 */
export function WorkstreamStatusMatrix({
  data,
}: {
  data: DashboardOverview;
}) {
  const rows = (data.programs ?? [])
    .map((program, index) => ({ ...program, index }))
    .sort((a, b) => {
      const byRag = RAG_RANK[a.status] - RAG_RANK[b.status];
      if (byRag !== 0) return byRag;
      return a.index - b.index;
    });

  return (
    <ModuleSurface
      data-dashboard-block="program-readiness"
      className="flex h-full min-h-0 min-w-0 flex-col !p-3"
    >
      <div data-program-layout="name-badge-progress" className="flex min-h-0 flex-1 flex-col">
        <h2
          id="program-heading"
          className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
        >
          Состояние по программам
        </h2>

        <ul className="mt-1.5 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-gutter:stable]">
          {rows.map((row) => {
            const pct = row.progressPct ?? null;
            const tone = row.progressFillTone ?? 'ok';
            const statusLabel = projectStatusLabel(row.status);
            const progressAria =
              pct == null
                ? PROGRESS_TIP
                : `Прогресс ${pct}% · ${PROGRESS_TIP}`;
            return (
              <li key={row.id} className="min-w-0">
                <Link
                  href={`/programs/${encodeURIComponent(row.id)}`}
                  className={`${PROGRAM_ROW_GRID} cursor-pointer rounded-[var(--radius-sm)] px-2 py-1 text-left no-underline transition-[box-shadow,background-color] duration-150 hover:bg-[var(--surface-sunken)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]`}
                  data-program={row.id}
                  data-program-status={row.status}
                  data-rag-surface="neutral"
                  data-program-row="name-badge-progress"
                >
                  <span className="min-w-0 truncate text-xs font-medium leading-snug text-[var(--text)]">
                    {row.name}
                  </span>
                  <span
                    className={`${PROGRAM_STATUS_BADGE} ${badgeTone(row.status)}`}
                    data-program-status-badge={row.status}
                    data-program-status-badge-compact="true"
                    title="Статус программы"
                    aria-label={`Статус программы: ${statusLabel}`}
                  >
                    {statusLabel}
                  </span>
                  <span
                    className="box-border flex w-24 justify-self-end sm:w-28 md:w-32"
                    data-program-progress="true"
                    data-program-progress-width="fixed"
                    title={PROGRESS_TIP}
                  >
                    <SemanticProgressBar
                      progressPct={pct}
                      fillTone={tone}
                      emptyLabel="—"
                      ariaLabel={progressAria}
                      compact
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </ModuleSurface>
  );
}

/** @deprecated name — program block replaced the workstream matrix on the dashboard. */
export const WorkstreamReadiness = WorkstreamStatusMatrix;
