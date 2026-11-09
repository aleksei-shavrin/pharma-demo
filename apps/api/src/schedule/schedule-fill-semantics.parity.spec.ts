import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import { PortfolioService } from '../portfolio/portfolio.service';
import { ScheduleService } from './schedule.service';
import {
  fillToneForProjectGroup,
  resolveScheduleFillTone,
  resolveScheduleWarning,
  type ScheduleWarningItem,
} from './schedule-fill-semantics';

const cases = JSON.parse(
  readFileSync(
    join(
      __dirname,
      '../../../../tools/test-fixtures/schedule-semantics-parity-cases.json',
    ),
    'utf8',
  ),
) as {
  warningCases: {
    id: string;
    item: ScheduleWarningItem;
    descendants: ScheduleWarningItem[];
    expectTone: string;
  }[];
  fillCases: {
    id: string;
    input: {
      kind: string;
      status?: string | null;
      rag?: string | null;
      warningTone: 'shift' | 'lag' | 'none';
    };
    expect: string;
  }[];
};

describe('Nest schedule-fill-semantics parity with FE fixtures', () => {
  for (const c of cases.warningCases) {
    it(`warning:${c.id}`, () => {
      expect(resolveScheduleWarning(c.item, c.descendants).tone).toBe(
        c.expectTone,
      );
    });
  }
  for (const c of cases.fillCases) {
    it(`fill:${c.id}`, () => {
      expect(resolveScheduleFillTone(c.input)).toBe(c.expect);
    });
  }
});

describe('Portfolio fillTone vs ScheduleService real data', () => {
  const dataSource = new MockDemoDataSource();
  const schedule = new ScheduleService(dataSource);
  const portfolio = new PortfolioService(dataSource, schedule);

  for (const snap of ['09', '03', '19'] as const) {
    it(`AN-01 on ${snap}: portfolio tone/pct matches schedule group fold`, () => {
      const items = schedule.getSchedule('PRT-01', snap).items.map((item) => ({
        kind: item.kind,
        id: item.id,
        status: 'status' in item ? (item.status as string | null) : null,
        sourceWeeks:
          'sourceWeeks' in item
            ? ((item as { sourceWeeks?: number | null }).sourceWeeks ?? null)
            : null,
        baselineStart:
          'baselineStart' in item
            ? ((item as { baselineStart?: string | null }).baselineStart ??
              null)
            : null,
        baselineEnd:
          'baselineEnd' in item
            ? ((item as { baselineEnd?: string | null }).baselineEnd ?? null)
            : null,
        startDate:
          'startDate' in item
            ? ((item as { startDate?: string | null }).startDate ?? null)
            : null,
        endDate:
          'endDate' in item
            ? ((item as { endDate?: string | null }).endDate ?? null)
            : null,
        rag:
          'rag' in item
            ? ((item as { rag?: string | null }).rag ?? null)
            : null,
        parentKey: item.parentKey ?? null,
        progressPct:
          'progressPct' in item
            ? ((item as { progressPct?: number | null }).progressPct ?? null)
            : null,
      }));
      const expected = fillToneForProjectGroup(items, 'AN-01');
      const row = portfolio
        .listProjects('PRT-01', snap)
        .items.find((r) => r.id === 'AN-01');
      expect(row).toBeTruthy();
      expect(row!.progressFillTone).toBe(expected.progressFillTone);
      if (row!.leafTotal === 0) {
        expect(row!.progressPct).toBeNull();
      } else {
        expect(row!.progressPct).toBe(expected.progressPct);
        expect(row!.leafCompleted + row!.leafTotal).toBeGreaterThan(
          row!.leafTotal - 1,
        );
      }
      // Not blind RAG: Yellow status may still be danger fill.
      if (row!.status === 'Yellow' && expected.progressFillTone === 'danger') {
        expect(row!.progressFillTone).not.toBe('warn');
      }
    });
  }

  it('program leaf sum is not mean of percents', () => {
    const program = portfolio
      .listPrograms('PRT-01', '03')
      .items.find((p) => p.id === 'PRG-DSN')!;
    const projects = portfolio
      .listProjects('PRT-01', '03')
      .items.filter((p) => p.programId === 'PRG-DSN');
    const sumC = projects.reduce((s, p) => s + p.leafCompleted, 0);
    const sumT = projects.reduce((s, p) => s + p.leafTotal, 0);
    expect(program.leafCompleted).toBe(sumC);
    expect(program.leafTotal).toBe(sumT);
    expect(program.progressPct).toBe(
      sumT === 0 ? null : Math.round((sumC / sumT) * 100),
    );
  });
});
