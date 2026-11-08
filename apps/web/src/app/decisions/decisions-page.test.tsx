/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DecisionsPage from '@/app/decisions/page';
import { SnapshotSelector } from '@/components/snapshot/snapshot-selector';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import {
  expectActiveSnapshot,
  selectDemoSnapshot,
} from '@/lib/test/select-snapshot';
import { NAV_ITEMS } from '@/lib/navigation';

const fetchDashboardOverview = vi.fn();
const fetchDecisionsRegister = vi.fn();
const replaceMock = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...a: unknown[]) => fetchDashboardOverview(...a),
    fetchDecisionsRegister: (...a: unknown[]) => fetchDecisionsRegister(...a),
  };
});

vi.mock('next/navigation', () => ({
  usePathname: () => '/decisions',
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  useSearchParams: () =>
    new URLSearchParams(mockSearchParams),
}));

let mockSearchParams = '';

function dash(snapshotId: SnapshotId) {
  return dashboardOverviewFixture(snapshotId);
}

function decisions(snapshotId: SnapshotId) {
  const asOf = dash(snapshotId).scenarioAsOfDate;
  const items =
    snapshotId === 'F'
      ? [
          {
            id: 'DEC-001',
            projectId: 'PRJ-01',
            milestoneId: 'MS-PS',
            milestoneName: 'Готовность к старту производства',
            type: 'PrioritizeRecovery' as const,
            ownerPersonId: 'PER-01' as const,
            ownerFullNameRu: 'Соколов Андрей Викторович',
            dueDate: '2027-05-15',
            note: 'Утвердить ускоренную логистику AHU и резервный монтажный слот',
            dueState: 'upcoming' as const,
            programId: null,
            analystProjectId: null,
            analystProjectName: null,
          },
          {
            id: 'DEC-UTL-01',
            projectId: 'PRJ-01',
            milestoneId: 'MS-UTL-WFI',
            milestoneName: 'WFI / утилиты — готовность',
            type: 'PrioritizeRecovery' as const,
            ownerPersonId: 'PER-09' as const,
            ownerFullNameRu: 'Утилиты Владелец',
            dueDate: asOf,
            note: 'Согласовать параллельный ввод PW',
            dueState: 'upcoming' as const,
            programId: 'PRG-ENG',
            analystProjectId: 'AN-10',
            analystProjectName: 'Утилиты WFI',
          },
        ]
      : [];
  return {
    snapshotId,
    scenarioAsOfDate: asOf,
    projectId: 'PRJ-01',
    items,
  };
}

function Harness({ children }: { children: ReactNode }) {
  return (
    <SnapshotProvider>
      <SnapshotSelector />
      {children}
    </SnapshotProvider>
  );
}

