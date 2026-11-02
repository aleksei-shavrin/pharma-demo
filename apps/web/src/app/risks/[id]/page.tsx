'use client';

import { useParams } from 'next/navigation';
import { StatusPill } from '@/components/dashboard/status-pill';
import {
  EntityDetailAbsent,
  EntityDetailError,
  EntityDetailLoading,
  EntityDetailShell,
  OverviewDl,
} from '@/components/entity-detail/entity-detail-view';
import { fetchRiskDetail } from '@/lib/api-client';
import { useEntityDetailQuery } from '@/lib/entity-detail/use-entity-detail-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { presentWorkstream } from '@/lib/ui-labels';

export default function RiskDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { active } = useSnapshot();
  const { data, status, error, retry } = useEntityDetailQuery(
    id,
    fetchRiskDetail,
  );

  if (!id || status === 'loading') return <EntityDetailLoading />;
  if (status === 'absent') {
    return (
      <EntityDetailAbsent entityType="risk" entityId={id} snapshot={active} />
    );
  }
  if (status === 'error') {
    return <EntityDetailError message={error ?? ''} onRetry={retry} />;
  }
  if (!data) return <EntityDetailLoading />;

  return (
    <EntityDetailShell
      title={data.entity.title}
      entityId={data.entity.id}
      statusSlot={
        <StatusPill family="rag" value={data.entity.rag} entity="risk" />
      }
      asOf={data.scenarioAsOfDate}
      snapshot={active}
      links={data.links}
      impact={data.impact}
      overview={
        <OverviewDl
          rows={[
            { label: 'ID', value: data.entity.id },
            { label: 'Название', value: data.entity.title },
            {
              label: 'Рабочий поток',
              value: presentWorkstream(data.entity.workstream),
            },
          ]}
        />
      }
    />
  );
}
