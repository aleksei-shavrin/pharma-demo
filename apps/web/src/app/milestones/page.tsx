'use client';

import Link from 'next/link';
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
import { fetchMilestonesRegister } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { presentMilestoneName } from '@/lib/ui-labels';

export default function MilestonesPage() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(
    fetchMilestonesRegister,
  );

  return (
    <RegisterShell
      title="Вехи"
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
          caption="Реестр вех"
          columns={[
            'ID',
            'Название',
            'Статус',
            'Базовая дата',
            'Прогноз',
            'Отклонение',
          ]}
        >
          {data.items.map((item) => (
            <RegisterRow key={item.id}>
              <RegisterCell className="font-medium text-[var(--text)]">
                <Link
                  href={entityDetailHref('milestone', item.id)}
                  className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {item.id}
                </Link>
              </RegisterCell>
              <RegisterCell>
                {presentMilestoneName(item.id, item.name)}
              </RegisterCell>
              <RegisterCell>
                <StatusPill family="rag" value={item.rag} entity="milestone" />
              </RegisterCell>
              <RegisterCell>{formatDateRu(item.baselineDate)}</RegisterCell>
              <RegisterCell>{formatDateRu(item.forecastDate)}</RegisterCell>
              <RegisterCell className="tabular-nums text-[var(--text)]">
                {formatDeltaDays(item.dateVariance.deltaDays)}
              </RegisterCell>
            </RegisterRow>
          ))}
        </RegisterTable>
      ) : null}
    </RegisterShell>
  );
}
