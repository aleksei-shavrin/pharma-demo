/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SchedulePage from '@/app/schedule/page';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';
import type {
  ScheduleItem,
  ScheduleMilestoneItem,
  ScheduleReadModel,
  ScheduleWorkItem,
} from '@/lib/api-client';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { ThemeProvider } from '@/lib/theme/theme-context';
import { SCHEDULE_ROW_HEIGHT_PX } from '@/lib/schedule/schedule-geometry';
import { selectDemoSnapshot } from '@/lib/test/select-snapshot';

const fetchDashboardOverview = vi.fn();
const fetchSchedule = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...a: unknown[]) => fetchDashboardOverview(...a),
    fetchSchedule: (...a: unknown[]) => fetchSchedule(...a),
  };
});

/** Avoid loading real dhtmlx-gantt in jsdom when Timeline mode mounts. */
vi.mock('@/components/schedule/dhtmlx-gantt-adapter', () => {
  function patchScrollBox(el: HTMLDivElement | null) {
    if (!el || el.dataset.scrollPatched === 'true') return;
    el.dataset.scrollPatched = 'true';
    let top = 0;
    Object.defineProperty(el, 'scrollHeight', {
      configurable: true,
      get: () => 2400,
    });
    Object.defineProperty(el, 'clientHeight', {
      configurable: true,
      get: () => 120,
    });
    Object.defineProperty(el, 'scrollTop', {
      configurable: true,
      get: () => top,
      set: (v: number) => {
        top = Number(v) || 0;
      },
    });
  }

  return {
    DhtmlxGanttAdapter: () => (
      <div data-testid="dhtmlx-gantt-stub" data-gantt-stub="true">
        <div
          ref={patchScrollBox}
          className="gantt_ver_scroll"
          data-gantt-ver-scroll="true"
          style={{ height: 120, overflow: 'auto' }}
        >
          <div style={{ height: 2400 }} />
        </div>
        <div className="gantt_task">
          <div
            className="gantt_task_row"
            {...{ task_id: 'equipment_delivery:EQ-HVAC-01' }}
          />
          <div
            className="gantt_task_row"
            {...{ task_id: 'milestone:MS-PS' }}
          />
        </div>
        <div ref={patchScrollBox} className="gantt_data_area" />
      </div>
    ),
  };
});

function dash(snapshotId: SnapshotId) {
  return dashboardOverviewFixture(snapshotId);
}

function buildItems(snapshotId: SnapshotId): ScheduleItem[] {
  const hvacDelta =
    snapshotId === '03' ? 21 : snapshotId === '07' || snapshotId === '08' ? 14 : 0;
  const msDelta = hvacDelta;
  const hvacForecast =
    hvacDelta === 21
      ? '2027-06-05'
      : hvacDelta === 14
        ? '2027-05-29'
        : '2027-05-15';
  const msForecast =
    msDelta === 21
      ? '2027-10-06'
      : msDelta === 14
        ? '2027-09-29'
        : '2027-09-15';

  const items: ScheduleItem[] = [
    {
      kind: 'equipment_delivery',
      id: 'EQ-HVAC-01',
      name: 'Центральный AHU чистых зон',
      workstream: 'WS-HVAC',
      critical: true,
      status: hvacDelta > 0 ? 'Delayed' : 'OnTrack',
      baselineDate: '2027-05-15',
      forecastDate: hvacForecast,
      dateVariance: {
        baselineDate: '2027-05-15',
        forecastDate: hvacForecast,
        deltaDays: hvacDelta,
      },
    },
    {
      kind: 'milestone',
      id: 'MS-PS',
      name: 'Ready for production',
      workstream: null,
      rag: msDelta > 0 ? 'Red' : 'Green',
      baselineDate: '2027-09-15',
      forecastDate: msForecast,
      dateVariance: {
        baselineDate: '2027-09-15',
        forecastDate: msForecast,
        deltaDays: msDelta,
      },
    },
  ];

  while (items.filter((i) => i.kind === 'equipment_delivery').length < 23) {
    const n = items.filter((i) => i.kind === 'equipment_delivery').length + 1;
    items.push({
      kind: 'equipment_delivery',
      id: `EQ-PAD-${String(n).padStart(2, '0')}`,
      name: `Оборудование ${n}`,
      workstream: 'WS-UTL',
      critical: false,
      status: 'OnTrack',
      baselineDate: '2027-04-01',
      forecastDate: '2027-04-01',
      dateVariance: {
        baselineDate: '2027-04-01',
        forecastDate: '2027-04-01',
        deltaDays: 0,
      },
    });
  }
  while (items.filter((i) => i.kind === 'milestone').length < 14) {
    const n = items.filter((i) => i.kind === 'milestone').length + 1;
    items.push({
      kind: 'milestone',
      id: `MS-PAD-${String(n).padStart(2, '0')}`,
      name: `Веха ${n}`,
      workstream: 'WS-UTL',
      rag: 'Green',
      baselineDate: '2027-07-01',
      forecastDate: '2027-07-01',
      dateVariance: {
        baselineDate: '2027-07-01',
        forecastDate: '2027-07-01',
        deltaDays: 0,
      },
    });
  }
  return items;
}

