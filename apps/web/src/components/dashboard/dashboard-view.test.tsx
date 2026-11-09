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
      projectId: 'PRT-01',
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
      projectId: 'PRT-01',
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
  it('summary production-start heading is Запуск производства', () => {
    renderView('01');
    const zone = document.querySelector(
      '[data-summary-zone="production-start"]',
    );
    expect(zone).toBeTruthy();
    expect(zone?.textContent ?? '').toMatch(/Запуск производства/);
    expect(zone?.textContent ?? '').not.toMatch(/Запуск портфеля/);
  });

  it('A: Green, PS baseline, delta 0', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(projectStatusBlock()).toBeTruthy();
    });
    const block = projectStatusBlock();
    expect(within(block).getByText('В норме')).toBeInTheDocument();
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
        screen.getByRole('button', { name: /Снимок 01.*активный/ }),
      ).toBeInTheDocument(),
    );
    await selectDemoSnapshot(user, '02');
    await waitFor(() => {
      expect(
        within(projectStatusBlock()).getByText('Требует внимания'),
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
        screen.getByRole('button', { name: /Снимок 01.*активный/ }),
      ).toBeInTheDocument(),
    );
    await selectDemoSnapshot(user, '03');
    await waitFor(() => {
      expect(
        within(projectStatusBlock()).getByText('Критично'),
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
        screen.getByRole('button', { name: /Снимок 01.*активный/ }),
      ).toBeInTheDocument(),
    );
    await selectDemoSnapshot(user, '07');
    await waitFor(() => {
      expect(
        within(projectStatusBlock()).getByText('Критично'),
      ).toBeInTheDocument();
    });
    let block = projectStatusBlock();
    expect(block.querySelector('[data-ps-dates]')).toHaveTextContent('29.09.2027');
    expect(block.querySelector('[data-ps-delta]')).toHaveTextContent('+14 дней');

    await selectDemoSnapshot(user, '08');
    await waitFor(() => {
      expect(
        within(projectStatusBlock()).getByText('Критично'),
      ).toBeInTheDocument();
    });
    block = projectStatusBlock();
    expect(block.querySelector('[data-ps-delta]')).toHaveTextContent('+14 дней');
  });
});

