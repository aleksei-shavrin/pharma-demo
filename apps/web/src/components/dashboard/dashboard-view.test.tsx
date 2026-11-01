/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import DashboardPage from '@/app/page';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';

const fetchDashboardOverview = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...args: unknown[]) =>
      fetchDashboardOverview(...args),
    fetchHealth: vi.fn(),
  };
});

function overview(
  snapshotId: 'A' | 'B' | 'C',
  overrides: Partial<DashboardOverview> = {},
): DashboardOverview {
  if (snapshotId === 'A') {
    return {
      snapshotId: 'A',
      scenarioAsOfDate: '2027-02-15',
      project: {
        id: 'PRJ-01',
        name: 'Строительство фармацевтического завода',
        baselineProductionStart: '2027-09-15',
        forecastProductionStart: '2027-09-15',
        productionStartVariance: {
          subject: 'production_start',
          baselineDate: '2027-09-15',
          forecastDate: '2027-09-15',
          deltaDays: 0,
        },
      },
      equipment: {
        id: 'EQ-HVAC-01',
        critical: true,
        status: 'OnTrack',
        baselineDelivery: '2027-05-15',
        forecastDelivery: '2027-05-15',
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: '2027-05-15',
          forecastDate: '2027-05-15',
          deltaDays: 0,
        },
      },
      issue: null,
      risk: {
        id: 'RISK-001',
        rag: 'Green',
        equipmentId: 'EQ-HVAC-01',
        milestoneId: 'MS-PS',
        issueId: null,
      },
      milestone: {
        id: 'MS-PS',
        name: 'Ready for production',
        rag: 'Green',
        baselineDate: '2027-09-15',
        forecastDate: '2027-09-15',
      },
      decisionPanelState: 'absent',
      decision: null,
      directEdges: [
        {
          kind: 'direct',
          fromType: 'equipment',
          fromId: 'EQ-HVAC-01',
          toType: 'risk',
          toId: 'RISK-001',
        },
        {
          kind: 'direct',
          fromType: 'risk',
          fromId: 'RISK-001',
          toType: 'milestone',
          toId: 'MS-PS',
        },
      ],
      derivedImpact: {
        rule: 'BR-004',
        equipmentDeliveryDeltaDays: 0,
        productionStartDeltaDays: 0,
        kind: 'none',
      },
      decisionHonesty: null,
      ...overrides,
    };
  }

  if (snapshotId === 'B') {
    return {
      snapshotId: 'B',
      scenarioAsOfDate: '2027-03-01',
      project: {
        id: 'PRJ-01',
        name: 'Строительство фармацевтического завода',
        baselineProductionStart: '2027-09-15',
        forecastProductionStart: '2027-10-06',
        productionStartVariance: {
          subject: 'production_start',
          baselineDate: '2027-09-15',
          forecastDate: '2027-10-06',
          deltaDays: 21,
        },
      },
      equipment: {
        id: 'EQ-HVAC-01',
        critical: true,
        status: 'Delayed',
        baselineDelivery: '2027-05-15',
        forecastDelivery: '2027-06-05',
        deliveryVariance: {
          subject: 'equipment_delivery',
          baselineDate: '2027-05-15',
          forecastDate: '2027-06-05',
          deltaDays: 21,
        },
      },
      issue: {
        id: 'ISS-001',
        title: 'HVAC long-lead delivery slip',
        status: 'Open',
        equipmentId: 'EQ-HVAC-01',
        milestoneId: 'MS-PS',
      },
      risk: {
        id: 'RISK-001',
        rag: 'Red',
        equipmentId: 'EQ-HVAC-01',
        milestoneId: 'MS-PS',
        issueId: 'ISS-001',
      },
      milestone: {
        id: 'MS-PS',
        name: 'Ready for production',
        rag: 'Red',
        baselineDate: '2027-09-15',
        forecastDate: '2027-10-06',
      },
      decisionPanelState: 'needed',
      decision: null,
      directEdges: [],
      derivedImpact: {
        rule: 'BR-004',
        equipmentDeliveryDeltaDays: 21,
        productionStartDeltaDays: 21,
        kind: 'aligned_slip',
      },
      decisionHonesty: null,
      ...overrides,
    };
  }

  return {
    snapshotId: 'C',
    scenarioAsOfDate: '2027-03-02',
    project: {
      id: 'PRJ-01',
      name: 'Строительство фармацевтического завода',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: '2027-10-06',
      productionStartVariance: {
        subject: 'production_start',
        baselineDate: '2027-09-15',
        forecastDate: '2027-10-06',
        deltaDays: 21,
      },
    },
    equipment: {
      id: 'EQ-HVAC-01',
      critical: true,
      status: 'Delayed',
      baselineDelivery: '2027-05-15',
      forecastDelivery: '2027-06-05',
      deliveryVariance: {
        subject: 'equipment_delivery',
        baselineDate: '2027-05-15',
        forecastDate: '2027-06-05',
        deltaDays: 21,
      },
    },
    issue: {
      id: 'ISS-001',
      title: 'HVAC long-lead delivery slip',
      status: 'Mitigating',
      equipmentId: 'EQ-HVAC-01',
      milestoneId: 'MS-PS',
    },
    risk: {
      id: 'RISK-001',
      rag: 'Red',
      equipmentId: 'EQ-HVAC-01',
      milestoneId: 'MS-PS',
      issueId: 'ISS-001',
    },
    milestone: {
      id: 'MS-PS',
      name: 'Ready for production',
      rag: 'Red',
      baselineDate: '2027-09-15',
      forecastDate: '2027-10-06',
    },
    decisionPanelState: 'recorded',
    decision: {
      id: 'DEC-001',
      type: 'PrioritizeRecovery',
      ownerRole: 'SH-006',
      dueDate: '2027-03-20',
      note: 'Expedite vendor / alternate lane',
    },
    directEdges: [],
    derivedImpact: {
      rule: 'BR-004',
      equipmentDeliveryDeltaDays: 21,
      productionStartDeltaDays: 21,
      kind: 'aligned_slip',
    },
    decisionHonesty: { recoveryExecuted: false },
    ...overrides,
  };
}

