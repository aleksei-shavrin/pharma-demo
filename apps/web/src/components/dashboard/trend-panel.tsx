import type { DashboardOverview } from '@/lib/api-client';
import { ModuleSurface } from './module-surface';

function ChangeTile({
  tone,
  arrow,
  title,
  items,
}: {
  tone: 'better' | 'worse' | 'critical';
  arrow: string;
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  const tint =
    tone === 'better'
      ? 'bg-[var(--status-ok-bg)] text-[var(--status-ok-fg)]'
      : tone === 'worse'
        ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]'
        : 'bg-[var(--status-warn-bg)] text-[var(--status-warn-fg)]';

  return (
    <div
      className={`rounded-[var(--radius-sm)] px-3 py-2.5 ${tint}`}
      data-trend-bucket={tone}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.08em]">
        <span aria-hidden className="mr-1.5 text-sm">
          {arrow}
        </span>
        {title}
      </p>
      <ul className="mt-1.5 space-y-1 text-sm text-[var(--text)]">
        {items.map((line) => (
          <li key={line} className="leading-snug">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Authored Snapshot Changes as distinct semantic tiles — no outer card chrome. */
export function SnapshotChanges({ data }: { data: DashboardOverview }) {
  const { better, worse, unchangedCritical } = data.trend;
  const emptyAll =
    better.length === 0 && worse.length === 0 && unchangedCritical.length === 0;

  return (
    <ModuleSurface data-dashboard-block="trend" className="min-w-0">
      <h2
        id="trend-heading"
        className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
      >
        Изменения с прошлого снимка
      </h2>

      {emptyAll ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]" data-trend="empty">
          Для текущего снимка изменений к предыдущему состоянию нет (базовый
          план).
        </p>
      ) : (
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <ChangeTile
            tone="better"
            arrow="↑"
            title="Улучшилось"
            items={better}
          />
          <ChangeTile tone="worse" arrow="↓" title="Ухудшилось" items={worse} />
          <ChangeTile
            tone="critical"
            arrow="→"
            title="Критичное без изменения"
            items={unchangedCritical}
          />
        </div>
      )}
    </ModuleSurface>
  );
}

/** @deprecated name — use SnapshotChanges */
export const TrendPanel = SnapshotChanges;
