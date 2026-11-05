/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import DashboardPage from '@/app/page';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { projectCostFixture } from '@/lib/test/project-cost-fixture';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { selectDemoSnapshot } from '@/lib/test/select-snapshot';

const fetchDashboardOverview = vi.fn();
const fetchProjectCosts = vi.fn();
const fetchNotifications = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...args: unknown[]) =>
      fetchDashboardOverview(...args),
    fetchProjectCosts: (...args: unknown[]) => fetchProjectCosts(...args),
    fetchNotifications: (...args: unknown[]) => fetchNotifications(...args),
    fetchHealth: vi.fn(),
  };
});

function overview(
  snapshotId: SnapshotId,
  overrides: Partial<DashboardOverview> = {},
): DashboardOverview {
  return dashboardOverviewFixture(snapshotId, overrides);
}

function renderDashboard() {
  return render(
    <SnapshotProvider>
      <SnapshotSelector />
      <DashboardPage />
    </SnapshotProvider>,
  );
}

function renderView(snapshotId: SnapshotId) {
  return render(
    <SnapshotProvider>
      <DashboardView
        data={overview(snapshotId)}
        projectCost={projectCostFixture(snapshotId)}
      />
    </SnapshotProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  sessionStorage.clear();
  fetchDashboardOverview.mockImplementation(
    async (_id: string, snapshot: SnapshotId) => overview(snapshot),
  );
  fetchProjectCosts.mockImplementation(
    async (_id: string, snapshot: SnapshotId) => ({
      snapshotId: snapshot,
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      project: projectCostFixture(snapshot),
      workstreams: [],
      equipment: [],
      reconciliation: {
        workstreamEacSumRub: 0,
        projectLevelForecastRub: 0,
      },
    }),
  );
  fetchNotifications.mockImplementation(
    async (_id: string, snapshot: SnapshotId) => ({
      snapshotId: snapshot,
      scenarioAsOfDate: '2027-02-15',
      projectId: 'PRJ-01',
      items: [],
    }),
  );
});

function projectStatusBlock() {
  return document.querySelector(
    '[data-dashboard-block="project-status"]',
  ) as HTMLElement;
}

describe('E3 Project Status', () => {
  it('A: Green, PS baseline, delta 0', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(projectStatusBlock()).toBeTruthy();
    });
    const block = projectStatusBlock();
    expect(within(block).getByText('Зелёный')).toBeInTheDocument();
    expect(within(block).getByText('Запуск производства')).toBeInTheDocument();
    expect(within(block).getByText('15.09.2027')).toBeInTheDocument();
    expect(
      within(block).getByText(/по плану · без отклонения/i),
    ).toBeInTheDocument();
    expect(
      within(block).getByText(
        /в базовом плане без управленческих отклонений/i,
      ),
    ).toBeInTheDocument();
  });

  it('B: Yellow, PS baseline, HVAC calm', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Снимок A.*активный/ }),
      ).toBeInTheDocument(),
    );
    await selectDemoSnapshot(user, 'B');
    await waitFor(() => {
      expect(
        within(projectStatusBlock()).getByText('Жёлтый'),
      ).toBeInTheDocument();
    });
    const block = projectStatusBlock();
    expect(within(block).getByText('15.09.2027')).toBeInTheDocument();
    expect(
      within(block).getByText(/по плану · без отклонения/i),
    ).toBeInTheDocument();
    expect(
      within(block).getByText(/прогноз старта производства без сдвига/i),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-workstream="WS-HVAC"]'),
    ).toHaveAttribute('data-workstream-status', 'Green');
  });

  it('C: Red, PS +21 with baseline→forecast hierarchy', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Снимок A.*активный/ }),
      ).toBeInTheDocument(),
    );
    await selectDemoSnapshot(user, 'C');
    await waitFor(() => {
      expect(
        within(projectStatusBlock()).getByText('Красный'),
      ).toBeInTheDocument();
    });
    const block = projectStatusBlock();
    // Forecast is the dominant PS signal; baseline remains visible as secondary.
    expect(block.querySelector('[data-ps-dates]')).toHaveTextContent(
      '06.10.2027',
    );
    expect(block).toHaveTextContent('15.09.2027');
    expect(block.querySelector('[data-ps-delta]')).toHaveTextContent('+21 день');
  });

  it('G/H: Red, PS +14 via A–H selector', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Снимок A.*активный/ }),
      ).toBeInTheDocument(),
    );
    await selectDemoSnapshot(user, 'G');
    await waitFor(() => {
      expect(
        within(projectStatusBlock()).getByText('Красный'),
      ).toBeInTheDocument();
    });
    let block = projectStatusBlock();
    expect(block.querySelector('[data-ps-dates]')).toHaveTextContent('29.09.2027');
    expect(block.querySelector('[data-ps-delta]')).toHaveTextContent('+14 дней');

    await selectDemoSnapshot(user, 'H');
    await waitFor(() => {
      expect(
        within(projectStatusBlock()).getByText('Красный'),
      ).toBeInTheDocument();
    });
    block = projectStatusBlock();
    expect(block.querySelector('[data-ps-delta]')).toHaveTextContent('+14 дней');
  });
});

