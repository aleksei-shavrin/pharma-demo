'use client';

import { useCallback } from 'react';
import { ProgramListView } from '@/components/portfolio/portfolio-views';
import {
  PageListError,
  PageListLoading,
} from '@/components/shell/page-list-states';
import { fetchProgramList } from '@/lib/api-client';
import { useSnapshotResource } from '@/lib/snapshot/use-snapshot-resource';

export default function ProgramsPage() {
  const fetcher = useCallback(
    (projectId: string, snapshotId: Parameters<typeof fetchProgramList>[1]) =>
      fetchProgramList(projectId, snapshotId),
    [],
  );
  const { data, status, error, retry } = useSnapshotResource(fetcher);

  if (status === 'loading') return <PageListLoading label="Загрузка программ" />;
  if (status === 'error') {
    return (
      <PageListError message={error ?? 'Не удалось загрузить программы'} onRetry={retry} />
    );
  }
  return <ProgramListView items={data?.items ?? []} />;
}
