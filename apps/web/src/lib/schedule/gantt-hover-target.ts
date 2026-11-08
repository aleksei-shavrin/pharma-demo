import { SCHEDULE_ROW_HEIGHT_PX } from '@/lib/schedule/schedule-geometry';

/**
 * Resolve the presentation task id under the pointer in the DHTMLX host.
 * Bars/milestones/summary live outside `.gantt_task_row`; links have no task_id —
 * fall back to Y → row index mapping so hover does not clear mid-bar.
 */
export function resolveGanttHoverPresentationId(
  target: EventTarget | null,
  host: HTMLElement,
  clientY: number,
): string | null {
  if (!(target instanceof Element) || !host.contains(target)) {
    return null;
  }

  const attributed = target.closest<HTMLElement>('[task_id], [data-task-id]');
  if (attributed && host.contains(attributed)) {
    const id =
      attributed.getAttribute('task_id') ??
      attributed.getAttribute('data-task-id');
    if (id) return id;
  }

  const row = target.closest<HTMLElement>('.gantt_task_row');
  if (row && host.contains(row)) {
    const id = row.getAttribute('task_id') ?? row.getAttribute('data-task-id');
    if (id) return id;
  }

  const rows = [
    ...host.querySelectorAll<HTMLElement>('.gantt_task_row[task_id], .gantt_task_row[data-task-id]'),
  ];
  if (rows.length === 0) return null;

  const area =
    host.querySelector<HTMLElement>('.gantt_task') ??
    host.querySelector<HTMLElement>('.gantt_data_area') ??
    host;
  const top = area.getBoundingClientRect().top;
  const idx = Math.floor((clientY - top) / SCHEDULE_ROW_HEIGHT_PX);
  if (idx < 0 || idx >= rows.length) return null;
  return (
    rows[idx]!.getAttribute('task_id') ??
    rows[idx]!.getAttribute('data-task-id')
  );
}
