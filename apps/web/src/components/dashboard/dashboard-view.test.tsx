/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, useState, type ComponentType } from 'react';
import type { DashboardOverview } from '@/lib/api-client';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import DashboardPage from '@/app/page';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { projectCostFixture } from '@/lib/test/project-cost-fixture';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { selectDemoSnapshot } from '@/lib/test/select-snapshot';
import { resolveProductionStartBand } from '@/lib/dashboard/executive-timeline';
import { formatDateRu } from '@/lib/format/ru';

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

vi.mock('next/dynamic', () => ({
  default: (
    loader: () => Promise<
      | ComponentType<{ model: { snapshotId: string; band: { deltaLabel: string; baselineDate: string; forecastDate: string; coincident: boolean }; textSummary?: string }; milestoneMeta: unknown }>
      | {
          default: ComponentType<{
            model: {
              snapshotId: string;
              band: {
                deltaLabel: string;
                baselineDate: string;
                forecastDate: string;
                coincident: boolean;
              };
              textSummary?: string;
            };
            milestoneMeta: unknown;
          }>;
        }
    >,
  ) => {
    function Lazy(props: {
      model: {
        snapshotId: string;
        band: {
          deltaLabel: string;
          baselineDate: string;
          forecastDate: string;
          coincident: boolean;
        };
        textSummary?: string;
      };
      milestoneMeta: unknown;
    }) {
      const [Comp, setComp] = useState<ComponentType<{
        model: typeof props.model;
        milestoneMeta: unknown;
      }> | null>(null);
      useEffect(() => {
        void loader().then((mod) => {
          const resolved =
            typeof mod === 'function' ? mod : mod.default;
          setComp(() => resolved);
        });
      }, []);
      if (!Comp) return <div data-testid="dynamic-loading" />;
      return <Comp {...props} />;
    }
    return Lazy;
  },
}));

vi.mock('./executive-timeline-echarts', () => ({
  ExecutiveTimelineEcharts: ({
    model,
  }: {
    model: {
      snapshotId: string;
      band: {
        deltaLabel: string;
        baselineDate: string;
        forecastDate: string;
        coincident: boolean;
      };
      textSummary?: string;
    };
  }) => (
    <div
      data-timeline-renderer="echarts"
      data-timeline-layout="experiment-echarts-lanes"
      data-testid="echarts-renderer"
    >
      <div data-snapshot-label>Дата снимка</div>
      <div data-timeline-ps-legend="true">
        План запуска: {formatDateRu(model.band.baselineDate)} Прогноз:{' '}
        {formatDateRu(model.band.forecastDate)} Δ: {model.band.deltaLabel}
        {model.band.coincident ? ' По плану' : ''}
      </div>
      <div role="img" aria-label={model.textSummary ?? `echarts:${model.snapshotId}`} />
    </div>
  ),
}));

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
    expect(within(block).getByText('Запуск портфеля')).toBeInTheDocument();
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
      document.querySelector('[data-program="PRG-CON"]'),
    ).toHaveAttribute('data-program-status', 'Yellow');
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

