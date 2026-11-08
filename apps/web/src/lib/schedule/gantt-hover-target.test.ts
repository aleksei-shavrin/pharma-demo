/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import { resolveGanttHoverPresentationId } from './gantt-hover-target';

afterEach(() => {
  document.body.innerHTML = '';
});

function mount(html: string): HTMLElement {
  const host = document.createElement('div');
  host.className = 'ppc-gantt-host';
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
}

describe('resolveGanttHoverPresentationId', () => {
  it('resolves empty task row', () => {
    const host = mount(`
      <div class="gantt_task" style="position:relative;height:64px">
        <div class="gantt_task_row" task_id="work:WK-01" style="height:32px"></div>
        <div class="gantt_task_row" task_id="work:WK-02" style="height:32px"></div>
      </div>
    `);
    const row = host.querySelector('.gantt_task_row')!;
    expect(resolveGanttHoverPresentationId(row, host, 0)).toBe('work:WK-01');
  });

  it('resolves bar / summary / milestone via task_id on the line', () => {
    const host = mount(`
      <div class="gantt_task">
        <div class="gantt_task_row" task_id="work:WK-01"></div>
        <div class="gantt_bars_area">
          <div class="gantt_task_line ppc-work" task_id="work:WK-01" data-task-id="work:WK-01"></div>
          <div class="gantt_task_line ppc-summary" task_id="project_group:AN-08"></div>
          <div class="gantt_task_line gantt_milestone" data-task-id="milestone:MS-PS"></div>
        </div>
      </div>
    `);
    expect(
      resolveGanttHoverPresentationId(
        host.querySelector('.ppc-work')!,
        host,
        0,
      ),
    ).toBe('work:WK-01');
    expect(
      resolveGanttHoverPresentationId(
        host.querySelector('.ppc-summary')!,
        host,
        0,
      ),
    ).toBe('project_group:AN-08');
    expect(
      resolveGanttHoverPresentationId(
        host.querySelector('.gantt_milestone')!,
        host,
        0,
      ),
    ).toBe('milestone:MS-PS');
  });

  it('maps link overlays without task_id via Y → row index', () => {
    const host = mount(`
      <div class="gantt_task" style="position:relative;height:64px;margin:0;padding:0">
        <div class="gantt_task_row" task_id="work:A" style="height:32px"></div>
        <div class="gantt_task_row" task_id="work:B" style="height:32px"></div>
        <div class="gantt_task_link" style="position:absolute;left:0;top:0;width:40px;height:40px"></div>
      </div>
    `);
    const link = host.querySelector('.gantt_task_link')!;
    const area = host.querySelector('.gantt_task')!;
    const top = area.getBoundingClientRect().top;
    expect(resolveGanttHoverPresentationId(link, host, top + 8)).toBe('work:A');
    expect(resolveGanttHoverPresentationId(link, host, top + 40)).toBe('work:B');
  });
});
