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
  // Catalog register (/milestones) excludes imported KT-* universe rows.
  const milestonesAtRisk = data.milestones.filter(
    (m) => m.rag === 'Red' && !m.id.startsWith('KT-'),
  ).length;

  return [
    {
      id: 'issues',
      label: 'Активные проблемы',
      count: activeIssues,
      href: '/issues-risks?type=Issue&issueStatus=active',
      hrefLabel: 'К активным проблемам',
    },
    {
      id: 'risks',
      label: 'Красные риски',
      count: redRisks,
      href: '/issues-risks?type=Risk&rag=Red',
      hrefLabel: 'К красным рискам',
    },
    {
      id: 'equipment',
      label: 'Крит. оборудование с задержкой',
      count: delayedCritical,
      href: '/equipment?critical=1&status=Delayed',
      hrefLabel: 'К задержанному критическому оборудованию',
    },
    {
      id: 'milestones',
      label: 'Вехи под риском',
      count: milestonesAtRisk,
      href: '/milestones?rag=Red',
      hrefLabel: 'К вехам с RAG Red',
    },
  ];
}

/**
 * R2-U1-R5: compact 2×2 signal matrix inside one surface.
 * Quiet state keeps a single empty message (no empty 2×2).
 */
export function ManagementAttention({ data }: { data: DashboardOverview }) {
  const items = managementAttentionItems(data);
  const active = items.filter((i) => i.count > 0);

  return (
    <section
      aria-labelledby="attention-heading"
      className="flex h-full min-h-0 min-w-0 flex-col rounded-[var(--radius-md)] bg-[var(--surface-raised)] px-4 py-2.5 shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
      data-dashboard-block="management-attention"
    >
      <h2
        id="attention-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
      >
        Управленческое внимание
      </h2>

      {active.length === 0 ? (
        <p className="mt-1 text-sm leading-snug text-[var(--text-secondary)]">
          Нет активных управленческих сигналов.
        </p>
      ) : (
        <div
          className="mt-2 grid grid-cols-2 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-subtle)]"
          data-attention-layout="matrix-2x2"
        >
          {items.map((item, index) => {
            const borderR = index % 2 === 0;
            const borderB = index < 2;
            return (
              <div
                key={item.id}
                className={[
                  'min-w-0 px-3 py-2.5',
                  borderR ? 'border-r border-[var(--border-subtle)]' : '',
                  borderB ? 'border-b border-[var(--border-subtle)]' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                data-attention={item.id}
                data-attention-count={item.count}
              >
                <p className="text-lg font-semibold tabular-nums leading-none text-[var(--text)]">
                  {item.count}
                </p>
                <Link
                  href={item.href}
                  className="mt-1.5 block text-[11px] leading-snug text-[var(--text-secondary)] underline-offset-2 hover:text-[var(--link)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {item.label}
                  <span className="sr-only"> — {item.hrefLabel}</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
