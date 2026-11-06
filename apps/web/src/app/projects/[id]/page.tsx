'use client';

import { useParams } from 'next/navigation';
import {
  EntityDetailError,
  EntityDetailLoading,
} from '@/components/entity-detail/entity-detail-view';
import { ProjectCardView, RecordMissing } from '@/components/portfolio/portfolio-views';
import { fetchAnalystProject } from '@/lib/api-client';
import { useEntityDetailQuery } from '@/lib/entity-detail/use-entity-detail-query';

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data, status, error, retry } = useEntityDetailQuery(id, fetchAnalystProject);

  if (!id || status === 'loading') return <EntityDetailLoading />;
  if (status === 'absent') return <RecordMissing id={id} />;
  if (status === 'error' || !data) {
    return <EntityDetailError message={error ?? 'Ошибка'} onRetry={retry} />;
  }
  return <ProjectCardView data={data} />;
}
