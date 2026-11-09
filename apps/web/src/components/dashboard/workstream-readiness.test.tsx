/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import { WorkstreamStatusMatrix } from './workstream-readiness';

const data = {
  programs: [
    {
      id: 'PRG-RED',
      name: 'Critical program',
      status: 'Red',
      progressPct: 12,
      leafCompleted: 1,
      leafTotal: 8,
      progressFillTone: 'warn',
    },
    {
      id: 'PRG-YEL',
      name: 'Watch program',
      status: 'Yellow',
      progressPct: 40,
      leafCompleted: 4,
      leafTotal: 10,
      progressFillTone: 'warn',
    },
    {
      id: 'PRG-OK',
      name: 'Healthy program',
      status: 'Green',
      progressPct: 80,
      leafCompleted: 8,
      leafTotal: 10,
      progressFillTone: 'ok',
    },
    {
      id: 'PRG-CON',
      name: 'Construction done',
      status: 'Red',
      progressPct: 100,
      leafCompleted: 10,
      leafTotal: 10,
      progressFillTone: 'ok',
    },
  ],
} as DashboardOverview;

describe('WorkstreamStatusMatrix', () => {
  it('renders name | status badge | fixed progress; no row status fill; dual-axis ok', () => {
    render(<WorkstreamStatusMatrix data={data} />);
    const red = screen.getByRole('link', { name: /Critical program/i });
    expect(red).toHaveAttribute('href', '/programs/PRG-RED');
    expect(red).toHaveAttribute('data-rag-surface', 'neutral');
    expect(red).toHaveAttribute('data-program-row', 'name-badge-progress');
    expect(red.className).not.toMatch(/status-danger-bg/);
    expect(red.className).not.toMatch(/status-warn-bg/);
    expect(red.className).toMatch(
      /grid-cols-\[minmax\(0,1fr\)_8\.75rem_minmax\(6rem,8rem\)\]/,
    );

    const badge = red.querySelector('[data-program-status-badge="Red"]');
    expect(badge).toBeTruthy();
    expect(badge).toHaveAttribute('data-program-status-badge-compact', 'true');
    expect(badge?.textContent).toMatch(/Критично/i);
    expect(badge?.className).toMatch(/status-danger/);
    expect(badge?.className).toMatch(/rounded-\[var\(--radius-sm\)\]/);
    expect(badge?.className).not.toMatch(/rounded-full/);
    expect(badge?.className).toMatch(/whitespace-nowrap/);
    expect(badge?.className).toMatch(/leading-none/);
    expect(badge?.className).toMatch(/px-1\.5/);
    expect(badge?.getAttribute('aria-label')).toMatch(/Статус программы/i);

    const yellow = screen.getByRole('link', { name: /Watch program/i });
    const yelBadge = yellow.querySelector('[data-program-status-badge="Yellow"]');
    expect(yelBadge?.textContent).toBe('Требует внимания');
    expect(yelBadge?.className).toMatch(/whitespace-nowrap/);

    const progress = red.querySelector('[data-program-progress="true"]');
    expect(progress).toHaveAttribute('data-program-progress-width', 'fixed');
    expect(progress?.className).toMatch(/w-24/);
    expect(red.querySelector('[data-progress-fill-tone="warn"]')).toBeTruthy();
    expect(red.textContent).toMatch(/12%/);
    expect(red.textContent?.match(/%/g)?.length).toBe(1);
    expect(
      red.querySelector('[data-semantic-progress-compact="true"]'),
    ).toBeTruthy();

    const con = screen.getByRole('link', { name: /Construction done/i });
    expect(con.querySelector('[data-program-status-badge="Red"]')).toBeTruthy();
    expect(con.querySelector('[data-progress-fill-tone="ok"]')).toBeTruthy();
    expect(
      con.querySelector('[data-semantic-progress-pct="true"]')?.textContent,
    ).toBe('100%');
    expect(
      con
        .querySelector('[data-semantic-progress="known"]')
        ?.getAttribute('data-semantic-progress-pct-col'),
    ).toMatch(/ch$/);

    // DOM order: name, badge, progress
    const children = [...red.children];
    expect(children[0]?.textContent).toMatch(/Critical program/i);
    expect(children[1]).toHaveAttribute('data-program-status-badge');
    expect(children[2]).toHaveAttribute('data-program-progress', 'true');

    expect(document.querySelectorAll('a a').length).toBe(0);
    expect(screen.getAllByRole('link')).toHaveLength(4);
  });

  it('empty progress uses tip aria and default fillTone; green badge uses ok tokens', () => {
    render(
      <WorkstreamStatusMatrix
        data={
          {
            programs: [
              {
                id: 'PRG-EMPTY',
                name: 'Empty progress',
                status: 'Green',
                progressPct: null,
                leafCompleted: 0,
                leafTotal: 0,
              },
            ],
          } as DashboardOverview
        }
      />,
    );
    const link = screen.getByRole('link', { name: /Empty progress/i });
    expect(link.querySelector('[data-program-status-badge="Green"]')?.className).toMatch(
      /status-ok/,
    );
    expect(link.querySelector('[data-semantic-progress="empty"]')).toBeTruthy();
    expect(link.querySelector('[data-program-progress="true"]')?.getAttribute('title')).toMatch(
      /календарное отклонение/i,
    );
  });
});
