/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import {
  applyScheduleRowHover,
  applyScheduleRowSelected,
  HOVER_CLASS,
  SELECTED_CLASS,
} from './schedule-row-hover';

describe('applyScheduleRowSelected', () => {
  it('marks chart rows for logical id including comparison-layer task ids', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="ppc-gantt-host">
        <div class="gantt_task_row" task_id="work:WK-01"></div>
        <div class="gantt_task_row" data-task-id="work:WK-01:baseline"></div>
        <div class="gantt_task_row" task_id="milestone:MS-01"></div>
        <div class="gantt_task_row" task_id="stage_group:1.2"></div>
      </div>
    `;
    applyScheduleRowSelected([root], 'work:WK-01');
    const marked = [
      ...root.querySelectorAll('[data-schedule-row-selected="true"]'),
    ].map((el) => el.getAttribute('task_id') || el.getAttribute('data-task-id'));
    expect(marked).toEqual(
      expect.arrayContaining(['work:WK-01', 'work:WK-01:baseline']),
    );
    expect(marked).not.toContain('milestone:MS-01');
    expect(
      root.querySelector('[task_id="work:WK-01"]')?.classList.contains(SELECTED_CLASS),
    ).toBe(true);
    applyScheduleRowSelected([root], null);
    expect(root.querySelectorAll('[data-schedule-row-selected="true"]')).toHaveLength(0);
  });

  it('does not clear hover when applying selection', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="gantt_task_row ${HOVER_CLASS}" task_id="work:WK-01" data-schedule-row-hover="true"></div>
    `;
    applyScheduleRowSelected([root], 'work:WK-01');
    const row = root.querySelector('.gantt_task_row')!;
    expect(row.getAttribute('data-schedule-row-hover')).toBe('true');
    expect(row.classList.contains(HOVER_CLASS)).toBe(true);
    expect(row.getAttribute('data-schedule-row-selected')).toBe('true');
  });
});

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