function renderDashboard() {
  return render(
    <SnapshotProvider>
      <SnapshotSelector />
      <DashboardPage />
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
    async (_id: string, snapshot: 'A' | 'B' | 'C') => overview(snapshot),
  );
});

describe('Dashboard narratives (I3 RU corrective)', () => {
  it('A: по плану, без DEC, без exception-chain', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(
        screen.getByText(/Поставка оборудования: без отклонения/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Запуск производства: без отклонения/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/решение не требуется/i)).toBeInTheDocument();
    expect(screen.queryByText('DEC-001')).not.toBeInTheDocument();
    expect(screen.getByText('По плану')).toBeInTheDocument();
    expect(
      screen.getAllByText(/Готовность к производству/).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Ready for production/)).not.toBeInTheDocument();
    expect(screen.queryByText(/DOC-BA-015|BR-004|BR-006|Domain edge/i)).not.toBeInTheDocument();
  });

  it('B: +21 день, открыта, красный, решение требуется', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );
    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() => {
      expect(
        screen.getByText(/Поставка оборудования: \+21 день/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Запуск производства: \+21 день/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Открыта')).toBeInTheDocument();
    expect(
      screen.getAllByText(
        /Задержка поставки HVAC с длительным сроком изготовления/,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Готовность к производству/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Риск: красный')).toBeInTheDocument();
    expect(screen.getByText('Веха: красная')).toBeInTheDocument();
    expect(
      screen.getByText(/Требуется управленческое решение/i),
    ).toBeInTheDocument();
    expect(screen.queryByText('DEC-001')).not.toBeInTheDocument();
    expect(screen.queryByText(/\bPending\b/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/HVAC long-lead delivery slip/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Ready for production/)).not.toBeInTheDocument();
  });

  it('C: DEC + меры; риск/веха красные; прогноз не восстановлен', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );
    await user.click(screen.getByRole('radio', { name: /^Снимок C$/ }));
    await waitFor(() => {
      expect(screen.getAllByText(/DEC-001/).length).toBeGreaterThan(0);
    });
    expect(
      screen.getAllByText(/Приоритизировать восстановление сроков/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(
        /Ускорить работу с поставщиком \/ проработать альтернативный маршрут поставки/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(
        /Задержка поставки HVAC с длительным сроком изготовления/,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Готовность к производству/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Выполняются меры')).toBeInTheDocument();
    expect(screen.getByText('Риск: красный')).toBeInTheDocument();
    expect(screen.getByText('Веха: красная')).toBeInTheDocument();
    expect(
      screen.getByText(/Запуск производства: \+21 день/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ещё не устранение задержки/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/восстановлен[ие]* выполнен/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Recovery completed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\(BR-006\)/)).not.toBeInTheDocument();
    expect(screen.queryByText(/PrioritizeRecovery/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Expedite vendor \/ alternate lane/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/HVAC long-lead delivery slip/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Ready for production/)).not.toBeInTheDocument();
  });

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
        screen.getByText(/Поставка оборудования: без отклонения/i),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() => {
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-busy', 'true');
    });
    expect(
      screen.getByText(/Поставка оборудования: без отклонения/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /Снимок A, активный/ }),
    ).toBeChecked();

    rejectB(new Error('network'));
    await waitFor(() => {
      expect(
        screen.getByText(/Не удалось переключить снимок/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('radio', { name: /Снимок A, активный/ }),
    ).toBeChecked();
    expect(
      screen.getByText(/Поставка оборудования: без отклонения/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Поставка оборудования: \+21 день/i),
    ).not.toBeInTheDocument();
  });
});
