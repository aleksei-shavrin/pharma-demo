import { describe, expect, it } from 'vitest';
import { resolveExecutiveTimelineExperimentModel } from '@/lib/dashboard/executive-timeline-experiment';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import {
  TIMELINE_CAPTION_BLOCK_PX,
  TIMELINE_CAPTION_GAP_PX,
  TIMELINE_FORECAST_LABEL_DISTANCE_PX,
  TIMELINE_GRID_BOTTOM_PX,
  TIMELINE_GRID_TOP_PX,
  TIMELINE_SNAPSHOT_CAPTION_TOP_PX,
} from '@/lib/dashboard/timeline-caption-gap';
import {
  buildExecutiveTimelineOption,
  psEndpointLabelAlign,
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
  laneBandFill: '#eef2f6',
  snapshotLine: '#06c',
  tooltipBg: '#fff',
  tooltipBorder: '#ccc',
};

describe('executive-timeline-echarts densify', () => {
  it('enables labelLayout hideOverlap/moveOverlap on milestone series', () => {
    const data = dashboardOverviewFixture('03');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const option = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(['MS-BLD-EXC', 'MS-BLD-ENCL']),
      data.milestones.map((m) => ({ id: m.id, programId: m.programId ?? null })),
    );
    const series = (
      option.series as {
        name?: string;
        labelLayout?: { hideOverlap?: boolean; moveOverlap?: string };
      }[]
    ).find((s) => s.name === 'milestones' || s.name === 'milestones-red');
    expect(series?.labelLayout?.hideOverlap).toBe(true);
    expect(series?.labelLayout?.moveOverlap).toBe('shiftY');
  });

  it('caption geometry: shared gap; gridTop = block + gap; compact bottom; forecast distance = gap', () => {
    expect(TIMELINE_FORECAST_LABEL_DISTANCE_PX).toBe(TIMELINE_CAPTION_GAP_PX);
    expect(TIMELINE_GRID_TOP_PX).toBe(
      TIMELINE_CAPTION_BLOCK_PX + TIMELINE_CAPTION_GAP_PX,
    );
    expect(TIMELINE_GRID_BOTTOM_PX).toBe(28);
    // Fallback top before measure; runtime bottom-aligns via convertToPixel.
    expect(TIMELINE_SNAPSHOT_CAPTION_TOP_PX).toBeGreaterThanOrEqual(0);
    expect(TIMELINE_SNAPSHOT_CAPTION_TOP_PX).toBeLessThanOrEqual(24);
    const data = dashboardOverviewFixture('03');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const option = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(),
      data.milestones.map((m) => ({ id: m.id, programId: m.programId ?? null })),
    );
    expect((option.grid as { top?: number }).top).toBe(TIMELINE_GRID_TOP_PX);
    expect((option.grid as { bottom?: number }).bottom).toBe(
      TIMELINE_GRID_BOTTOM_PX,
    );
    const ps = (option.series as { name?: string; clip?: boolean; data?: { label?: { distance?: number; align?: string; overflow?: string; formatter?: string } }[] }[]).find(
      (s) => s.name === 'ps-endpoints',
    );
    expect(ps?.clip).toBe(false);
    const forecast = ps?.data?.find((d) =>
      String(d.label?.formatter ?? '').startsWith('Прогноз'),
    );
    expect(forecast?.label?.distance).toBe(TIMELINE_CAPTION_GAP_PX);
    expect(forecast?.label?.overflow).toBe('none');
    expect(forecast?.label?.align).toBe('right');
    expect(String(forecast?.label?.formatter)).toMatch(/\+21/);
    expect(String(forecast?.label?.formatter)).not.toMatch(/\(\+21,$/);
    expect(String(forecast?.label?.formatter)).not.toMatch(/\n/);
  });

  it('narrow host wraps red forecast label without dropping Δ', () => {
    const data = dashboardOverviewFixture('03');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const option = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(),
      data.milestones.map((m) => ({ id: m.id, programId: m.programId ?? null })),
      false,
      true,
      360,
    );
    const ps = (
      option.series as {
        name?: string;
        data?: {
          label?: {
            formatter?: string;
            align?: string;
            overflow?: string;
            width?: number;
            lineHeight?: number;
          };
        }[];
      }[]
    ).find((s) => s.name === 'ps-endpoints');
    const forecast = ps?.data?.find((d) =>
      String(d.label?.formatter ?? '').startsWith('Прогноз'),
    );
    expect(forecast?.label?.align).toBe('right');
    expect(forecast?.label?.overflow).toBe('none');
    expect(forecast?.label?.width).toBe(72);
    expect(forecast?.label?.lineHeight).toBe(12);
    expect(String(forecast?.label?.formatter)).toBe(
      'Прогноз\n06.10.2027\n(+21 день)',
    );
  });

  it('psEndpointLabelAlign grows inward near plot edges', () => {
    expect(psEndpointLabelAlign(90, 0, 100)).toBe('right');
    expect(psEndpointLabelAlign(10, 0, 100)).toBe('left');
    expect(psEndpointLabelAlign(50, 0, 100)).toBe('center');
  });

  it('tooltip: one bold full title, StatusPill HTML, outline Перейти, escaped', () => {
    const data = dashboardOverviewFixture('03');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const option = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(['MS-HVAC-IQ']),
      data.milestones.map((m) => ({ id: m.id, programId: m.programId ?? null })),
    );
    const tip = option.tooltip as {
      enterable?: boolean;
      hideDelay?: number;
      formatter?: (p: unknown) => string;
    };
    expect(tip.enterable).toBe(true);
    expect((tip.hideDelay ?? 0) >= 300).toBe(true);
    const html = tip.formatter?.({
      data: {
        name: 'HVAC',
        title: 'Демо <script>IQ',
        entityId: 'MS-HVAC-IQ',
        forecastDate: '2027-06-01',
        rag: 'Red',
        programLabel: 'Инженерия',
      },
    });
    expect(html).toBeTruthy();
    expect(html).toContain('<strong>Демо &lt;script&gt;IQ</strong>');
    expect(html).not.toMatch(/<strong>HVAC<\/strong>/);
    expect(html).not.toMatch(/<strong>[\s\S]*?<\/strong>[\s\S]*Демо/);
    expect(html).toContain('data-status-pill="rag"');
    expect(html).toContain('Веха критична');
    expect(html).toContain('>Перейти</a>');
    expect(html).toContain('focus=milestone%3AMS-HVAC-IQ');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toMatch(/max-width:min\(22rem/);
  });

  it('uses effectScatter for Red unless reduced motion', () => {
    const data = dashboardOverviewFixture('03');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const meta = data.milestones.map((m) => ({
      id: m.id,
      programId: m.programId ?? null,
    }));
    const animated = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(),
      meta,
      false,
    );
    const reduced = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(),
      meta,
      true,
    );
    const redA = (
      animated.series as { name?: string; type?: string }[]
    ).find((s) => s.name === 'milestones-red');
    const redB = (
      reduced.series as { name?: string; type?: string }[]
    ).find((s) => s.name === 'milestones-red');
    expect(redA?.type).toBe('effectScatter');
    expect(redB?.type).toBe('scatter');
  });

  it('xAxis domain extends past nominal horizon when PS forecast is later', () => {
    const data = dashboardOverviewFixture('03');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const option = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(),
      data.milestones.map((m) => ({ id: m.id, programId: m.programId ?? null })),
    );
    const x = option.xAxis as { min?: number; max?: number };
    expect(x.max).toBeGreaterThan(Date.UTC(2027, 9, 6));
  });

  it('lane-aware visible set does not keep every overview id on dense C', () => {
    const data = dashboardOverviewFixture('03');
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
    const data = dashboardOverviewFixture('01');
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
    const data = dashboardOverviewFixture('03');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const meta = data.milestones.map((m) => ({
      id: m.id,
      programId: m.programId ?? null,
    }));
    const visible = resolveEchartsVisibleLabelIds(model.ordinaryPoints, false);
    const option = buildExecutiveTimelineOption(model, colors, visible, meta);
    type YEntry = string | { value: string; textStyle?: { fontWeight?: string } };
    const yData = ((option.yAxis as { data?: YEntry[] }).data ?? []).map((e) =>
      typeof e === 'string' ? e : e.value,
    );
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

  it('portfolio lane none: bold «Портфель» + splitArea when highlight; off when filter=none; forecast kept', () => {
    const data = dashboardOverviewFixture('04');
    const model = resolveExecutiveTimelineExperimentModel(data);
    const meta = data.milestones.map((m) => ({
      id: m.id,
      programId: m.programId ?? null,
    }));
    const withPortfolio = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(),
      meta,
      false,
      true,
    );
    type YEntry = string | { value: string; textStyle?: { fontWeight?: string } };
    const yAxis = withPortfolio.yAxis as {
      data?: YEntry[];
      splitArea?: {
        show?: boolean;
        interval?: number;
        areaStyle?: { color?: string[] };
      };
    };
    const yEntries = yAxis.data ?? [];
    const portfolioIdx = yEntries.findIndex(
      (e) => typeof e !== 'string' && e.value === 'Портфель',
    );
    expect(portfolioIdx).toBeGreaterThanOrEqual(0);
    const portfolioY = yEntries[portfolioIdx] as {
      value: string;
      textStyle?: { fontWeight?: string };
    };
    expect(portfolioY.value).toBe('Портфель');
    expect(portfolioY.textStyle?.fontWeight).toBe('bold');
    expect(yAxis.splitArea?.show).toBe(true);
    expect(yAxis.splitArea?.interval).toBe(0);
    const splitColors = yAxis.splitArea?.areaStyle?.color ?? [];
    expect(splitColors[portfolioIdx]).toBe(colors.laneBandFill);

    const noWash = buildExecutiveTimelineOption(
      model,
      colors,
      new Set(),
      meta,
      false,
      false,
    );
    const noWashAxis = noWash.yAxis as {
      data?: YEntry[];
      splitArea?: { show?: boolean; areaStyle?: { color?: string[] } };
    };
    const noWashEntries = noWashAxis.data ?? [];
    const noWashIdx = noWashEntries.findIndex(
      (e) => typeof e !== 'string' && e.value === 'Портфель',
    );
    expect(noWashIdx).toBeGreaterThanOrEqual(0);
    expect(
      (noWashEntries[noWashIdx] as { textStyle?: { fontWeight?: string } })
        .textStyle?.fontWeight,
    ).toBe('bold');
    expect(noWashAxis.splitArea?.show).toBe(false);

    const milestones = (
      withPortfolio.series as {
        name?: string;
        markArea?: { data?: { xAxis?: string; yAxis?: string }[][] };
      }[]
    ).find((s) => s.name === 'milestones');
    expect(
      milestones?.markArea?.data?.some((pair) => pair[0]?.yAxis),
    ).toBeFalsy();
    expect(
      milestones?.markArea?.data?.some((pair) => pair[0]?.xAxis),
    ).toBe(true);

    const programOnlyMeta = meta.map((m) => ({
      ...m,
      programId: m.programId && m.programId !== 'none' ? m.programId : 'PRG-CON',
    }));
    const programModel = {
      ...model,
      ordinaryPoints: model.ordinaryPoints.filter((p) => {
        const ms = programOnlyMeta.find((m) => m.id === p.id);
        return (ms?.programId ?? 'PRG-CON') !== 'none';
      }),
    };
    const filtered = buildExecutiveTimelineOption(
      programModel,
      colors,
      new Set(),
      programOnlyMeta,
    );
    const yFilteredAxis = filtered.yAxis as {
      data?: YEntry[];
      splitArea?: { show?: boolean };
    };
    const yFiltered = (yFilteredAxis.data ?? []).map((e) =>
      typeof e === 'string' ? e : e.value,
    );
    expect(yFiltered.some((l) => l === 'Портфель')).toBe(false);
    expect(yFilteredAxis.splitArea?.show).toBe(false);
  });

  it('keeps execution phase markLine label', () => {
    const data = dashboardOverviewFixture('01');
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
