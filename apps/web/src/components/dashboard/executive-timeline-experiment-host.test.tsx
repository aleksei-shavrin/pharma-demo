/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import { useEffect, useState, type ComponentType } from 'react';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { ExecutiveTimelineExperimentHost } from './executive-timeline-experiment-host';

vi.mock('next/dynamic', () => ({
  default: (
    loader: () => Promise<
      | ComponentType<{ model: { snapshotId: string }; milestoneMeta: unknown }>
      | {
          default: ComponentType<{
            model: { snapshotId: string };
            milestoneMeta: unknown;
          }>;
        }
    >,
  ) => {
    function Lazy(props: {
      model: { snapshotId: string };
      milestoneMeta: unknown;
    }) {
      const [Comp, setComp] = useState<ComponentType<{
        model: { snapshotId: string };
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
    model: { snapshotId: string };
    milestoneMeta: unknown;
  }) => (
    <div data-timeline-renderer="echarts" data-testid="echarts-renderer">
      echarts:{model.snapshotId}
    </div>
  ),
}));

function renderHost(snapshotId: 'A' | 'C' = 'A') {
  return render(
    <SnapshotProvider>
      <ExecutiveTimelineExperimentHost
        data={dashboardOverviewFixture(snapshotId)}
      />
    </SnapshotProvider>,
  );
}

describe('ExecutiveTimelineExperimentHost (ECharts-only)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders ECharts without renderer toggle', async () => {
    renderHost('A');
    const section = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    expect(section).toBeTruthy();
    expect(
      section.querySelector('[data-timeline-renderer-toggle]'),
    ).toBeNull();
    expect(
      within(section).queryByRole('button', { name: 'Текущая шкала' }),
    ).toBeNull();
    expect(
      within(section).queryByRole('button', { name: 'vis-timeline' }),
    ).toBeNull();
    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="echarts-renderer"]'),
      ).toHaveTextContent('echarts:A');
    });
    expect(section.querySelector('[data-timeline-scope-filter]')).toBeTruthy();
  });

  it('keeps universe chrome filters with ECharts body', async () => {
    renderHost('C');
    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="echarts-renderer"]'),
      ).toHaveTextContent('echarts:C');
    });
    expect(
      document.querySelector('[data-timeline-phase-context]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-timeline-body="echarts"]'),
    ).toBeTruthy();
  });
});
