/**
 * Shared chart↔table row hover without React setState (avoids 688-row rebuild / gantt.parse).
 * Applies CSS classes / data attrs on DOM nodes under known roots.
 * Table rows use data-schedule-row; chart gantt rows use task_id / data-task-id.
 */

import { selectionKeyId } from '@/lib/schedule/selection-key';
import { presentationIdToSelectionKey } from '@/lib/schedule/to-gantt-presentation';

const HOVER_CLASS = 'ppc-schedule-row-hovered';
const SELECTED_CLASS = 'ppc-schedule-row-selected';

function ganttRowKey(row: HTMLElement): string | null {
  const taskId =
    row.getAttribute('task_id') ?? row.getAttribute('data-task-id');
  if (!taskId) return null;
  const key = presentationIdToSelectionKey(taskId);
  return key ? selectionKeyId(key) : null;
}

/**
 * Mirror React `selectedKey` onto chart `.gantt_task_row` (and keep table attrs
 * in sync if present). Logical id via presentationIdToSelectionKey — comparison
 * layer suffixes collapse to one key. Does not clear hover.
 */
export function applyScheduleRowSelected(
  roots: Array<HTMLElement | null | undefined>,
  key: string | null,
): void {
  for (const root of roots) {
    if (!root) continue;
    for (const el of root.querySelectorAll<HTMLElement>(
      `.${SELECTED_CLASS}, [data-schedule-row-selected="true"]`,
    )) {
      // Table rows own class via React — only strip chart markers here when
      // the node is a gantt task row (or was DOM-stamped).
      if (el.classList.contains('gantt_task_row') || el.hasAttribute('task_id')) {
        el.classList.remove(SELECTED_CLASS);
        el.removeAttribute('data-schedule-row-selected');
      }
    }
    if (!key) continue;
    for (const el of root.querySelectorAll<HTMLElement>('.gantt_task_row')) {
      if (ganttRowKey(el) === key) {
        el.classList.add(SELECTED_CLASS);
        el.setAttribute('data-schedule-row-selected', 'true');
      }
    }
  }
}

export function applyScheduleRowHover(
  roots: Array<HTMLElement | null | undefined>,
  key: string | null,
): void {
  for (const root of roots) {
    if (!root) continue;
    for (const el of root.querySelectorAll<HTMLElement>(`.${HOVER_CLASS}`)) {
      el.classList.remove(HOVER_CLASS);
      el.removeAttribute('data-schedule-row-hover');
    }
    for (const el of root.querySelectorAll<HTMLElement>(
      '[data-schedule-row-left-hover="true"]',
    )) {
      el.removeAttribute('data-schedule-row-left-hover');
    }
    for (const el of root.querySelectorAll<HTMLElement>(
      '.gantt_task_row[data-schedule-row-hover="true"], .gantt_task_row.ppc-hover',
    )) {
      el.classList.remove('ppc-hover');
      el.removeAttribute('data-schedule-row-hover');
    }
    if (!key) continue;
    for (const el of root.querySelectorAll<HTMLElement>(
      `[data-schedule-row="${CSS.escape(key)}"]`,
    )) {
      el.classList.add(HOVER_CLASS);
      el.setAttribute('data-schedule-row-hover', 'true');
      const left = el.querySelector<HTMLElement>('[data-schedule-row-left="true"]');
      if (left) left.setAttribute('data-schedule-row-left-hover', 'true');
    }
    for (const el of root.querySelectorAll<HTMLElement>('.gantt_task_row')) {
      if (ganttRowKey(el) === key) {
        el.classList.add(HOVER_CLASS);
        el.setAttribute('data-schedule-row-hover', 'true');
      }
    }
  }
}

export { HOVER_CLASS, SELECTED_CLASS };
