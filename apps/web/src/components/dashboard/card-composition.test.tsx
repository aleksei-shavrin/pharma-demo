/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { DashboardOverview } from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { dashboardOverviewFixture } from '@/lib/test/dashboard-overview-fixture';
import { DecisionAction } from './decision-panel';
import { SnapshotChanges } from './trend-panel';
import { TopExceptionsPanel } from './top-exceptions-panel';

afterEach(() => {
  cleanup();
});

function overview(
  snapshotId: SnapshotId,
  patch?: Partial<DashboardOverview>,
): DashboardOverview {
  return dashboardOverviewFixture(snapshotId, patch);
}

describe('dashboard card composition', () => {
  it('critical exceptions use border-box chrome, not outer ring', () => {
    // 06 fixture links RISK-001 Red → critical evidence.
    const data = overview('06');
    const { container } = render(<TopExceptionsPanel data={data} />);
    const critical = container.querySelectorAll(
      '[data-exception-critical="true"]',
    );
    expect(critical.length).toBeGreaterThan(0);
    for (const el of critical) {
      expect(el.getAttribute('data-exception-chrome')).toBe('critical-box');
      expect(el.className).toMatch(/border/);
      expect(el.className).not.toMatch(/\bring-1\b/);
      expect(el.className).not.toMatch(/border-b /);
    }
    const list = container.querySelector('[data-top-exceptions="list"]');
    expect(list?.className).toMatch(/px-1/);
    expect(list?.className).toMatch(/py-1/);
  });

  it('non-critical rows keep divider chrome; empty baseline has no list', () => {
    // Issue-only links are navigable but not criticalEvidence.
    const yellow = overview('02', {
      topExceptions: [
        {
          id: 'TEX-NEUTRAL',
          title: 'Локальное замечание оболочки',
          causeImpact: 'Без критических фактов в ссылках',
          links: [{ type: 'issue', id: 'ISS-BLD-01' }],
          priority: 1,
        },
      ],
    });
    const { container: c2 } = render(<TopExceptionsPanel data={yellow} />);
    const neutrals = c2.querySelectorAll(
      '[data-exception-chrome="neutral-divider"]',
    );
    expect(neutrals.length).toBe(1);
    expect(c2.querySelector('[data-exception-badge="critical"]')).toBeNull();
    expect(neutrals[0]?.className).toMatch(/border-b/);

    cleanup();
    const { container: c1 } = render(
      <TopExceptionsPanel data={overview('01')} />,
    );
    expect(c1.querySelector('[data-top-exceptions="empty"]')).toBeTruthy();
    expect(c1.querySelector('[data-top-exceptions="list"]')).toBeNull();
  });

  it('critical with typed PS-driver shows Δ chip; orphan title has no title link', () => {
    const data = overview('03');
    const { container } = render(<TopExceptionsPanel data={data} />);
    expect(
      container.querySelector('[data-exception-badge="critical"]'),
    ).toBeTruthy();
    // 03 has PS drivers + positive Δ → chip text from formatDeltaDays.
    expect(container.textContent).toMatch(/\+/);

    cleanup();
    const orphan = overview('02', {
      topExceptions: [
        {
          id: 'TEX-ORPHAN',
          title: 'Без ссылок',
          causeImpact: 'Нейтральная строка без навигации',
          links: [],
          priority: 1,
        },
      ],
    });
    const { container: cOrphan } = render(
      <TopExceptionsPanel data={orphan} />,
    );
    expect(
      cOrphan.querySelector('[data-exception-title-link="true"]'),
    ).toBeNull();
    expect(screen.getByText('Без ссылок')).toBeInTheDocument();
  });

  it('ChangeTile tones include semantic 1px border classes', () => {
    const data = overview('11', {
      trend: {
        better: ['Пакет стабилизирован'],
        worse: ['HVAC остаётся критичным'],
        unchangedCritical: ['PS отклонение без улучшения'],
      },
    });
    const { container } = render(<SnapshotChanges data={data} />);
    const better = container.querySelector('[data-trend-bucket="better"]');
    const worse = container.querySelector('[data-trend-bucket="worse"]');
    const critical = container.querySelector('[data-trend-bucket="critical"]');
    expect(better?.className).toMatch(/border-\[var\(--status-ok-border\)\]/);
    expect(worse?.className).toMatch(/border-\[var\(--status-danger-border\)\]/);
    expect(critical?.className).toMatch(
      /border-\[var\(--status-warn-border\)\]/,
    );
    expect(better?.getAttribute('data-trend-border')).toBe('semantic');
  });

  it('trend empty baseline and partial empty tiles stay honest', () => {
    const { container } = render(<SnapshotChanges data={overview('01')} />);
    expect(container.querySelector('[data-trend="empty"]')).toBeTruthy();
    expect(container.querySelector('[data-trend-bucket]')).toBeNull();

    cleanup();
    // Only worse populated — better/critical ChangeTiles return null.
    const partial = overview('02');
    const { container: c2 } = render(<SnapshotChanges data={partial} />);
    expect(c2.querySelector('[data-trend-bucket="worse"]')).toBeTruthy();
    expect(c2.querySelector('[data-trend-bucket="better"]')).toBeNull();
    expect(c2.querySelector('[data-trend-bucket="critical"]')).toBeNull();
  });

  it('decision card: one control object, related decision group, footer CTAs', () => {
    const data = overview('06');
    render(<DecisionAction data={data} />);
    expect(
      screen.getByRole('heading', { name: 'Прогноз и решение' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Объект контроля: Запуск производства'),
    ).toBeInTheDocument();
    // Scope caption once — not tripled as heading/body echoes.
    expect(
      screen.getAllByText(/Объект контроля: Запуск производства/).length,
    ).toBe(1);
    expect(screen.getByText('Связанное решение')).toBeInTheDocument();
    expect(screen.getByText('DEC-001')).toBeInTheDocument();
    const openDecision = screen.getByRole('link', { name: 'Открыть решение' });
    expect(openDecision).toHaveAttribute('href', '/decisions?q=DEC-001');
    expect(document.querySelector('[data-decision-footer="cta"]')).toBeTruthy();
    expect(
      document.querySelector('[data-decision-execution-source="demo"]'),
    ).toBeTruthy();
  });

  it('needed state keeps callout and issue CTA without related-decision group', () => {
    const data = overview('03');
    expect(data.decisionPanelState).toBe('needed');
    render(<DecisionAction data={data} />);
    expect(screen.getByText('Требуется решение')).toBeInTheDocument();
    expect(screen.queryByText('Связанное решение')).toBeNull();
    expect(
      document.querySelector('[data-decision-cta="open-issue"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-decision-related="true"]'),
    ).toBeNull();
    expect(screen.getByText(/отклонение сохраняется/)).toBeInTheDocument();
  });

  it('completed residual shows short caveat; absent panel is null', () => {
    const completed = overview('15', {
      decisionPanelState: 'recorded',
      decisionHonesty: {
        recoveryExecuted: false,
        forecastDeviation: 'deviation_persists',
      },
      decisions: overview('06').decisions.map((d) =>
        d.id === 'DEC-001'
          ? {
              ...d,
              executionStatus: 'completed' as const,
              execution: d.execution
                ? {
                    ...d.execution,
                    status: 'completed' as const,
                    evidenceNote: 'Действие отмечено выполненным (демо)',
                  }
                : null,
            }
          : d,
      ),
    });
    render(<DecisionAction data={completed} />);
    expect(
      screen.getByText(
        'Выполнение действия не означает восстановление прогноза.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Связанное решение')).toBeInTheDocument();

    cleanup();
    const { container } = render(<DecisionAction data={overview('01')} />);
    expect(
      container.querySelector('[data-dashboard-block="decisions"]'),
    ).toBeNull();
  });

  it('recorded without DEC-001 shows missing callout; no-exec note when execution null', () => {
    const missing = overview('06', {
      decisions: overview('06').decisions.filter((d) => d.id !== 'DEC-001'),
    });
    render(<DecisionAction data={missing} />);
    expect(
      document.querySelector('[data-decision-callout="recorded-missing"]'),
    ).toBeTruthy();
    expect(screen.queryByText('Связанное решение')).toBeNull();

    cleanup();
    const noExec = overview('06', {
      decisions: overview('06').decisions.map((d) =>
        d.id === 'DEC-001'
          ? {
              ...d,
              note: '',
              execution: null,
              executionStatus: 'unknown' as const,
            }
          : d,
      ),
    });
    render(<DecisionAction data={noExec} />);
    expect(screen.getByText(/Нет данных об исполнении/)).toBeInTheDocument();
  });

  it('within_baseline hides deviation suffix; needed without issue omits issue CTA', () => {
    const within = overview('06', {
      decisionHonesty: {
        recoveryExecuted: false,
        forecastDeviation: 'within_baseline',
      },
      project: {
        ...overview('06').project,
        productionStartVariance: {
          ...overview('06').project.productionStartVariance,
          deltaDays: 0,
        },
      },
    });
    render(<DecisionAction data={within} />);
    expect(screen.queryByText(/отклонение сохраняется/)).toBeNull();

    cleanup();
    const neededNoIssue = overview('03', {
      issues: [],
    });
    render(<DecisionAction data={neededNoIssue} />);
    expect(
      document.querySelector('[data-decision-cta="open-issue"]'),
    ).toBeNull();
    expect(
      document.querySelector('[data-decision-cta="open-decisions"]'),
    ).toBeTruthy();
  });
});
