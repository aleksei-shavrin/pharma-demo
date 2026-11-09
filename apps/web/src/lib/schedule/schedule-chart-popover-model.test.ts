/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import type { ScheduleItem } from '@/lib/api-client';
import { buildScheduleChartPopoverModel } from './schedule-chart-popover-model';

describe('buildScheduleChartPopoverModel', () => {
  it('work forecast omits null baselines/actuals; no Invalid Date; no href', () => {
    const item = {
      kind: 'work',
      id: 'WK-1',
      name: 'Работа A',
      wbs: '1.2.3',
      startDate: '2027-01-10',
      endDate: '2027-02-01',
      status: 'OnSchedule',
      progressPct: 40,
      baselineStart: null,
      baselineEnd: null,
      actualStart: null,
      actualEnd: null,
    } as ScheduleItem;
    const model = buildScheduleChartPopoverModel(item, 'forecast');
    expect(model.title).toBe('Работа A');
    expect(model.href).toBeFalsy();
    expect(model.dateLines.some((l) => l.label.includes('Прогноз'))).toBe(true);
    expect(model.dateLines.some((l) => l.label.includes('База'))).toBe(false);
    expect(model.dateLines.some((l) => /Invalid/i.test(l.value))).toBe(false);
    expect(model.progressLabel).toContain('40');
  });

  it('work actual includes fact when present and skips missing end', () => {
    const item = {
      kind: 'work',
      id: 'WK-2',
      name: 'Работа B',
      startDate: '2027-01-10',
      endDate: '2027-02-01',
      status: 'Delayed',
      progressPct: null,
      actualStart: '2027-01-12',
      actualEnd: null,
      baselineStart: '2027-01-01',
      baselineEnd: '2027-01-20',
    } as ScheduleItem;
    const model = buildScheduleChartPopoverModel(item, 'actual');
    expect(model.statusLabel).toMatch(/задерж/i);
    expect(model.progressLabel).toBeNull();
    expect(model.dateLines.some((l) => l.label.includes('Факт · начало'))).toBe(
      true,
    );
    expect(model.dateLines.some((l) => l.label.includes('Факт · окончание'))).toBe(
      false,
    );
  });

  it('work baseline-only uses baseline dates', () => {
    const item = {
      kind: 'work',
      id: 'WK-3',
      name: 'Работа C',
      startDate: '2027-01-10',
      endDate: '2027-02-01',
      status: 'Completed',
      baselineStart: '2026-12-01',
      baselineEnd: '2026-12-15',
    } as ScheduleItem;
    const model = buildScheduleChartPopoverModel(item, 'baseline');
    expect(model.dateLines.map((l) => l.label).join('|')).toMatch(/База/);
    expect(model.dateLines.every((l) => l.label.startsWith('База'))).toBe(true);
  });

  it('equipment gets detail href; KT milestone does not; MS does', () => {
    const eq = {
      kind: 'equipment_delivery',
      id: 'EQ-1',
      name: 'Линия',
      workstream: 'engineering',
      critical: true,
      status: 'OnTrack',
      baselineDate: '2027-03-01',
      forecastDate: '2027-03-15',
      dateVariance: {
        baselineDate: '2027-03-01',
        forecastDate: '2027-03-15',
        deltaDays: 14,
      },
    } as unknown as ScheduleItem;
    expect(buildScheduleChartPopoverModel(eq, 'forecast').href).toMatch(
      /equipment/,
    );
    expect(
      buildScheduleChartPopoverModel(eq, 'baseline').dateLines[0]?.label,
    ).toBe('База');

    const kt = {
      kind: 'milestone',
      id: 'KT-01',
      name: 'КТ',
      workstream: null,
      rag: 'Green',
      baselineDate: '2027-04-01',
      forecastDate: '2027-04-01',
      dateVariance: {
        baselineDate: '2027-04-01',
        forecastDate: '2027-04-01',
        deltaDays: 0,
      },
      sourceKind: 'controlpoint',
    } as unknown as ScheduleItem;
    expect(buildScheduleChartPopoverModel(kt, 'forecast').href).toBeNull();

    const ms = {
      kind: 'milestone',
      id: 'MS-UTL-PWR',
      name: 'Питание',
      workstream: null,
      rag: 'Red',
      baselineDate: '2027-05-01',
      forecastDate: '2027-05-10',
      dateVariance: {
        baselineDate: '2027-05-01',
        forecastDate: '2027-05-10',
        deltaDays: 9,
      },
      sourceKind: 'catalog_milestone',
    } as unknown as ScheduleItem;
    const msModel = buildScheduleChartPopoverModel(ms, 'forecast');
    expect(msModel.href).toMatch(/milestone/);
    expect(msModel.statusLabel).toMatch(/красн/i);
  });

  it('group uses presentation hints, not fake leaf dates', () => {
    const group = {
      kind: 'stage_group',
      id: 'ST-1',
      name: 'Этап',
      wbs: '1',
      progressPct: null,
    } as ScheduleItem;
    const empty = buildScheduleChartPopoverModel(group, 'forecast');
    expect(empty.dateLines).toHaveLength(0);
    const withHints = buildScheduleChartPopoverModel(group, 'forecast', {
      startIso: '2027-01-01',
      endIso: '2027-06-01',
    });
    expect(withHints.dateLines).toHaveLength(2);
  });

  it('project_group actual hints + progress; equipment delayed baseline', () => {
    const project = {
      kind: 'project_group',
      id: 'AN-01',
      name: 'Проект',
      wbs: 'AN',
      progressPct: 55,
    } as ScheduleItem;
    const m = buildScheduleChartPopoverModel(project, 'actual', {
      startIso: '2026-08-01',
      endIso: '2027-09-01',
    });
    expect(m.kindLabel).toBe('Проект');
    expect(m.progressLabel).toContain('55');
    expect(m.dateLines.some((l) => l.label.includes('Факт'))).toBe(true);

    const eq = {
      kind: 'equipment_delivery',
      id: 'EQ-9',
      name: 'EQ',
      workstream: 'engineering',
      critical: false,
      status: 'Delayed',
      baselineDate: '2027-01-01',
      forecastDate: '2027-02-01',
      dateVariance: {
        baselineDate: '2027-01-01',
        forecastDate: '2027-02-01',
        deltaDays: 31,
      },
    } as unknown as ScheduleItem;
    expect(buildScheduleChartPopoverModel(eq, 'baseline').statusLabel).toMatch(
      /задерж/i,
    );
  });
});
