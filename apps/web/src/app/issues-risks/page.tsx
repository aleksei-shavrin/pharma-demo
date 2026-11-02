'use client';

import { useMemo, useState } from 'react';
import { StatusPill } from '@/components/dashboard/status-pill';
import {
  RegisterCell,
  RegisterEmpty,
  RegisterEntityCell,
  RegisterError,
  RegisterFilteredEmpty,
  RegisterLoading,
  RegisterMutedIds,
  RegisterRow,
  RegisterShell,
  RegisterTable,
} from '@/components/registers/register-table';
import {
  RegisterSummary,
  RegisterToolbar,
} from '@/components/registers/register-toolbar';
import type { IssuesRisksRegister } from '@/lib/api-client';
import { fetchIssuesRisksRegister } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu } from '@/lib/format/ru';
import {
  DEFAULT_REGISTER_FILTERS,
  filtersActive,
  matchesSearch,
  matchesWorkstream,
  type RegisterFilterState,
} from '@/lib/registers/register-filters';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import {
  presentIssueTitle,
  presentWorkstream,
  registerRowTypeLabel,
} from '@/lib/ui-labels';

/**
 * BA-OQ-006: single Issues & Risks register + Type column.
 * Domain Issue/Risk remain separate; Owner omitted from shared columns.
 */

type Row = IssuesRisksRegister['rows'][number];

function isAttention(row: Row): boolean {
  if (row.type === 'Issue') {
    return row.issueStatus === 'Open' || row.issueStatus === 'Mitigating';
  }
  return row.rag === 'Red';
}

function severityRank(row: Row): number {
  if (row.type === 'Risk' && row.rag === 'Red') return 3;
  if (row.type === 'Issue' && row.issueStatus === 'Open') return 2;
  if (row.type === 'Issue' && row.issueStatus === 'Mitigating') return 1;
  return 0;
}

function sortRows(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => {
    const sev = severityRank(b) - severityRank(a);
    if (sev !== 0) return sev;
    return a.title.localeCompare(b.title, 'ru');
  });
}

function displayTitle(row: Row): string {
  return row.type === 'Issue'
    ? presentIssueTitle(row.id, row.title)
    : row.title;
}

export default function IssuesRisksPage() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(
    fetchIssuesRisksRegister,
  );
  const [filters, setFilters] = useState<RegisterFilterState>(
    DEFAULT_REGISTER_FILTERS,
  );

  const reset = () => setFilters(DEFAULT_REGISTER_FILTERS);

  const filtered = useMemo(() => {
    if (!data) return [];
    return sortRows(
      data.rows.filter((row) => {
        if (filters.type !== 'all' && row.type !== filters.type) return false;
        if (filters.attention === 'attention' && !isAttention(row)) {
          return false;
        }
        if (filters.attention === 'normal' && isAttention(row)) {
          return false;
        }
        if (!matchesWorkstream(filters.workstream, row.workstream)) {
          return false;
        }
        return matchesSearch(filters.query, [
          displayTitle(row),
          row.id,
          row.equipmentId,
          row.linkedIssueId,
          row.linkedRiskId,
          row.milestoneId,
        ]);
      }),
    );
  }, [data, filters]);

  const counters = useMemo(() => {
    if (!data) return [];
    const issues = data.rows.filter((r) => r.type === 'Issue');
    const risks = data.rows.filter((r) => r.type === 'Risk');
    const open = issues.filter((r) => r.issueStatus === 'Open').length;
    const mitigating = issues.filter(
      (r) => r.issueStatus === 'Mitigating',
    ).length;
    const closed = issues.filter((r) => r.issueStatus === 'Closed').length;
    const red = risks.filter((r) => r.rag === 'Red').length;
    return [
      { label: 'Проблемы', value: issues.length },
      { label: 'Открыты', value: open },
      { label: 'Меры', value: mitigating },
      { label: 'Закрыты', value: closed },
      { label: 'Риски Red', value: red },
    ];
  }, [data]);

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
        <>
          <RegisterSummary
            total={data.rows.length}
            visible={filtered.length}
            counters={counters}
          />
          <RegisterToolbar
            filters={filters}
            onChange={setFilters}
            onReset={reset}
            showType
          />
          {filtered.length === 0 && filtersActive(filters) ? (
            <RegisterFilteredEmpty onReset={reset} />
          ) : (
            <RegisterTable
              caption="Реестр проблем и рисков"
              columns={[
                'Тип',
                'Объект',
                'Направление',
                'Статус',
                'Оборудование',
                'Связи',
              ]}
            >
              {filtered.map((row) => (
                <RegisterRow
                  key={`${row.type}:${row.id}`}
                  emphasis={isAttention(row)}
                >
                  <RegisterCell className="whitespace-nowrap">
                    {registerRowTypeLabel(row.type)}
                  </RegisterCell>
                  <RegisterEntityCell
                    href={entityDetailHref(
                      row.type === 'Issue' ? 'issue' : 'risk',
                      row.id,
                    )}
                    title={displayTitle(row)}
                    id={row.id}
                  />
                  <RegisterCell className="whitespace-nowrap">
                    {presentWorkstream(row.workstream)}
                  </RegisterCell>
                  <RegisterCell>
                    {row.type === 'Issue' && row.issueStatus ? (
                      <StatusPill family="issue" value={row.issueStatus} />
                    ) : null}
                    {row.type === 'Risk' && row.rag ? (
                      <StatusPill
                        family="rag"
                        value={row.rag}
                        entity="risk"
                      />
                    ) : null}
                  </RegisterCell>
                  <RegisterCell>
                    <RegisterMutedIds
                      ids={row.equipmentId ? [row.equipmentId] : []}
                    />
                  </RegisterCell>
                  <RegisterCell>
                    <RegisterMutedIds
                      ids={[
                        ...(row.linkedIssueId ? [row.linkedIssueId] : []),
                        ...(row.linkedRiskId ? [row.linkedRiskId] : []),
                        ...(row.milestoneId ? [row.milestoneId] : []),
                      ]}
                    />
                  </RegisterCell>
                </RegisterRow>
              ))}
            </RegisterTable>
          )}
        </>
      ) : null}
    </RegisterShell>
  );
}
