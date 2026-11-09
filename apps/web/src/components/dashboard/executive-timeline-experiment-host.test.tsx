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

function renderHost(snapshotId: '01' | '03' = '01') {
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
    renderHost('01');
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
    expect(
      within(section).queryByRole('button', { name: 'ECharts' }),
    ).toBeNull();
    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="echarts-renderer"]'),
      ).toHaveTextContent('echarts:01');
    });
    expect(section.querySelector('[data-timeline-scope-filter]')).toBeTruthy();
  });

  it('keeps header controls; no phase/PS legend meta row', async () => {
    renderHost('03');
    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="echarts-renderer"]'),
      ).toHaveTextContent('echarts:03');
    });
    expect(
      document.querySelector('[data-timeline-body="echarts"]'),
    ).toBeTruthy();
    expect(
      document.querySelector(
        '[data-dashboard-block="executive-timeline"] a[href="/schedule"]',
      ),
    ).toBeNull();
    expect(
      document.querySelector(
        '[data-timeline-card-header] [data-timeline-universe-toolbar]',
      ),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-timeline-select-pair]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-timeline-meta-row]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-timeline-phase-context]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-timeline-ps-legend]'),
    ).toBeNull();
    expect(document.body.textContent).not.toMatch(/Предпроект/);
    expect(document.body.textContent).not.toMatch(/План запуска:/);
  });

  it('under ?program=PRG-CON: no meta row; chart without universe filters', async () => {
    (globalThis as { __testSearch?: string }).__testSearch = '?program=PRG-CON';
    try {
      const data = dashboardOverviewFixture('03');
      const withProgram = {
        ...data,
        milestones: data.milestones.map((m) =>
          m.id === 'MS-PS' ||
          m.id === 'MS-BLD-EXC' ||
          m.id === 'MS-CLN-PANEL' ||
          m.id === 'MS-UTL-PWR'
            ? { ...m, programId: 'PRG-CON' }
            : m,
        ),
      };
      render(
        <SnapshotProvider>
          <ExecutiveTimelineExperimentHost data={withProgram} />
        </SnapshotProvider>,
      );
      await waitFor(() => {
        expect(
          document.querySelector('[data-testid="echarts-renderer"]'),
        ).toHaveTextContent('echarts:03');
      });
      expect(
        document.querySelector('[data-timeline-universe-toolbar]'),
      ).toBeNull();
      expect(
        document.querySelector('[data-timeline-meta-row]'),
      ).toBeNull();
      expect(
        document.querySelector('[data-timeline-ps-legend]'),
      ).toBeNull();
      expect(
        document.querySelector('h2')?.textContent,
      ).toMatch(/Вехи программы/);
    } finally {
      delete (globalThis as { __testSearch?: string }).__testSearch;
    }
  });
});
