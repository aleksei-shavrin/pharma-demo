'use client';

import { useParams } from 'next/navigation';
import {
  EntityDetailAbsent,
  EntityDetailError,
  EntityDetailLoading,
} from '@/components/entity-detail/entity-detail-view';
import { PersonDetailView } from '@/components/people/person-detail-view';
import { fetchPersonDetail } from '@/lib/api-client';
import { useEntityDetailQuery } from '@/lib/entity-detail/use-entity-detail-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

export default function PersonDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { active } = useSnapshot();
  const { data, status, error, retry } = useEntityDetailQuery(
    id,
    fetchPersonDetail,
  );

  if (!id || status === 'loading') return <EntityDetailLoading />;
  if (status === 'absent') {
    return (
      <EntityDetailAbsent entityType="person" entityId={id} snapshot={active} />
    );
  }
  if (status === 'error') {
    return <EntityDetailError message={error ?? 'Не найдено'} onRetry={retry} />;
  }
  if (!data) return <EntityDetailLoading />;
  return <PersonDetailView data={data} />;
}
