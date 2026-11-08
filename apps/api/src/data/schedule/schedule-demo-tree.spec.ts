import {
  buildEquipmentAttachments,
  buildMilestoneAttachments,
  clampWorkActualsToAsOf,
  mergeDemoTree,
  rollupProgress,
} from './schedule-demo-tree';
import { getScheduleWorkFixture } from '../fixtures/schedule-works';
import { equipmentProgressPct } from './schedule-control-progress';
import {
  EQUIPMENT_DELIVERED_ON,
  MILESTONE_COMPLETED_ON,
} from './schedule-control-facts';

describe('schedule-demo-tree', () => {
  it('authored progress is NOT forecast≤asOf (past forecast can stay 0)', () => {
    // EQ-HVAC-01 deliveredOn 2027-06-05 (crisis +21): 0 on C, 100 from June onward.
    expect(EQUIPMENT_DELIVERED_ON['EQ-HVAC-01']).toBe('2027-06-05');
    expect(
      equipmentProgressPct({
        id: 'EQ-HVAC-01',
        scenarioAsOfDate: '2027-03-01',
      }),
    ).toBe(0);
    expect(
      equipmentProgressPct({
        id: 'EQ-HVAC-01',
        scenarioAsOfDate: '2027-06-01',
      }),
    ).toBe(0);
    expect(
      equipmentProgressPct({
        id: 'EQ-HVAC-01',
        scenarioAsOfDate: '2027-06-05',
      }),
    ).toBe(100);
    expect(
      equipmentProgressPct({
        id: 'EQ-HVAC-01',
        scenarioAsOfDate: '2027-09-22',
      }),
    ).toBe(100);
    expect(MILESTONE_COMPLETED_ON['MS-COM-GO']).toBe('2027-09-18');
  });

  it('clampWorkActualsToAsOf clears future facts only', () => {
    const [row] = clampWorkActualsToAsOf(
      [
        {
          id: 'WK-X',
          name: 'x',
          startDate: '2027-02-01',
          endDate: '2027-02-10',
          status: 'Completed',
          actualStart: '2027-02-20',
          actualEnd: '2027-02-25',
        },
      ],
      '2027-02-15',
    );
    expect(row.actualStart).toBeNull();
    expect(row.actualEnd).toBeNull();
  });

  it('mergeDemoTree nests WK and applies C overlay percents', () => {
    const merged = mergeDemoTree(
      getScheduleWorkFixture('C'),
      [
        { id: 'MS-CLN-PANEL', workstream: 'WS-CLN' },
        { id: 'MS-UTL-PWR', workstream: 'WS-UTL' },
      ],
      '2027-03-01',
      'C',
    );
    expect(merged.groups?.length).toBe(170); // 25 projects + 145 stages
    const wk01 = merged.works.find((w) => w.id === 'WK-01');
    expect(wk01).toMatchObject({
      parentKey: 'stage_group:8.2',
      wbs: '8.2.90',
      progressPct: 100,
    });
    expect(merged.works.find((w) => w.id === '8.2.1')?.progressPct).toBe(0);
    expect(merged.works.find((w) => w.id === '8.2.2')?.progressPct).toBe(0);
    expect(
      merged.milestoneAttachments?.find((a) => a.id === 'MS-CLN-PANEL'),
    ).toMatchObject({ wbs: '8.2.3', siblingOrder: 2 });
  });

  it('A vs C work progress differs (not one frozen C alias)', () => {
    const a = mergeDemoTree(
      getScheduleWorkFixture('A'),
      [{ id: 'MS-CLN-PANEL', workstream: 'WS-CLN' }],
      '2027-02-15',
      'A',
    );
    const c = mergeDemoTree(
      getScheduleWorkFixture('C'),
      [{ id: 'MS-CLN-PANEL', workstream: 'WS-CLN' }],
      '2027-03-01',
      'C',
    );
    expect(a.works.find((w) => w.id === 'WK-01')?.progressPct).toBe(0);
    expect(c.works.find((w) => w.id === 'WK-01')?.progressPct).toBe(100);
    expect(a.works.find((w) => w.id === '8.2.2')?.progressPct).toBe(0);
    expect(c.works.find((w) => w.id === '8.2.2')?.progressPct).toBe(0);
  });

  it('equipment WBS stable under shuffle, first-id drop, and neighbor snapshot', () => {
    const base = [
      { id: 'EQ-CLN-02', workstream: 'WS-CLN' },
      { id: 'EQ-CLN-01', workstream: 'WS-CLN' },
      { id: 'EQ-CLN-03', workstream: 'WS-CLN' },
    ];
    const shuffled = [base[2], base[0], base[1]];
    // Drop FIRST by sorted id (EQ-CLN-01), not the last — old counters hid this.
    const withoutFirst = [
      { id: 'EQ-CLN-02', workstream: 'WS-CLN' },
      { id: 'EQ-CLN-03', workstream: 'WS-CLN' },
    ];
    const a = Object.fromEntries(
      buildEquipmentAttachments(base).map((x) => [x.id, x.wbs]),
    );
    const b = Object.fromEntries(
      buildEquipmentAttachments(shuffled).map((x) => [x.id, x.wbs]),
    );
    const c = Object.fromEntries(
      buildEquipmentAttachments(withoutFirst).map((x) => [x.id, x.wbs]),
    );
    expect(a['EQ-CLN-01']).toBe(b['EQ-CLN-01']);
    expect(a['EQ-CLN-02']).toBe(b['EQ-CLN-02']);
    expect(a['EQ-CLN-02']).toBe(c['EQ-CLN-02']);
    expect(a['EQ-CLN-03']).toBe(c['EQ-CLN-03']);
  });

  it('equipment/milestone attachments use numeric sibling bands without collisions', () => {
    const eq = buildEquipmentAttachments([
      { id: 'EQ-CLN-01', workstream: 'WS-CLN' },
      { id: 'EQ-CLN-02', workstream: 'WS-CLN' },
    ]);
    const ms = buildMilestoneAttachments([
      { id: 'MS-CLN-PANEL', workstream: 'WS-CLN' },
      { id: 'MS-CLN-RDY', workstream: 'WS-CLN' },
    ]);
    const codes = [...eq, ...ms].map((x) => x.wbs);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('rollupProgress equal-weight mean of leaf children', () => {
    const items = [
      {
        kind: 'stage_group',
        id: '8.2',
        parentKey: 'project_group:AN-08',
        progressPct: null as number | null,
      },
      {
        kind: 'work',
        id: 'a',
        parentKey: 'stage_group:8.2',
        progressPct: 0,
      },
      {
        kind: 'work',
        id: 'b',
        parentKey: 'stage_group:8.2',
        progressPct: 100,
      },
      {
        kind: 'milestone',
        id: 'm',
        parentKey: 'stage_group:8.2',
        progressPct: 50,
      },
    ];
    expect(
      rollupProgress(
        'stage_group:8.2',
        items,
        new Set(['project_group:AN-08', 'stage_group:8.2']),
      ),
    ).toBe(50);
  });
});
