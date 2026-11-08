import { describe, expect, it } from 'vitest';
import { resolveExecutiveTimelineExperimentModel } from '@/lib/dashboard/executive-timeline-experiment';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import {
  buildExecutiveTimelineOption,
  resolveEchartsVisibleLabelIds,
} from './executive-timeline-echarts';

const colors = {
  axis: '#000',
  axisMuted: '#444',
  text: '#111',
  textMuted: '#666',
  textSecondary: '#333',
  ragGreen: '#0a0',
  ragRed: '#a00',
  bandFill: '#ccc',
  bandBorder: '#888',
  snapshotLine: '#06c',
  tooltipBg: '#fff',
  tooltipBorder: '#ccc',
};

describe('executive-timeline-echarts densify', () => {
  it('enables labelLayout hideOverlap/moveOverlap on milestone series', () => {
    const data = dashboardOverviewFixture('C');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const option = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(['MS-BLD-EXC', 'MS-BLD-ENCL']),
      data.milestones.map((m) => ({ id: m.id, programId: m.programId ?? null })),
    );
    const series = (option.series as { name?: string; labelLayout?: { hideOverlap?: boolean; moveOverlap?: string } }[]).find(
      (s) => s.name === 'milestones',
    );
    expect(series?.labelLayout?.hideOverlap).toBe(true);
    expect(series?.labelLayout?.moveOverlap).toBe('shiftY');
  });

  it('lane-aware visible set does not keep every overview id on dense C', () => {
    const data = dashboardOverviewFixture('C');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const meta = data.milestones.map((m) => ({
      id: m.id,
      programId: m.programId ?? null,
    }));
    const visible = resolveEchartsVisibleLabelIds(
      model.ordinaryPoints,
      false,
      meta,
    );
    expect(visible.size).toBeLessThanOrEqual(12);
    expect(visible.size).toBeGreaterThan(0);
  });

  it('grid left/right match ECHARTS_PLOT_INSETS used by snapshot chrome', () => {
    const data = dashboardOverviewFixture('A');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const option = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(),
      data.milestones.map((m) => ({ id: m.id, programId: m.programId ?? null })),
    );
    const grid = option.grid as { left?: number; right?: number };
    expect(grid.left).toBe(128);
    expect(grid.right).toBe(10);
  });

  it('uses program display names on y categories and permanent PS labels', () => {
    const data = dashboardOverviewFixture('C');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const meta = data.milestones.map((m) => ({
      id: m.id,
      programId: m.programId ?? null,
    }));
    const visible = resolveEchartsVisibleLabelIds(model.ordinaryPoints, false);
    const option = buildExecutiveTimelineOption(model, colors, visible, meta);
    const yData = (option.yAxis as { data?: string[] }).data ?? [];
    expect(yData.some((label) => label.includes('PRG-'))).toBe(false);
    expect(yData.length).toBeGreaterThan(0);

    const psSeries = (option.series as { name?: string; data?: unknown[] }[]).find(
      (s) => s.name === 'ps-endpoints',
    );
    const labels = (psSeries?.data ?? []).map(
      (d) => (d as { label?: { formatter?: string } }).label?.formatter ?? '',
    );
    expect(labels.some((t) => /План|ПС|Прогноз/.test(t))).toBe(true);
    expect(labels.some((t) => /\d{2}\.\d{2}\.\d{4}|день|по плану|\+/.test(t))).toBe(
      true,
    );
  });

  it('keeps execution phase markLine label', () => {
    const data = dashboardOverviewFixture('A');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const option = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(),
      data.milestones.map((m) => ({ id: m.id, programId: m.programId ?? null })),
    );
    const milestones = (option.series as { name?: string; markLine?: { data?: { label?: { formatter?: string } }[] } }[]).find(
      (s) => s.name === 'milestones',
    );
    const formatters =
      milestones?.markLine?.data?.map((d) => d.label?.formatter).filter(Boolean) ??
      [];
    expect(formatters).toContain('Исполнение');
  });
});
