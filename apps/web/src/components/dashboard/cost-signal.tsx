'use client';

import { DEMO_PORTFOLIO_ID } from '@/lib/demo-portfolio-id';

import { useEffect, useState } from 'react';
import {
  fetchProjectCosts,
  type ProjectCost,
} from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { formatRubCompactRu } from '@/lib/format/ru';
import { DEMO_PROJECT_BAC_RUB } from '@/lib/api-client';
import {
  costMetricTipText,
  type CostMetricId,
} from '@/lib/dashboard/cost-metric-labels';
import { MetricAbbrTip } from './metric-abbr-tip';


type Props = {
  snapshotId: SnapshotId;
  /** Optional injected cost for tests — skips fetch. */
  projectCost?: ProjectCost | null;
};

function MetricRow({
  id,
  valueClass,
  value,
  valueAttrs,
}: {
  id: CostMetricId;
  valueClass: string;
  value: string;
  valueAttrs?: Record<string, string | number | undefined>;
}) {
  const short = id === 'reserve' ? 'Резерв' : id;
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--text-muted)]">
        <MetricAbbrTip abbr={short} tip={costMetricTipText(id)}>
          {short}
        </MetricAbbrTip>
      </dt>
      <dd className={valueClass} {...valueAttrs}>
        {value}
      </dd>
    </div>
  );
}

/**
 * Compact executive cost signal (R2-U1) — not a mini /costs page.
 * Authoritative integers from M1 cost read model.
 * R2-U1-R1: never show ready cost for a different snapshot than committed.
 */
export function CostSignal({ snapshotId, projectCost }: Props) {
  const [cost, setCost] = useState<ProjectCost | null>(
    projectCost !== undefined ? projectCost : null,
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (projectCost !== undefined) {
      setCost(projectCost);
      setFailed(false);
      return;
    }
    let cancelled = false;
    const requested = snapshotId;
    setCost(null);
    setFailed(false);
    void fetchProjectCosts(DEMO_PORTFOLIO_ID, requested)
      .then((overview) => {
        if (cancelled) return;
        if (overview.snapshotId !== requested) return;
        setCost(overview.project);
      })
      .catch(() => {
        if (!cancelled) {
          setCost(null);
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [snapshotId, projectCost]);

  if (failed) {
    return (
      <div
        data-cost-signal
        data-cost-signal-state="error"
        data-cost-for-snapshot={snapshotId}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          Стоимость
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">Нет данных</p>
      </div>
    );
  }

  if (!cost) {
    return (
      <div
        data-cost-signal
        data-cost-signal-state="loading"
        data-cost-for-snapshot={snapshotId}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          Стоимость
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">Загрузка…</p>
      </div>
    );
  }

  const vacDanger = cost.vacRub < 0;
  const reserveTight =
    cost.contingencyRemainingRub < cost.contingencyTotalRub * 0.25;

  return (
    <div
      data-cost-signal
      data-cost-signal-state="ready"
      data-cost-for-snapshot={snapshotId}
      data-eac={cost.eacRub}
      data-vac={cost.vacRub}
      data-bac={cost.approvedBudgetRub}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
        Стоимость
      </p>
      <dl className="mt-2 space-y-1.5 text-sm">
        <MetricRow
          id="EAC"
          valueClass="font-semibold tabular-nums text-[var(--text)]"
          value={formatRubCompactRu(cost.eacRub)}
        />
        <MetricRow
          id="VAC"
          valueClass={`font-semibold tabular-nums ${
            vacDanger
              ? 'text-[var(--status-danger-fg)]'
              : 'text-[var(--status-ok-fg)]'
          }`}
          value={formatRubCompactRu(cost.vacRub)}
          valueAttrs={{ 'data-vac-value': 'true' }}
        />
        <MetricRow
          id="BAC"
          valueClass="tabular-nums text-[var(--text-secondary)]"
          value={formatRubCompactRu(
            cost.approvedBudgetRub || DEMO_PROJECT_BAC_RUB,
          )}
        />
        <div className="flex items-baseline justify-between gap-3 pt-0.5">
          <dt className="text-[var(--text-muted)]">
            <MetricAbbrTip
              abbr="Резерв"
              tip={costMetricTipText('reserve')}
            >
              Резерв
            </MetricAbbrTip>
          </dt>
          <dd
            className={`tabular-nums text-xs ${
              reserveTight
                ? 'text-[var(--status-warn-fg)]'
                : 'text-[var(--text-secondary)]'
            }`}
            data-contingency-remaining={cost.contingencyRemainingRub}
          >
            {formatRubCompactRu(cost.contingencyRemainingRub)} ост.
          </dd>
        </div>
      </dl>
    </div>
  );
}
