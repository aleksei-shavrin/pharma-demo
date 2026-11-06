/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState, type ComponentType } from 'react';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { ExecutiveTimelineExperimentHost } from './executive-timeline-experiment-host';

vi.mock('next/dynamic', () => ({
  default: (
    loader: () => Promise<
      | ComponentType<{ model: { snapshotId: string } }>
      | { default: ComponentType<{ model: { snapshotId: string } }> }
    >,
  ) => {
    function Lazy(props: { model: { snapshotId: string } }) {
      const [Comp, setComp] = useState<ComponentType<{
        model: { snapshotId: string };
      }> | null>(null);
      useEffect(() => {
        void loader().then((mod) => {
          const resolved =
            typeof mod === 'function'
              ? mod
              : mod.default;
          setComp(() => resolved);
        });
      }, []);
      if (!Comp) return <div data-testid="dynamic-loading" />;
      return <Comp {...props} />;
    }
    return Lazy;
  },
}));

vi.mock('./executive-timeline-vis', () => ({
  ExecutiveTimelineVis: ({
    model,
  }: {
    model: { snapshotId: string };
  }) => (
    <div data-timeline-renderer="vis" data-testid="vis-renderer">
      vis:{model.snapshotId}
    </div>
  ),
}));

vi.mock('./executive-timeline-echarts', () => ({
  ExecutiveTimelineEcharts: ({
    model,
  }: {
    model: { snapshotId: string };
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

describe('ExecutiveTimelineExperimentHost', () => {
  afterEach(() => {
    cleanup();
  });

  it('по умолчанию показывает текущую шкалу (вариант 1)', () => {
    renderHost('A');
    const section = document.querySelector(
      '[data-dashboard-block="executive-timeline"]',
    ) as HTMLElement;
    expect(
      section.querySelector('[data-timeline-renderer="current"]'),
    ).toBeTruthy();
    expect(
      within(section).getByRole('button', {
        name: 'Текущая шкала',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('переключает 1→2→3 без смены блока секции', async () => {
    const user = userEvent.setup();
    renderHost('C');
    const section = () =>
      document.querySelector(
        '[data-dashboard-block="executive-timeline"]',
      ) as HTMLElement;

    await user.click(
      within(section()).getByRole('button', { name: 'vis-timeline' }),
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="vis-renderer"]'),
      ).toHaveTextContent('vis:C');
    });
    expect(section()).toBeTruthy();

    await user.click(
      within(section()).getByRole('button', { name: 'Apache ECharts' }),
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="echarts-renderer"]'),
      ).toHaveTextContent('echarts:C');
    });

    await user.click(
      within(section()).getByRole('button', { name: 'Текущая шкала' }),
    );
    expect(
      document.querySelector('[data-timeline-renderer="current"]'),
    ).toBeTruthy();
  });
});
