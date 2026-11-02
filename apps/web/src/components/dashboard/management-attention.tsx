import Link from 'next/link';
import type { DashboardOverview } from '@/lib/api-client';

type AttentionItem = {
  id: string;
  label: string;
  count: number;
  href: string;
  hrefLabel: string;
};

/**
 * Compact counts from backend collections — no scoring.
 * Closed issues do not count as active attention.
 */
export function managementAttentionItems(
  data: DashboardOverview,
): AttentionItem[] {
  const activeIssues = data.issues.filter(
    (i) => i.status === 'Open' || i.status === 'Mitigating',
  ).length;
  const redRisks = data.risks.filter((r) => r.rag === 'Red').length;
  const delayedCritical = data.equipment.filter(
    (e) => e.critical && e.status === 'Delayed',
  ).length;
  const milestonesAtRisk = data.milestones.filter((m) => m.rag === 'Red').length;

  return [
    {
      id: 'issues',
      label: 'Активные проблемы',
      count: activeIssues,
      href: '/issues-risks',
      hrefLabel: 'К проблемам и рискам',
    },
    {
      id: 'risks',
      label: 'Красные риски',
      count: redRisks,
      href: '/issues-risks',
      hrefLabel: 'К проблемам и рискам',
    },
    {
      id: 'equipment',
      label: 'Крит. оборудование с задержкой',
      count: delayedCritical,
      href: '/equipment',
      hrefLabel: 'К оборудованию',
    },
    {
      id: 'milestones',
      label: 'Вехи под риском',
      count: milestonesAtRisk,
      href: '/milestones',
      hrefLabel: 'К вехам',
    },
  ];
}

export function ManagementAttention({ data }: { data: DashboardOverview }) {
  const items = managementAttentionItems(data);
  const active = items.filter((i) => i.count > 0);

  return (
    <section
      aria-labelledby="attention-heading"
      className="rounded-[var(--radius-md)] bg-[var(--surface-raised)] px-4 py-3 shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
      data-dashboard-block="management-attention"
    >
      <h2
        id="attention-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
      >
        Управленческое внимание
      </h2>

      {active.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Активных сигналов внимания нет.
        </p>
      ) : (
        <ul className="mt-2 flex flex-wrap items-baseline gap-x-1 gap-y-1.5 text-sm">
          {active.map((item, index) => (
            <li
              key={item.id}
              className="inline-flex items-baseline gap-1.5"
              data-attention={item.id}
              data-attention-count={item.count}
            >
              {index > 0 ? (
                <span className="mx-1.5 text-[var(--border)]" aria-hidden>
                  ·
                </span>
              ) : null}
              <span className="text-base font-semibold tabular-nums text-[var(--text)]">
                {item.count}
              </span>
              <Link
                href={item.href}
                className="text-[var(--text-secondary)] underline-offset-2 hover:text-[var(--link)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              >
                {item.label}
                <span className="sr-only"> — {item.hrefLabel}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
