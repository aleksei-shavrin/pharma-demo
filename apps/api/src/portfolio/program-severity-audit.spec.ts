import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import {
  analystProjectStatus,
  projectsOf,
  worstStatus,
} from '../data/analyst-portfolio';
import { PortfolioService } from './portfolio.service';
import { ScheduleService } from '../schedule/schedule.service';
import { fillToneForProgramProjects } from '../schedule/schedule-fill-semantics';

const STATUS_LABEL: Record<string, string> = {
  Green: 'В норме',
  Yellow: 'Требует внимания',
  Red: 'Критично',
};

function toWarningItems(schedule: ReturnType<ScheduleService['getSchedule']>) {
  return schedule.items.map((item) => ({
    kind: item.kind,
    id: item.id,
    status: 'status' in item ? (item.status as string | null) : null,
    sourceWeeks:
      'sourceWeeks' in item
        ? ((item as { sourceWeeks?: number | null }).sourceWeeks ?? null)
        : null,
    baselineStart:
      'baselineStart' in item
        ? ((item as { baselineStart?: string | null }).baselineStart ?? null)
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
    rag: 'rag' in item ? ((item as { rag?: string | null }).rag ?? null) : null,
    parentKey: item.parentKey ?? null,
    progressPct:
      'progressPct' in item
        ? ((item as { progressPct?: number | null }).progressPct ?? null)
        : null,
  }));
}

describe('Program severity dual-axis audit (19 snapshots)', () => {
  const dataSource = new MockDemoDataSource();
  const schedule = new ScheduleService(dataSource);
  const portfolio = new PortfolioService(dataSource, schedule);
  const ids = [...dataSource.listSnapshotIds()].sort(
    (a, b) => Number(a) - Number(b),
  );

  it('status matches worst child; fillTone matches fillToneForProgramProjects', () => {
    expect(ids).toHaveLength(19);

    const matrix: Array<{
      snap: string;
      id: string;
      status: string;
      label: string;
      progressFillTone: string;
      progressPct: number | null;
    }> = [];
    const dualAxis: typeof matrix = [];
    const fillBugs: unknown[] = [];
    const statusBugs: unknown[] = [];

    for (const id of ids) {
      const snap = dataSource.getSnapshot(id);
      const panel = snap.milestones.find((ms) => ms.id === 'MS-CLN-PANEL');
      const power = snap.milestones.find((ms) => ms.id === 'MS-UTL-PWR');
      const hvac = snap.equipment.find((item) => item.id === 'EQ-HVAC-01');
      const signals = {
        panelRed: panel?.rag === 'Red',
        powerRed: power?.rag === 'Red',
        hvacDelayed: hvac?.status === 'Delayed',
      };
      const items = toWarningItems(schedule.getSchedule('PRT-01', id));
      const list = portfolio.listPrograms('PRT-01', id).items;

      for (const row of list) {
        const projectIds = projectsOf(row.id).map((p) => p.id);
        const expectedFill = fillToneForProgramProjects(items, projectIds);
        if (row.progressFillTone !== expectedFill) {
          fillBugs.push({
            snap: id,
            id: row.id,
            got: row.progressFillTone,
            expected: expectedFill,
          });
        }
        const childStatuses = projectsOf(row.id).map((project) =>
          analystProjectStatus({ project, ...signals }),
        );
        const worst = worstStatus(childStatuses);
        if (row.status !== worst) {
          statusBugs.push({
            snap: id,
            id: row.id,
            got: row.status,
            expected: worst,
          });
        }
        const label = STATUS_LABEL[row.status] ?? '?';
        const entry = {
          snap: id,
          id: row.id,
          status: row.status,
          label,
          progressFillTone: row.progressFillTone,
          progressPct: row.progressPct,
        };
        matrix.push(entry);
        const axesDiverge =
          (row.status === 'Red' && row.progressFillTone !== 'danger') ||
          (row.status === 'Yellow' && row.progressFillTone === 'ok') ||
          (row.status === 'Yellow' && row.progressFillTone === 'danger') ||
          (row.status === 'Green' && row.progressFillTone !== 'ok');
        if (axesDiverge) dualAxis.push(entry);
      }
    }

    expect(fillBugs).toEqual([]);
    expect(statusBugs).toEqual([]);
    expect(matrix.length).toBe(133);
    // Live dual-axis samples must exist (not just fields).
    expect(
      dualAxis.some(
        (r) =>
          r.id === 'PRG-ENG' &&
          r.status === 'Red' &&
          r.progressFillTone === 'warn',
      ),
    ).toBe(true);
    expect(
      dualAxis.some(
        (r) =>
          r.id === 'PRG-CON' &&
          r.status === 'Red' &&
          r.progressFillTone === 'ok',
      ),
    ).toBe(true);

    const outDir =
      '/tmp/pharma-demo-artifacts/pharma-dashboard-program-people-layout';
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      join(outDir, 'program-severity-audit.json'),
      JSON.stringify(
        {
          snapCount: ids.length,
          matrixLen: matrix.length,
          fillBugs,
          statusBugs,
          dualAxisAllowed: dualAxis,
          conclusion: 'DUAL_AXIS_OK_KEEP',
        },
        null,
        2,
      ),
    );
  });
});
