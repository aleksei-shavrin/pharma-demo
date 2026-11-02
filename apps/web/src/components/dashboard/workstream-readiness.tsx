import type { DashboardOverview, ProjectStatus, WorkstreamId } from '@/lib/api-client';
import {
  WORKSTREAM_DISPLAY_ORDER,
  presentWorkstream,
  projectStatusLabel,
} from '@/lib/ui-labels';

function toneClass(status: ProjectStatus): string {
  if (status === 'Green') {
    return 'bg-[var(--status-ok-bg)] text-[var(--status-ok-fg)]';
  }
  if (status === 'Yellow') {
    return 'bg-[var(--status-warn-bg)] text-[var(--status-warn-fg)]';
  }
  return 'bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]';
}

function marker(status: ProjectStatus): string {
  if (status === 'Green') return '●';
  if (status === 'Yellow') return '▲';
  return '◆';
}

export function WorkstreamReadiness({ data }: { data: DashboardOverview }) {
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
      className="rounded-[var(--radius-md)] bg-[var(--surface-raised)] px-4 py-3 shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
      data-dashboard-block="workstream-readiness"
    >
      <h2
        id="workstream-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
      >
        Готовность направлений
      </h2>

      <ul className="mt-2 grid gap-x-6 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => (
          <li
            key={row.workstream}
            className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] py-1.5"
            data-workstream={row.workstream}
            data-workstream-status={row.status}
          >
            <span className="truncate text-sm text-[var(--text)]">
              {presentWorkstream(row.workstream as WorkstreamId)}
            </span>
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${toneClass(row.status)}`}
            >
              <span aria-hidden className="text-[0.65rem] leading-none">
                {marker(row.status)}
              </span>
              {projectStatusLabel(row.status)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
