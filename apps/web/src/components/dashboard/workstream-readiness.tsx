import type { DashboardOverview, ProjectStatus, WorkstreamId } from '@/lib/api-client';
import {
  WORKSTREAM_DISPLAY_ORDER,
  presentWorkstream,
} from '@/lib/ui-labels';
import { ModuleSurface } from './module-surface';

/** Semantic cell tints — outer ModuleSurface is neutral; cells carry color. */
function cellTint(status: ProjectStatus): string {
  if (status === 'Green') return 'bg-[var(--status-ok-bg)]';
  if (status === 'Yellow') return 'bg-[var(--status-warn-bg)]';
  return 'bg-[var(--status-danger-bg)]';
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

/** True 2×4 status matrix — colored cells, weak/no outer card. */
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
    <ModuleSurface
      data-dashboard-block="workstream-readiness"
      className="min-w-0"
    >
      <h2
        id="workstream-heading"
        className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
      >
        Готовность направлений
      </h2>

      <ul className="mt-2 grid grid-cols-2 gap-2">
        {rows.map((row) => (
          <li
            key={row.workstream}
            className={`rounded-[var(--radius-sm)] px-2.5 py-2.5 ${cellTint(row.status)}`}
            data-workstream={row.workstream}
            data-workstream-status={row.status}
          >
            <p className="truncate text-sm font-medium leading-snug text-[var(--text)]">
              {presentWorkstream(row.workstream as WorkstreamId)}
            </p>
            <p
              className={`mt-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${markerClass(row.status)}`}
            >
              <span aria-hidden className="text-sm leading-none">
                {marker(row.status)}
              </span>
              {statusWord(row.status)}
            </p>
          </li>
        ))}
      </ul>
    </ModuleSurface>
  );
}

/** @deprecated name — use WorkstreamStatusMatrix */
export const WorkstreamReadiness = WorkstreamStatusMatrix;
