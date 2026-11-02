import type { DashboardOverview, ProjectStatus, WorkstreamId } from '@/lib/api-client';
import {
  WORKSTREAM_DISPLAY_ORDER,
  presentWorkstream,
} from '@/lib/ui-labels';

function cellTint(status: ProjectStatus): string {
  if (status === 'Green') return 'bg-[var(--status-ok-bg)]/55';
  if (status === 'Yellow') return 'bg-[var(--status-warn-bg)]/55';
  return 'bg-[var(--status-danger-bg)]/55';
}

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

/** 2×4 restrained tinted status matrix — backend rollups only. */
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
  }));

  return (
    <section
      aria-labelledby="workstream-heading"
      className="rounded-[var(--radius-md)] bg-[var(--surface-raised)] px-3 py-3 shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
      data-dashboard-block="workstream-readiness"
    >
      <h2
        id="workstream-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
      >
        Готовность направлений
      </h2>

      <ul className="mt-2 grid grid-cols-2 gap-1.5">
        {rows.map((row) => (
          <li
            key={row.workstream}
            className={`rounded-[var(--radius-sm)] px-2.5 py-2 ${cellTint(row.status)}`}
            data-workstream={row.workstream}
            data-workstream-status={row.status}
          >
            <p className="truncate text-sm font-medium text-[var(--text)]">
              {presentWorkstream(row.workstream as WorkstreamId)}
            </p>
            <p
              className={`mt-0.5 flex items-center gap-1 text-xs ${markerClass(row.status)}`}
            >
              <span aria-hidden>{marker(row.status)}</span>
              {statusWord(row.status)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** @deprecated name — use WorkstreamStatusMatrix */
export const WorkstreamReadiness = WorkstreamStatusMatrix;
