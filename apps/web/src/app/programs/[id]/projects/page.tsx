'use client';

import { useParams } from 'next/navigation';
import {
  EntityDetailError,
  EntityDetailLoading,
} from '@/components/entity-detail/entity-detail-view';
import {
  ProgramCompositionView,
  RecordMissing,
} from '@/components/portfolio/portfolio-views';
import { fetchProgramDetail } from '@/lib/api-client';
import { useEntityDetailQuery } from '@/lib/entity-detail/use-entity-detail-query';

export default function ProgramCompositionPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data, status, error, retry } = useEntityDetailQuery(id, fetchProgramDetail);

  if (!id || status === 'loading') return <EntityDetailLoading />;
  if (status === 'absent') return <RecordMissing id={id} kind="program" />;
  if (status === 'error' || !data) {
    return <EntityDetailError message={error ?? 'Ошибка'} onRetry={retry} />;
  }
  return <ProgramCompositionView data={data} />;
}
