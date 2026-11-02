import type { DashboardOverview } from '@/lib/api-client';

function TrendGroup({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'better' | 'worse' | 'critical';
}) {
  if (items.length === 0) return null;

  const accent =
    tone === 'better'
      ? 'border-[var(--status-ok-border)] text-[var(--status-ok-fg)]'
      : tone === 'worse'
        ? 'border-[var(--status-danger-border)] text-[var(--status-danger-fg)]'
        : 'border-[var(--status-warn-border)] text-[var(--status-warn-fg)]';

  return (
    <div className={`border-l-2 pl-3 ${accent}`} data-trend-bucket={tone}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em]">
        {title}
      </h3>
      <ul className="mt-1.5 space-y-1 text-sm text-[var(--text-secondary)]">
        {items.map((line) => (
          <li key={line} className="leading-snug text-[var(--text)]">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Fixture-authored trend only — no frontend snapshot diff. */
export function TrendPanel({ data }: { data: DashboardOverview }) {
  const { better, worse, unchangedCritical } = data.trend;
  const emptyAll =
    better.length === 0 && worse.length === 0 && unchangedCritical.length === 0;

  return (
    <section
      aria-labelledby="trend-heading"
      className="rounded-[var(--radius-md)] bg-[var(--surface-raised)] px-4 py-3 shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
      data-dashboard-block="trend"
    >
      <h2
        id="trend-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
      >
        Тренд к предыдущему снимку
      </h2>

      {emptyAll ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]" data-trend="empty">
          Для текущего снимка изменений к предыдущему состоянию нет (базовый
          план).
        </p>
      ) : (
        <div className="mt-2 grid gap-3 lg:grid-cols-3">
          <TrendGroup title="Улучшилось" items={better} tone="better" />
          <TrendGroup title="Ухудшилось" items={worse} tone="worse" />
          <TrendGroup
            title="Критичное без изменения"
            items={unchangedCritical}
            tone="critical"
          />
        </div>
      )}
    </section>
  );
}
