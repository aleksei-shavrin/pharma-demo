/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SnapshotProvider } from '@/lib/snapshot/snapshot-context';
import { ThemeProvider } from '@/lib/theme/theme-context';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { AppShell } from './app-shell';

const fetchDashboardOverview = vi.fn();
const fetchNotifications = vi.fn();
const fetchProjectCosts = vi.fn();

vi.mock('@/lib/api-client', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    fetchDashboardOverview: (...args: unknown[]) =>
      fetchDashboardOverview(...args),
    fetchNotifications: (...args: unknown[]) => fetchNotifications(...args),
    fetchProjectCosts: (...args: unknown[]) => fetchProjectCosts(...args),
  };
});

beforeEach(() => {
  sessionStorage.clear();
  fetchDashboardOverview.mockImplementation(
    async (_id: string, snapshot: SnapshotId) =>
      dashboardOverviewFixture(snapshot),
  );
  fetchNotifications.mockResolvedValue({
    snapshotId: 'A',
    scenarioAsOfDate: '2027-02-15',
    projectId: 'PRJ-01',
    items: [],
  });
  fetchProjectCosts.mockResolvedValue({
    snapshotId: 'A',
    scenarioAsOfDate: '2027-02-15',
    projectId: 'PRJ-01',
    project: {
      approvedBudgetRub: 6_200_000_000,
      actualCostRub: 0,
      committedCostRub: 0,
      etcRub: 6_200_000_000,
      eacRub: 6_200_000_000,
      vacRub: 0,
      contingencyTotalRub: 350_000_000,
      contingencyConsumedRub: 0,
      contingencyRemainingRub: 350_000_000,
    },
    workstreams: [],
    equipment: [],
    reconciliation: {
      workstreamEacSumRub: 0,
      projectLevelForecastRub: 0,
    },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  delete (globalThis as { __testPathname?: string }).__testPathname;
});

async function renderShell(pathname: string) {
  (globalThis as { __testPathname?: string }).__testPathname = pathname;
  const view = render(
    <ThemeProvider>
      <SnapshotProvider>
        <AppShell>
          <div>x</div>
        </AppShell>
      </SnapshotProvider>
    </ThemeProvider>,
  );
  await waitFor(() => {
    expect(fetchDashboardOverview).toHaveBeenCalled();
  });
  return view;
}

describe('AppShell Page Surface vs Dashboard canvas', () => {
  it('Dashboard `/` uses canvas without Page Surface', async () => {
    await renderShell('/');
    expect(document.querySelector('[data-dashboard-canvas="true"]')).toBeTruthy();
    expect(document.querySelector('[data-page-surface]')).toBeNull();
  });

  it('показывает бренд и крошку портфеля без зелёной ссылки пропуска', async () => {
    await renderShell('/');
    expect(screen.getByText('РАНДОК.Платформа')).toBeInTheDocument();
    expect(screen.queryByText('Randoc. Платформа')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Перейти к основному содержимому' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Навигационная цепочка' }).textContent,
    ).toMatch(/Портфель 01\s*\/\s*Дашборд/);
    expect(screen.getByRole('link', { name: /Дашборд/ })).toBeInTheDocument();
  });

  it('non-Dashboard routes keep Page Surface', async () => {
    await renderShell('/schedule');
    expect(document.querySelector('[data-dashboard-canvas="true"]')).toBeNull();
    expect(document.querySelector('[data-page-surface]')).toBeTruthy();
  });

  it('shell is fixed to the viewport (out of document flow)', async () => {
    const { container } = await renderShell('/schedule');
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/fixed/);
    expect(root.className).toMatch(/inset-0/);
    expect(root.className).toMatch(/overflow-hidden/);
  });

  it('Dashboard canvas is the page scroll owner (not document)', async () => {
    await renderShell('/');
    const canvas = document.querySelector(
      '[data-dashboard-canvas="true"]',
    ) as HTMLElement;
    expect(canvas.className).toMatch(/overflow-auto/);
    expect(canvas.className).toMatch(/min-h-0/);
  });
});

