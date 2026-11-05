import Link from 'next/link';
import type { DashboardOverview, ProjectStatus, WorkstreamId } from '@/lib/api-client';
import {
  WORKSTREAM_DISPLAY_ORDER,
  presentWorkstream,
} from '@/lib/ui-labels';
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

/**
 * R2-U1-R6: persistent tint only for attention states.
 * Green = neutral row + green indicator; Yellow/Red = semantic surface.
 */
function rowSurface(status: ProjectStatus): string {
  if (status === 'Green') {
    return [
      'bg-transparent',
      'hover:bg-[var(--surface-sunken)] hover:ring-1 hover:ring-[var(--border-subtle)]',
      'focus-visible:bg-[var(--surface-sunken)] focus-visible:ring-1 focus-visible:ring-[var(--border-subtle)]',
    ].join(' ');
  }
  if (status === 'Yellow') {
    return [
      'bg-[var(--status-warn-bg)]',
      'hover:brightness-[0.97] hover:ring-1 hover:ring-[var(--status-warn-border)]',
      'focus-visible:ring-1 focus-visible:ring-[var(--status-warn-border)]',
      'dark:hover:brightness-110',
    ].join(' ');
  }
  return [
    'bg-[var(--status-danger-bg)]',
    'hover:brightness-[0.97] hover:ring-1 hover:ring-[var(--status-danger-border)]',
    'focus-visible:ring-1 focus-visible:ring-[var(--status-danger-border)]',
    'dark:hover:brightness-110',
  ].join(' ');
}

function ragSurfaceAttr(status: ProjectStatus): 'persistent' | 'neutral' {
  return status === 'Green' ? 'neutral' : 'persistent';
}

function catalogOrder(id: WorkstreamId): number {
  return WORKSTREAM_DISPLAY_ORDER.indexOf(id);
}

/**
 * Compact Dashboard readiness (R2-U1-R6).
 */
export function WorkstreamStatusMatrix({
  data,
}: {
  data: DashboardOverview;
}) {
  const byId = new Map(
    data.workstreamRollups.map((r) => [r.workstream, r.status] as const),
  );

  const rows = WORKSTREAM_DISPLAY_ORDER.map((id) => ({
    workstream: id,
    status: (byId.get(id) ?? 'Green') as ProjectStatus,
  })).sort((a, b) => {
    const byRag = RAG_RANK[a.status] - RAG_RANK[b.status];
    if (byRag !== 0) return byRag;
    return catalogOrder(a.workstream) - catalogOrder(b.workstream);
  });

  return (
    <ModuleSurface
      data-dashboard-block="workstream-readiness"
      className="flex h-full min-h-0 min-w-0 flex-col !p-3"
    >
      <div
        data-workstream-layout="compact-rag"
        className="flex min-h-0 flex-1 flex-col"
      >
        <h2
          id="workstream-heading"
          className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
        >
          Готовность направлений
        </h2>

        <ul
          className="mt-1.5 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-gutter:stable]"
          data-workstream-scroll
          style={{ maxHeight: '13.25rem' }}
        >
          {rows.map((row) => (
            <li key={row.workstream} className="min-w-0">
              <Link
                href={`/workstreams/${encodeURIComponent(row.workstream)}`}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 py-1 transition-[filter,box-shadow,background-color] duration-150 ${rowSurface(row.status)} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]`}
                data-workstream={row.workstream}
                data-workstream-status={row.status}
                data-workstream-interactive="true"
                data-rag-surface={ragSurfaceAttr(row.status)}
              >
                <span className="truncate text-xs font-medium leading-snug text-[var(--text)]">
                  {presentWorkstream(row.workstream as WorkstreamId)}
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

/** @deprecated name — use WorkstreamStatusMatrix */
export const WorkstreamReadiness = WorkstreamStatusMatrix;
