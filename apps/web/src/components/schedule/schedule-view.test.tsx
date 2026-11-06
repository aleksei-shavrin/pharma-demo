/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
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
vi.mock('@/components/schedule/dhtmlx-gantt-adapter', () => ({
  DhtmlxGanttAdapter: () => (
    <div data-testid="dhtmlx-gantt-stub" data-gantt-stub="true" />
  ),
}));

function dash(snapshotId: SnapshotId) {
  return dashboardOverviewFixture(snapshotId);
}

function buildItems(snapshotId: SnapshotId): ScheduleItem[] {
  const hvacDelta =
    snapshotId === 'C' ? 21 : snapshotId === 'G' || snapshotId === 'H' ? 14 : 0;
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
    projectId: 'PRJ-01',
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
  it('loads 23 EQ + 14 MS; unified board; detail links; C +21', async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('37 / 37')).toBeInTheDocument();
      expect(document.querySelector('[data-schedule-board="true"]')).toBeTruthy();
      expect(document.querySelector('[data-gantt-stub="true"]')).toBeTruthy();
    });

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
    expect(
      document.querySelector('[data-schedule-viewport="true"]')?.className,
    ).toMatch(/overflow-auto/);
    expect(
      document.querySelectorAll('[data-schedule-row]').length,
    ).toBe(37);

    // Split opens the same table as Table mode, plus the shared chart.
    const splitHeader = document.querySelector('[data-schedule-header="true"]');
    expect(splitHeader?.textContent).toMatch(/Объект/);
    expect(splitHeader?.textContent).toMatch(/Тип/);
    expect(
      document.querySelector('[data-schedule-presentation="split"]'),
    ).toBeTruthy();
    expect(document.querySelector('[data-schedule-pane="chart"]')).toBeTruthy();
    await waitFor(() => {
      expect(document.querySelector('[data-gantt-stub="true"]')).toBeTruthy();
    });

    expect(
      screen.getByRole('link', { name: 'Центральный AHU чистых зон' }),
    ).toHaveAttribute('href', '/equipment/EQ-HVAC-01');
    expect(
      screen.getByRole('link', { name: 'Готовность к производству' }),
    ).toHaveAttribute('href', '/milestones/MS-PS');

    // Rows are not selectable / not clickable for selection chrome.
    const sampleRow = document.querySelector(
      '[data-schedule-row="equipment_delivery:EQ-HVAC-01"]',
    ) as HTMLElement;
    expect(sampleRow.getAttribute('aria-selected')).toBeNull();
    expect(sampleRow.getAttribute('data-selected')).toBeNull();
    await user.click(sampleRow);
    expect(sampleRow.getAttribute('aria-selected')).toBeNull();
    expect(document.querySelector('[data-selected="true"]')).toBeNull();

    await selectDemoSnapshot(user, 'C');
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
  });

  it('Таблица — board; Временная шкала — DHTMLX (стрелки G07–G11)', async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('37 / 37')).toBeInTheDocument();
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
      expect(screen.getByText('37 / 37')).toBeInTheDocument();
    });

    await selectDemoSnapshot(user, 'C');
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
      expect(screen.getByText('37 / 37')).toBeInTheDocument();
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
      expect(screen.getByText('39 / 39')).toBeInTheDocument();
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
      expect(screen.getByText(/39 \/ 39|2 \/ /)).toBeTruthy();
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
    for (const id of ['G', 'H'] as SnapshotId[]) {
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
      expect(screen.getByText('37 / 37')).toBeInTheDocument();
    });
    expect(screen.queryByText(/\bOnTrack\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bDelayed\b/)).not.toBeInTheDocument();
  });

  it('переключение режима сохраняет снимок и показывает одни и те же части', async () => {
    const user = userEvent.setup();
    render(wrap(<SchedulePage />));
    await waitFor(() => {
      expect(screen.getByText('37 / 37')).toBeInTheDocument();
    });
    await selectDemoSnapshot(user, 'C');
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
});
