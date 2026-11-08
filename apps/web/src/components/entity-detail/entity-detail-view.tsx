'use client';

import Link from 'next/link';
import { useId, useState, type ReactNode } from 'react';
import { DetailImpact } from '@/components/entity-detail/detail-impact';
import { DetailLinks } from '@/components/entity-detail/detail-links';
import type {
  EntityImpact,
  EntityLink,
  EntityRefType,
} from '@/lib/api-client';
import {
  registerCtaLabel,
  registerHrefForEntity,
} from '@/lib/entity-routes';
import { formatDateRu } from '@/lib/format/ru';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { entityTypeLabel } from '@/lib/ui-labels';
import {
  PageContent,
  PageFrame,
  PageHeader,
} from '@/components/shell/page-frame';

type TabId = 'overview' | 'links' | 'impact';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'links', label: 'Связи' },
  { id: 'impact', label: 'Влияние' },
];

export function EntityDetailLoading() {
  return (
    <PageFrame className="p-6">
      <PageContent mode="page">
        <div
          className="space-y-3"
          role="status"
          aria-busy="true"
          aria-live="polite"
          data-page-state="loading"
        >
          <div className="h-5 w-40 animate-pulse rounded bg-[var(--border-subtle)]" />
          <div className="h-4 w-64 animate-pulse rounded bg-[var(--border-subtle)]" />
          <div className="mt-4 space-y-2">
            <div className="h-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--border-subtle)]" />
            <div className="h-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--border-subtle)]" />
            <div className="h-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--border-subtle)]" />
          </div>
          <span className="sr-only">Загрузка…</span>
        </div>
      </PageContent>
    </PageFrame>
  );
}

export function EntityDetailError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <PageFrame className="p-6">
      <PageContent mode="page">
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-4"
        >
          <p className="text-sm text-[var(--text)]">
            Не удалось загрузить карточку. Повторите попытку.
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text)] hover:bg-[var(--interactive)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Повторить
          </button>
        </div>
      </PageContent>
    </PageFrame>
  );
}

export function EntityDetailAbsent({
  entityType,
  entityId,
  snapshot,
}: {
  entityType: EntityRefType;
  entityId: string;
  snapshot: SnapshotId;
}) {
  const href = registerHrefForEntity(entityType);
  const cta = registerCtaLabel(entityType);
  const typeName = entityTypeLabel(entityType);
  return (
    <PageFrame className="p-6">
      <PageContent mode="page">
        <div
          role="status"
          data-page-state="absent"
          className="max-w-xl rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-6"
        >
          <h1 className="text-lg font-semibold text-[var(--text)]">{entityId}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {typeName} отсутствует в снимке {snapshot}.
          </p>
          <Link
            href={href}
            className="mt-4 inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--interactive)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            {cta}
          </Link>
        </div>
      </PageContent>
    </PageFrame>
  );
}

export function EntityDetailShell({
  title,
  entityId,
  statusSlot,
  asOf,
  snapshot,
  links,
  impact,
  overview,
}: {
  /** Director-facing primary heading (RU name/title). */
  title: string;
  /** Secondary machine id shown under the title. */
  entityId: string;
  statusSlot: ReactNode;
  asOf: string;
  snapshot: SnapshotId;
  links: EntityLink[];
  impact: EntityImpact;
  overview: ReactNode;
}) {
  const baseId = useId();
  const [tab, setTab] = useState<TabId>('overview');

  return (
    <PageFrame className="p-6">
      <PageHeader className="space-y-2">
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">
            {title}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">{entityId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {statusSlot}
          <span className="text-[var(--text-muted)]">
            Снимок {snapshot} · на {formatDateRu(asOf)}
          </span>
        </div>
        <div
          role="tablist"
          aria-label="Разделы карточки"
          className="flex gap-1 border-b border-[var(--border)]"
        >
          {TABS.map((t) => {
            const selected = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`${baseId}-${t.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => {
                  const idx = TABS.findIndex((x) => x.id === t.id);
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setTab(TABS[(idx + 1) % TABS.length].id);
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setTab(TABS[(idx - 1 + TABS.length) % TABS.length].id);
                  }
                }}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                  selected
                    ? 'border-[var(--text)] text-[var(--text)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </PageHeader>

      <PageContent mode="page" className="mt-4">
        <div
          role="tabpanel"
          id={`${baseId}-panel-overview`}
          aria-labelledby={`${baseId}-overview`}
          hidden={tab !== 'overview'}
          className="space-y-3"
        >
          {tab === 'overview' ? overview : null}
        </div>
        <div
          role="tabpanel"
          id={`${baseId}-panel-links`}
          aria-labelledby={`${baseId}-links`}
          hidden={tab !== 'links'}
        >
          {tab === 'links' ? <DetailLinks links={links} /> : null}
        </div>
        <div
          role="tabpanel"
          id={`${baseId}-panel-impact`}
          aria-labelledby={`${baseId}-impact`}
          hidden={tab !== 'impact'}
        >
          {tab === 'impact' ? <DetailImpact impact={impact} /> : null}
        </div>
      </PageContent>
    </PageFrame>
  );
}

/**
 * Compact read-only property summary (not a form).
 * Label+value stay on one row; single sequential column so related
 * dates/deltas are not split across wide two-column gaps.
 */
export function OverviewDl({
  rows,
}: {
  rows: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="w-fit max-w-full divide-y divide-[var(--border-subtle)] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)]">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline gap-x-3 px-3 py-2"
        >
          <dt className="shrink-0 text-xs font-medium text-[var(--text-muted)]">
            {row.label}
          </dt>
          <dd className="min-w-0 text-sm text-[var(--text)]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
