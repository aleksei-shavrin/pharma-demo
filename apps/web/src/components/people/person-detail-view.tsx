'use client';

import Link from 'next/link';
import type { PersonDetail } from '@/lib/api-client';
import {
  PageContent,
  PageFrame,
  PageHeader,
} from '@/components/shell/page-frame';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu } from '@/lib/format/ru';
import { presentWorkstream } from '@/lib/ui-labels';

const PREVIEW = 5;

function PreviewSection({
  title,
  ids,
  hrefFor,
}: {
  title: string;
  ids: string[];
  hrefFor?: (id: string) => string;
}) {
  const visible = ids.slice(0, PREVIEW);
  const overflow = ids.length > PREVIEW;
  return (
    <section className="min-w-0">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
        {title}
      </h2>
      <div className="mt-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
        {ids.length === 0 ? (
          <p className="px-3 py-3 text-sm text-[var(--text-muted)]">Нет записей</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {visible.map((id) => (
              <li key={id} className="px-3 py-2 text-sm">
                {hrefFor ? (
                  <Link
                    href={hrefFor(id)}
                    className="font-medium text-[var(--text)] underline-offset-2 hover:underline"
                  >
                    {id}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--text)]">{id}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {overflow ? (
          <p className="border-t border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)]">
            Показаны {PREVIEW} из {ids.length}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function PersonDetailView({ data }: { data: PersonDetail }) {
  const p = data.person;
  return (
    <PageFrame className="p-6" data-page="person-detail">
      <PageHeader>
        <p className="text-xs text-[var(--text-muted)]">
          {p.id} · снимок {data.snapshotId} · на{' '}
          {formatDateRu(data.scenarioAsOfDate)}
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text)]">
          {p.fullNameRu}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{p.roleTitleRu}</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          <Link
            href="/people"
            className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            ← К списку людей
          </Link>
        </p>
      </PageHeader>

      <PageContent mode="page" className="mt-4 flex flex-col gap-4">
        <section className="min-w-0">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Руководитель направлений
          </h2>
          <div className="mt-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
            {data.leadWorkstreamIds.length === 0 ? (
              <p className="px-3 py-3 text-sm text-[var(--text-muted)]">
                Не является руководителем направления
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {data.leadWorkstreamIds.map((ws) => (
                  <li key={ws} className="px-3 py-2 text-sm">
                    <Link
                      href={`/workstreams/${encodeURIComponent(ws)}`}
                      className="font-medium text-[var(--text)] underline-offset-2 hover:underline"
                    >
                      {presentWorkstream(ws)}
                    </Link>
                    <div className="text-xs text-[var(--text-muted)]">{ws}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <PreviewSection
          title="Проблемы"
          ids={data.issueIds}
          hrefFor={(id) => entityDetailHref('issue', id)}
        />
        <PreviewSection title="Решения" ids={data.decisionIds} />
        <PreviewSection
          title="Ответственное оборудование"
          ids={data.equipmentIds}
          hrefFor={(id) => entityDetailHref('equipment', id)}
        />
      </PageContent>
    </PageFrame>
  );
}
