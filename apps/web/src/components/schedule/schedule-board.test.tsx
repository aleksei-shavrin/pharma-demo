/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ScheduleItem } from '@/lib/api-client';
import { SCHEDULE_GANTT_ROW_HEIGHT_PX } from '@/lib/schedule/schedule-geometry';
import { ScheduleBoard, type ScheduleTreeRow } from './schedule-board';

const work: ScheduleItem = {
  kind: 'work',
  id: 'WK-01',
  name: 'Монтаж AHU',
  startDate: '2027-06-01',
  endDate: '2027-06-10',
  status: 'Waiting',
};

const zeroWork: ScheduleItem = {
  kind: 'work',
  id: '8.2.1',
  name: 'Сэндвич-панели и герметизация',
  startDate: '2027-02-25',
  endDate: '2027-03-02',
  status: 'Delayed',
};

function treeRow(overrides: Partial<ScheduleTreeRow> & Pick<ScheduleTreeRow, 'key' | 'visibleOrdinal' | 'name'>): ScheduleTreeRow {
  return {
    depth: 0,
    kind: 'work',
    wbs: null,
    hasChildren: false,
    expanded: false,
    progressPct: null,
    warning: { tone: 'none', label: '' },
    ...overrides,
  };
}

afterEach(cleanup);

