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
import { fetchMilestoneDetail } from '@/lib/api-client';
import { useEntityDetailQuery } from '@/lib/entity-detail/use-entity-detail-query';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { presentMilestoneName, presentWorkstream } from '@/lib/ui-labels';

export default function MilestoneDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { active } = useSnapshot();
  const { data, status, error, retry } = useEntityDetailQuery(
    id,
    fetchMilestoneDetail,
  );

  if (!id || status === 'loading') return <EntityDetailLoading />;
  if (status === 'absent') {
    return (
      <EntityDetailAbsent
        entityType="milestone"
        entityId={id}
        snapshot={active}
      />
    );
  }
  if (status === 'error') {
    return <EntityDetailError message={error ?? ''} onRetry={retry} />;
  }
  if (!data) return <EntityDetailLoading />;

  const name = presentMilestoneName(data.entity.id, data.entity.name);

  return (
    <EntityDetailShell
      title={name}
      entityId={data.entity.id}
      statusSlot={
        <StatusPill family="rag" value={data.entity.rag} entity="milestone" />
      }
      asOf={data.scenarioAsOfDate}
      snapshot={active}
      links={data.links}
      impact={data.impact}
      overview={
        <OverviewDl
          rows={[
            { label: 'ID', value: data.entity.id },
            { label: 'Название', value: name },
            {
              label: 'Рабочий поток',
              value: data.entity.workstream
                ? presentWorkstream(data.entity.workstream)
                : 'Проектный уровень',
            },
            {
              label: 'Базовая дата',
              value: formatDateRu(data.entity.baselineDate),
            },
            {
              label: 'Прогноз',
              value: formatDateRu(data.entity.forecastDate),
            },
            {
              label: 'Отклонение',
              value: formatDeltaDays(data.entity.dateVariance.deltaDays),
            },
          ]}
        />
      }
    />
  );
}
