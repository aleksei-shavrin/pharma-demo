/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ScheduleItem } from '@/lib/api-client';
import {
  SCHEDULE_COL_NAME_PX,
  SCHEDULE_COL_OBJECT_PX,
  wideTableMinWidthPx,
} from '@/lib/schedule/schedule-column-geometry';
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
  overrides: Partial<ScheduleTreeRow> & Pick<ScheduleTreeRow, 'key' | 'name'>,
): ScheduleTreeRow {
  return {
    depth: 0,
    kind: 'work',
    wbs: null,
    hasChildren: false,
    expanded: false,
    progressPct: null,
    fillTone: 'ok',
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

  it('таблица: без №, ИСР из wbs, без подписи вида «Работа», иконка предупреждения, 0% / «нет данных» / «—» для группы', async () => {
    const user = userEvent.setup();
    const onToggleRow = vi.fn();
    const lagLabel = 'Отставание, 3 недели';
    const rows: ScheduleTreeRow[] = [
      treeRow({
        key: 'project_group:AN-08',
        depth: 0,
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
    expect(header?.textContent).not.toMatch(/№/);
    expect(header?.querySelector('[data-schedule-col="ordinal"]')).toBeNull();
    expect(header?.textContent).toMatch(/ИСР/);
    expect(header?.textContent).toMatch(/Наименование/);
    expect(header?.textContent).toMatch(/Прогресс/);
    expect(screen.getByLabelText('Предупреждение')).toBeInTheDocument();
    const h = header?.textContent ?? '';
    expect(h.indexOf('ИСР')).toBeLessThan(h.indexOf('Наименование'));
    expect(h.indexOf('ИСР')).toBeLessThan(h.indexOf('Наименование'));
    expect(h.indexOf('Наименование')).toBeLessThan(h.indexOf('Прогресс'));
    expect(h.indexOf('Прогресс')).toBeLessThan(h.indexOf('Тип'));

    expect(document.querySelectorAll('[data-schedule-ordinal]')).toHaveLength(0);
    expect(document.querySelectorAll('[data-schedule-col="ordinal"]')).toHaveLength(0);
    expect(document.querySelector('[data-schedule-kind]')).toBeNull();

    const row8 = document.querySelector('[data-schedule-row="project_group:AN-08"]');
    expect(row8?.querySelector('[data-schedule-wbs="8"]')).toHaveTextContent('8');
    // Group with a numeric rollup shows a bar, not a dash.
    const row8Progress = row8?.querySelector('[data-schedule-progress]');
    expect(row8Progress).toHaveAttribute('data-schedule-progress', '40');
    expect(row8Progress).toHaveTextContent('40%');
    expect(row8Progress?.querySelector('[style*="width: 40%"]')).toBeTruthy();
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

    const pct100 = document.querySelector('[data-schedule-row="work:WK-02"] [data-schedule-progress]');
    expect(pct100).toHaveTextContent('100%');
    expect(pct100?.querySelector('[style*="width: 100%"]')).toBeTruthy();

    const stageProgress = document.querySelector(
      '[data-schedule-row="stage_group:8.2"] [data-schedule-progress]',
    );
    expect(stageProgress).toHaveAttribute('data-schedule-progress', 'n/a');
    expect(stageProgress).toHaveTextContent('—');
    expect(stageProgress?.textContent).not.toMatch(/нет данных/);
    expect(stageProgress?.querySelector('[style*="width"]')).toBeNull();
    expect(
      stageProgress?.querySelector('[aria-label="Прогресс не применяется"]'),
    ).toBeTruthy();

    const workUnknown = document.querySelector(
      '[data-schedule-row="work:WK-01"] [data-schedule-progress]',
    );
    expect(workUnknown).toHaveAttribute('data-schedule-progress', 'unknown');
    expect(workUnknown).toHaveTextContent('нет данных');

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

  it('прогресс: оборудование и веха показывают полосу; группа с rollup — %; без числа — тире; fill по status', () => {
    render(
      <ScheduleBoard
        items={[milestoneItem, equipmentItem]}
        mode="table"
        treeRows={[
          treeRow({
            key: 'milestone:MS-X',
            name: 'Готовность',
            kind: 'milestone',
            progressPct: 100,
            fillTone: 'ok',
          }),
          treeRow({
            key: 'equipment_delivery:EQ-1',
            name: 'AHU',
            kind: 'equipment_delivery',
            progressPct: 55,
            fillTone: 'ok',
          }),
          treeRow({
            key: 'work:WK-D',
            name: 'Задержка',
            kind: 'work',
            progressPct: 20,
            fillTone: 'danger',
          }),
          treeRow({
            key: 'equipment_delivery:EQ-2',
            name: 'Без данных',
            kind: 'equipment_delivery',
            progressPct: null,
          }),
          treeRow({
            key: 'stage_group:S1',
            name: 'Этап',
            kind: 'stage_group',
            progressPct: null,
          }),
          treeRow({
            key: 'stage_group:S2',
            name: 'Этап с rollup',
            kind: 'stage_group',
            progressPct: 42,
            fillTone: 'warn',
          }),
        ]}
      />,
    );

    const ms = document.querySelector('[data-schedule-row="milestone:MS-X"] [data-schedule-progress]');
    expect(ms).toHaveAttribute('data-schedule-progress', '100');
    expect(ms?.querySelector('[data-schedule-progress-fill="true"]')).toBeTruthy();
    expect(ms?.querySelector('[data-schedule-progress-end="true"]')).toBeNull();

    const eq = document.querySelector(
      '[data-schedule-row="equipment_delivery:EQ-1"] [data-schedule-progress]',
    );
    expect(eq).toHaveAttribute('data-schedule-progress', '55');
    expect(eq).toHaveTextContent('55%');
    expect(eq?.querySelector('[style*="width: 55%"]')).toBeTruthy();
    expect(eq?.querySelector('[data-schedule-fill-tone="ok"]')).toBeTruthy();
    expect(eq?.innerHTML).not.toMatch(/status-ok-fg/);

    const delayed = document.querySelector(
      '[data-schedule-row="work:WK-D"] [data-schedule-fill-tone="danger"]',
    );
    expect(delayed).toBeTruthy();

    const eqUnknown = document.querySelector(
      '[data-schedule-row="equipment_delivery:EQ-2"] [data-schedule-progress]',
    );
    expect(eqUnknown).toHaveAttribute('data-schedule-progress', 'unknown');
    expect(eqUnknown).toHaveTextContent('нет данных');

    const group = document.querySelector('[data-schedule-row="stage_group:S1"] [data-schedule-progress]');
    expect(group).toHaveAttribute('data-schedule-progress', 'n/a');
    expect(group).toHaveTextContent('—');

    const rolled = document.querySelector(
      '[data-schedule-row="stage_group:S2"] [data-schedule-progress]',
    );
    expect(rolled).toHaveAttribute('data-schedule-progress', '42');
    expect(rolled).toHaveTextContent('42%');
  });

  it('verticalScrollOwned: шапка без полосы, липкая нижняя полоса, колонки без №, гибкая рейка', () => {
    render(
      <ScheduleBoard
        items={[work]}
        mode="table"
        verticalScrollOwned
        embedded
        treeRows={[treeRow({ key: 'work:WK-01', name: 'Монтаж AHU', kind: 'work', wbs: '9.1' })]}
      />,
    );

    const header = document.querySelector<HTMLElement>('[data-schedule-header-hscroll="true"]');
    expect(header?.className).toMatch(/overflow-x-hidden/);
    expect(header?.className).not.toMatch(/overflow-x-auto/);
    expect(header?.style.scrollbarWidth).toBe('none');

    const body = document.querySelector<HTMLElement>('[data-schedule-body-hscroll="true"]');
    expect(body?.className).toMatch(/overflow-x-auto/);
    expect(body?.style.scrollbarWidth).toBe('none');

    const proxy = document.querySelector<HTMLElement>('[data-schedule-hscroll-proxy="true"]');
    expect(proxy).toBeTruthy();
    expect(proxy?.style.position).toBe('sticky');
    expect(proxy?.style.bottom).toBe('0px');

    expect(document.querySelector('[data-schedule-col="ordinal"]')).toBeNull();
  });

  it('scrollLeft тела синхронизируется с шапкой и нижней полосой', () => {
    render(
      <ScheduleBoard
        items={[work]}
        mode="table"
        verticalScrollOwned
        embedded
        treeRows={[treeRow({ key: 'work:WK-01', name: 'Монтаж AHU', kind: 'work' })]}
      />,
    );
    const header = document.querySelector<HTMLElement>('[data-schedule-header-hscroll="true"]')!;
    const body = document.querySelector<HTMLElement>('[data-schedule-body-hscroll="true"]')!;
    const proxy = document.querySelector<HTMLElement>('[data-schedule-hscroll-proxy="true"]')!;
    for (const el of [header, body, proxy]) {
      Object.defineProperty(el, 'scrollWidth', { configurable: true, value: 2000 });
      Object.defineProperty(el, 'clientWidth', { configurable: true, value: 500 });
    }
    proxy.scrollLeft = 120;
    fireEvent.scroll(proxy);
    expect(body.scrollLeft).toBe(120);
    expect(header.scrollLeft).toBe(120);
  });

  it('в split + embedded рейка hierarchical-таблицы тянется по ширине панели', () => {
    render(
      <ScheduleBoard
        items={[work]}
        mode="split"
        verticalScrollOwned
        embedded
        treeRows={[treeRow({ key: 'work:WK-01', name: 'Монтаж AHU', kind: 'work' })]}
      />,
    );
    const left = document.querySelector('[data-schedule-row-left="true"]');
    expect(left?.className).toMatch(/w-full/);
    expect(left?.className).toMatch(/min-w-0/);
    expect(left?.className).not.toMatch(/w-\[48rem\]/);
  });

  it('shared hover paints sticky left rail, not only the outer row', () => {
    const { rerender } = render(
      <ScheduleBoard
        items={[work]}
        mode="table"
        verticalScrollOwned
        embedded
        treeRows={[treeRow({ key: 'work:WK-01', name: 'Монтаж AHU', kind: 'work' })]}
        hoveredRowKey={null}
      />,
    );
    const left = () =>
      document.querySelector<HTMLElement>('[data-schedule-row-left="true"]')!;
    expect(left().className).toMatch(/surface-raised/);
    expect(left().getAttribute('data-schedule-row-left-hover')).toBeNull();

    rerender(
      <ScheduleBoard
        items={[work]}
        mode="table"
        verticalScrollOwned
        embedded
        treeRows={[treeRow({ key: 'work:WK-01', name: 'Монтаж AHU', kind: 'work' })]}
        hoveredRowKey="work:WK-01"
      />,
    );
    const hovered = document.querySelector(
      '[data-schedule-row="work:WK-01"]',
    ) as HTMLElement;
    expect(hovered.className).toMatch(/ppc-schedule-row-hovered/);
    expect(left().className).toMatch(/surface-raised/);
    expect(hovered.getAttribute('data-schedule-row-hover')).toBe('true');
  });

  it('отметка внимания не задаёт левую рамку строки', () => {
    render(
      <ScheduleBoard
        items={[zeroWork]}
        mode="split"
        treeRows={[
          treeRow({
            key: 'work:8.2.1',
            name: 'Сэндвич-панели и герметизация',
          }),
        ]}
      />,
    );

    const row = document.querySelector('[data-schedule-row="work:8.2.1"]');
    expect(row).toHaveAttribute('data-emphasis', 'true');
    expect(row?.className ?? '').not.toMatch(/border-l/);
    expect(row?.className ?? '').not.toMatch(/inset_2px|shadow-\[inset/);
  });

  it('не сортирует treeRows повторно', () => {
    render(
      <ScheduleBoard
        items={[]}
        mode="table"
        treeRows={[
          treeRow({ key: 'work:b', name: 'Вторая', wbs: '2' }),
          treeRow({ key: 'work:a', name: 'Первая', wbs: '1' }),
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
            name: 'Готовность',
            kind: 'milestone',
            wbs: 'M1',
          }),
          treeRow({
            key: 'equipment_delivery:EQ-1',
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

  it('в узком списке задаёт минимум 560px и доступное имя области прокрутки', () => {
    render(
      <ScheduleBoard
        items={[zeroWork]}
        mode="gantt"
        leadOnly
        treeRows={[
          treeRow({
            key: 'stage_group:8.2',
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
    expect(viewport?.firstElementChild).toHaveStyle({ minWidth: '560px' });
  });

  it('широкая таблица берёт minWidth из суммы колонок (forecast)', () => {
    render(<ScheduleBoard items={[work]} mode="table" />);

    const viewport = document.querySelector('[data-schedule-viewport="true"]');
    expect(viewport?.firstElementChild).toHaveStyle({
      minWidth: `${wideTableMinWidthPx('forecast')}px`,
    });
  });

  it('в режиме факта minWidth учитывает 4×120 fact-колонки', () => {
    render(<ScheduleBoard items={[work]} mode="table" comparison="actual" />);

    const viewport = document.querySelector('[data-schedule-viewport="true"]');
    expect(viewport?.firstElementChild).toHaveStyle({
      minWidth: `${wideTableMinWidthPx('actual')}px`,
    });
  });

  it('заголовок и тело колонки name/object делят фиксированную ширину (не min-w-0)', () => {
    render(
      <ScheduleBoard
        items={[work]}
        mode="table"
        treeRows={[
          treeRow({
            key: 'work:WK-01',
            name: 'Монтаж AHU',
            kind: 'work',
            wbs: '9.1',
          }),
        ]}
      />,
    );

    const header = document.querySelector('[data-schedule-header="true"]');
    const nameHeader = header?.querySelector('[data-schedule-col="name"]');
    const objectHeader = header?.querySelector('[data-schedule-col="object"]');
    expect(nameHeader).toBeTruthy();
    expect(objectHeader).toBeTruthy();
    expect(nameHeader).toHaveStyle({
      width: `${SCHEDULE_COL_NAME_PX}px`,
      minWidth: `${SCHEDULE_COL_NAME_PX}px`,
      maxWidth: `${SCHEDULE_COL_NAME_PX}px`,
    });
    expect(objectHeader).toHaveStyle({
      width: `${SCHEDULE_COL_OBJECT_PX}px`,
      minWidth: `${SCHEDULE_COL_OBJECT_PX}px`,
      maxWidth: `${SCHEDULE_COL_OBJECT_PX}px`,
    });
    expect(nameHeader?.className).toMatch(/truncate|overflow-hidden/);
    expect(nameHeader?.className).not.toMatch(/min-w-0/);

    const bodyLeft = document.querySelector(
      '[data-schedule-row="work:WK-01"] [data-schedule-row-left="true"]',
    );
    const nameBody = bodyLeft?.querySelector('[data-schedule-col="name"]');
    const objectBody = bodyLeft?.querySelector('[data-schedule-col="object"]');
    expect(nameBody).toHaveStyle({
      width: `${SCHEDULE_COL_NAME_PX}px`,
      minWidth: `${SCHEDULE_COL_NAME_PX}px`,
      maxWidth: `${SCHEDULE_COL_NAME_PX}px`,
    });
    expect(objectBody).toHaveStyle({
      width: `${SCHEDULE_COL_OBJECT_PX}px`,
      minWidth: `${SCHEDULE_COL_OBJECT_PX}px`,
      maxWidth: `${SCHEDULE_COL_OBJECT_PX}px`,
    });
  });

  it('ячейка Объект — имя и id в одном ряду (не две строки)', () => {
    render(
      <ScheduleBoard
        items={[
          {
            ...milestoneItem,
            id: 'MS-X',
            name: 'Готовность чистых зон к эксплуатации',
          },
        ]}
        mode="table"
        treeRows={[
          treeRow({
            key: 'milestone:MS-X',
            name: 'Готовность чистых зон к эксплуатации',
            kind: 'milestone',
            wbs: '8.9',
          }),
        ]}
      />,
    );

    const objectBody = document.querySelector(
      '[data-schedule-row="milestone:MS-X"] [data-schedule-col="object"]',
    );
    expect(objectBody).toBeTruthy();
    const inline = objectBody?.querySelector('[data-schedule-object="true"]');
    expect(inline).toBeTruthy();
    expect(inline?.className).toMatch(/flex/);
    expect(inline?.className).not.toMatch(/flex-col/);
    expect(objectBody?.querySelector('.mt-0\\.5, .mt-0\\.5')).toBeNull();
    expect(objectBody?.querySelector('[class*="mt-0.5"]')).toBeNull();
    expect(inline?.textContent).toMatch(/Готовность/);
    expect(inline?.textContent).toMatch(/MS-X/);
    const link = inline?.querySelector('a');
    expect(link).toBeTruthy();
    expect(link).toHaveAttribute('title', expect.stringMatching(/Готовность/));
    expect(inline?.querySelector('[aria-label*="Идентификатор MS-X"], [title="MS-X"]')).toBeTruthy();
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

  it('verticalScrollOwned + rowWindow mounts only the window and keeps logical height', () => {
    const rows = Array.from({ length: 40 }, (_, i) =>
      treeRow({
        key: `work:WK-${i}`,
        name: `Work ${i}`,
        kind: 'work',
      }),
    );
    const rowWindow = {
      startIndex: 10,
      endIndex: 18,
      rowCount: 40,
      rowHeight: SCHEDULE_ROW_HEIGHT_PX,
      scrollTop: 320,
      viewportHeight: 256,
    };
    render(
      <ScheduleBoard
        items={[]}
        mode="table"
        treeRows={rows}
        verticalScrollOwned
        embedded
        rowWindow={rowWindow}
      />,
    );
    const board = document.querySelector('[data-schedule-board="true"]');
    expect(board).toHaveAttribute('data-schedule-virtualized', 'true');
    expect(board).toHaveAttribute('data-schedule-logical-rows', '40');
    expect(board).toHaveAttribute('data-schedule-dom-rows', '8');
    expect(document.querySelectorAll('[data-schedule-row]').length).toBe(8);
    expect(document.querySelector('[data-schedule-row="work:WK-10"]')).toBeTruthy();
    expect(document.querySelector('[data-schedule-row="work:WK-0"]')).toBeNull();
    expect(document.querySelector('[data-schedule-virtual-spacer="top"]')).toHaveStyle({
      height: `${10 * SCHEDULE_ROW_HEIGHT_PX}px`,
    });
    expect(document.querySelector('[data-schedule-virtual-spacer="bottom"]')).toHaveStyle({
      height: `${22 * SCHEDULE_ROW_HEIGHT_PX}px`,
    });
  });
});
