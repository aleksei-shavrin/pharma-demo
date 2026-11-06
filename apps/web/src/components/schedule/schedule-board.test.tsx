/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ScheduleItem } from '@/lib/api-client';
import { SCHEDULE_ROW_HEIGHT_PX } from '@/lib/schedule/schedule-geometry';
import { SCHEDULE_SHIFT_WARNING_LABEL } from '@/lib/schedule/schedule-warning';
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

const milestoneItem: ScheduleItem = {
  kind: 'milestone',
  id: 'MS-X',
  name: 'Готовность',
  workstream: null,
  rag: 'Green',
  baselineDate: '2027-01-01',
  forecastDate: '2027-01-05',
  dateVariance: {
    baselineDate: '2027-01-01',
    forecastDate: '2027-01-05',
    deltaDays: 4,
  },
};

const equipmentItem: ScheduleItem = {
  kind: 'equipment_delivery',
  id: 'EQ-1',
  name: 'AHU',
  workstream: 'WS-HVAC',
  critical: false,
  status: 'OnTrack',
  baselineDate: '2027-02-01',
  forecastDate: '2027-02-10',
  dateVariance: {
    baselineDate: '2027-02-01',
    forecastDate: '2027-02-10',
    deltaDays: 9,
  },
};

function treeRow(
  overrides: Partial<ScheduleTreeRow> & Pick<ScheduleTreeRow, 'key' | 'visibleOrdinal' | 'name'>,
): ScheduleTreeRow {
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

    expect(screen.queryByText('ИСР')).not.toBeInTheDocument();
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

  it('таблица: ИСР из wbs, без подписи вида «Работа», иконка предупреждения с именем по фокусу, 0% и «нет данных», 40% и 100%', async () => {
    const user = userEvent.setup();
    const onToggleRow = vi.fn();
    const lagLabel = 'Отставание, 3 недели';
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
        progressPct: 40,
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
        warning: { tone: 'lag', label: lagLabel },
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
        warning: { tone: 'shift', label: SCHEDULE_SHIFT_WARNING_LABEL },
      }),
      treeRow({
        key: 'work:WK-02',
        depth: 0,
        visibleOrdinal: 4,
        name: 'Завершение участка',
        kind: 'work',
        wbs: '9',
        hasChildren: false,
        progressPct: 100,
        warning: { tone: 'none', label: '' },
      }),
      treeRow({
        key: 'work:WK-01',
        depth: 0,
        visibleOrdinal: 5,
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

    const header = document.querySelector('[data-schedule-header="true"]');
    expect(header?.textContent).toMatch(/ИСР/);
    expect(header?.textContent).toMatch(/Наименование/);
    expect(header?.textContent).toMatch(/Прогресс/);
    expect(screen.getByLabelText('Предупреждение')).toBeInTheDocument();
    const h = header?.textContent ?? '';
    expect(h.indexOf('ИСР')).toBeLessThan(h.indexOf('Наименование'));
    expect(h.indexOf('Наименование')).toBeLessThan(h.indexOf('Прогресс'));
    expect(h.indexOf('Прогресс')).toBeLessThan(h.indexOf('Тип'));

    expect(document.querySelectorAll('[data-schedule-ordinal]')).toHaveLength(0);
    expect(document.querySelector('[data-schedule-kind]')).toBeNull();

    const row8 = document.querySelector('[data-schedule-row="project_group:AN-08"]');
    expect(row8?.querySelector('[data-schedule-wbs="8"]')).toHaveTextContent('8');
    expect(
      document.querySelector('[data-schedule-row="work:8.2.1"] [data-schedule-wbs="8.2.1"]'),
    ).toHaveTextContent('8.2.1');

    const emptyWbsRow = document.querySelector('[data-schedule-row="work:WK-01"]');
    expect(emptyWbsRow?.querySelector('[data-schedule-wbs]')).toBeNull();
    expect(emptyWbsRow?.textContent).toMatch(/—/);
    expect(screen.getByLabelText('ИСР отсутствует')).toBeInTheDocument();

    const nameCell = document.querySelector('[data-schedule-row="work:8.2.1"] [data-schedule-name]');
    expect(nameCell?.textContent).toBe('Сэндвич-панели и герметизация');
    expect(nameCell?.textContent).not.toMatch(/Работа/);
    expect(document.querySelector('[data-schedule-row="work:8.2.1"] button')).toBeNull();

    const lagIcon = document.querySelector(
      `[data-schedule-row="stage_group:8.2"] [data-schedule-warning="lag"] [aria-label="${lagLabel}"]`,
    );
    expect(lagIcon).toBeTruthy();
    expect(lagIcon?.querySelector('svg')).toBeTruthy();
    expect(lagIcon?.textContent).not.toMatch(/\S{5,}/);

    const lagIconEl = screen.getByLabelText(lagLabel);
    lagIconEl.focus();
    expect(document.activeElement).toBe(lagIconEl);

    const zeroCell = document.querySelector('[data-schedule-row="work:8.2.1"] [data-schedule-progress]');
    expect(zeroCell).toHaveTextContent('0%');
    expect(zeroCell?.textContent).not.toMatch(/нет данных/);
    expect(zeroCell?.querySelector('[style*="width: 0%"]')).toBeTruthy();

    const pct40 = document.querySelector('[data-schedule-row="project_group:AN-08"] [data-schedule-progress]');
    expect(pct40).toHaveTextContent('40%');
    expect(pct40?.querySelector('[style*="width: 40%"]')).toBeTruthy();

    const pct100 = document.querySelector('[data-schedule-row="work:WK-02"] [data-schedule-progress]');
    expect(pct100).toHaveTextContent('100%');
    expect(pct100?.querySelector('[style*="width: 100%"]')).toBeTruthy();

    const unknownCell = document.querySelector(
      '[data-schedule-row="stage_group:8.2"] [data-schedule-progress]',
    );
    expect(unknownCell).toHaveTextContent('нет данных');
    expect(unknownCell?.querySelector('[style*="width"]')).toBeNull();

    const collapse = screen.getByRole('button', { name: 'Свернуть Внутренняя отделка' });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    const expand = screen.getByRole('button', { name: 'Развернуть Чистые помещения' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');

    await user.click(expand);
    expect(onToggleRow).toHaveBeenCalledTimes(1);
    expect(onToggleRow).toHaveBeenCalledWith('stage_group:8.2');

    expect(
      document.querySelector('[data-schedule-row="work:8.2.1"] [data-schedule-wbs="8.2.1"]'),
    ).toHaveTextContent('8.2.1');
    expect(
      document.querySelector('[data-schedule-row="work:WK-01"] [aria-label="Идентификатор WK-01"]'),
    ).toHaveTextContent('WK-01');
  });

  it('отметка внимания не задаёт левую рамку строки', () => {
    render(
      <ScheduleBoard
        items={[zeroWork]}
        mode="split"
        treeRows={[
          treeRow({
            key: 'work:8.2.1',
            visibleOrdinal: 1,
            name: 'Сэндвич-панели и герметизация',
          }),
        ]}
      />,
    );

    const row = document.querySelector('[data-schedule-row="work:8.2.1"]');
    expect(row).toHaveAttribute('data-emphasis', 'true');
    expect(row?.className ?? '').not.toMatch(/border-l/);
    expect(row?.className ?? '').toContain('shadow-[inset_2px_0_0_0_var(--border)]');
  });

  it('не сортирует treeRows повторно', () => {
    render(
      <ScheduleBoard
        items={[]}
        mode="table"
        treeRows={[
          treeRow({ key: 'work:b', visibleOrdinal: 2, name: 'Вторая', wbs: '2' }),
          treeRow({ key: 'work:a', visibleOrdinal: 1, name: 'Первая', wbs: '1' }),
        ]}
      />,
    );

    const wbsOrder = [...document.querySelectorAll('[data-schedule-wbs]')].map((cell) =>
      cell.getAttribute('data-schedule-wbs'),
    );
    expect(wbsOrder).toEqual(['2', '1']);
  });

  it('в широкой таблице показывает короткий тип вехи и оборудования', () => {
    render(
      <ScheduleBoard
        items={[milestoneItem, equipmentItem]}
        mode="table"
        treeRows={[
          treeRow({
            key: 'milestone:MS-X',
            visibleOrdinal: 1,
            name: 'Готовность',
            kind: 'milestone',
            wbs: 'M1',
          }),
          treeRow({
            key: 'equipment_delivery:EQ-1',
            visibleOrdinal: 2,
            name: 'AHU',
            kind: 'equipment_delivery',
            wbs: 'E1',
          }),
        ]}
      />,
    );

    expect(screen.getByLabelText('Веха')).toBeInTheDocument();
    expect(screen.getByLabelText('Оборудование')).toBeInTheDocument();
    const header = document.querySelector('[data-schedule-header="true"]')?.textContent ?? '';
    expect(header.indexOf('Прогресс')).toBeLessThan(header.indexOf('Тип'));
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
      String(SCHEDULE_ROW_HEIGHT_PX),
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