describe('E3 Top Exceptions', () => {
  it('A empty/calm; C HVAC/PS first; backend order preserved; human link labels', async () => {
    renderView('A');
    expect(screen.getByText(/критических исключений нет/i)).toBeInTheDocument();

    cleanup();
    renderView('C');
    const exceptions = document.querySelectorAll('[data-exception-id]');
    expect(exceptions[0]).toHaveAttribute('data-exception-id', 'TEX-C-HVAC-PS');
    expect(exceptions[0]).toHaveAttribute('data-exception-order', '1');
    expect(
      within(exceptions[0] as HTMLElement).getByText(
        /Критический прогноз сдвига AHU/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/priority\s*:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Оборудование · EQ-HVAC-01/)).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-top-exceptions="list"]'),
    ).toBeTruthy();
  });

  it('does not reorder when fixture priority order is non-title-sorted', () => {
    render(
      <SnapshotProvider>
        <DashboardView
          data={overview('B', {
            topExceptions: [
              {
                id: 'TEX-SECOND',
                title: 'Якорь второй',
                causeImpact: 'второй',
                links: [],
                priority: 2,
              },
              {
                id: 'TEX-FIRST',
                title: 'Абзац первый',
                causeImpact: 'первый',
                links: [],
                priority: 1,
              },
            ],
          })}
        />
      </SnapshotProvider>,
    );
    // Backend array order must be preserved (no FE sort by title/priority).
    const ids = [...document.querySelectorAll('[data-exception-id]')].map((el) =>
      el.getAttribute('data-exception-id'),
    );
    expect(ids).toEqual(['TEX-SECOND', 'TEX-FIRST']);
  });
});

describe('E3 Workstreams', () => {
  it('A all Green; B PKG+BLD Yellow HVAC Green; C HVAC Red; G/H HVAC Red PKG Yellow', () => {
    renderView('A');
    for (const el of document.querySelectorAll('[data-workstream-status]')) {
      expect(el).toHaveAttribute('data-workstream-status', 'Green');
    }
    expect(screen.getByText('Здание и оболочка')).toBeInTheDocument();
    expect(screen.getByText('Упаковка')).toBeInTheDocument();

    cleanup();
    renderView('B');
    expect(
      document.querySelector('[data-workstream="WS-PKG"]'),
    ).toHaveAttribute('data-workstream-status', 'Yellow');
    expect(
      document.querySelector('[data-workstream="WS-BLD"]'),
    ).toHaveAttribute('data-workstream-status', 'Yellow');
    expect(
      document.querySelector('[data-workstream="WS-HVAC"]'),
    ).toHaveAttribute('data-workstream-status', 'Green');

    cleanup();
    renderView('C');
    expect(
      document.querySelector('[data-workstream="WS-HVAC"]'),
    ).toHaveAttribute('data-workstream-status', 'Red');

    cleanup();
    renderView('G');
    expect(
      document.querySelector('[data-workstream="WS-HVAC"]'),
    ).toHaveAttribute('data-workstream-status', 'Red');
    expect(
      document.querySelector('[data-workstream="WS-PKG"]'),
    ).toHaveAttribute('data-workstream-status', 'Yellow');

    cleanup();
    renderView('H');
    expect(
      document.querySelector('[data-workstream="WS-PKG"]'),
    ).toHaveAttribute('data-workstream-status', 'Yellow');
  });
});

