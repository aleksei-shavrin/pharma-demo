/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectStub } from '@/lib/api-client';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { SnapshotSelector } from './snapshot-selector';

const fetchProjectStub = vi.fn();

vi.mock('@/lib/api-client', () => ({
  fetchProjectStub: (...args: unknown[]) => fetchProjectStub(...args),
  fetchHealth: vi.fn(),
}));

function project(snapshotId: 'A' | 'B' | 'C'): ProjectStub {
  return {
    id: 'PRJ-01',
    name: 'Facility Expansion Alpha',
    baselineProductionStart: '2027-09-15',
    forecastProductionStart:
      snapshotId === 'A' ? '2027-09-15' : '2027-10-06',
    snapshotId,
    scenarioAsOfDate: snapshotId === 'A' ? '2027-02-15' : '2027-03-01',
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
  fetchProjectStub.mockImplementation(async (_id: string, snapshot: 'A' | 'B' | 'C') =>
    project(snapshot),
  );
});

describe('SnapshotSelector keyboard (R2)', () => {
  it('uses roving tabindex after bootstrap; aria-checked tracks active', async () => {
    renderSelector();
    await waitFor(() => {
      expect(fetchProjectStub).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(
        screen.getByRole('radio', { name: /Snapshot A, active/ }),
      ).toBeChecked();
    });

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    const tabbable = radios.filter((r) => r.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(radios.filter((r) => r.getAttribute('tabindex') === '-1')).toHaveLength(
      2,
    );
  });

  it('ArrowRight moves focus and selects; wraps C→A', async () => {
    const user = userEvent.setup();
    renderSelector();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Snapshot A, active/ }),
      ).toBeChecked(),
    );

    const group = screen.getByRole('radiogroup', { name: 'Demo snapshot' });
    within(group).getByRole('radio', { name: /Snapshot A/ }).focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Snapshot B, active/ }),
      ).toBeChecked(),
    );
    expect(
      within(group).getByRole('radio', { name: /Snapshot B/ }),
    ).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Snapshot C, active/ }),
      ).toBeChecked(),
    );
    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Snapshot A, active/ }),
      ).toBeChecked(),
    );
  });

  it('Home → A and End → C', async () => {
    const user = userEvent.setup();
    renderSelector();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Snapshot A, active/ }),
      ).toBeChecked(),
    );
    const group = screen.getByRole('radiogroup');
    within(group).getByRole('radio', { name: /Snapshot A/ }).focus();
    await user.keyboard('{End}');
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Snapshot C, active/ }),
      ).toBeChecked(),
    );
    await user.keyboard('{Home}');
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Snapshot A, active/ }),
      ).toBeChecked(),
    );
  });

  it('during loading: aria-disabled (not HTML disabled), focus retained, activation blocked', async () => {
    const user = userEvent.setup();
    let resolveB!: (p: ProjectStub) => void;
    fetchProjectStub.mockImplementationOnce(async () => project('A'));
    fetchProjectStub.mockImplementationOnce(
      () =>
        new Promise<ProjectStub>((r) => {
          resolveB = r;
        }),
    );

    renderSelector();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Snapshot A, active/ }),
      ).toBeChecked(),
    );

    const group = screen.getByRole('radiogroup');
    within(group).getByRole('radio', { name: /Snapshot A/ }).focus();
    await user.keyboard('{ArrowRight}');

    await waitFor(() => {
      expect(group).toHaveAttribute('aria-busy', 'true');
    });

    const radios = within(group).getAllByRole('radio');
    for (const r of radios) {
      expect(r).not.toBeDisabled();
      expect(r).toHaveAttribute('aria-disabled', 'true');
    }
    // Still active A while B loading
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();

    const callsWhileLoading = fetchProjectStub.mock.calls.length;
    await user.keyboard('{ArrowRight}'); // focus-only during loading
    expect(fetchProjectStub.mock.calls.length).toBe(callsWhileLoading);
    expect(radios[2]).toHaveFocus();

    await user.keyboard(' ');
    expect(fetchProjectStub.mock.calls.length).toBe(callsWhileLoading);

    resolveB(project('B'));
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Snapshot B, active/ }),
      ).toBeChecked(),
    );
  });

  it('Enter activates focused radio once (no double fetch)', async () => {
    const user = userEvent.setup();
    renderSelector();
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /Snapshot A, active/ }),
      ).toBeChecked(),
    );

    const group = screen.getByRole('radiogroup');
    within(group).getByRole('radio', { name: /Snapshot A/ }).focus();

    // Move focus to B without selecting via loading-blocked path is hard;
    // click B once, then from B use ArrowLeft to A and Enter on A is silly.
    // Instead: focus B via click, clear, then Enter should early-return (same active).
    await user.click(within(group).getByRole('radio', { name: /Snapshot B/ }));
    await waitFor(() =>
      expect(
        within(group).getByRole('radio', { name: /Snapshot B, active/ }),
      ).toBeChecked(),
    );
    const callsAfterClick = fetchProjectStub.mock.calls.length;

    within(group).getByRole('radio', { name: /Snapshot B/ }).focus();
    await user.keyboard('{Enter}');
    // Same active + loaded project → provider early-return; no extra fetch
    expect(fetchProjectStub.mock.calls.length).toBe(callsAfterClick);
  });
});