describe('E3 Programs', () => {
  it('A/B programs stay Yellow; C construction and engineering are Red', () => {
    renderView('A');
    for (const el of document.querySelectorAll('[data-program-status]')) {
      expect(el).toHaveAttribute('data-program-status', 'Yellow');
    }
    expect(screen.getByText('Строительство')).toBeInTheDocument();

    cleanup();
    renderView('B');
    expect(
      document.querySelector('[data-program="PRG-CON"]'),
    ).toHaveAttribute('data-program-status', 'Yellow');

    cleanup();
    renderView('C');
    expect(
      document.querySelector('[data-program="PRG-CON"]'),
    ).toHaveAttribute('data-program-status', 'Red');
    expect(
      document.querySelector('[data-program="PRG-ENG"]'),
    ).toHaveAttribute('data-program-status', 'Red');
    expect(
      document.querySelector('[data-program="PRG-DSN"]'),
    ).toHaveAttribute('data-program-status', 'Yellow');
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
      screen.getByRole('heading', { name: 'Требуется решение' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('DEC-001')).not.toBeInTheDocument();

    cleanup();
    renderView('F');
    expect(
      screen.getByRole('heading', { name: 'Решения' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Записанные решения/)).toBeInTheDocument();
    expect(screen.queryByText('Решение записано')).not.toBeInTheDocument();
    expect(document.querySelector('[data-decision-honesty]')).toBeNull();
    expect(
      screen.getAllByText('Приоритизировать восстановление сроков').length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Соколов Андрей Викторович')).toBeInTheDocument();
    // WFI recovery decision → UTL lead (not mechanical HVAC/SH-ENG).
    expect(screen.getByText('Фёдоров Сергей Михайлович')).toBeInTheDocument();
    expect(screen.queryByText('Смирнов Павел Андреевич')).not.toBeInTheDocument();
    expect(
      screen.getByText(/не снимает отклонение автоматически/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/исполнение не отслеживается/i)).toBeInTheDocument();
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
  it('renders ECharts card with asOf chrome + PS legend; excludes AUT-BMS from model', async () => {
    renderView('A');
    const strip = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    expect(strip).toBeTruthy();
    await waitFor(() => {
      expect(strip.querySelector('[data-timeline-renderer="echarts"]')).toBeTruthy();
    });
    expect(strip.querySelector('[data-snapshot-label]')).toBeTruthy();
    expect(strip.querySelector('[data-timeline-ps-legend]')?.textContent).toMatch(
      /по плану/i,
    );
    expect(strip.querySelector('[data-timeline-renderer-toggle]')).toBeNull();
    const idsA = overview('A').executiveMilestoneIds ?? [];
    expect(idsA).toContain('MS-UTL-WFI');
    expect(idsA).not.toContain('MS-AUT-BMS');

    cleanup();
    renderView('C');
    const stripC = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    await waitFor(() => {
      expect(
        stripC.querySelector('[data-timeline-ps-legend]')?.textContent,
      ).toMatch(/\+21/);
    });
    expect(resolveProductionStartBand(overview('C')).deltaDays).toBe(21);

    cleanup();
    renderView('G');
    const stripG = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    await waitFor(() => {
      expect(
        stripG.querySelector('[data-timeline-ps-legend]')?.textContent,
      ).toMatch(/\+14/);
    });
  });

  it('ECharts host keeps universe chrome; chart body is echarts', async () => {
    renderView('C');
    const strip = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    expect(strip.querySelector('[data-timeline-scope-filter]')).toBeTruthy();
    expect(strip.querySelector('[data-timeline-phase-context]')).toBeTruthy();
    await waitFor(() => {
      expect(strip.querySelector('[data-timeline-body="echarts"]')).toBeTruthy();
      expect(
        strip.querySelector('[data-timeline-layout="experiment-echarts-lanes"]'),
      ).toBeTruthy();
    });
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
      document.querySelector('[data-dashboard-block="program-readiness"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-dashboard-block="executive-timeline"]'),
    ).toBeTruthy();
  });

  it('ECharts-only timeline: no strip markers / toggle', async () => {
    renderView('A');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(document.querySelector('[data-timeline-renderer-toggle]')).toBeNull();
    expect(document.querySelector('[data-milestone-marker]')).toBeNull();
    expect(document.querySelector('[data-ps-cluster]')).toBeNull();
  });

  it('A/B coincident PS; C baseline+forecast +21; G +14 via legend/model', async () => {
    renderView('A');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-ps-legend]')?.textContent,
      ).toMatch(/по плану/i);
    });
    expect(resolveProductionStartBand(overview('A')).coincident).toBe(true);

    cleanup();
    renderView('B');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-ps-legend]')?.textContent,
      ).toMatch(/по плану/i);
    });

    cleanup();
    renderView('C');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-ps-legend]')?.textContent,
      ).toMatch(/\+21/);
    });
    expect(resolveProductionStartBand(overview('C')).deltaDays).toBe(21);

    cleanup();
    renderView('G');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-ps-legend]')?.textContent,
      ).toMatch(/\+14/);
    });
  });

  it('timeline section keeps schedule cross-link', async () => {
    renderView('C');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(
      document.querySelector(
        '[data-dashboard-block="executive-timeline"] a[href="/schedule"]',
      ),
    ).toBeTruthy();
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
