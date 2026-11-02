'use client';

import { useParams } from 'next/navigation';
import {
  EntityDetailError,
  EntityDetailLoading,
} from '@/components/entity-detail/entity-detail-view';
import { PersonDetailView } from '@/components/people/person-detail-view';
import { fetchPersonDetail } from '@/lib/api-client';
import { useEntityDetailQuery } from '@/lib/entity-detail/use-entity-detail-query';

export default function PersonDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data, status, error, retry } = useEntityDetailQuery(
    id,
    fetchPersonDetail,
  );

  if (!id || status === 'loading') return <EntityDetailLoading />;
  if (status === 'absent' || status === 'error') {
    return <EntityDetailError message={error ?? 'Не найдено'} onRetry={retry} />;
  }
  if (!data) return <EntityDetailLoading />;
  return <PersonDetailView data={data} />;
}