describe('E3 Trend', () => {
  it('A empty; B/C/F/G authored values; no diff engine cues', () => {
    renderView('A');
    expect(
      screen.getByText(/изменений к предыдущему состоянию нет/i),
    ).toBeInTheDocument();

    cleanup();
    renderView('B');
    expect(screen.getByText(/Упаковка: прогноз срыва FAT/)).toBeInTheDocument();

    cleanup();
    renderView('C');
    expect(
      screen.getByText(/HVAC \/ старт производства: \+21/),
    ).toBeInTheDocument();

    cleanup();
    renderView('F');
    expect(
      screen.getByText(/HVAC \/ PS без изменения прогноза/),
    ).toBeInTheDocument();

    cleanup();
    renderView('G');
    expect(screen.getByText(/HVAC Δ снижен до \+14/)).toBeInTheDocument();
    expect(screen.getByText(/Упаковка стабилизирована/)).toBeInTheDocument();
  });
});

describe('E3 Decisions', () => {
  it('pre-F empty; F renders RU mapping + honesty; G AcceptDateSlip', () => {
    renderView('C');
    expect(
      screen.getByText(/Требуется управленческое решение/i),
    ).toBeInTheDocument();
    expect(screen.queryByText('DEC-001')).not.toBeInTheDocument();

    cleanup();
    renderView('F');
    expect(
      screen.getAllByText('Приоритизировать восстановление сроков').length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Соколов Андрей Викторович')).toBeInTheDocument();
    // WFI recovery decision → UTL lead (not mechanical HVAC/SH-ENG).
    expect(screen.getByText('Фёдоров Сергей Михайлович')).toBeInTheDocument();
    expect(screen.queryByText('Смирнов Павел Андреевич')).not.toBeInTheDocument();
    expect(
      screen.getByText(/не означает автоматическое устранение/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/ещё не устранение задержки/i)).toBeInTheDocument();
    expect(
      within(projectStatusBlock()).getByText('Красный'),
    ).toBeInTheDocument();
    expect(
      projectStatusBlock().querySelector('[data-ps-delta]'),
    ).toHaveTextContent('+21 день');

    cleanup();
    renderView('G');
    expect(screen.getByText('Принять сдвиг даты')).toBeInTheDocument();
    expect(screen.getByText('Попов Алексей Дмитриевич')).toBeInTheDocument();
    expect(screen.getByText('Фёдоров Сергей Михайлович')).toBeInTheDocument();
    expect(screen.queryByText('Смирнов Павел Андреевич')).not.toBeInTheDocument();
    expect(screen.getAllByText(/не задан/).length).toBeGreaterThanOrEqual(1);
  });
});

describe('E3-R2 Management Attention (in Summary)', () => {
  it('Closed alone does not create active issue attention on calm path; C counts Open', () => {
    renderView('A');
    expect(
      screen.getByText(/Нет активных управленческих сигналов/i),
    ).toBeInTheDocument();

    cleanup();
    renderView('C');
    const issues = document.querySelector('[data-attention="issues"]');
    expect(issues).toHaveAttribute('data-attention-count', '1');
    const risks = document.querySelector('[data-attention="risks"]');
    expect(risks).toHaveAttribute('data-attention-count', '1');
  });
});

describe('E3-R2 Executive Timeline', () => {
  it('renders fixed subset with WFI, excludes AUT-BMS; asOf + PS bands', () => {
    renderView('A');
    const strip = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    expect(strip).toBeTruthy();
    expect(strip.querySelector('[data-snapshot-label]')).toBeTruthy();
    expect(strip.querySelector('[data-snapshot-marker]')).toBeTruthy();
    expect(strip.querySelector('[data-milestone-label="MS-UTL-WFI"]')).toBeTruthy();

    expect(strip.querySelector('[data-milestone-label="MS-PS"]')).toBeTruthy();
    expect(
      strip.querySelector('[data-milestone-label="MS-AUT-BMS"]'),
    ).toBeNull();
    expect(strip.querySelector('[data-ps-delta-label]')).toHaveTextContent(
      /по плану/i,
    );
    expect(strip.querySelector('[data-ps-variance-span]')).toBeNull();

    cleanup();
    renderView('C');
    const stripC = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    expect(stripC.querySelector('[data-ps-variance-span]')).toBeTruthy();
    expect(stripC.querySelector('[data-ps-delta-label]')).toHaveTextContent(
      /\+21/,
    );
    expect(
      stripC.querySelector('[data-milestone-marker="MS-BLD-ENCL"]'),
    ).toHaveAttribute('data-milestone-rag', 'Green');

    cleanup();
    renderView('G');
    const stripG = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    expect(stripG.querySelector('[data-ps-delta-label]')).toHaveTextContent(
      /\+14/,
    );
  });
});

describe('E3-R5 Dashboard canvas + timeline interaction', () => {
  it('renders e3-r5 canvas modules without inventing RAG', () => {
    renderView('C');
    expect(document.querySelector('[data-dashboard="r2-u1"]')).toBeTruthy();
    expect(
      document.querySelector('[data-dashboard-block="project-status"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-dashboard-block="top-exceptions"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-dashboard-block="management-attention"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-dashboard-block="workstream-readiness"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-dashboard-block="executive-timeline"]'),
    ).toBeTruthy();
  });

  it('uses fixed-html marker triggers for approved subset (not SVG polygons)', () => {
    renderView('A');
    const subset = [
      'MS-BLD-EXC',
      'MS-BLD-FND',
      'MS-BLD-STR',
      'MS-BLD-ENCL',
      'MS-CLN-RDY',
      'MS-HVAC-IQ',
      'MS-UTL-WFI',
      'MS-PRD-INST',
      'MS-PKG-SAT',
      'MS-COM-OQ',
      'MS-COM-GO',
      'MS-PS',
    ];
    for (const id of subset) {
      const trigger = document.querySelector(
        `[data-milestone-marker="${id}"]`,
      ) as HTMLElement | null;
      expect(trigger).toBeTruthy();
      expect(trigger?.tagName).toBe('BUTTON');
      expect(
        trigger?.closest('[data-marker-geometry="fixed-html"]'),
      ).toBeTruthy();
      expect(trigger?.closest('svg')).toBeNull();
    }
  });

  it('A/B coincident PS; C baseline+forecast +21; G/H +14', () => {
    renderView('A');
    expect(
      document.querySelector('[data-ps-forecast-marker="coincident"]'),
    ).toBeTruthy();
    expect(document.querySelector('[data-ps-variance-span]')).toBeNull();

    cleanup();
    renderView('B');
    expect(
      document.querySelector('[data-ps-forecast-marker="coincident"]'),
    ).toBeTruthy();

    cleanup();
    renderView('C');
    expect(
      document.querySelector('[data-ps-baseline-marker="true"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-ps-forecast-marker="true"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-ps-delta-label]'),
    ).toHaveTextContent(/\+21/);

    cleanup();
    renderView('G');
    expect(
      document.querySelector('[data-ps-delta-label]'),
    ).toHaveTextContent(/\+14/);
  });

  it('focus shows tooltip; click opens popover with entity and schedule links', async () => {
    const user = userEvent.setup();
    renderView('C');
    const hvac = document.querySelector(
      '[data-milestone-marker="MS-HVAC-IQ"]',
    ) as HTMLButtonElement;
    expect(hvac).toBeTruthy();

    hvac.focus();
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    expect(screen.getByRole('tooltip')).toHaveTextContent(/Готовность HVAC/);
    expect(screen.getByRole('tooltip')).toHaveTextContent(/В норме/);

    await user.click(hvac);
    await waitFor(() => {
      expect(document.querySelector('[data-timeline-popover]')).toBeTruthy();
    });
    expect(document.querySelector('[data-timeline-tooltip]')).toBeNull();
    const pop = document.querySelector(
      '[data-timeline-popover]',
    ) as HTMLElement;
    expect(pop.getAttribute('role')).not.toBe('dialog');
    expect(within(pop).getByRole('link', { name: /Открыть веху/i })).toHaveAttribute(
      'href',
      '/milestones/MS-HVAC-IQ',
    );
    expect(
      within(pop).getByRole('link', { name: /Подробный график/i }),
    ).toHaveAttribute('href', '/schedule');
    expect(hvac).toHaveAttribute('aria-expanded', 'true');
  });

  it('keyboard Enter/Space open popover; Escape closes and returns focus; outside closes', async () => {
    const user = userEvent.setup();
    renderView('C');
    const ps = document.querySelector(
      '[data-ps-forecast-marker="true"]',
    ) as HTMLButtonElement;
    ps.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(document.querySelector('[data-timeline-popover]')).toBeTruthy();
    });
    let pop = document.querySelector('[data-timeline-popover]') as HTMLElement;
    expect(pop).toHaveTextContent(/Запуск производства/);
    expect(pop).toHaveTextContent(/\+21/);
    expect(within(pop).getByRole('link', { name: /Открыть веху/i })).toHaveAttribute(
      'href',
      '/milestones/MS-PS',
    );

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[data-timeline-popover]')).toBeNull();
    });
    expect(document.activeElement).toBe(ps);

    await user.keyboard(' ');
    await waitFor(() => {
      expect(document.querySelector('[data-timeline-popover]')).toBeTruthy();
    });
    pop = document.querySelector('[data-timeline-popover]') as HTMLElement;
    expect(pop).toBeTruthy();

    await user.click(document.body);
    await waitFor(() => {
      expect(document.querySelector('[data-timeline-popover]')).toBeNull();
    });
  });
});

