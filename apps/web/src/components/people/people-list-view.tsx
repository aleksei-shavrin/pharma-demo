'use client';

import Link from 'next/link';
import type { PersonList } from '@/lib/api-client';
import {
  PageContent,
  PageFrame,
  PageHeader,
} from '@/components/shell/page-frame';
import { presentWorkstream } from '@/lib/ui-labels';
import { formatDateRu } from '@/lib/format/ru';

export function PeopleListView({ data }: { data: PersonList }) {
  return (
    <PageFrame className="gap-4 p-6" data-page="people-list">
      <PageHeader className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">
          Люди
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          На дату {formatDateRu(data.scenarioAsOfDate)} · снимок{' '}
          <span className="font-semibold text-[var(--text)]">
            {data.snapshotId}
          </span>
        </p>
      </PageHeader>
      <PageContent mode="workspace">
        <div className="min-h-0 flex-1 overflow-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Каталог людей проекта</caption>
            <thead className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface-sunken)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-semibold">Человек</th>
                <th className="px-3 py-2 font-semibold">Роль</th>
                <th className="px-3 py-2 font-semibold">Направление</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/people/${encodeURIComponent(p.id)}`}
                      className="font-medium text-[var(--text)] underline-offset-2 hover:underline"
                    >
                      {p.fullNameRu}
                    </Link>
                    <div className="text-xs text-[var(--text-muted)]">{p.id}</div>
                  </td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">
                    {p.roleTitleRu}
                  </td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">
                    {p.primaryWorkstreamId
                      ? presentWorkstream(p.primaryWorkstreamId)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageContent>
    </PageFrame>
  );
}
