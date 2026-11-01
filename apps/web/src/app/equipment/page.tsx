'use client';

import { StatusPill } from '@/components/dashboard/status-pill';
import {
  RegisterCell,
  RegisterEmpty,
  RegisterError,
  RegisterLoading,
  RegisterRow,
  RegisterShell,
  RegisterTable,
} from '@/components/registers/register-table';
import { fetchEquipmentRegister } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

export default function EquipmentPage() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(fetchEquipmentRegister);

  return (
    <RegisterShell
      title="Оборудование"
      asOf={data ? formatDateRu(data.scenarioAsOfDate) : null}
      snapshot={active}
    >
      {status === 'loading' ? <RegisterLoading /> : null}
      {status === 'error' ? (
        <RegisterError message={error ?? ''} onRetry={retry} />
      ) : null}
      {status === 'idle' && data && data.items.length === 0 ? (
        <RegisterEmpty />
      ) : null}
      {status === 'idle' && data && data.items.length > 0 ? (
        <RegisterTable
          caption="Реестр оборудования"
          columns={[
            'ID',
            'Критичность',
            'Статус',
            'Базовая поставка',
            'Прогноз поставки',
            'Отклонение',
          ]}
        >
          {data.items.map((item) => (
            <RegisterRow key={item.id}>
              <RegisterCell className="font-medium text-[var(--text)]">
                {item.id}
              </RegisterCell>
              <RegisterCell>{item.critical ? 'Да' : 'Нет'}</RegisterCell>
              <RegisterCell>
                <StatusPill family="equipment" value={item.status} />
              </RegisterCell>
              <RegisterCell>
                {formatDateRu(item.baselineDelivery)}
              </RegisterCell>
              <RegisterCell>
                {formatDateRu(item.forecastDelivery)}
              </RegisterCell>
              <RegisterCell className="tabular-nums text-[var(--text)]">
                {formatDeltaDays(item.deliveryVariance.deltaDays)}
              </RegisterCell>
            </RegisterRow>
          ))}
        </RegisterTable>
      ) : null}
    </RegisterShell>
  );
}