describe('DecisionsPage', () => {
  beforeEach(() => {
    mockSearchParams = '';
    replaceMock.mockReset();
    fetchDashboardOverview.mockImplementation(async (_p, id: SnapshotId) =>
      dash(id),
    );
    fetchDecisionsRegister.mockImplementation(async (_p, id: SnapshotId) =>
      decisions(id),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('shows loading then empty on snapshot A', async () => {
    let resolveDec!: (v: ReturnType<typeof decisions>) => void;
    fetchDecisionsRegister.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveDec = resolve;
        }),
    );
    render(
      <Harness>
        <DecisionsPage />
      </Harness>,
    );
    expect(screen.getByRole('status')).toBeTruthy();
    resolveDec(decisions('A'));
    await waitFor(() => {
      expect(screen.getByText('Нет записей в этом снимке.')).toBeTruthy();
    });
  });

  it('shows error with retry', async () => {
    fetchDecisionsRegister.mockRejectedValue(new Error('boom'));
    render(
      <Harness>
        <DecisionsPage />
      </Harness>,
    );
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/boom/);
    });
    const user = userEvent.setup();
    fetchDecisionsRegister.mockImplementation(async (_p, id: SnapshotId) =>
      decisions(id),
    );
    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    await waitFor(() => {
      expect(screen.getByText('Нет записей в этом снимке.')).toBeTruthy();
    });
  });

  it('lists F rows with people/milestone links; no nested td; portfolio link', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <DecisionsPage />
      </Harness>,
    );
    await selectDemoSnapshot(user, 'F');
    await expectActiveSnapshot('F');
    await waitFor(() => {
      expect(screen.getByText('DEC-001')).toBeTruthy();
    });
    expect(screen.getByText('DEC-UTL-01')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /Соколов Андрей Викторович/ }),
    ).toHaveAttribute('href', '/people/PER-01');
    const msCell = screen.getByText('MS-PS').closest('td');
    expect(msCell).toBeTruthy();
    expect(msCell!.querySelector('td')).toBeNull();
    expect(msCell!.querySelector('a')).toHaveAttribute(
      'href',
      '/milestones/MS-PS',
    );
    expect(
      screen.getByRole('link', {
        name: /Готовность к производ/,
      }),
    ).toBeTruthy();
    // Human title ≠ technical id in the primary link text
    expect(
      screen.getByRole('link', { name: /Готовность к производ/ }).textContent,
    ).not.toBe('MS-PS');
    expect(
      document.querySelectorAll('td td').length,
    ).toBe(0);
    expect(
      screen.getAllByRole('link', { name: /Портфель \(PRJ-01\)/ })[0],
    ).toHaveAttribute('href', '/');
    expect(
      screen.getByRole('link', { name: /Утилиты WFI/ }),
    ).toHaveAttribute('href', '/projects/AN-10');
    expect(
      screen.getByRole('link', { name: /Инженерия|PRG-ENG/ }),
    ).toHaveAttribute('href', '/programs/PRG-ENG');
    expect(screen.getByRole('heading', { name: 'Решения' })).toBeTruthy();
    expect(screen.getByLabelText('Фильтр срока решения')).toBeTruthy();
    expect(screen.queryByLabelText('Фильтр внимания')).toBeNull();
    expect(screen.getByPlaceholderText('Поиск решений')).toBeTruthy();
    const searchLabel = screen.getByPlaceholderText('Поиск решений').closest(
      'label',
    );
    expect(searchLabel?.className).toMatch(/max-w-\[240px\]/);
    expect(
      screen.getByText(
        /Данные об исполнении не указаны\. Прошедший срок не подтверждает неисполнение/,
      ),
    ).toBeTruthy();
    expect(screen.queryByText(/Demo v1/i)).toBeNull();
    expect(
      document.querySelector('[data-decision-due-badge="today"]'),
    ).toBeTruthy();
    expect(screen.getByText('Сегодня')).toBeTruthy();
    const idCell = screen.getByText('DEC-001').closest('td');
    expect(idCell?.className).toMatch(/whitespace-nowrap/);
    const tableScroll = document.querySelector(
      '[data-register-table-layout="decisions-desktop-fit"]',
    );
    expect(tableScroll).toBeTruthy();
    const table = tableScroll?.querySelector('table');
    expect(table?.className).toMatch(/table-fixed/);
    expect(table?.className).toMatch(/max-lg:min-w-\[64rem\]/);
    expect(table?.className).not.toMatch(/min-w-\[72rem\]/);
  });

  it('search filters rows and preserves program query context', async () => {
    mockSearchParams = 'program=PRG-CON';
    const user = userEvent.setup();
    render(
      <Harness>
        <DecisionsPage />
      </Harness>,
    );
    await selectDemoSnapshot(user, 'F');
    await waitFor(() => expect(screen.getByText('DEC-001')).toBeTruthy());
    await user.type(screen.getByPlaceholderText('Поиск решений'), 'UTL');
    await waitFor(() => {
      expect(screen.queryByText('DEC-001')).toBeNull();
      expect(screen.getByText('DEC-UTL-01')).toBeTruthy();
    });
    expect(replaceMock).toHaveBeenCalled();
    const last = String(replaceMock.mock.calls.at(-1)?.[0] ?? '');
    expect(last).toContain('program=PRG-CON');
    expect(last).toMatch(/q=UTL/i);
  });

  it('due filter + null due/milestone still valid single-level td', async () => {
    fetchDecisionsRegister.mockImplementation(async () => ({
      snapshotId: 'F' as SnapshotId,
      scenarioAsOfDate: '2027-04-20',
      projectId: 'PRJ-01',
      items: [
        {
          id: 'DEC-NULL',
          projectId: 'PRJ-01',
          milestoneId: null,
          milestoneName: null,
          type: 'AcceptDateSlip' as const,
          ownerPersonId: 'PER-01' as const,
          ownerFullNameRu: 'Соколов Андрей Викторович',
          dueDate: null,
          note: 'Без срока и вехи',
          dueState: 'none' as const,
          programId: null,
          analystProjectId: null,
          analystProjectName: null,
        },
        {
          id: 'DEC-PASSED',
          projectId: 'PRJ-01',
          milestoneId: 'MS-PS',
          milestoneName: 'Готовность к старту производства',
          type: 'PrioritizeRecovery' as const,
          ownerPersonId: 'PER-01' as const,
          ownerFullNameRu: 'Соколов Андрей Викторович',
          dueDate: '2027-03-01',
          note: 'Срок уже прошёл',
          dueState: 'passed' as const,
          programId: null,
          analystProjectId: null,
          analystProjectName: null,
        },
      ],
    }));
    const user = userEvent.setup();
    render(
      <Harness>
        <DecisionsPage />
      </Harness>,
    );
    await selectDemoSnapshot(user, 'F');
    await waitFor(() => expect(screen.getByText('DEC-NULL')).toBeTruthy());
    expect(screen.getByText('не задан')).toBeTruthy();
    expect(screen.getByText('не привязана')).toBeTruthy();
    expect(
      screen.getAllByText('Срок прошёл').length,
    ).toBeGreaterThanOrEqual(1);
    expect(document.querySelectorAll('td td').length).toBe(0);

    await user.selectOptions(
      screen.getByLabelText('Фильтр срока решения'),
      'passed',
    );
    await waitFor(() => {
      expect(screen.queryByText('DEC-NULL')).toBeNull();
      expect(screen.getByText('DEC-PASSED')).toBeTruthy();
    });
    expect(replaceMock).toHaveBeenCalled();
    expect(String(replaceMock.mock.calls.at(-1)?.[0] ?? '')).toContain(
      'due=passed',
    );

    await user.selectOptions(
      screen.getByLabelText('Фильтр срока решения'),
      'none',
    );
    await waitFor(() => {
      expect(screen.getByText('DEC-NULL')).toBeTruthy();
      expect(screen.queryByText('DEC-PASSED')).toBeNull();
    });

    await user.selectOptions(
      screen.getByLabelText('Фильтр срока решения'),
      'upcoming',
    );
    await waitFor(() => {
      expect(
        screen.getByText(/Нет записей, соответствующих текущим фильтрам/),
      ).toBeTruthy();
    });
  });

  it('nav includes decisions after milestones', () => {
    const milestonesIdx = NAV_ITEMS.findIndex((i) => i.href === '/milestones');
    const decisionsIdx = NAV_ITEMS.findIndex((i) => i.href === '/decisions');
    expect(decisionsIdx).toBe(milestonesIdx + 1);
  });
});
