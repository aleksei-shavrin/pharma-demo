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
import { fetchIssueDetail } from '@/lib/api-client';
import { useEntityDetailQuery } from '@/lib/entity-detail/use-entity-detail-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { presentIssueTitle } from '@/lib/ui-labels';

export default function IssueDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { active } = useSnapshot();
  const { data, status, error, retry } = useEntityDetailQuery(
    id,
    fetchIssueDetail,
  );

  if (!id || status === 'loading') return <EntityDetailLoading />;
  if (status === 'absent') {
    return (
      <EntityDetailAbsent entityType="issue" entityId={id} snapshot={active} />
    );
  }
  if (status === 'error') {
    return <EntityDetailError message={error ?? ''} onRetry={retry} />;
  }
  if (!data) return <EntityDetailLoading />;

  const title = presentIssueTitle(data.entity.id, data.entity.title);

  return (
    <EntityDetailShell
      title={`${data.entity.id} · ${title}`}
      statusSlot={<StatusPill family="issue" value={data.entity.status} />}
      asOf={data.scenarioAsOfDate}
      snapshot={active}
      links={data.links}
      impact={data.impact}
      overview={
        <OverviewDl
          rows={[
            { label: 'ID', value: data.entity.id },
            { label: 'Название', value: title },
            { label: 'Ответственный', value: data.entity.owner },
          ]}
        />
      }
    />
  );
}