function schedule(snapshotId: SnapshotId): ScheduleReadModel {
  return {
    snapshotId,
    scenarioAsOfDate: dash(snapshotId).scenarioAsOfDate,
    projectId: 'PRT-01',
    items: buildItems(snapshotId),
    links: [],
  };
}

function wrap(ui: ReactNode) {
  return (
    <ThemeProvider>
      <SnapshotProvider>
        <SnapshotSelector />
        {ui}
      </SnapshotProvider>
    </ThemeProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  sessionStorage.clear();
  fetchDashboardOverview.mockImplementation(
    async (_id: string, s: SnapshotId) => dash(s),
  );
  fetchSchedule.mockImplementation(async (_id: string, s: SnapshotId) =>
    schedule(s),
  );
});

describe('E5 Schedule control board', () => {
  it(
    'loads 23 EQ + 14 MS; unified board; detail links; C +21',
    async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(
      () => {
        expect(screen.getByText('37 из 37')).toBeInTheDocument();
        expect(document.querySelector('[data-schedule-board="true"]')).toBeTruthy();
        expect(document.querySelector('[data-gantt-stub="true"]')).toBeTruthy();
      },
      { timeout: 10_000 },
    );

    const board = document.querySelector('[data-schedule-board="true"]');
    expect(board).toBeTruthy();
    expect(board).toHaveAttribute(
      'data-schedule-row-height',
      String(SCHEDULE_ROW_HEIGHT_PX),
    );
    expect(
      document.querySelector('[data-schedule-viewport="true"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-schedule-bounded="true"]'),
    ).toBeTruthy();
    // R2-W1-R2: Schedule stays in workspace mode — no page-level scroll owner.
    const pageContent = document.querySelector('[data-page-content="true"]');
    expect(pageContent?.getAttribute('data-page-scroll-mode')).toBe(
      'workspace',
    );
    expect(pageContent?.className).toMatch(/overflow-hidden/);
    expect(pageContent?.className).not.toMatch(/overflow-y-auto/);
    const scrollOwner = document.querySelector(
      '[data-schedule-scroll-owner="true"]',
    );
    expect(scrollOwner?.className).toMatch(/overflow-y-auto/);
    expect(
      document.querySelector('[data-schedule-sticky-header="true"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-schedule-chart-sticky-header="true"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-schedule-chart-sticky-scale="true"]'),
    ).toBeTruthy();
    // Stub gantt does not publish vendor geometry; live browser proves matching.
    expect(
      document.querySelector('[data-schedule-viewport="true"]')?.className,
    ).toMatch(/overflow-x-auto/);
    expect(
      document.querySelector('[data-schedule-viewport="true"]')?.className,
    ).not.toMatch(/(^|\s)overflow-auto(\s|$)/);
    expect(
      document.querySelectorAll('[data-schedule-row]').length,
    ).toBe(37);

    // Split opens the same table as Table mode, plus the shared chart.
    const splitHeader = document.querySelector('[data-schedule-header="true"]');
    expect(splitHeader?.textContent).not.toMatch(/№/);
    expect(splitHeader?.textContent).toMatch(/ИСР/);
    expect(splitHeader?.textContent).toMatch(/Объект/);
    expect(splitHeader?.textContent).toMatch(/Тип/);
    expect(
      document.querySelector('[data-schedule-presentation="split"]'),
    ).toBeTruthy();
    expect(document.querySelector('[data-schedule-pane="chart"]')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Разделение' }),
    ).toHaveAttribute('aria-pressed', 'true');
    // Snapshot without curated works hides comparison; view toggle stays in toolbar.
    expect(
      screen.queryByRole('button', { name: 'Базовый план / прогноз' }),
    ).toBeNull();
    await waitFor(() => {
      expect(document.querySelector('[data-gantt-stub="true"]')).toBeTruthy();
    });

    expect(
      screen.getByRole('link', { name: 'Центральный AHU чистых зон' }),
    ).toHaveAttribute('href', '/equipment/EQ-HVAC-01');
    expect(
      screen.getByRole('link', { name: 'Готовность к производству' }),
    ).toHaveAttribute('href', '/milestones/MS-PS');

    // Click selects the logical row (table chrome + aria-selected).
    const sampleRow = document.querySelector(
      '[data-schedule-row="equipment_delivery:EQ-HVAC-01"]',
    ) as HTMLElement;
    expect(sampleRow.getAttribute('aria-selected')).toBe('false');
    await user.click(sampleRow);
    expect(sampleRow.getAttribute('aria-selected')).toBe('true');
    expect(sampleRow.getAttribute('data-schedule-row-selected')).toBe('true');
    expect(sampleRow.className).toMatch(/ppc-schedule-row-selected/);
    // Toggle off on second click.
    await user.click(sampleRow);
    expect(sampleRow.getAttribute('aria-selected')).toBe('false');
    expect(sampleRow.getAttribute('data-schedule-row-selected')).toBeNull();

    await selectDemoSnapshot(user, '03');
    await waitFor(() => {
      expect(screen.getAllByText('+21 день').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('05.06.2027')).toBeInTheDocument();
    expect(screen.getByText('06.10.2027')).toBeInTheDocument();

    const hvacRow = document.querySelector(
      '[data-schedule-row="equipment_delivery:EQ-HVAC-01"]',
    );
    const msRow = document.querySelector(
      '[data-schedule-row="milestone:MS-PS"]',
    );
    expect(hvacRow?.getAttribute('data-row-height')).toBe(
      String(SCHEDULE_ROW_HEIGHT_PX),
    );
    expect(msRow?.getAttribute('data-row-height')).toBe(
      String(SCHEDULE_ROW_HEIGHT_PX),
    );
    expect(
      hvacRow?.querySelector('[data-schedule-row-timeline="true"]'),
    ).toBeNull();
    expect(document.querySelector('[data-schedule-pane="chart"]')).toBeTruthy();
  },
  15_000,
  );

  it('Таблица — board; Временная шкала — DHTMLX (стрелки G07–G11)', async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('37 из 37')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Таблица' }));
    expect(
      document.querySelector('[data-schedule-layout="table"]'),
    ).toBeTruthy();
    expect(document.querySelectorAll('[data-schedule-row]').length).toBe(37);
    expect(
      document.querySelector('[data-schedule-row-timeline="true"]'),
    ).toBeNull();
    // Table keeps Type column.
    expect(
      document.querySelector('[data-schedule-header="true"]')?.textContent,
    ).toMatch(/Тип/);

    await user.click(screen.getByRole('button', { name: 'Временная шкала' }));
    await waitFor(() => {
      expect(
        document.querySelector('[data-schedule-timeline="live"]'),
      ).toBeTruthy();
    });
    expect(
      document.querySelector('[data-schedule-layout="gantt"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-gantt-viewport="bounded"]'),
    ).toBeTruthy();
  });

  it('filters by attention / kind / search; reset restores full set', async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('37 из 37')).toBeInTheDocument();
    });

    await selectDemoSnapshot(user, '03');
    await waitFor(() => {
      expect(screen.getAllByText('+21 день').length).toBeGreaterThan(0);
    });

    await user.selectOptions(
      screen.getByLabelText('Фильтр внимания'),
      'attention',
    );
    await waitFor(() => {
      expect(
        document.querySelectorAll('[data-schedule-row]').length,
      ).toBeGreaterThan(0);
    });
    expect(
      document.querySelector(
        '[data-schedule-row="equipment_delivery:EQ-HVAC-01"]',
      ),
    ).toBeTruthy();

    await user.selectOptions(
      screen.getByLabelText('Фильтр типа контрольной точки'),
      'milestone',
    );
    await waitFor(() => {
      expect(
        document.querySelector(
          '[data-schedule-row="milestone:MS-PS"]',
        ),
      ).toBeTruthy();
    });
    expect(
      document.querySelector(
        '[data-schedule-row="equipment_delivery:EQ-HVAC-01"]',
      ),
    ).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    await waitFor(() => {
      expect(screen.getByText('37 из 37')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/Поиск/), 'MS-PS');
    await waitFor(() => {
      expect(
        document.querySelector('[data-schedule-row="milestone:MS-PS"]'),
      ).toBeTruthy();
    });
    expect(document.querySelectorAll('[data-schedule-row]').length).toBe(1);
  });

  it('работы: строки, статус, фильтр «Работы», таблица с начало/окончание', async () => {
    const user = userEvent.setup();
    const works: ScheduleWorkItem[] = [
      {
        kind: 'work',
        id: 'WK-01',
        name: 'Монтаж AHU',
        workstream: 'WS-HVAC',
        startDate: '2027-06-01',
        endDate: '2027-06-10',
        status: 'Delayed',
      },
      {
        kind: 'work',
        id: 'WK-02',
        name: 'Пусконаладка',
        workstream: null,
        startDate: '2027-06-11',
        endDate: '2027-06-11',
        status: 'Completed',
      },
    ];
    fetchSchedule.mockImplementation(async (_id: string, s: SnapshotId) => ({
      ...schedule(s),
      items: [...buildItems(s), ...works],
      links: [
        {
          id: 'LNK-01',
          sourceRef: 'work:WK-01',
          targetRef: 'work:WK-02',
          type: 'FS' as const,
        },
      ],
    }));
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('39 из 39')).toBeInTheDocument();
    });
    expect(
      document.querySelector('[data-schedule-row="work:WK-01"]'),
    ).toBeTruthy();
    expect(document.querySelector('[data-schedule-pane="chart"]')).toBeTruthy();
    expect(
      document.querySelector('[data-marker="work-bar"][data-kind="work"]'),
    ).toBeNull();
    expect(screen.getByText('Работы')).toBeInTheDocument();
    // Статус остаётся текстом. Предупреждение — иконка с тем же смыслом в имени.
    expect(screen.getAllByText('Отстаёт').length).toBeGreaterThanOrEqual(1);
    expect(
      document.querySelector(
        '[data-schedule-row="work:WK-01"] [data-schedule-warning="lag"] [aria-label]',
      )?.getAttribute('aria-label'),
    ).toMatch(/Отстаёт/);
    expect(screen.getByText('Выполнено')).toBeInTheDocument();
    // Работы без карточки детализации — не ссылки.
    expect(
      screen.queryByRole('link', { name: 'Монтаж AHU' }),
    ).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText('Фильтр типа контрольной точки'),
      'work',
    );
    await waitFor(() => {
      expect(document.querySelectorAll('[data-schedule-row]').length).toBe(2);
    });

    await user.click(screen.getByRole('button', { name: 'Таблица' }));
    const header = document.querySelector('[data-schedule-header="true"]');
    expect(header?.textContent).toMatch(/Начало/);
    expect(header?.textContent).toMatch(/Окончание/);
    // Колонка «Тип» называет работу. В ячейке имени подписи вида нет.
    expect(screen.getAllByText('Работа').length).toBeGreaterThanOrEqual(2);
    expect(
      document.querySelector('[data-schedule-row="work:WK-01"] [data-schedule-kind]'),
    ).toBeNull();
    expect(screen.getByText('01.06.2027')).toBeInTheDocument();
    expect(screen.getByText('10.06.2027')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Временная шкала' }));
    await waitFor(() => {
      expect(
        document.querySelector('[data-schedule-timeline="live"]'),
      ).toBeTruthy();
    });
    expect(document.querySelector('[data-schedule-legend="markers"]')).toBeNull();
    expect(document.querySelector('[data-schedule-legend="links"]')).toBeNull();
  });

  it('SF-связь: disclaimer о точках крепления на временной шкале', async () => {
    const user = userEvent.setup();
    fetchSchedule.mockImplementation(async (_id: string, s: SnapshotId) => ({
      ...schedule(s),
      items: [
        ...buildItems(s),
        {
          kind: 'work' as const,
          id: 'WK-04',
          name: 'Герметизация',
          startDate: '2027-03-06',
          endDate: '2027-03-10',
          status: 'OnSchedule' as const,
        },
        {
          kind: 'work' as const,
          id: 'WK-05',
          name: 'Приёмка',
          startDate: '2027-03-13',
          endDate: '2027-03-13',
          status: 'Waiting' as const,
        },
      ],
      links: [
        {
          id: 'LNK-SF-01',
          sourceRef: 'work:WK-04',
          targetRef: 'work:WK-05',
          type: 'SF' as const,
        },
      ],
    }));
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText(/39 из 39|2 из /)).toBeTruthy();
    });
    await user.click(screen.getByRole('button', { name: 'Временная шкала' }));
    await waitFor(() => {
      expect(
        document.querySelector('[data-schedule-timeline="live"]'),
      ).toBeTruthy();
    });
    expect(document.querySelector('[data-schedule-legend="sf-demo"]')).toBeNull();
    expect(
      screen.queryByText(/не утверждённая технологическая зависимость/i),
    ).not.toBeInTheDocument();
  });

  it('G/H residual MS-PS +14 from register contract shape', () => {
    for (const id of ['07', '08'] as SnapshotId[]) {
      const ms = schedule(id).items.find(
        (i): i is ScheduleMilestoneItem =>
          i.kind === 'milestone' && i.id === 'MS-PS',
      );
      expect(ms).toBeDefined();
      expect(ms!.dateVariance.deltaDays).toBe(14);
      expect(ms!.rag).toBe('Red');
      expect(ms!.forecastDate).toBe('2027-09-29');
    }
  });

  it('does not invent RAG labels from English machine values in UI', async () => {
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('37 из 37')).toBeInTheDocument();
    });
    expect(screen.queryByText(/\bOnTrack\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bDelayed\b/)).not.toBeInTheDocument();
  });

  it('chart-only: Y диаграммы сохраняется при gantt → table → gantt', async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('37 из 37')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Временная шкала' }));
    await waitFor(() => {
      expect(
        document.querySelector('[data-schedule-presentation="gantt"]'),
      ).toBeTruthy();
      expect(document.querySelector('.gantt_ver_scroll')).toBeTruthy();
    });

    const chartScroll = document.querySelector<HTMLElement>('.gantt_ver_scroll');
    expect(chartScroll).toBeTruthy();
    chartScroll!.scrollTop = 480;
    chartScroll!.dispatchEvent(new Event('scroll'));

    await user.click(screen.getByRole('button', { name: 'Таблица' }));
    await waitFor(() => {
      expect(
        document.querySelector('[data-schedule-presentation="table"]'),
      ).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: 'Временная шкала' }));
    await waitFor(
      () => {
        const restored = document.querySelector<HTMLElement>('.gantt_ver_scroll');
        expect(restored).toBeTruthy();
        expect(restored!.scrollTop).toBe(480);
      },
      { timeout: 3000 },
    );
  });

  it('переключение режима сохраняет снимок и показывает одни и те же части', async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('37 из 37')).toBeInTheDocument();
    });
    await selectDemoSnapshot(user, '03');
    await waitFor(() => {
      expect(screen.getAllByText('+21 день').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByRole('button', { name: 'Таблица' }));
    expect(
      document.querySelector('[data-schedule-presentation="table"]'),
    ).toBeTruthy();
    expect(document.querySelector('[data-schedule-pane="chart"]')).toBeNull();
    expect(screen.getAllByText('+21 день').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Временная шкала' }));
    await waitFor(() => {
      expect(
        document.querySelector('[data-schedule-presentation="gantt"]'),
      ).toBeTruthy();
    });
    expect(document.querySelector('[data-schedule-pane="table"]')).toBeNull();
    expect(document.querySelector('[data-gantt-stub="true"]')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Разделение' }));
    expect(
      document.querySelector('[data-schedule-presentation="split"]'),
    ).toBeTruthy();
    expect(document.querySelector('[data-schedule-pane="table"]')).toBeTruthy();
    expect(document.querySelector('[data-schedule-pane="chart"]')).toBeTruthy();
    expect(screen.getAllByText('+21 день').length).toBeGreaterThan(0);
  });

  it('панель: слева поиск (компактный) и тип точки, справа только переключатели одного размера', async () => {
    fetchSchedule.mockImplementation(async (_id: string, s: SnapshotId) => ({
      ...schedule(s),
      items: [
        ...buildItems(s),
        {
          kind: 'work' as const,
          id: 'WK-01',
          name: 'Монтаж AHU',
          startDate: '2027-06-01',
          endDate: '2027-06-10',
          status: 'Delayed' as const,
        },
      ],
    }));
    render(wrap(<SchedulePage />));
    const toolbar = await waitFor(() => {
      expect(screen.getByText('38 из 38')).toBeInTheDocument();
      const el = document.querySelector<HTMLElement>(
        '[data-schedule-toolbar="true"]',
      );
      expect(el).toBeTruthy();
      return el!;
    });
    expect(toolbar.className).toMatch(/flex-wrap/);
    const left = toolbar.querySelector<HTMLElement>('[data-schedule-toolbar-left="true"]')!;
    const right = toolbar.querySelector<HTMLElement>(
      '[data-schedule-toolbar-actions="true"]',
    )!;
    // Action cluster stays right-aligned even when wrapped onto its own row.
    expect(right).toHaveAttribute('data-schedule-toolbar-right', 'true');
    expect(right.className).toMatch(/\bml-auto\b/);
    expect(right.className).toMatch(/justify-end/);
    expect(right.className).toMatch(/\bshrink-0\b/);
    expect(left.className).toMatch(/\bflex-1\b/);

    const search = within(left).getByPlaceholderText(/Поиск/);
    expect(search.closest('label')?.className).toMatch(/w-\[240px\]/);
    expect(search.closest('label')?.className).not.toMatch(/flex-1/);
    expect(left.querySelector('[data-register-toolbar-layout="schedule"]')).toBeTruthy();
    const typeFilter = within(left).getByLabelText('Фильтр типа контрольной точки');
    expect(typeFilter).toBeTruthy();
    const reset = within(left).getByRole('button', { name: 'Сбросить фильтры' });
    expect(
      typeFilter.compareDocumentPosition(reset) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const groups = right.querySelectorAll('[role="group"]');
    // Zoom −/+ | comparison | view — shared group chrome; icon buttons transparent.
    expect(groups).toHaveLength(3);
    expect(groups[0]).toHaveAttribute('data-schedule-zoom-toggle', 'true');
    expect(groups[1]).toHaveAttribute('data-schedule-comparison');
    expect(groups[2]).toHaveAttribute('data-schedule-view-toggle', 'true');
    expect(right.querySelector('select, input')).toBeNull();
    for (const group of groups) {
      expect(group.className).toMatch(/\bh-8\b/);
      expect(group.className).toMatch(/\bborder\b/);
      expect(group.className).toMatch(/surface-sunken/);
      for (const btn of group.querySelectorAll('button')) {
        expect(btn.className).toMatch(/\bh-6\b/);
        expect(btn.className).toMatch(/\bw-6\b/);
        expect(btn.className).toMatch(/bg-transparent/);
        expect(btn.className).not.toMatch(/inset|ring-offset-0|shadow-\[inset/);
      }
    }
    const pressed = right.querySelectorAll('[aria-pressed="true"]');
    for (const btn of pressed) {
      expect(btn.className).toMatch(/status-info-border/);
      expect(btn.className).not.toMatch(/bg-\[var\(--surface/);
    }
  });

  it('split: разделитель двигается мышью и стрелками в пределах min/max', async () => {
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('37 из 37')).toBeInTheDocument();
    });

    const list = document.querySelector<HTMLElement>('[data-schedule-pane="table"]')!;
    const row = list.parentElement!;
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
    expect(sep).toHaveAttribute('tabindex', '0');
    // Default width is CSS 50% until the user drags; no fixed px yet.
    expect(list).not.toHaveAttribute('data-schedule-list-width');
    expect(list.style.width).toBe('50%');

    row.getBoundingClientRect = () => ({ width: 1000 }) as DOMRect;
    list.getBoundingClientRect = () => ({ width: 460 }) as DOMRect;

    fireEvent.keyDown(sep, { key: 'ArrowRight' });
    expect(list.style.width).toBe('484px');
    fireEvent.keyDown(sep, { key: 'End' });
    expect(list.style.width).toBe('700px');
    fireEvent.keyDown(sep, { key: 'Home' });
    expect(list.style.width).toBe('320px');

    list.getBoundingClientRect = () => ({ width: 320 }) as DOMRect;
    fireEvent.pointerDown(sep, { button: 0, pointerId: 1, clientX: 400 });
    expect(sep).toHaveAttribute('data-dragging', 'true');
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 500 });
    expect(list.style.width).toBe('420px');
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 5000 });
    expect(list.style.width).toBe('700px');
    fireEvent.pointerUp(window, { pointerId: 1 });
    expect(sep).not.toHaveAttribute('data-dragging');
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 450 });
    expect(list.style.width).toBe('700px');

    fireEvent.pointerDown(sep, { button: 0, pointerId: 2, clientX: 400 });
    fireEvent.pointerCancel(window, { pointerId: 2 });
    expect(sep).not.toHaveAttribute('data-dragging');
  });
});