type MediaListener = (event: MediaQueryListEvent) => void;

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<MediaListener>();
  const media = {
    matches,
    media: '(max-width: 1023px)',
    onchange: null,
    addEventListener: (type: string, listener: EventListener) => {
      if (type === 'change') listeners.add(listener as MediaListener);
    },
    removeEventListener: (type: string, listener: EventListener) => {
      if (type === 'change') listeners.delete(listener as MediaListener);
    },
    addListener: (listener: MediaListener) => {
      listeners.add(listener);
    },
    removeListener: (listener: MediaListener) => {
      listeners.delete(listener);
    },
    dispatchEvent: () => true,
  };

  const matchMediaMock = vi.fn((query: string) => {
    if (query !== '(max-width: 1023px)') {
      return {
        ...media,
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    }
    return media;
  });
  vi.stubGlobal('matchMedia', matchMediaMock);

  return { matchMediaMock };
}

describe('меню оболочки ниже 1024px', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function renderAt(pathname: string, matches: boolean) {
    const media = stubMatchMedia(matches);
    const view = await renderShell(pathname);
    await waitFor(() => {
      expect(media.matchMediaMock).toHaveBeenCalledWith('(max-width: 1023px)');
    });
    return { ...view, media };
  }

  it('на узкой ширине кнопка есть, меню закрыто', async () => {
    await renderAt('/', true);

    const button = await screen.findByRole('button', { name: 'Открыть меню' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button.getAttribute('aria-controls')).toBeTruthy();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.querySelector('aside')).toBeNull();
    expect(screen.getByRole('button', { name: /Снимок/ })).toBeInTheDocument();

    const crumbs = screen.getByRole('navigation', { name: 'Навигационная цепочка' });
    expect(
      button.compareDocumentPosition(crumbs) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('открытие ставит фокус в диалог', async () => {
    const user = userEvent.setup();
    await renderAt('/schedule', true);

    await user.click(await screen.findByRole('button', { name: 'Открыть меню' }));

    const dialog = await screen.findByRole('dialog', { name: 'Основная навигация' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Закрыть меню' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Закрыть меню' })).toHaveAttribute(
      'aria-controls',
      dialog.id,
    );
    expect(within(dialog).getByRole('link', { name: /Календарный план/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(dialog).getByRole('link', { name: 'Документация' })).toBeInTheDocument();
    expect(dialog.className).toMatch(/w-\[var\(--sidebar-width\)\]/);
    const aside = dialog.querySelector('aside');
    expect(aside).toBeTruthy();
    expect(aside?.parentElement).toBe(dialog);
  });

  it('Escape возвращает фокус на кнопку', async () => {
    const user = userEvent.setup();
    await renderAt('/', true);

    const openButton = await screen.findByRole('button', { name: 'Открыть меню' });
    await user.click(openButton);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const closedButton = screen.getByRole('button', { name: 'Открыть меню' });
    expect(closedButton).toHaveFocus();
    expect(closedButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('клик по затемнению закрывает меню', async () => {
    const user = userEvent.setup();
    await renderAt('/', true);
    await user.click(await screen.findByRole('button', { name: 'Открыть меню' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    const backdrop = document.querySelector('[data-shell-menu-backdrop]');
    expect(backdrop).toBeTruthy();
    await user.click(backdrop as HTMLElement);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Открыть меню' })).toHaveFocus();
  });

  it('переход по ссылке раздела закрывает меню', async () => {
    const user = userEvent.setup();
    const view = await renderAt('/', true);
    await user.click(await screen.findByRole('button', { name: 'Открыть меню' }));
    const dialog = await screen.findByRole('dialog');

    const programs = within(dialog).getByRole('link', { name: 'Программы' });
    programs.addEventListener('click', (event) => event.preventDefault());
    await user.click(programs);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Открыть меню' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    (globalThis as { __testPathname?: string }).__testPathname = '/projects';
    view.rerender(
      <ThemeProvider>
        <SnapshotProvider>
          <AppShell>
            <div>x</div>
          </AppShell>
        </SnapshotProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('на широкой ширине кнопки нет и aside в потоке', async () => {
    const { container } = await renderAt('/schedule', false);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Открыть меню' })).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Закрыть меню' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const root = container.firstElementChild as HTMLElement;
    const aside = root.querySelector(':scope > aside');
    expect(aside).toBeTruthy();
    expect(aside?.className).toMatch(/w-\[var\(--sidebar-width\)\]/);
    expect(aside?.className).not.toMatch(/\bfixed\b/);
    expect(aside?.getAttribute('aria-label')).toBe('Основная навигация');
  });
});
