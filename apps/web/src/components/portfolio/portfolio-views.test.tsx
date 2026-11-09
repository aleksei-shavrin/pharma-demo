/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ProgramCompositionView,
  ProgramDashboardView,
  ProgramListView,
  ProjectCardView,
  ProjectListView,
  RecordMissing,
} from './portfolio-views';
import type { ProgramDetail } from '@/lib/api-client';

const projectRow = {
  id: 'AN-08',
  name: 'Чистые',
  programId: 'PRG-CON',
  status: 'Red' as const,
  ownerLabel: 'Лебедева Ольга Викторовна',
  ownerPersonId: 'PER-07',
  progressLabel: '12% · 3/25 завершено',
  progressPct: 12,
  leafCompleted: 3,
  leafTotal: 25,
  progressFillTone: 'danger' as const,
};

const programDetail: ProgramDetail = {
  snapshotId: '03',
  id: 'PRG-CON',
  name: 'Строительство',
  status: 'Red',
  projectCount: 1,
  ownerLabel: 'Не назначен',
  ownerPersonId: null,
  responsiblePeople: [
    {
      personId: 'PER-06',
      fullNameRu: 'Васильев Игорь Николаевич',
      role: 'Владелец AN-06',
    },
  ],
  progressLabel: '12% · 3/25 завершено',
  progressPct: 12,
  leafCompleted: 3,
  leafTotal: 25,
  progressFillTone: 'danger',
  projects: [projectRow],
  cost: {
    approvedControlBudgetRub: 100,
    actualCostRub: 40,
    committedCostRub: 20,
    etcRub: 50,
    eacRub: 90,
    vacRub: 10,
    workstreamIds: ['WS-BLD', 'WS-CLN'],
  },
  attention: {
    redRiskCount: 1,
    delayedCriticalEquipmentCount: 1,
    openOrMitigatingIssueCount: 1,
    redMilestoneCount: 1,
  },
  issues: [
    {
      id: 'ISS-CLN-01',
      title: 'Отставание монтажа',
      status: 'Open',
      projectId: 'AN-08',
    },
  ],
  milestones: [
    {
      id: 'MS-CLN-PANEL',
      name: 'Панели',
      rag: 'Red',
      baselineDate: '2027-01-01',
      forecastDate: '2027-03-01',
      projectId: 'AN-08',
    },
  ],
  equipment: [
    {
      id: 'EQ-CLN-01',
      name: 'Панели',
      status: 'Delayed',
      critical: true,
      baselineDelivery: '2027-01-01',
      forecastDelivery: '2027-03-01',
    },
  ],
  risks: [{ id: 'RSK-1', title: 'Риск панелей', rag: 'Red' }],
  decisions: [],
};

