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
import { fetchIssuesRisksRegister } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu } from '@/lib/format/ru';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import {
  presentIssueTitle,
  registerRowTypeLabel,
} from '@/lib/ui-labels';

/**
 * V1 working assumption: single table + Type (BA-OQ-006 remains OPEN).
 * Shared columns only — Owner intentionally omitted.
 */
export default function IssuesRisksPage() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(
    fetchIssuesRisksRegister,
  );

  return (
    <RegisterShell
      title="Проблемы и риски"
      asOf={data ? formatDateRu(data.scenarioAsOfDate) : null}
      snapshot={active}
    >
      {status === 'loading' ? <RegisterLoading /> : null}
      {status === 'error' ? (
        <RegisterError message={error ?? ''} onRetry={retry} />
      ) : null}
      {status === 'idle' && data && data.rows.length === 0 ? (
        <RegisterEmpty />
      ) : null}
      {status === 'idle' && data && data.rows.length > 0 ? (
        <RegisterTable
          caption="Реестр проблем и рисков"
          columns={['Тип', 'ID', 'Название', 'Статус']}
        >
          {data.rows.map((row) => (
            <RegisterRow key={`${row.type}:${row.id}`}>
              <RegisterCell>{registerRowTypeLabel(row.type)}</RegisterCell>
              <RegisterCell className="font-medium text-[var(--text)]">
                <Link
                  href={entityDetailHref(
                    row.type === 'Issue' ? 'issue' : 'risk',
                    row.id,
                  )}
                  className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {row.id}
                </Link>
              </RegisterCell>
              <RegisterCell>
                {row.type === 'Issue'
                  ? presentIssueTitle(row.id, row.title)
                  : '—'}
              </RegisterCell>
              <RegisterCell>
                {row.type === 'Issue' && row.issueStatus ? (
                  <StatusPill family="issue" value={row.issueStatus} />
                ) : null}
                {row.type === 'Risk' && row.rag ? (
                  <StatusPill family="rag" value={row.rag} entity="risk" />
                ) : null}
              </RegisterCell>
            </RegisterRow>
          ))}
        </RegisterTable>
      ) : null}
    </RegisterShell>
  );
}