describe('E3-R2 Decisions absent', () => {
  it('A does not render a large empty decisions card', () => {
    renderView('A');
    expect(
      document.querySelector('[data-dashboard-block="decisions"]'),
    ).toBeNull();
  });
});

describe('E3 regression snapshot switch', () => {
  it('failed switch keeps previous Dashboard (no mixed state)', async () => {
    const user = userEvent.setup();
    fetchDashboardOverview.mockImplementationOnce(async () => overview('A'));
    let rejectB!: (e: Error) => void;
    fetchDashboardOverview.mockImplementationOnce(
      () =>
        new Promise<DashboardOverview>((_r, rej) => {
          rejectB = rej;
        }),
    );

    renderDashboard();
    await waitFor(() => {
      expect(
        within(projectStatusBlock()).getByText('Зелёный'),
      ).toBeInTheDocument();
    });

    await selectDemoSnapshot(user, 'B');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Снимок/ })).toHaveAttribute('aria-busy', 'true');
    });
    expect(
      screen.getByRole('button', { name: /Снимок A.*активный/ }),
    ).toBeInTheDocument();

    rejectB(new Error('network'));
    await waitFor(() => {
      expect(
        screen.getByText(/Не удалось переключить снимок/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /Снимок A.*активный/ }),
    ).toBeInTheDocument();
    expect(
      within(projectStatusBlock()).getByText('Зелёный'),
    ).toBeInTheDocument();
  });
});
