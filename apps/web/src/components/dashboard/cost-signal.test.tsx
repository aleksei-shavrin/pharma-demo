/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  render,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CostSignal } from './cost-signal';
import { projectCostFixture } from '@/lib/test/project-cost-fixture';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';

const fetchProjectCosts = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>(
      '@/lib/api-client',
    );
  return {
    ...actual,
    fetchProjectCosts: (...args: unknown[]) => fetchProjectCosts(...args),
  };
});

function overviewFor(snapshotId: SnapshotId) {
  return {
    snapshotId,
    scenarioAsOfDate: '2027-01-01',
    projectId: 'PRT-01',
    project: projectCostFixture(snapshotId),
    workstreams: [],
    equipment: [],
    reconciliation: {
      workstreamEacSumRub: 0,
      projectLevelForecastRub: 0,
    },
  };
}

afterEach(() => {
  cleanup();
  fetchProjectCosts.mockReset();
});

beforeEach(() => {
  fetchProjectCosts.mockImplementation(async (_pid: string, snap: SnapshotId) =>
    overviewFor(snap),
  );
});

describe('CostSignal snapshot consistency (R2-U1-R1)', () => {
  it('invalidates ready C cost when committed snapshot switches to O', async () => {
    let resolveO: ((v: unknown) => void) | undefined;
    const oPending = new Promise((resolve) => {
      resolveO = resolve;
    });

    fetchProjectCosts.mockImplementation(
      async (_pid: string, snap: SnapshotId) => {
        if (snap === '03') return overviewFor('03');
        if (snap === '15') return oPending.then(() => overviewFor('15'));
        return overviewFor(snap);
      },
    );

    const { rerender } = render(<CostSignal snapshotId="03" />);
    await waitFor(() => {
      expect(
        document.querySelector('[data-cost-signal-state="ready"]'),
      ).toBeTruthy();
    });
    expect(
      document.querySelector('[data-cost-signal]')?.getAttribute('data-eac'),
    ).toBe(String(projectCostFixture('03').eacRub));

    rerender(<CostSignal snapshotId="15" />);
    await waitFor(() => {
      const el = document.querySelector('[data-cost-signal]');
      expect(el?.getAttribute('data-cost-signal-state')).toBe('loading');
      expect(el?.getAttribute('data-eac')).toBeNull();
      expect(el?.getAttribute('data-cost-for-snapshot')).toBe('15');
    });

    await act(async () => {
      resolveO?.(overviewFor('15'));
    });
    await waitFor(() => {
      const el = document.querySelector('[data-cost-signal]');
      expect(el?.getAttribute('data-cost-signal-state')).toBe('ready');
      expect(el?.getAttribute('data-eac')).toBe(
        String(projectCostFixture('15').eacRub),
      );
    });
  });

  it('stale C response after O request does not commit', async () => {
    let resolveC: ((v: unknown) => void) | undefined;
    const cLate = new Promise((resolve) => {
      resolveC = resolve;
    });

    fetchProjectCosts.mockImplementation(
      async (_pid: string, snap: SnapshotId) => {
        if (snap === '03') return cLate;
        return overviewFor(snap);
      },
    );

    const { rerender } = render(<CostSignal snapshotId="03" />);
    expect(
      document
        .querySelector('[data-cost-signal]')
        ?.getAttribute('data-cost-signal-state'),
    ).toBe('loading');

    rerender(<CostSignal snapshotId="15" />);
    await waitFor(() => {
      expect(
        document
          .querySelector('[data-cost-signal]')
          ?.getAttribute('data-cost-for-snapshot'),
      ).toBe('15');
    });
    await waitFor(() => {
      expect(
        document
          .querySelector('[data-cost-signal]')
          ?.getAttribute('data-cost-signal-state'),
      ).toBe('ready');
    });
    const oEac = String(projectCostFixture('15').eacRub);
    expect(
      document.querySelector('[data-cost-signal]')?.getAttribute('data-eac'),
    ).toBe(oEac);

    await act(async () => {
      resolveC?.(overviewFor('03'));
    });
    expect(
      document.querySelector('[data-cost-signal]')?.getAttribute('data-eac'),
    ).toBe(oEac);
  });

  it('failed O leaves error/no-data — not previous C values', async () => {
    fetchProjectCosts.mockImplementation(
      async (_pid: string, snap: SnapshotId) => {
        if (snap === '03') return overviewFor('03');
        throw new Error('cost failed');
      },
    );

    const { rerender } = render(<CostSignal snapshotId="03" />);
    await waitFor(() => {
      expect(
        document.querySelector('[data-cost-signal-state="ready"]'),
      ).toBeTruthy();
    });

    rerender(<CostSignal snapshotId="15" />);
    await waitFor(() => {
      const el = document.querySelector('[data-cost-signal]');
      expect(el?.getAttribute('data-cost-signal-state')).toBe('error');
      expect(el?.getAttribute('data-eac')).toBeNull();
    });
  });

  it('response snapshotId mismatch is not committed', async () => {
    fetchProjectCosts.mockResolvedValue({
      ...overviewFor('03'),
      snapshotId: '01',
      project: projectCostFixture('01'),
    });

    render(<CostSignal snapshotId="03" />);
    await waitFor(() => {
      // stays loading — mismatch ignored
      expect(
        document
          .querySelector('[data-cost-signal]')
          ?.getAttribute('data-cost-signal-state'),
      ).toBe('loading');
    });
    expect(
      document.querySelector('[data-cost-signal]')?.getAttribute('data-eac'),
    ).toBeNull();
  });
});
