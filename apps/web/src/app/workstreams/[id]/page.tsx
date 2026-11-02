'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  EntityDetailError,
  EntityDetailLoading,
} from '@/components/entity-detail/entity-detail-view';
import {
  PageContent,
  PageFrame,
} from '@/components/shell/page-frame';
import { WorkstreamDetailView } from '@/components/workstreams/workstream-detail-view';
import { fetchWorkstreamDetail } from '@/lib/api-client';
import { useEntityDetailQuery } from '@/lib/entity-detail/use-entity-detail-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

export default function WorkstreamDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { active } = useSnapshot();
  const { data, status, error, retry } = useEntityDetailQuery(
    id,
    fetchWorkstreamDetail,
  );

  if (!id || status === 'loading') return <EntityDetailLoading />;
  if (status === 'absent') {
    return (
      <PageFrame className="p-6">
        <PageContent mode="page">
          <div
            role="status"
            className="max-w-xl rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-6"
          >
            <h1 className="text-lg font-semibold text-[var(--text)]">{id}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Направление отсутствует в снимке {active}.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--interactive)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              К обзору
            </Link>
          </div>
        </PageContent>
      </PageFrame>
    );
  }
  if (status === 'error') {
    return <EntityDetailError message={error ?? ''} onRetry={retry} />;
  }
  if (!data) return <EntityDetailLoading />;

  return <WorkstreamDetailView data={data} />;
}
