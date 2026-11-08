'use client';

import Link from 'next/link';
import type { DashboardOverview, ProjectStatus } from '@/lib/api-client';
import { ModuleSurface } from './module-surface';

const RAG_RANK: Record<ProjectStatus, number> = {
  Red: 0,
  Yellow: 1,
  Green: 2,
};

function statusWord(status: ProjectStatus): string {
  if (status === 'Green') return 'В норме';
  if (status === 'Yellow') return 'Внимание';
  return 'Критично';
}

function marker(status: ProjectStatus): string {
  if (status === 'Green') return '●';
  if (status === 'Yellow') return '▲';
  return '◆';
}

function markerClass(status: ProjectStatus): string {
  if (status === 'Green') return 'text-[var(--status-ok-fg)]';
  if (status === 'Yellow') return 'text-[var(--status-warn-fg)]';
  return 'text-[var(--status-danger-fg)]';
}

function rowSurface(status: ProjectStatus): string {
  if (status === 'Green') {
    return 'bg-transparent hover:bg-[var(--surface-sunken)]';
  }
  if (status === 'Yellow') {
    return 'bg-[var(--status-warn-bg)] hover:brightness-[0.98]';
  }
  return 'bg-[var(--status-danger-bg)] hover:brightness-[0.98]';
}

function ragSurfaceAttr(status: ProjectStatus): 'neutral' | 'persistent' {
  return status === 'Green' ? 'neutral' : 'persistent';
}

/**
 * B02: program statuses. Each cell is a direct Link to /programs/PRG-*.
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
      <div data-program-layout="compact-rag" className="flex min-h-0 flex-1 flex-col">
        <h2
          id="program-heading"
          className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
        >
          Состояние по программам
        </h2>

        <ul className="mt-1.5 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-gutter:stable]">
          {rows.map((row) => (
            <li key={row.id} className="min-w-0">
              <Link
                href={`/programs/${encodeURIComponent(row.id)}`}
                className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 py-1 text-left no-underline transition-[filter,box-shadow,background-color] duration-150 ${rowSurface(row.status)} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] hover:underline`}
                data-program={row.id}
                data-program-status={row.status}
                data-rag-surface={ragSurfaceAttr(row.status)}
              >
                <span className="truncate text-xs font-medium leading-snug text-[var(--text)]">
                  {row.name}
                </span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${markerClass(row.status)}`}
                >
                  <span aria-hidden className="text-[10px] leading-none">
                    {marker(row.status)}
                  </span>
                  {statusWord(row.status)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </ModuleSurface>
  );
}

/** @deprecated name — program block replaced the workstream matrix on the dashboard. */
export const WorkstreamReadiness = WorkstreamStatusMatrix;