describe('E3 Top Exceptions', () => {
  it('A empty/calm; C HVAC/PS first; backend order preserved; human link labels', async () => {
    renderView('01');
    expect(screen.getByText(/критических исключений нет/i)).toBeInTheDocument();

    cleanup();
    renderView('03');
    const exceptions = document.querySelectorAll('[data-exception-id]');
    expect(exceptions[0]).toHaveAttribute('data-exception-id', 'TEX-03-HVAC-PS');
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
          data={overview('02', {
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
    renderView('01');
    for (const el of document.querySelectorAll('[data-program-status]')) {
      expect(el).toHaveAttribute('data-program-status', 'Yellow');
    }
    expect(screen.getByText('Строительство')).toBeInTheDocument();

    cleanup();
    renderView('02');
    expect(
      document.querySelector('[data-program="PRG-CON"]'),
    ).toHaveAttribute('data-program-status', 'Yellow');

    cleanup();
    renderView('03');
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
    renderView('01');
    expect(
      screen.getByText(/изменений к предыдущему состоянию нет/i),
    ).toBeInTheDocument();

    cleanup();
    renderView('02');
    expect(screen.getByText(/Упаковка: прогноз срыва FAT/)).toBeInTheDocument();

    cleanup();
    renderView('03');
    expect(
      screen.getByText(/HVAC \/ старт производства: \+21/),
    ).toBeInTheDocument();

    cleanup();
    renderView('06');
    expect(
      screen.getByText(/HVAC \/ PS без изменения прогноза/),
    ).toBeInTheDocument();

    cleanup();
    renderView('07');
    expect(screen.getByText(/HVAC Δ снижен до \+14/)).toBeInTheDocument();
    expect(screen.getByText(/Упаковка стабилизирована/)).toBeInTheDocument();
  });
});

describe('E3 Decisions', () => {
  it('pre-F empty; F renders RU mapping + honesty; G AcceptDateSlip', () => {
    renderView('03');
    expect(
      screen.getByRole('heading', { name: 'Прогноз и решение' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Требуется решение')).toBeInTheDocument();
    expect(screen.queryByText('DEC-001')).not.toBeInTheDocument();

    cleanup();
    renderView('06');
    expect(
      screen.getByRole('heading', { name: 'Прогноз и решение' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Объект контроля: Запуск производства/)).toBeInTheDocument();
    expect(screen.getByText('Связанное решение')).toBeInTheDocument();
    expect(
      screen.getByText(/Приоритизировать восстановление сроков/),
    ).toBeInTheDocument();
    expect(screen.getByText('DEC-001')).toBeInTheDocument();
    expect(screen.getByText('Не начато')).toBeInTheDocument();
    expect(
      screen.getByText(/Демонстрационный отчёт исполнителя/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Действия не начаты/)).toBeInTheDocument();
    expect(screen.queryByText(/\bDelayed\b|\bRed\b|\bOnTrack\b/)).toBeNull();
    expect(
      within(projectStatusBlock()).getByText('Критично'),
    ).toBeInTheDocument();
    expect(
      projectStatusBlock().querySelector('[data-ps-delta]'),
    ).toHaveTextContent('+21 день');
    expect(
      document.querySelector('[data-decision-footer="cta"]'),
    ).toBeTruthy();

    cleanup();
    renderView('07');
    expect(screen.getByText('Связанное решение')).toBeInTheDocument();
    expect(
      screen.getByText(/Приоритизировать восстановление сроков/),
    ).toBeInTheDocument();
    expect(screen.getByText('В работе')).toBeInTheDocument();
    expect(screen.getByText(/Действия начаты/)).toBeInTheDocument();
  });
});

describe('E3-R2 Management Attention (in Summary)', () => {
  it('Closed alone does not create active issue attention on calm path; C counts Open', () => {
    renderView('01');
    expect(
      screen.getByText(/Нет активных управленческих сигналов/i),
    ).toBeInTheDocument();

    cleanup();
    renderView('03');
    const issues = document.querySelector('[data-attention="issues"]');
    expect(issues).toHaveAttribute('data-attention-count', '1');
    const risks = document.querySelector('[data-attention="risks"]');
    expect(risks).toHaveAttribute('data-attention-count', '1');
  });
});

describe('E3-R2 Executive Timeline', () => {
  it('renders ECharts card with asOf chrome; excludes AUT-BMS from model', async () => {
    renderView('01');
    const strip = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    expect(strip).toBeTruthy();
    await waitFor(() => {
      expect(strip.querySelector('[data-timeline-renderer="echarts"]')).toBeTruthy();
    });
    expect(strip.querySelector('[data-snapshot-label]')).toBeTruthy();
    expect(strip.querySelector('[data-timeline-ps-legend]')).toBeNull();
    expect(strip.querySelector('[data-timeline-meta-row]')).toBeNull();
    expect(resolveProductionStartBand(overview('01')).coincident).toBe(true);
    expect(strip.querySelector('[data-timeline-renderer-toggle]')).toBeNull();
    const idsA = overview('01').executiveMilestoneIds ?? [];
    expect(idsA).toContain('MS-UTL-WFI');
    expect(idsA).not.toContain('MS-AUT-BMS');

    cleanup();
    renderView('03');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(resolveProductionStartBand(overview('03')).deltaDays).toBe(21);

    cleanup();
    renderView('07');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(resolveProductionStartBand(overview('07')).deltaDays).toBe(14);
  });

  it('ECharts host keeps universe toolbar; chart body is echarts; no meta row', async () => {
    renderView('03');
    const strip = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    expect(strip.querySelector('[data-timeline-scope-filter]')).toBeTruthy();
    expect(strip.querySelector('[data-timeline-phase-context]')).toBeNull();
    expect(strip.querySelector('[data-timeline-meta-row]')).toBeNull();
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
    renderView('03');
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
    renderView('01');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(document.querySelector('[data-timeline-renderer-toggle]')).toBeNull();
    expect(document.querySelector('[data-milestone-marker]')).toBeNull();
    expect(document.querySelector('[data-ps-cluster]')).toBeNull();
  });

  it('A/B coincident PS; C baseline+forecast +21; G +14 via model (no DOM legend)', async () => {
    renderView('01');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(document.querySelector('[data-timeline-ps-legend]')).toBeNull();
    expect(resolveProductionStartBand(overview('01')).coincident).toBe(true);

    cleanup();
    renderView('02');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(resolveProductionStartBand(overview('02')).coincident).toBe(true);

    cleanup();
    renderView('03');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(resolveProductionStartBand(overview('03')).deltaDays).toBe(21);

    cleanup();
    renderView('07');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    expect(resolveProductionStartBand(overview('07')).deltaDays).toBe(14);
  });

  it('timeline card header has filters without schedule cross-link or meta row', async () => {
    renderView('03');
    await waitFor(() => {
      expect(
        document.querySelector('[data-timeline-renderer="echarts"]'),
      ).toBeTruthy();
    });
    const section = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    expect(
      section.querySelector('a[href="/schedule"]'),
    ).toBeNull();
    expect(
      section.querySelector('[data-timeline-universe-toolbar]'),
    ).toBeTruthy();
    expect(
      section.querySelector('[data-timeline-scope-filter]'),
    ).toHaveAttribute('aria-label', 'Объём');
    expect(
      section.querySelector('[data-timeline-program-filter]'),
    ).toHaveAttribute('aria-label', 'Программа');
    expect(section.querySelector('[data-timeline-meta-row]')).toBeNull();
    expect(section.querySelector('[data-timeline-ps-legend]')).toBeNull();
  });
});

describe('E3-R2 Decisions absent', () => {
  it('A does not render a large empty decisions card', () => {
    renderView('01');
    expect(
      document.querySelector('[data-dashboard-block="decisions"]'),
    ).toBeNull();
  });
});

describe('E3 regression snapshot switch', () => {
  it('failed switch keeps previous Dashboard (no mixed state)', async () => {
    const user = userEvent.setup();
    fetchDashboardOverview.mockImplementationOnce(async () => overview('01'));
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
        within(projectStatusBlock()).getByText('В норме'),
      ).toBeInTheDocument();
    });

    await selectDemoSnapshot(user, '02');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Снимок/ })).toHaveAttribute('aria-busy', 'true');
    });
    expect(
      screen.getByRole('button', { name: /Снимок 01.*активный/ }),
    ).toBeInTheDocument();

    rejectB(new Error('network'));
    await waitFor(() => {
      expect(
        screen.getByText(/Не удалось переключить снимок/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /Снимок 01.*активный/ }),
    ).toBeInTheDocument();
    expect(
      within(projectStatusBlock()).getByText('В норме'),
    ).toBeInTheDocument();
  });
});
