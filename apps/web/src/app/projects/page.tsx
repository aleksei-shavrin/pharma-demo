'use client';

import { useCallback } from 'react';
import { ProjectListView } from '@/components/portfolio/portfolio-views';
import {
  PageListError,
  PageListLoading,
} from '@/components/shell/page-list-states';
import { fetchAnalystProjects } from '@/lib/api-client';
import { useSnapshotResource } from '@/lib/snapshot/use-snapshot-resource';

export default function ProjectsPage() {
  const fetcher = useCallback(
    (
      projectId: string,
      snapshotId: Parameters<typeof fetchAnalystProjects>[1],
    ) => fetchAnalystProjects(projectId, snapshotId),
    [],
  );
  const { data, status, error, retry } = useSnapshotResource(fetcher);

  if (status === 'loading') return <PageListLoading label="Загрузка проектов" />;
  if (status === 'error') {
    return (
      <PageListError message={error ?? 'Не удалось загрузить проекты'} onRetry={retry} />
    );
  }
  return <ProjectListView items={data?.items ?? []} />;
}
