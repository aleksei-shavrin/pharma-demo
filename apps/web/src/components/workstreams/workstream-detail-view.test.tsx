/** @vitest-environment jsdom */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import type { WorkstreamDetail } from '@/lib/api-client';
import { WorkstreamDetailView } from './workstream-detail-view';

function detail(overrides: Partial<WorkstreamDetail> = {}): WorkstreamDetail {
  return {
    snapshotId: 'C',
    scenarioAsOfDate: '2027-03-02',
    projectId: 'PRJ-01',
    workstream: {
      id: 'WS-HVAC',
      nameRu: 'HVAC',
      leadPersonId: 'PER-08',
      sortOrder: 3,
    },
    leadFullNameRu: 'Смирнов Павел Андреевич',
    rag: 'Red',
    attention: {
      redRiskCount: 1,
      delayedCriticalEquipmentCount: 1,
      openOrMitigatingIssueCount: 1,
    },
    equipmentIds: ['EQ-HVAC-01'],
    milestoneIds: ['MS-HVAC-IQ'],
    issueIds: ['ISS-001'],
    riskIds: ['RISK-001'],
    decisionIds: [],
    equipment: [
      {
        id: 'EQ-HVAC-01',
        name: 'Приточная установка AHU (long-lead)',
        critical: true,
        status: 'Delayed',
        baselineDelivery: '2027-05-15',
        forecastDelivery: '2027-06-05',
      },
    ],
    milestones: [
      {
        id: 'MS-HVAC-IQ',
        name: 'Демо-гейт готовности HVAC (IQ)',
        rag: 'Red',
        baselineDate: '2027-06-15',
        forecastDate: '2027-07-06',
      },
    ],
    issues: [
      {
        id: 'ISS-001',
        title: 'Прогноз сдвига поставки long-lead AHU',
        status: 'Open',
      },
    ],
    risks: [
      {
        id: 'RISK-001',
        title: 'Риск срыва старта производства',
        rag: 'Red',
      },
    ],
    decisions: [],
    cost: {
      workstream: 'WS-HVAC',
      approvedControlBudgetRub: 880_000_000,
      actualCostRub: 40_000_000,
      committedCostRub: 200_000_000,
      etcRub: 860_000_000,
      eacRub: 900_000_000,
      vacRub: -20_000_000,
    },
    ...overrides,
  };
}

afterEach(() => cleanup());

