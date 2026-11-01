'use client';

import type { ReactNode } from 'react';
import type { DashboardOverview } from '@/lib/api-client';
import { formatDateRu } from '@/lib/format/ru';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import {
  presentIssueTitle,
  presentMilestoneName,
} from '@/lib/ui-labels';
import { DecisionPanel } from './decision-panel';
import { ImpactNarrative } from './impact-narrative';
import { StatusPill } from './status-pill';
import { VarianceDelta } from './variance-delta';

function EntitySummary({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {title}
      </h3>
      <div className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
        {children}
      </div>
    </article>
  );
}

export function DashboardView({ data }: { data: DashboardOverview }) {
  const { status, active } = useSnapshot();

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">
          {data.project.name}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {data.project.id} · на дату {formatDateRu(data.scenarioAsOfDate)} ·
          снимок{' '}
          <span className="font-semibold text-[var(--text)]">{active}</span>
          {status === 'loading' ? ' (загрузка…)' : null}
        </p>
      </header>

      <section
        aria-labelledby="delta-strip-heading"
        className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-4"
      >
        <h2
          id="delta-strip-heading"
          className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]"
        >
          Базовый план и прогноз
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <VarianceDelta variance={data.equipment.deliveryVariance} />
          <VarianceDelta variance={data.project.productionStartVariance} />
        </div>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(16rem,22rem)]">
        <div className="space-y-4">
          <ImpactNarrative data={data} />

          <section
            aria-labelledby="exceptions-heading"
            className="space-y-3"
          >
            <h2
              id="exceptions-heading"
              className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]"
            >
              Текущее состояние
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <EntitySummary title="Критическое оборудование">
                <p className="font-medium text-[var(--text)]">
                  {data.equipment.id}
                </p>
                <StatusPill family="equipment" value={data.equipment.status} />
                <p>
                  Поставка {formatDateRu(data.equipment.baselineDelivery)} →{' '}
                  {formatDateRu(data.equipment.forecastDelivery)}
                </p>
              </EntitySummary>

              <EntitySummary title="Проблема">
                {data.issue ? (
                  <>
                    <p className="font-medium text-[var(--text)]">
                      {data.issue.id}
                    </p>
                    <StatusPill family="issue" value={data.issue.status} />
                    <p>
                      {presentIssueTitle(data.issue.id, data.issue.title)}
                    </p>
                  </>
                ) : (
                  <p>В этом снимке проблемы нет.</p>
                )}
              </EntitySummary>

              <EntitySummary title="Риск">
                <p className="font-medium text-[var(--text)]">{data.risk.id}</p>
                <StatusPill family="rag" value={data.risk.rag} entity="risk" />
              </EntitySummary>

              <EntitySummary title="Веха (запуск производства)">
                <p className="font-medium text-[var(--text)]">
                  {data.milestone.id} ·{' '}
                  {presentMilestoneName(
                    data.milestone.id,
                    data.milestone.name,
                  )}
                </p>
                <StatusPill
                  family="rag"
                  value={data.milestone.rag}
                  entity="milestone"
                />
                <p>
                  {formatDateRu(data.milestone.baselineDate)} →{' '}
                  {formatDateRu(data.milestone.forecastDate)}
                </p>
              </EntitySummary>
            </div>
          </section>
        </div>

        <DecisionPanel data={data} />
      </div>
    </div>
  );
}
