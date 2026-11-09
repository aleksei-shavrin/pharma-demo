'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { StatusPill } from '@/components/dashboard/status-pill';
import {
  RegisterCell,
  RegisterEmpty,
  RegisterEntityCell,
  RegisterError,
  RegisterFilteredEmpty,
  RegisterLoading,
  RegisterIdLinks,
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
  filtersFromSearchParams,
  matchesSearch,
  matchesProgram,
  searchParamsFromFilters,
  type RegisterFilterState,
} from '@/lib/registers/register-filters';
import { programLabelForWorkstream } from '@/lib/registers/program-filter';
import { useRegisterQuery } from '@/lib/registers/use-register-query';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import {
  presentIssueTitle,
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

function IssuesRisksPage() {
  const { active } = useSnapshot();
  const { data, status, error, retry } = useRegisterQuery(
    fetchIssuesRisksRegister,
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<RegisterFilterState>(() =>
    filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
  );

  const searchKey = searchParams.toString();
  useEffect(() => {
    setFilters(filtersFromSearchParams(new URLSearchParams(searchKey)));
  }, [searchKey]);

  const applyFilters = (next: RegisterFilterState) => {
    setFilters(next);
    const q = searchParamsFromFilters(next).toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const reset = () => applyFilters(DEFAULT_REGISTER_FILTERS);

  const filtered = useMemo(() => {
    if (!data) return [];
    return sortRows(
      data.rows.filter((row) => {
        if (filters.type !== 'all' && row.type !== filters.type) return false;
        if (filters.issueStatus === 'active') {
          if (row.type !== 'Issue') return false;
          if (row.issueStatus !== 'Open' && row.issueStatus !== 'Mitigating') {
            return false;
          }
        }
        if (filters.issueStatus === 'Closed') {
          if (row.type !== 'Issue' || row.issueStatus !== 'Closed') return false;
        }
        if (filters.rag !== 'all') {
          if (row.type !== 'Risk' || row.rag !== filters.rag) return false;
        }
        if (filters.attention === 'attention' && !isAttention(row)) {
          return false;
        }
        if (filters.attention === 'normal' && isAttention(row)) {
          return false;
        }
        if (!matchesProgram(filters.program, row.workstream)) {
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
            onChange={applyFilters}
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
                'Программа',
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
                    {programLabelForWorkstream(row.workstream)}
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
                    <RegisterIdLinks
                      refs={
                        row.equipmentId
                          ? [{ type: 'equipment', id: row.equipmentId }]
                          : []
                      }
                    />
                  </RegisterCell>
                  <RegisterCell>
                    <RegisterIdLinks
                      refs={[
                        ...(row.linkedIssueId
                          ? [{ type: 'issue' as const, id: row.linkedIssueId }]
                          : []),
                        ...(row.linkedRiskId
                          ? [{ type: 'risk' as const, id: row.linkedRiskId }]
                          : []),
                        ...(row.milestoneId
                          ? [
                              {
                                type: 'milestone' as const,
                                id: row.milestoneId,
                              },
                            ]
                          : []),
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

export default function IssuesRisksPageRoute() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <IssuesRisksPage />
    </Suspense>
  );
}
