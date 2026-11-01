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
import { fetchEquipmentDetail } from '@/lib/api-client';
import { useEntityDetailQuery } from '@/lib/entity-detail/use-entity-detail-query';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

export default function EquipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { active } = useSnapshot();
  const { data, status, error, retry } = useEntityDetailQuery(
    id,
    fetchEquipmentDetail,
  );

  if (!id || status === 'loading') return <EntityDetailLoading />;
  if (status === 'absent') {
    return (
      <EntityDetailAbsent
        entityType="equipment"
        entityId={id}
        snapshot={active}
      />
    );
  }
  if (status === 'error') {
    return <EntityDetailError message={error ?? ''} onRetry={retry} />;
  }
  if (!data) return <EntityDetailLoading />;

  return (
    <EntityDetailShell
      title={data.entity.id}
      statusSlot={
        <StatusPill family="equipment" value={data.entity.status} />
      }
      asOf={data.scenarioAsOfDate}
      snapshot={active}
      links={data.links}
      impact={data.impact}
      overview={
        <OverviewDl
          rows={[
            { label: 'ID', value: data.entity.id },
            {
              label: 'Критичность',
              value: data.entity.critical ? 'Да' : 'Нет',
            },
            {
              label: 'Базовая поставка',
              value: formatDateRu(data.entity.baselineDelivery),
            },
            {
              label: 'Прогноз поставки',
              value: formatDateRu(data.entity.forecastDelivery),
            },
            {
              label: 'Отклонение',
              value: formatDeltaDays(data.entity.deliveryVariance.deltaDays),
            },
          ]}
        />
      }
    />
  );
}