describe('portfolio-views product labels', () => {
  afterEach(() => cleanup());

  it('shows Ответственные from responsiblePeople, not blank Руководитель', () => {
    render(
      <ProgramListView
        items={[
          {
            id: 'PRG-CON',
            name: 'Строительство',
            status: 'Red',
            projectCount: 3,
            ownerLabel: 'Не назначен',
            responsiblePeople: [
              {
                personId: 'PER-06',
                fullNameRu: 'Васильев Игорь Николаевич',
                role: 'Владелец AN-06',
              },
            ],
          },
          {
            id: 'PRG-ORG',
            name: 'Организация',
            status: 'Green',
            projectCount: 2,
            responsiblePeople: [],
          },
        ]}
      />,
    );
    expect(screen.getByText('Ответственные')).toBeTruthy();
    expect(screen.getByText('Васильев Игорь Николаевич')).toBeTruthy();
    expect(screen.getByText('Не назначены')).toBeTruthy();
    expect(screen.queryByText('Руководитель')).toBeNull();
  });

  it('renders empty program list copy', () => {
    render(<ProgramListView items={[]} />);
    expect(screen.getByText(/Программ в этом снимке нет/)).toBeTruthy();
  });

  it('renders progress bar percent and completed counts without seed/anchor internals', () => {
    render(<ProjectListView items={[projectRow]} />);
    expect(screen.getByText('12%')).toBeTruthy();
    expect(screen.getByText('3/25')).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: /Завершённые работы/ })).toBeTruthy();
    expect(screen.queryByText(/якор|источник|thin|depth/i)).toBeNull();
  });

  it('shared SemanticProgressBar grid keeps full 100% label (non-compact portfolio)', () => {
    render(
      <ProgramListView
        items={[
          {
            id: 'PRG-CON',
            name: 'Строительство',
            status: 'Red',
            projectCount: 2,
            progressPct: 100,
            leafCompleted: 10,
            leafTotal: 10,
            progressFillTone: 'ok',
          },
        ]}
      />,
    );
    const meter = document.querySelector('[data-semantic-progress="known"]');
    expect(meter).toBeTruthy();
    expect(meter?.getAttribute('data-semantic-progress-compact')).toBeNull();
    expect(meter?.getAttribute('data-semantic-progress-pct-col')).toMatch(/ch$/);
    expect(
      document.querySelector('[data-semantic-progress-pct="true"]')?.textContent,
    ).toBe('100%');
    expect(meter?.getAttribute('style') ?? '').toMatch(/minmax\(0,\s*1fr\)/);
  });


  it('keeps catalog codes on one line (nowrap + min width)', () => {
    render(<ProjectListView items={[projectRow]} />);
    const code = document.querySelector('[data-portfolio-code="AN-08"]');
    expect(code).toBeTruthy();
    expect(code?.className).toMatch(/whitespace-nowrap/);
    expect(code?.className).toMatch(/min-w-\[5\.5rem\]/);
    render(
      <ProgramListView
        items={[
          {
            id: 'PRG-DSN',
            name: 'Проектирование',
            status: 'Yellow',
            projectCount: 5,
            progressPct: 40,
            leafCompleted: 4,
            leafTotal: 10,
            progressFillTone: 'danger',
          },
        ]}
      />,
    );
    const prg = document.querySelector('[data-portfolio-code="PRG-DSN"]');
    expect(prg?.className).toMatch(/whitespace-nowrap/);
  });

  it('renders empty projects table', () => {
    render(<ProjectListView items={[]} />);
    expect(screen.getByText('Проектов нет.')).toBeTruthy();
  });

  it('program dashboard shows progress + responsibles + linked projects', () => {
    render(<ProgramDashboardView data={programDetail} />);
    expect(screen.getAllByText(/12% · 3\/25 завершено/).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText('Васильев Игорь Николаевич')).toBeTruthy();
    expect(screen.getByText('Отставание монтажа')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Чистые' })).toBeTruthy();
  });

  it('program summary shows red milestones when risks/EQ/issues are zero', () => {
    render(
      <ProgramDashboardView
        data={{
          ...programDetail,
          attention: {
            redRiskCount: 0,
            delayedCriticalEquipmentCount: 0,
            openOrMitigatingIssueCount: 0,
            redMilestoneCount: 1,
          },
          issues: [],
          risks: [],
        }}
      />,
    );
    expect(screen.getByText('Вехи под риском')).toBeTruthy();
    expect(
      document.querySelector('[data-summary-red-milestones="true"]'),
    ).toHaveTextContent('1');
  });

  it('program dashboard honest empty people/issues', () => {
    render(
      <ProgramDashboardView
        data={{
          ...programDetail,
          responsiblePeople: [],
          issues: [{ id: 'x', title: 'без проекта', status: 'Open', projectId: null }],
          projects: [],
        }}
      />,
    );
    expect(screen.getByText('Не назначены.')).toBeTruthy();
    expect(screen.getByText('без проекта')).toBeTruthy();
  });

  it('composition filter toggles attention rows', async () => {
    const user = userEvent.setup();
    render(
      <ProgramCompositionView
        data={{
          ...programDetail,
          projects: [
            projectRow,
            { ...projectRow, id: 'AN-15', name: 'ИТ', status: 'Green' },
          ],
        }}
      />,
    );
    expect(screen.getAllByText('Чистые').length).toBeGreaterThan(0);
    expect(screen.getByText('ИТ')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Требует внимания' }));
    expect(screen.queryByText('ИТ')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Сбросить фильтр' }));
    expect(screen.getByText('ИТ')).toBeTruthy();
  });

  it('shows Демо-даты note without English supplementary provenance', () => {
    render(
      <ProjectCardView
        data={{
          snapshotId: '03',
          id: 'AN-08',
          name: 'Чистые',
          programId: 'PRG-CON',
          programName: 'Строительство',
          status: 'Red',
          ownerPersonId: 'PER-07',
          ownerLabel: 'Лебедева',
          progressLabel: '12% · 3/25 завершено',
          datesLabel: 'КТ: 2027-03-01',
          composition: {
            stages: 1,
            works: 10,
            checkpoints: 6,
            catalogMilestones: 1,
            equipment: 2,
          },
          datesNote: 'Демо-даты',
          issues: [
            { id: 'ISS-CLN-01', title: 'Отставание монтажа', status: 'Open' },
          ],
          risks: [{ id: 'RSK-CLN-01', title: 'Риск чистоты', rag: 'Red' }],
          decisions: [
            {
              id: 'DEC-1',
              type: 'PrioritizeRecovery',
              note: 'Решение по панелям',
              dueDate: '2027-02-01',
              milestoneId: 'MS-CLN-PANEL',
            },
          ],
          attention: {
            redRiskCount: 1,
            delayedCriticalEquipmentCount: 1,
            openOrMitigatingIssueCount: 1,
            redMilestoneCount: 1,
          },
          equipment: [
            {
              id: 'EQ-CLN-01',
              name: 'Панели',
              status: 'Delayed',
              critical: true,
              forecastDelivery: '2027-04-01',
              deltaDays: 14,
            },
          ],
          milestones: [
            {
              id: 'MS-CLN-PANEL',
              name: 'Панели готовы',
              rag: 'Red',
              baselineDate: '2027-01-01',
              forecastDate: '2027-03-01',
            },
          ],
          installationLag: 'Отставание монтажа',
          deliveryNote: 'Сдвиг поставки',
        }}
      />,
    );
    expect(screen.getByText('Демо-даты')).toBeTruthy();
    expect(screen.getAllByText('Отставание монтажа').length).toBeGreaterThan(0);
    expect(screen.getByText('Сдвиг поставки')).toBeTruthy();
    expect(screen.getByText(/Панели готовы/)).toBeTruthy();
    expect(screen.getByText('Риск чистоты')).toBeTruthy();
    expect(screen.getByText(/Решение по панелям/)).toBeTruthy();
    expect(screen.getByText(/Отдельный бюджет проекта не выделен/)).toBeTruthy();
    expect(screen.getByText('Состав проекта')).toBeTruthy();
    expect(screen.queryByText(/supplementary|DEMO_ASSUMPTION/i)).toBeNull();
  });

  it('project card empty sections', () => {
    render(
      <ProjectCardView
        data={{
          snapshotId: '03',
          id: 'AN-22',
          name: 'СМК',
          programId: 'PRG-ORG',
          programName: 'Организация',
          status: 'Yellow',
          ownerPersonId: null,
          ownerLabel: 'Не назначен',
          progressLabel: 'Нет листовых работ в импорте',
          datesLabel: '—',
          composition: {
            stages: 0,
            works: 0,
            checkpoints: 0,
            catalogMilestones: 0,
            equipment: 0,
          },
          datesNote: null,
          issues: [],
          risks: [],
          decisions: [],
          attention: {
            redRiskCount: 0,
            delayedCriticalEquipmentCount: 0,
            openOrMitigatingIssueCount: 0,
            redMilestoneCount: 0,
          },
          equipment: [],
          milestones: [],
          installationLag: null,
          deliveryNote: null,
        }}
      />,
    );
    expect(screen.getAllByText(/Нет записей/).length).toBeGreaterThan(0);
  });

  it('RecordMissing routes by kind', () => {
    const { unmount } = render(<RecordMissing id="AN-99" kind="project" />);
    expect(screen.getByText(/не найдена/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'К списку проектов' })).toHaveAttribute(
      'href',
      '/projects',
    );
    unmount();
    render(<RecordMissing id="PRG-NOPE" kind="program" />);
    expect(screen.getByRole('link', { name: 'К списку программ' })).toHaveAttribute(
      'href',
      '/programs',
    );
  });

  it('program status filter options use RU labels with raw enum values', () => {
    render(
      <ProgramListView
        items={[
          {
            id: 'PRG-CON',
            name: 'Строительство',
            status: 'Red',
            projectCount: 1,
            responsiblePeople: [],
          },
        ]}
      />,
    );
    const select = document.querySelector(
      'select',
    ) as HTMLSelectElement | null;
    expect(select).toBeTruthy();
    expect(select!.querySelector('option[value="Green"]')?.textContent).toBe(
      'В норме',
    );
    expect(select!.querySelector('option[value="Yellow"]')?.textContent).toBe(
      'Требует внимания',
    );
    expect(select!.querySelector('option[value="Red"]')?.textContent).toBe(
      'Критично',
    );
  });
});