describe('WorkstreamDetailView (R2-W1 / W1-R1)', () => {
  it('renders single title without name duplication', () => {
    render(<WorkstreamDetailView data={detail()} />);
    const titles = screen.getAllByRole('heading', { level: 1 });
    expect(titles).toHaveLength(1);
    expect(titles[0]).toHaveTextContent('HVAC');
    expect(screen.getByText(/WS-HVAC/)).toBeInTheDocument();
    // No second body line repeating the same workstream name under the h1
    const header = titles[0]!.parentElement!;
    expect(within(header).queryAllByText('HVAC')).toHaveLength(1);
  });

  it('uses Russian summary labels and contingency copy', () => {
    render(<WorkstreamDetailView data={detail()} />);
    expect(screen.getByText('Красные риски')).toBeInTheDocument();
    expect(screen.getByText('Критические задержки')).toBeInTheDocument();
    expect(screen.getByText('Активные проблемы')).toBeInTheDocument();
    expect(screen.queryByText(/Red risks/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Delayed critical EQ/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Open\/Mitigating issues/i)).not.toBeInTheDocument();
    expect(
      screen.getByText('Резерв проекта не входит в бюджет направления.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Contingency/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/project-level/i)).not.toBeInTheDocument();
  });

  it('keeps all six cost metrics', () => {
    render(<WorkstreamDetailView data={detail()} />);
    const cost = document.querySelector('[data-workstream-block="cost"]')!;
    expect(within(cost as HTMLElement).getByText('Утверждённый бюджет')).toBeInTheDocument();
    expect(within(cost as HTMLElement).getByText('Фактически')).toBeInTheDocument();
    expect(within(cost as HTMLElement).getByText('Обязательства')).toBeInTheDocument();
    expect(within(cost as HTMLElement).getByText('ETC')).toBeInTheDocument();
    expect(within(cost as HTMLElement).getByText('EAC')).toBeInTheDocument();
    expect(within(cost as HTMLElement).getByText('VAC')).toBeInTheDocument();
    expect(screen.getByText(/880 000 000/)).toBeInTheDocument();
  });

  it('keeps attention rows visible in default HVAC C preview', () => {
    render(<WorkstreamDetailView data={detail()} />);
    expect(screen.getByText('EQ-HVAC-01')).toBeInTheDocument();
    expect(screen.getByText('ISS-001')).toBeInTheDocument();
    expect(screen.getByText('RISK-001')).toBeInTheDocument();
    expect(screen.getByText('Красный')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '← К обзору проекта' }),
    ).toHaveAttribute('href', '/');
  });

  it('limits equipment preview and shows overflow action when over limit', async () => {
    const user = userEvent.setup();
    const equipment = Array.from({ length: 6 }, (_, i) => ({
      id: `EQ-X-${i}`,
      name: `Позиция ${i}`,
      critical: i === 0,
      status: (i === 0 ? 'Delayed' : 'OnTrack') as 'Delayed' | 'OnTrack',
      baselineDelivery: '2027-05-01',
      forecastDelivery: `2027-0${(i % 8) + 1}-15`,
    }));
    // Put attention entity last in API order — must still appear in preview
    equipment.push({
      id: 'EQ-HVAC-01',
      name: 'Приточная установка AHU (long-lead)',
      critical: true,
      status: 'Delayed',
      baselineDelivery: '2027-05-15',
      forecastDelivery: '2027-06-05',
    });

    render(
      <WorkstreamDetailView
        data={detail({
          equipment,
          equipmentIds: equipment.map((e) => e.id),
        })}
      />,
    );

    expect(screen.getByText('EQ-HVAC-01')).toBeInTheDocument();
    expect(screen.queryByText('EQ-X-5')).not.toBeInTheDocument();
    const overflow = screen.getByRole('button', {
      name: /Показать все позиции 7/,
    });
    expect(overflow).toBeInTheDocument();

    await user.click(overflow);
    expect(screen.getByText('EQ-X-5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Свернуть' })).toBeInTheDocument();
  });

  it('does not show overflow action when items fit preview', () => {
    render(<WorkstreamDetailView data={detail()} />);
    expect(
      screen.queryByRole('button', { name: /Показать все/ }),
    ).not.toBeInTheDocument();
    expect(document.querySelector('[data-workstream-overflow]')).toBeNull();
  });

  it('uses Russian type labels for issues and risks', () => {
    render(<WorkstreamDetailView data={detail()} />);
    expect(screen.getByText('Проблема')).toBeInTheDocument();
    expect(screen.getByText('Риск')).toBeInTheDocument();
    expect(screen.queryByText('Issue')).not.toBeInTheDocument();
    expect(screen.queryByText('Risk')).not.toBeInTheDocument();
  });

  it('uses normal page scroll mode with header outside PageContent', () => {
    render(<WorkstreamDetailView data={detail()} />);
    const frame = document.querySelector(
      '[data-page="workstream-detail"][data-page-frame="true"]',
    )!;
    const header = frame.querySelector('[data-page-header="true"]')!;
    const content = frame.querySelector('[data-page-content="true"]')!;
    expect(content.getAttribute('data-page-scroll-mode')).toBe('page');
    expect(content.className).toMatch(/overflow-y-auto/);
    expect(content.contains(header)).toBe(false);
    expect(header.contains(screen.getByRole('heading', { level: 1 }))).toBe(
      true,
    );
    expect(content.querySelector('[data-workstream-block="summary"]')).toBeTruthy();
  });

  it('shows Workstream lead as Person link (R2-P1)', () => {
    render(<WorkstreamDetailView data={detail()} />);
    expect(
      screen.getByRole('link', { name: 'Смирнов Павел Андреевич' }),
    ).toHaveAttribute('href', '/people/PER-08');
  });
});
