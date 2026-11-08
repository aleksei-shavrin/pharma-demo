/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { applyScheduleRowHover, HOVER_CLASS } from './schedule-row-hover';

describe('applyScheduleRowHover', () => {
  it('lights matching table data-schedule-row and chart gantt_task_row for same key', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-schedule-pane="table">
        <div data-schedule-row="project_group:AN-01">
          <div data-schedule-row-left="true"></div>
        </div>
      </div>
      <div data-schedule-pane="chart" class="ppc-gantt-host">
        <div class="gantt_task_row" task_id="project_group:AN-01"></div>
        <div class="gantt_task_row" task_id="work:WK-01"></div>
        <div class="gantt_task_row" data-task-id="project_group:AN-01:forecast"></div>
      </div>
    `;
    document.body.appendChild(root);
    applyScheduleRowHover([null, root], 'project_group:AN-01');
    const table = root.querySelector(
      '[data-schedule-pane="table"] [data-schedule-row-hover="true"]',
    );
    const left = root.querySelector('[data-schedule-row-left-hover="true"]');
    const chart = root.querySelectorAll(
      '[data-schedule-pane="chart"] [data-schedule-row-hover="true"]',
    );
    expect(table?.getAttribute('data-schedule-row')).toBe('project_group:AN-01');
    expect(left).toBeTruthy();
    expect(table?.classList.contains(HOVER_CLASS)).toBe(true);
    expect([...chart].map((el) => el.getAttribute('task_id') || el.getAttribute('data-task-id'))).toEqual(
      expect.arrayContaining([
        'project_group:AN-01',
        'project_group:AN-01:forecast',
      ]),
    );
    applyScheduleRowHover([root], null);
    expect(root.querySelectorAll('[data-schedule-row-hover="true"]')).toHaveLength(0);
    expect(root.querySelector('[data-schedule-row-left-hover="true"]')).toBeNull();
    root.remove();
  });

  it('clears leftover gantt hover attrs and ignores rows without task id', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="gantt_task_row ppc-hover" data-schedule-row-hover="true"></div>
      <div class="gantt_task_row"></div>
    `;
    applyScheduleRowHover([root], 'work:WK-01');
    expect(root.querySelectorAll('[data-schedule-row-hover="true"]')).toHaveLength(0);
    expect(root.querySelector('.ppc-hover')).toBeNull();
  });
});
