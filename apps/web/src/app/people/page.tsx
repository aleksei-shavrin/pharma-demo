'use client';

import { useCallback } from 'react';
import { PeopleListView } from '@/components/people/people-list-view';
import {
  PageListError,
  PageListLoading,
} from '@/components/shell/page-list-states';
import { fetchPeopleList } from '@/lib/api-client';
import { useSnapshotResource } from '@/lib/snapshot/use-snapshot-resource';

export default function PeoplePage() {
  const fetcher = useCallback(
    (projectId: string, snapshotId: Parameters<typeof fetchPeopleList>[1]) =>
      fetchPeopleList(projectId, snapshotId),
    [],
  );
  const { data, status, error, retry } = useSnapshotResource(fetcher);

  if (status === 'loading') {
    return <PageListLoading label="Загрузка участников" />;
  }
  if (status === 'error' || !data) {
    return (
      <PageListError
        message={error ?? 'Не удалось загрузить участников'}
        onRetry={retry}
      />
    );
  }
  return <PeopleListView data={data} />;
}
