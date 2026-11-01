/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { SnapshotSelector } from './snapshot-selector';

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

function dash(snapshotId: 'A' | 'B' | 'C'): DashboardOverview {
  const delayed = snapshotId !== 'A';
  return {
    snapshotId,
    scenarioAsOfDate:
      snapshotId === 'A'
        ? '2027-02-15'
        : snapshotId === 'B'
          ? '2027-03-01'
          : '2027-03-02',
    project: {
      id: 'PRJ-01',
      name: 'Строительство фармацевтического завода',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: delayed ? '2027-10-06' : '2027-09-15',
      productionStartVariance: {
        subject: 'production_start',
        baselineDate: '2027-09-15',
        forecastDate: delayed ? '2027-10-06' : '2027-09-15',
        deltaDays: delayed ? 21 : 0,
      },
    },
    equipment: {
      id: 'EQ-HVAC-01',
      critical: true,
      status: delayed ? 'Delayed' : 'OnTrack',
      baselineDelivery: '2027-05-15',
      forecastDelivery: delayed ? '2027-06-05' : '2027-05-15',
      deliveryVariance: {
        subject: 'equipment_delivery',
        baselineDate: '2027-05-15',
        forecastDate: delayed ? '2027-06-05' : '2027-05-15',
        deltaDays: delayed ? 21 : 0,
      },
    },
    issue: null,
    risk: {
      id: 'RISK-001',
      rag: delayed ? 'Red' : 'Green',
      equipmentId: 'EQ-HVAC-01',
      milestoneId: 'MS-PS',
      issueId: null,
    },
    milestone: {
      id: 'MS-PS',
      name: 'Ready for production',
      rag: delayed ? 'Red' : 'Green',
      baselineDate: '2027-09-15',
      forecastDate: delayed ? '2027-10-06' : '2027-09-15',
    },
    decisionPanelState: 'absent',
    decision: null,
    directEdges: [],
    derivedImpact: {
      rule: 'BR-004',
      equipmentDeliveryDeltaDays: delayed ? 21 : 0,
      productionStartDeltaDays: delayed ? 21 : 0,
      kind: delayed ? 'aligned_slip' : 'none',
    },
    decisionHonesty: null,
  };
}

function renderSelector() {
  return render(
    <SnapshotProvider>
      <SnapshotSelector />
    </SnapshotProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  fetchDashboardOverview.mockImplementation(
    async (_id: string, snapshot: 'A' | 'B' | 'C') => dash(snapshot),
  );
});

describe('SnapshotSelector keyboard (R2)', () => {
  it('uses roving tabindex after bootstrap; aria-checked tracks active', async () => {
    renderSelector();
    await waitFor(() => {
      expect(fetchDashboardOverview).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked();
    });

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    const tabbable = radios.filter((r) => r.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
  });

  it('ArrowRight moves focus and selects; wraps C→A', async () => {
    const user = userEvent.setup();
    renderSelector();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );

    const group = screen.getByRole('radiogroup', { name: 'Демо-снимок' });
    within(group).getByRole('radio', { name: /Снимок A/ }).focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Снимок B, активный/ }),
      ).toBeChecked(),
    );
    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Снимок C, активный/ }),
      ).toBeChecked(),
    );
    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );
  });

  it('Home → A and End → C', async () => {
    const user = userEvent.setup();
    renderSelector();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );
    const group = screen.getByRole('radiogroup');
    within(group).getByRole('radio', { name: /Снимок A/ }).focus();
    await user.keyboard('{End}');
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Снимок C, активный/ }),
      ).toBeChecked(),
    );
    await user.keyboard('{Home}');
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );
  });

  it('during loading: aria-disabled; focus retained; activation blocked', async () => {
    const user = userEvent.setup();
    let resolveB!: (p: DashboardOverview) => void;
    fetchDashboardOverview.mockImplementationOnce(async () => dash('A'));
    fetchDashboardOverview.mockImplementationOnce(
      () =>
        new Promise<DashboardOverview>((r) => {
          resolveB = r;
        }),
    );

    renderSelector();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );

    const group = screen.getByRole('radiogroup');
    within(group).getByRole('radio', { name: /Снимок A/ }).focus();
    await user.keyboard('{ArrowRight}');

    await waitFor(() => {
      expect(group).toHaveAttribute('aria-busy', 'true');
    });

    const radios = within(group).getAllByRole('radio');
    for (const r of radios) {
      expect(r).not.toBeDisabled();
      expect(r).toHaveAttribute('aria-disabled', 'true');
    }
    expect(radios[0]).toBeChecked();

    const callsWhileLoading = fetchDashboardOverview.mock.calls.length;
    await user.keyboard('{ArrowRight}');
    expect(fetchDashboardOverview.mock.calls.length).toBe(callsWhileLoading);
    expect(radios[2]).toHaveFocus();

    resolveB(dash('B'));
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Снимок B, активный/ }),
      ).toBeChecked(),
    );
  });

  it('Enter on already-active does not refetch', async () => {
    const user = userEvent.setup();
    renderSelector();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Снимок A, активный/ }),
      ).toBeChecked(),
    );

    const group = screen.getByRole('radiogroup');
    await user.click(within(group).getByRole('radio', { name: /Снимок B/ }));
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Снимок B, активный/ }),
      ).toBeChecked(),
    );
    const callsAfterClick = fetchDashboardOverview.mock.calls.length;
    within(group).getByRole('radio', { name: /Снимок B/ }).focus();
    await user.keyboard('{Enter}');
    expect(fetchDashboardOverview.mock.calls.length).toBe(callsAfterClick);
  });
});