describe('ScheduleBoard', () => {
  it('без treeRows оставляет плоскую доску: прежние колонки и порядок items', () => {
    render(<ScheduleBoard items={[work, zeroWork]} mode="table" />);

    expect(screen.queryByText('№')).not.toBeInTheDocument();
    expect(screen.queryByText('нет данных')).not.toBeInTheDocument();
    expect(document.querySelector('[data-schedule-tree="true"]')).toBeNull();

    const rowIds = [...document.querySelectorAll('[data-schedule-row]')].map((row) =>
      row.getAttribute('data-schedule-row'),
    );
    expect(rowIds).toEqual(['work:WK-01', 'work:8.2.1']);
    expect(screen.getByText('Монтаж AHU')).toBeInTheDocument();
    expect(screen.getByText('WK-01')).toBeInTheDocument();
    expect(screen.getByText('Ожидание')).toBeInTheDocument();
    expect(document.querySelector('[data-schedule-header="true"]')?.textContent).toMatch(/Тип/);
    expect(document.querySelector('[data-schedule-header="true"]')?.textContent).toMatch(/Объект/);
  });

  it('показывает №, имя, предупреждение и прогресс перед колонками режима', async () => {
    const onToggleRow = vi.fn();
    const rows: ScheduleTreeRow[] = [
      treeRow({
        key: 'project_group:AN-08',
        depth: 0,
        visibleOrdinal: 1,
        name: 'Внутренняя отделка',
        kind: 'project_group',
        wbs: '8',
        hasChildren: true,
        expanded: true,
        progressPct: null,
        warning: { tone: 'none', label: '' },
      }),
      treeRow({
        key: 'stage_group:8.2',
        depth: 1,
        visibleOrdinal: 2,
        name: 'Чистые помещения',
        kind: 'stage_group',
        wbs: '8.2',
        hasChildren: true,
        expanded: false,
        progressPct: null,
        warning: { tone: 'lag', label: 'Отставание, 3 недели' },
      }),
      treeRow({
        key: 'work:8.2.1',
        depth: 2,
        visibleOrdinal: 3,
        name: 'Сэндвич-панели и герметизация',
        kind: 'work',
        wbs: '8.2.1',
        hasChildren: false,
        expanded: false,
        progressPct: 0,
        warning: { tone: 'shift', label: 'Прогноз отличается от базового плана' },
      }),
      treeRow({
        key: 'work:WK-01',
        depth: 0,
        visibleOrdinal: 4,
        name: 'Монтаж AHU',
        kind: 'work',
        wbs: null,
        hasChildren: false,
        progressPct: null,
        warning: { tone: 'none', label: '' },
      }),
    ];

    render(
      <ScheduleBoard
        items={[zeroWork, work]}
        mode="table"
        treeRows={rows}
        onToggleRow={onToggleRow}
      />,
    );

    const header = document.querySelector('[data-schedule-header="true"]')?.textContent ?? '';
    const ordinalHeader = header.indexOf('№');
    const nameHeader = header.indexOf('Наименование');
    const warningHeader = header.indexOf('Предупреждение');
    const progressHeader = header.indexOf('Прогресс');
    const typeHeader = header.indexOf('Тип');
    expect(ordinalHeader).toBeGreaterThanOrEqual(0);
    expect(ordinalHeader).toBeLessThan(nameHeader);
    expect(nameHeader).toBeLessThan(warningHeader);
    expect(warningHeader).toBeLessThan(progressHeader);
    expect(progressHeader).toBeLessThan(typeHeader);

    const rowIds = [...document.querySelectorAll('[data-schedule-row]')].map((row) =>
      row.getAttribute('data-schedule-row'),
    );
    expect(rowIds).toEqual([
      'project_group:AN-08',
      'stage_group:8.2',
      'work:8.2.1',
      'work:WK-01',
    ]);

    const ordinals = [...document.querySelectorAll('[data-schedule-ordinal]')].map(
      (cell) => cell.textContent,
    );
    expect(ordinals).toEqual(['1', '2', '3', '4']);
    expect(document.querySelector('[data-schedule-ordinal="1"]')?.textContent).toBe('1');

    expect(document.querySelector('[data-depth="0"]')).toHaveClass('pl-0');
    expect(document.querySelector('[data-depth="1"]')).toHaveClass('pl-3');
    expect(document.querySelector('[data-depth="2"]')).toHaveClass('pl-6');

    expect(
      document.querySelector('[data-schedule-row="project_group:AN-08"] [data-schedule-kind="group"]'),
    ).toHaveTextContent('Группа');
    expect(
      document.querySelector('[data-schedule-row="work:8.2.1"] [data-schedule-kind="work"]'),
    ).toHaveTextContent('Работа');

    const zeroCell = document.querySelector(
      '[data-schedule-row="work:8.2.1"] [data-schedule-progress]',
    );
    expect(zeroCell).toHaveTextContent('0%');
    expect(zeroCell).not.toHaveTextContent('нет данных');
    expect(zeroCell?.querySelector('progress')).toHaveAttribute('aria-valuenow', '0');
    expect(zeroCell?.querySelector('progress')).toHaveAttribute('value', '0');

    const unknownCell = document.querySelector(
      '[data-schedule-row="work:WK-01"] [data-schedule-progress]',
    );
    expect(unknownCell).toHaveTextContent('нет данных');
    expect(unknownCell?.textContent).not.toMatch(/%/);
    expect(unknownCell?.querySelector('progress')).toBeNull();
    expect(unknownCell?.querySelector('[aria-valuenow]')).toBeNull();

    const warning = document.querySelector(
      '[data-schedule-row="stage_group:8.2"] [aria-label="Отставание, 3 недели"]',
    );
    expect(warning).toHaveTextContent('Отставание, 3 недели');
    expect(
      document.querySelector('[data-schedule-row="project_group:AN-08"] [data-schedule-warning="none"]')
        ?.textContent,
    ).toBe('');

    const collapse = screen.getByRole('button', { name: 'Свернуть Внутренняя отделка' });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    const expand = screen.getByRole('button', { name: 'Развернуть Чистые помещения' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('[data-schedule-row="work:8.2.1"] button')).toBeNull();

    await userEvent.click(expand);
    expect(onToggleRow).toHaveBeenCalledTimes(1);
    expect(onToggleRow).toHaveBeenCalledWith('stage_group:8.2');

    expect(screen.getByText('8.2.1')).toBeInTheDocument();
    expect(screen.getByText('Отстаёт')).toBeInTheDocument();
    expect(screen.getByText('WK-01')).toBeInTheDocument();
  });

  it('не сортирует treeRows повторно', () => {
    render(
      <ScheduleBoard
        items={[]}
        mode="table"
        treeRows={[
          treeRow({ key: 'work:b', visibleOrdinal: 2, name: 'Вторая' }),
          treeRow({ key: 'work:a', visibleOrdinal: 1, name: 'Первая' }),
        ]}
      />,
    );

    const ordinals = [...document.querySelectorAll('[data-schedule-ordinal]')].map(
      (cell) => cell.textContent,
    );
    expect(ordinals).toEqual(['2', '1']);
  });

  it('подписывает веху и оборудование коротким типом', () => {
    render(
      <ScheduleBoard
        items={[]}
        mode="split"
        treeRows={[
          treeRow({
            key: 'milestone:MS-PS',
            visibleOrdinal: 1,
            name: 'Готовность',
            kind: 'milestone',
          }),
          treeRow({
            key: 'equipment_delivery:EQ-1',
            visibleOrdinal: 2,
            name: 'AHU',
            kind: 'equipment_delivery',
          }),
        ]}
      />,
    );

    expect(
      document.querySelector('[data-schedule-kind="milestone"]'),
    ).toHaveTextContent('Веха');
    expect(
      document.querySelector('[data-schedule-kind="equipment"]'),
    ).toHaveTextContent('Оборудование');
    const header = document.querySelector('[data-schedule-header="true"]')?.textContent ?? '';
    expect(header.indexOf('Прогресс')).toBeLessThan(header.indexOf('Объект'));
  });

  it('в списке рядом со шкалой оставляет имя и предупреждение без широких колонок', () => {
    render(
      <ScheduleBoard
        items={[zeroWork]}
        mode="table"
        leadOnly
        treeRows={[
          treeRow({
            key: 'stage_group:8.2',
            visibleOrdinal: 2,
            name: 'Чистые помещения классов C/D',
            kind: 'stage_group',
            hasChildren: true,
            expanded: true,
            warning: { tone: 'lag', label: 'Отставание, 3 нед.' },
          }),
        ]}
      />,
    );

    expect(screen.getByText('Чистые помещения классов C/D')).toBeInTheDocument();
    expect(screen.getByLabelText('Отставание, 3 нед.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Свернуть Чистые помещения классов C/D' })).toBeInTheDocument();
    const header = document.querySelector('[data-schedule-header="true"]')?.textContent ?? '';
    expect(header).not.toMatch(/Тип/);
    expect(document.querySelector('[data-schedule-board="true"]')).toHaveAttribute(
      'data-schedule-row-height',
      String(SCHEDULE_GANTT_ROW_HEIGHT_PX),
    );
  });

  it('в узком списке задаёт минимум 520px и доступное имя области прокрутки', () => {
    render(
      <ScheduleBoard
        items={[zeroWork]}
        mode="gantt"
        leadOnly
        treeRows={[
          treeRow({
            key: 'stage_group:8.2',
            visibleOrdinal: 1,
            name: 'Чистые помещения классов C/D',
            kind: 'stage_group',
          }),
        ]}
      />,
    );

    const viewport = document.querySelector('[data-schedule-viewport="true"]');
    expect(viewport).toHaveAttribute('tabindex', '0');
    expect(viewport).toHaveAccessibleName('Прокрутка календарного плана');
    expect(viewport).toHaveClass('overflow-auto');
    expect(viewport?.className).not.toMatch(/touch-none|touch-action/);
    expect(viewport?.firstElementChild).toHaveStyle({ minWidth: '520px' });
  });

  it('широкая таблица не сжимает колонки ниже 1040px', () => {
    render(<ScheduleBoard items={[work]} mode="table" />);

    const viewport = document.querySelector('[data-schedule-viewport="true"]');
    expect(viewport?.firstElementChild).toHaveStyle({ minWidth: '1040px' });
  });

  it('в режиме факта называет прогноз и факт отдельно', () => {
    render(
      <ScheduleBoard
        items={[
          {
            ...work,
            startDate: '2027-02-20',
            endDate: '2027-02-24',
            actualStart: '2027-02-18',
            actualEnd: '2027-02-23',
          },
          {
            ...zeroWork,
            actualStart: null,
            actualEnd: null,
          },
        ]}
        mode="table"
        comparison="actual"
      />,
    );

    const header = document.querySelector('[data-schedule-header="true"]')?.textContent ?? '';
    expect(header).toMatch(/Прогноз, начало/);
    expect(header).toMatch(/Факт, окончание/);
    const closed = document.querySelector('[data-schedule-row="work:WK-01"]');
    expect(closed?.textContent).toMatch(/18\.02\.2027/);
    expect(closed?.textContent).toMatch(/23\.02\.2027/);
    const empty = document.querySelector('[data-schedule-row="work:8.2.1"]');
    expect(empty?.querySelector('[data-fact-column="Факт, начало"]')?.textContent).toBe('—');
    expect(empty?.querySelector('[data-fact-column="Факт, окончание"]')?.textContent).toBe('—');
    expect(empty?.textContent).toMatch(/25\.02\.2027/);
  });
});
