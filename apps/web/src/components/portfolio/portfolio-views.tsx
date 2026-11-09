'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import type {
  AnalystProjectCard,
  AnalystProjectRow,
  ProgramCostSummary,
  ProgramDetail,
  ProgressFillTone,
  ProjectStatus,
} from '@/lib/api-client';
import { StatusPill } from '@/components/dashboard/status-pill';
import { SemanticProgressBar } from '@/components/progress/semantic-progress-bar';
import { PageContent, PageFrame, PageHeader } from '@/components/shell/page-frame';
import { formatDateRu, formatRubRu } from '@/lib/format/ru';
import { entityDetailHref } from '@/lib/entity-routes';
import {
  presentDecisionType,
  presentMilestoneName,
  projectStatusLabel,
} from '@/lib/ui-labels';
import { snapshotDisplayLabel } from '@/lib/snapshot/snapshot-id';
import {
  previewSlice,
  WORKSTREAM_SECTION_PREVIEW_LIMIT,
} from '@/components/workstreams/workstream-detail-preview';

export const NOT_FOUND_COPY = 'Запись не найдена в этом снимке';

export type RecordMissingKind = 'program' | 'project';

export function RecordMissing({
  id,
  kind = 'program',
}: {
  id: string;
  kind?: RecordMissingKind;
}) {
  const href = kind === 'project' ? '/projects' : '/programs';
  const cta = kind === 'project' ? 'К списку проектов' : 'К списку программ';
  return (
    <PageFrame className="p-6">
      <PageContent mode="page">
        <div
          role="status"
          data-page-state="absent"
          data-record-missing={kind}
          className="max-w-xl rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-6"
        >
          <h1 className="text-lg font-semibold text-[var(--text)]">{id}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{NOT_FOUND_COPY}</p>
          <Link
            href={href}
            className="mt-4 inline-block text-sm text-[var(--link)] underline"
          >
            {cta}
          </Link>
        </div>
      </PageContent>
    </PageFrame>
  );
}

type ProgramListItem = {
  id: string;
  name: string;
  status: ProjectStatus;
  projectCount?: number;
  ownerLabel?: string;
  responsiblePeople?: { personId: string; fullNameRu: string; role: string }[];
  progressPct?: number | null;
  leafCompleted?: number;
  leafTotal?: number;
  progressFillTone?: ProgressFillTone;
  progressLabel?: string;
};

const COMPLETED_HEADER =
  'Завершённые работы и контрольные точки / всего';

/** Short catalog ids (AN-01, PRG-DSN) must not wrap mid-token. */
const CODE_CELL_CLASS =
  'whitespace-nowrap px-2 py-2 tabular-nums text-[var(--text-secondary)] min-w-[5.5rem]';
const CODE_TH_CLASS =
  'whitespace-nowrap px-3 py-2 font-semibold min-w-[5.5rem]';

function ResponsibleLinks({
  people,
  fallback,
}: {
  people: { personId: string; fullNameRu: string }[] | undefined;
  fallback?: string;
}) {
  if (people && people.length > 0) {
    return (
      <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
        {people.map((p, i) => (
          <span key={p.personId} className="inline-flex items-center gap-1">
            {i > 0 ? (
              <span className="text-[var(--text-muted)]" aria-hidden>
                ,
              </span>
            ) : null}
            <Link
              href={`/people/${encodeURIComponent(p.personId)}`}
              className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              {p.fullNameRu}
            </Link>
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className="text-[var(--text-muted)]">
      {fallback && fallback !== 'Не назначен' ? fallback : 'Не назначены'}
    </span>
  );
}

function ProgramCostBlock({ cost }: { cost: ProgramCostSummary | null }) {
  if (!cost) {
    return (
      <p className="text-sm text-[var(--text-muted)]" data-program-cost="absent">
        Бюджет программы не выделен в этом снимке (нет WS cost в bridge).
      </p>
    );
  }
  const rows: { label: string; value: string; danger?: boolean }[] = [
    { label: 'Утверждённый бюджет', value: formatRubRu(cost.approvedControlBudgetRub) },
    { label: 'Фактически', value: formatRubRu(cost.actualCostRub) },
    { label: 'Обязательства', value: formatRubRu(cost.committedCostRub) },
    { label: 'ETC', value: formatRubRu(cost.etcRub) },
    { label: 'EAC', value: formatRubRu(cost.eacRub) },
    {
      label: 'VAC',
      value: formatRubRu(cost.vacRub),
      danger: cost.vacRub < 0,
    },
  ];
  return (
    <dl
      className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 lg:grid-cols-6"
      data-program-cost="present"
      data-program-cost-ws={cost.workstreamIds.join(',')}
    >
      {rows.map((r) => (
        <div key={r.label} className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            {r.label}
          </dt>
          <dd
            className={`mt-0.5 truncate text-sm font-semibold tabular-nums ${
              r.danger
                ? 'text-[var(--status-danger-fg)]'
                : 'text-[var(--text)]'
            }`}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DetailSection({
  title,
  children,
  empty,
  footer,
}: {
  title: string;
  children: ReactNode;
  empty?: boolean;
  footer?: ReactNode;
}) {
  return (
    <section className="min-w-0">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
        {title}
      </h2>
      <div className="mt-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
        {empty ? (
          <p className="px-3 py-3 text-sm text-[var(--text-muted)]">Нет записей</p>
        ) : (
          children
        )}
        {footer}
      </div>
    </section>
  );
}

function OverflowToggle({
  total,
  expanded,
  onToggle,
  labelAll,
}: {
  total: number;
  expanded: boolean;
  onToggle: () => void;
  labelAll: string;
}) {
  return (
    <div className="border-t border-[var(--border)] px-3 py-2">
      <button
        type="button"
        onClick={onToggle}
        className="text-sm font-medium text-[var(--text-secondary)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        {expanded ? 'Свернуть' : `${labelAll} ${total} →`}
      </button>
    </div>
  );
}

export function ProgramListView({ items }: { items: ProgramListItem[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'Green' | 'Yellow' | 'Red'>('all');
  const q = query.trim().toLowerCase();
  const filtered = items.filter((p) => {
    if (status !== 'all' && p.status !== status) return false;
    if (!q) return true;
    return (
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q)
    );
  });
  const clear = () => {
    setQuery('');
    setStatus('all');
  };
  return (
    <PageFrame className="p-6">
      <PageHeader>
        <h1 className="text-lg font-semibold text-[var(--text)]">Программы</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]" data-list-subtitle="programs">
          Показано{' '}
          <span className="font-semibold tabular-nums text-[var(--text)]">
            {filtered.length} / {items.length}
          </span>
        </p>
      </PageHeader>
      <PageContent mode="page">
        <div className="mt-2 flex flex-wrap items-center gap-2" data-list-toolbar="programs">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или ID"
            className="h-8 w-60 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
          />
          <select
            className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as 'all' | 'Green' | 'Yellow' | 'Red')
            }
          >
            <option value="all">Все статусы</option>
            <option value="Green">{projectStatusLabel('Green')}</option>
            <option value="Yellow">{projectStatusLabel('Yellow')}</option>
            <option value="Red">{projectStatusLabel('Red')}</option>
          </select>
          {(q || status !== 'all') && (
            <button
              type="button"
              className="text-sm text-[var(--link)] underline"
              onClick={clear}
            >
              Сбросить
            </button>
          )}
        </div>
        <div
          className="mt-3 min-h-0 overflow-x-auto overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)]"
          data-portfolio-table="programs"
        >
          <table className="min-w-[56rem] w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--surface-sunken)] text-xs uppercase tracking-wide text-[var(--text-muted)] shadow-[inset_0_-1px_0_0_var(--border)]">
              <tr>
                <th scope="col" className={CODE_TH_CLASS}>
                  Код
                </th>
                <th scope="col" className="min-w-[12rem] px-3 py-2 font-semibold">
                  Программа
                </th>
                <th scope="col" className="w-[10rem] whitespace-nowrap px-3 py-2 font-semibold">
                  Прогресс
                </th>
                <th
                  scope="col"
                  className="w-[6rem] whitespace-nowrap px-3 py-2 font-semibold"
                  title={COMPLETED_HEADER}
                  aria-label={COMPLETED_HEADER}
                >
                  Завершено
                </th>
                <th scope="col" className="whitespace-nowrap px-3 py-2 font-semibold">
                  Статус
                </th>
                <th scope="col" className="min-w-[8rem] whitespace-nowrap px-3 py-2 font-semibold">
                  Ответственные
                </th>
                <th scope="col" className="whitespace-nowrap px-3 py-2 font-semibold">
                  Проекты
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-[var(--text-muted)]">
                    {items.length === 0
                      ? 'Программ в этом снимке нет.'
                      : 'Нет программ по фильтру.'}
                  </td>
                </tr>
              ) : (
                filtered.map((program) => (
                  <tr
                    key={program.id}
                    className="border-b border-[var(--border-subtle)]"
                    data-program-row={program.id}
                  >
                    <td className={CODE_CELL_CLASS} data-portfolio-code={program.id}>
                      {program.id}
                    </td>
                    <td className="px-2 py-2">
                      <Link
                        href={`/programs/${program.id}`}
                        className="font-medium text-[var(--link)] underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                      >
                        {program.name}
                      </Link>
                    </td>
                    <td className="px-2 py-2">
                      <SemanticProgressBar
                        progressPct={program.progressPct ?? null}
                        fillTone={program.progressFillTone ?? 'ok'}
                        emptyLabel={
                          program.leafTotal === 0
                            ? 'Нет листовых работ в импорте'
                            : 'нет данных'
                        }
                      />
                    </td>
                    <td
                      className="px-2 py-2 tabular-nums text-[var(--text-secondary)]"
                      title={COMPLETED_HEADER}
                      aria-label={
                        typeof program.leafCompleted === 'number' &&
                        typeof program.leafTotal === 'number'
                          ? `${program.leafCompleted} из ${program.leafTotal} завершено`
                          : COMPLETED_HEADER
                      }
                    >
                      {typeof program.leafCompleted === 'number' &&
                      typeof program.leafTotal === 'number'
                        ? `${program.leafCompleted}/${program.leafTotal}`
                        : '—'}
                    </td>
                    <td className="px-2 py-2" data-status={program.status}>
                      <StatusPill family="project" value={program.status} />
                    </td>
                    <td
                      className="px-2 py-2 text-[var(--text-secondary)]"
                      data-program-responsibles={program.id}
                    >
                      <ResponsibleLinks
                        people={program.responsiblePeople}
                        fallback={program.ownerLabel}
                      />
                    </td>
                    <td className="px-2 py-2 tabular-nums">
                      {program.projectCount ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PageContent>
    </PageFrame>
  );
}

export function ProgramDashboardView({ data }: { data: ProgramDetail }) {
  const focus = useSearchParams().get('focus');
  const [msExpanded, setMsExpanded] = useState(false);
  const [eqExpanded, setEqExpanded] = useState(false);
  const [attExpanded, setAttExpanded] = useState(false);
  useEffect(() => {
    if (!focus) return;
    document.getElementById(`project-${focus}`)?.scrollIntoView({ block: 'center' });
  }, [focus, data.id]);

  const att = data.attention ?? {
    redRiskCount: 0,
    delayedCriticalEquipmentCount: 0,
    openOrMitigatingIssueCount: 0,
    redMilestoneCount: 0,
  };
  const redMilestoneCount =
    att.redMilestoneCount ??
    (data.milestones ?? []).filter((m) => m.rag === 'Red').length;
  const msSlice = previewSlice(data.milestones ?? [], msExpanded, WORKSTREAM_SECTION_PREVIEW_LIMIT);
  const eqSlice = previewSlice(data.equipment ?? [], eqExpanded, WORKSTREAM_SECTION_PREVIEW_LIMIT);
  const attentionRows = [
    ...(data.issues ?? []).map((i) => ({ kind: 'issue' as const, item: i })),
    ...(data.risks ?? []).map((r) => ({ kind: 'risk' as const, item: r })),
  ];
  const attSlice = previewSlice(attentionRows, attExpanded, WORKSTREAM_SECTION_PREVIEW_LIMIT);

  return (
    <PageFrame className="p-6" data-page="program-detail">
      <PageHeader>
        <p className="text-xs text-[var(--text-muted)]">
          Снимок {snapshotDisplayLabel(data.snapshotId)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold text-[var(--text)]">{data.name}</h1>
          <span data-program-status={data.status}>
            <StatusPill family="project" value={data.status} />
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          проектов {data.projectCount} · {data.progressLabel}
        </p>
      </PageHeader>
      <PageContent mode="page" className="mt-4 flex flex-col gap-4">
        <section
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-3"
          data-program-block="summary"
        >
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Сводка
          </h2>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--text)]">
            <li>
              <span className="text-[var(--text-muted)]">Вехи под риском</span>{' '}
              <span
                className="font-medium tabular-nums"
                data-summary-red-milestones="true"
              >
                {redMilestoneCount}
              </span>
            </li>
            <li>
              <span className="text-[var(--text-muted)]">Критичные риски</span>{' '}
              <span className="font-medium tabular-nums">{att.redRiskCount}</span>
            </li>
            <li>
              <span className="text-[var(--text-muted)]">Критические задержки</span>{' '}
              <span className="font-medium tabular-nums">
                {att.delayedCriticalEquipmentCount}
              </span>
            </li>
            <li>
              <span className="text-[var(--text-muted)]">Активные проблемы</span>{' '}
              <span className="font-medium tabular-nums">
                {att.openOrMitigatingIssueCount}
              </span>
            </li>
          </ul>
        </section>

        <section
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-3"
          data-program-block="cost"
        >
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Бюджет программы
          </h2>
          <div className="mt-2">
            <ProgramCostBlock cost={data.cost ?? null} />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Резерв портфеля не входит в бюджет программы.
          </p>
        </section>

        <section aria-labelledby="program-people">
          <h2 id="program-people" className="text-sm font-semibold">
            Ответственные
          </h2>
          {data.responsiblePeople.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--text-muted)]">Не назначены.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {data.responsiblePeople.map((person) => (
                <li key={person.personId}>
                  <Link
                    href={`/people/${encodeURIComponent(person.personId)}`}
                    className="text-[var(--link)] underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    {person.fullNameRu}
                  </Link>
                  <span className="text-[var(--text-muted)]"> — {person.role}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <DetailSection
          title="Вехи"
          empty={(data.milestones ?? []).length === 0}
          footer={
            msSlice.overflow ? (
              <OverflowToggle
                total={msSlice.total}
                expanded={msExpanded}
                onToggle={() => setMsExpanded((v) => !v)}
                labelAll="Показать все вехи"
              />
            ) : null
          }
        >
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-semibold">Веха</th>
                <th className="px-3 py-2 font-semibold">RAG</th>
                <th className="px-3 py-2 font-semibold">База</th>
                <th className="px-3 py-2 font-semibold">Прогноз</th>
              </tr>
            </thead>
            <tbody>
              {msSlice.visible.map((m) => (
                <tr key={m.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-2">
                    <Link
                      href={entityDetailHref('milestone', m.id)}
                      className="font-medium text-[var(--text)] underline-offset-2 hover:underline"
                    >
                      {presentMilestoneName(m.id, m.name)}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill family="rag" entity="milestone" value={m.rag} />
                  </td>
                  <td className="px-3 py-2 tabular-nums text-[var(--text-secondary)]">
                    {formatDateRu(m.baselineDate)}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-[var(--text-secondary)]">
                    {formatDateRu(m.forecastDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetailSection>

        <DetailSection
          title="Оборудование"
          empty={(data.equipment ?? []).length === 0}
          footer={
            eqSlice.overflow ? (
              <OverflowToggle
                total={eqSlice.total}
                expanded={eqExpanded}
                onToggle={() => setEqExpanded((v) => !v)}
                labelAll="Показать все позиции"
              />
            ) : null
          }
        >
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-semibold">Позиция</th>
                <th className="px-3 py-2 font-semibold">Статус</th>
                <th className="px-3 py-2 font-semibold">Прогноз</th>
              </tr>
            </thead>
            <tbody>
              {eqSlice.visible.map((eq) => (
                <tr key={eq.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-2">
                    <Link
                      href={entityDetailHref('equipment', eq.id)}
                      className="font-medium text-[var(--text)] underline-offset-2 hover:underline"
                    >
                      {eq.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill
                      family="equipment"
                      value={eq.status as 'OnTrack' | 'Delayed'}
                    />
                  </td>
                  <td className="px-3 py-2 tabular-nums text-[var(--text-secondary)]">
                    {formatDateRu(eq.forecastDelivery)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetailSection>

        <DetailSection
          title="Проблемы и риски"
          empty={attentionRows.length === 0}
          footer={
            attSlice.overflow ? (
              <OverflowToggle
                total={attSlice.total}
                expanded={attExpanded}
                onToggle={() => setAttExpanded((v) => !v)}
                labelAll="Показать все"
              />
            ) : null
          }
        >
          <ul className="divide-y divide-[var(--border)]">
            {attSlice.visible.map((row) =>
              row.kind === 'issue' ? (
                <li
                  key={row.item.id}
                  className="flex items-start justify-between gap-2 px-3 py-2"
                >
                  <Link
                    href={
                      row.item.projectId
                        ? `/programs/${data.id}?focus=${row.item.projectId}#project-${row.item.projectId}`
                        : entityDetailHref('issue', row.item.id)
                    }
                    className="text-sm text-[var(--link)] underline"
                  >
                    {row.item.title}
                  </Link>
                  <StatusPill
                    family="issue"
                    value={row.item.status as 'Open' | 'Mitigating' | 'Closed'}
                  />
                </li>
              ) : (
                <li
                  key={row.item.id}
                  className="flex items-start justify-between gap-2 px-3 py-2"
                >
                  <Link
                    href={entityDetailHref('risk', row.item.id)}
                    className="text-sm text-[var(--link)] underline"
                  >
                    {row.item.title}
                  </Link>
                  <StatusPill family="rag" entity="risk" value={row.item.rag} />
                </li>
              ),
            )}
          </ul>
        </DetailSection>

        <DetailSection title="Решения" empty={(data.decisions ?? []).length === 0}>
          <ul className="divide-y divide-[var(--border)]">
            {(data.decisions ?? []).map((d) => (
              <li key={d.id} className="px-3 py-2 text-sm">
                <span className="font-medium">
                  {presentDecisionType(
                    d.type as Parameters<typeof presentDecisionType>[0],
                  )}
                </span>
                <span className="text-[var(--text-muted)]"> · {d.note}</span>
                <div className="text-xs text-[var(--text-muted)]">
                  {d.dueDate ? formatDateRu(d.dueDate) : '—'}
                  {d.milestoneId ? ` · ${d.milestoneId}` : ''}
                </div>
              </li>
            ))}
          </ul>
        </DetailSection>

        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Проекты программы</h2>
            <Link
              href={`/programs/${data.id}/projects`}
              className="text-sm text-[var(--link)] underline"
            >
              Состав
            </Link>
          </div>
          <ProjectTable projects={data.projects} focus={focus} showProgram={false} />
        </section>
      </PageContent>
    </PageFrame>
  );
}

export function ProgramCompositionView({ data }: { data: ProgramDetail }) {
  const [attentionOnly, setAttentionOnly] = useState(false);
  const rows = attentionOnly
    ? data.projects.filter((p) => p.status !== 'Green')
    : data.projects;
  return (
    <PageFrame className="p-6">
      <PageHeader>
        <h1 className="text-lg font-semibold text-[var(--text)]">
          Состав · {data.name}
        </h1>
        <Link href={`/programs/${data.id}`} className="text-sm text-[var(--link)] underline">
          К карточке программы
        </Link>
      </PageHeader>
      <PageContent mode="page">
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-sm hover:bg-[var(--surface-sunken)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            onClick={() => setAttentionOnly(true)}
          >
            Требует внимания
          </button>
          <button
            type="button"
            className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-sm hover:bg-[var(--surface-sunken)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            onClick={() => setAttentionOnly(false)}
          >
            Сбросить фильтр
          </button>
        </div>
        <ProjectTable projects={rows} focus={null} showProgram={false} />
      </PageContent>
    </PageFrame>
  );
}

function ProjectTable({
  projects,
  focus,
  showProgram,
}: {
  projects: AnalystProjectRow[];
  focus: string | null;
  showProgram: boolean;
}) {
  return (
    <div
      className="mt-3 min-h-0 overflow-x-auto overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)]"
      data-portfolio-table="projects"
    >
      <table className="min-w-[64rem] w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-[var(--surface-sunken)] text-xs uppercase tracking-wide text-[var(--text-muted)] shadow-[inset_0_-1px_0_0_var(--border)]">
          <tr>
            <th scope="col" className={CODE_TH_CLASS}>
              Код
            </th>
            <th scope="col" className="min-w-[12rem] px-3 py-2 font-semibold">
              Проект
            </th>
            <th scope="col" className="w-[10rem] whitespace-nowrap px-3 py-2 font-semibold">
              Прогресс
            </th>
            <th
              scope="col"
              className="w-[6rem] whitespace-nowrap px-3 py-2 font-semibold"
              title={COMPLETED_HEADER}
              aria-label={COMPLETED_HEADER}
            >
              Завершено
            </th>
            <th scope="col" className="whitespace-nowrap px-3 py-2 font-semibold">
              Статус
            </th>
            {showProgram ? (
              <th scope="col" className="whitespace-nowrap px-3 py-2 font-semibold">
                Программа
              </th>
            ) : null}
            <th scope="col" className="min-w-[8rem] whitespace-nowrap px-3 py-2 font-semibold">
              Ответственный
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td
                colSpan={showProgram ? 7 : 6}
                className="px-2 py-6 text-[var(--text-muted)]"
              >
                Проектов нет.
              </td>
            </tr>
          ) : (
            projects.map((project) => (
              <tr
                key={project.id}
                id={`project-${project.id}`}
                data-project-row={project.id}
                data-project-focus={focus === project.id ? 'true' : 'false'}
                className="border-b border-[var(--border-subtle)]"
              >
                <td className={CODE_CELL_CLASS} data-portfolio-code={project.id}>
                  {project.id}
                </td>
                <td className="px-2 py-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium text-[var(--link)] underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    {project.name}
                  </Link>
                </td>
                <td className="px-2 py-2">
                  <SemanticProgressBar
                    progressPct={project.progressPct}
                    fillTone={project.progressFillTone}
                    emptyLabel={
                      project.leafTotal === 0
                        ? 'Нет листовых работ в импорте'
                        : 'нет данных'
                    }
                  />
                </td>
                <td
                  className="px-2 py-2 tabular-nums text-[var(--text-secondary)]"
                  title={COMPLETED_HEADER}
                  aria-label={`${project.leafCompleted} из ${project.leafTotal} завершено`}
                >
                  {`${project.leafCompleted}/${project.leafTotal}`}
                </td>
                <td className="px-2 py-2" data-project-status={project.status}>
                  <StatusPill family="project" value={project.status} />
                </td>
                {showProgram ? (
                  <td className="px-2 py-2">
                    <Link
                      href={`/programs/${project.programId}`}
                      className="text-[var(--link)] underline"
                    >
                      {project.programId}
                    </Link>
                  </td>
                ) : null}
                <td className="px-2 py-2 text-[var(--text-secondary)]">
                  {project.ownerPersonId ? (
                    <Link
                      href={`/people/${encodeURIComponent(project.ownerPersonId)}`}
                      className="text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                    >
                      {project.ownerLabel}
                    </Link>
                  ) : (
                    project.ownerLabel
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ProjectListView({ items }: { items: AnalystProjectRow[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'Green' | 'Yellow' | 'Red'>('all');
  const [program, setProgram] = useState('all');
  const q = query.trim().toLowerCase();
  const programs = [...new Set(items.map((i) => i.programId))].sort();
  const filtered = items.filter((p) => {
    if (status !== 'all' && p.status !== status) return false;
    if (program !== 'all' && p.programId !== program) return false;
    if (!q) return true;
    return (
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.programId.toLowerCase().includes(q)
    );
  });
  const clear = () => {
    setQuery('');
    setStatus('all');
    setProgram('all');
  };
  return (
    <PageFrame className="p-6">
      <PageHeader>
        <h1 className="text-lg font-semibold text-[var(--text)]">Проекты</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]" data-list-subtitle="projects">
          Показано{' '}
          <span className="font-semibold tabular-nums text-[var(--text)]">
            {filtered.length} / {items.length}
          </span>
        </p>
      </PageHeader>
      <PageContent mode="page">
        <div className="mt-2 flex flex-wrap items-center gap-2" data-list-toolbar="projects">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или ID"
            className="h-8 w-60 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
          />
          <select
            className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
          >
            <option value="all">Все программы</option>
            {programs.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
          <select
            className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as 'all' | 'Green' | 'Yellow' | 'Red')
            }
          >
            <option value="all">Все статусы</option>
            <option value="Green">{projectStatusLabel('Green')}</option>
            <option value="Yellow">{projectStatusLabel('Yellow')}</option>
            <option value="Red">{projectStatusLabel('Red')}</option>
          </select>
          {(q || status !== 'all' || program !== 'all') && (
            <button
              type="button"
              className="text-sm text-[var(--link)] underline"
              onClick={clear}
            >
              Сбросить
            </button>
          )}
        </div>
        <ProjectTable projects={filtered} focus={null} showProgram />
      </PageContent>
    </PageFrame>
  );
}

export function ProjectCardView({ data }: { data: AnalystProjectCard }) {
  const [msExpanded, setMsExpanded] = useState(false);
  const [eqExpanded, setEqExpanded] = useState(false);
  const [issExpanded, setIssExpanded] = useState(false);
  const [riskExpanded, setRiskExpanded] = useState(false);
  const att = data.attention ?? {
    redRiskCount: 0,
    delayedCriticalEquipmentCount: 0,
    openOrMitigatingIssueCount: 0,
    redMilestoneCount: 0,
  };
  const redMilestoneCount =
    att.redMilestoneCount ??
    (data.milestones ?? []).filter((m) => m.rag === 'Red').length;
  const risks = data.risks ?? [];
  const decisions = data.decisions ?? [];
  const msSlice = previewSlice(
    data.milestones ?? [],
    msExpanded,
    WORKSTREAM_SECTION_PREVIEW_LIMIT,
  );
  const eqSlice = previewSlice(
    data.equipment ?? [],
    eqExpanded,
    WORKSTREAM_SECTION_PREVIEW_LIMIT,
  );
  const issSlice = previewSlice(
    data.issues ?? [],
    issExpanded,
    WORKSTREAM_SECTION_PREVIEW_LIMIT,
  );
  const riskSlice = previewSlice(
    risks,
    riskExpanded,
    WORKSTREAM_SECTION_PREVIEW_LIMIT,
  );
  return (
    <PageFrame className="p-6" data-page="project-detail">
      <PageHeader>
        <p className="text-xs text-[var(--text-muted)]">
          <Link href={`/programs/${data.programId}`} className="underline">
            {data.programName}
          </Link>
          {' · '}
          снимок {snapshotDisplayLabel(data.snapshotId)}
        </p>
        <h1 className="text-lg font-semibold text-[var(--text)]">
          {data.id} · {data.name}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-2" data-project-status={data.status}>
          <StatusPill family="project" value={data.status} />
          <span>
            {data.ownerPersonId ? (
              <Link
                href={`/people/${encodeURIComponent(data.ownerPersonId)}`}
                className="text-[var(--link)] underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              >
                {data.ownerLabel}
              </Link>
            ) : (
              data.ownerLabel
            )}
          </span>
          <span>· {data.progressLabel}</span>
        </p>
        <p className="text-sm text-[var(--text-secondary)]">{data.datesLabel}</p>
        {data.datesNote ? (
          <p className="text-xs text-[var(--text-muted)]">{data.datesNote}</p>
        ) : null}
        <Link
          href={`/schedule?project=${encodeURIComponent(data.id)}`}
          className="mt-2 inline-block text-sm text-[var(--link)] underline"
          data-schedule-drilldown="true"
        >
          Открыть календарный план проекта
        </Link>
      </PageHeader>
      <PageContent mode="page" className="mt-4 flex flex-col gap-4">
        <section
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-3"
          data-project-block="summary"
        >
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Сводка
          </h2>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--text)]">
            <li>
              <span className="text-[var(--text-muted)]">Вехи под риском</span>{' '}
              <span
                className="font-medium tabular-nums"
                data-summary-red-milestones="true"
              >
                {redMilestoneCount}
              </span>
            </li>
            <li>
              <span className="text-[var(--text-muted)]">Критичные риски</span>{' '}
              <span className="font-medium tabular-nums">{att.redRiskCount}</span>
            </li>
            <li>
              <span className="text-[var(--text-muted)]">Критические задержки</span>{' '}
              <span className="font-medium tabular-nums">
                {att.delayedCriticalEquipmentCount}
              </span>
            </li>
            <li>
              <span className="text-[var(--text-muted)]">Активные проблемы</span>{' '}
              <span className="font-medium tabular-nums">
                {att.openOrMitigatingIssueCount}
              </span>
            </li>
          </ul>
          <h3 className="mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Состав проекта
          </h3>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5" data-project-composition="true">
            <li>Этапы: {data.composition.stages}</li>
            <li>Работы: {data.composition.works}</li>
            <li>КТ: {data.composition.checkpoints}</li>
            <li>Вехи каталога: {data.composition.catalogMilestones}</li>
            <li>Оборудование: {data.composition.equipment}</li>
          </ul>
          <p className="mt-2 text-xs text-[var(--text-muted)]" data-project-budget="none">
            Отдельный бюджет проекта не выделен.
          </p>
        </section>

        <DetailSection
          title="Вехи"
          empty={data.milestones.length === 0}
          footer={
            msSlice.overflow ? (
              <OverflowToggle
                total={msSlice.total}
                expanded={msExpanded}
                onToggle={() => setMsExpanded((v) => !v)}
                labelAll="Показать все вехи"
              />
            ) : null
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Веха</th>
                  <th className="px-3 py-2 font-semibold">RAG</th>
                  <th className="px-3 py-2 font-semibold">База</th>
                  <th className="px-3 py-2 font-semibold">Прогноз</th>
                </tr>
              </thead>
              <tbody>
                {msSlice.visible.map((ms) => (
                  <tr key={ms.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-3 py-2">
                      <Link
                        href={entityDetailHref('milestone', ms.id)}
                        className="font-medium text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                      >
                        {presentMilestoneName(ms.id, ms.name)}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill family="rag" entity="milestone" value={ms.rag} />
                    </td>
                    <td className="px-3 py-2 tabular-nums text-[var(--text-secondary)]">
                      {formatDateRu(ms.baselineDate)}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-[var(--text-secondary)]">
                      {formatDateRu(ms.forecastDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DetailSection>

        <DetailSection
          title="Оборудование"
          empty={data.equipment.length === 0}
          footer={
            eqSlice.overflow ? (
              <OverflowToggle
                total={eqSlice.total}
                expanded={eqExpanded}
                onToggle={() => setEqExpanded((v) => !v)}
                labelAll="Показать всё оборудование"
              />
            ) : null
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Объект</th>
                  <th className="px-3 py-2 font-semibold">Статус</th>
                  <th className="px-3 py-2 font-semibold">Прогноз</th>
                  <th className="px-3 py-2 font-semibold">Δ</th>
                </tr>
              </thead>
              <tbody>
                {eqSlice.visible.map((eq) => (
                  <tr key={eq.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-3 py-2">
                      <Link
                        href={entityDetailHref('equipment', eq.id)}
                        className="font-medium text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                      >
                        {eq.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill
                        family="equipment"
                        value={eq.status as 'OnTrack' | 'Delayed'}
                      />
                    </td>
                    <td className="px-3 py-2 tabular-nums text-[var(--text-secondary)]">
                      {formatDateRu(eq.forecastDelivery)}
                    </td>
                    <td className="px-3 py-2 tabular-nums">Δ{eq.deltaDays}д</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DetailSection>

        <DetailSection
          title="Проблемы"
          empty={data.issues.length === 0}
          footer={
            issSlice.overflow ? (
              <OverflowToggle
                total={issSlice.total}
                expanded={issExpanded}
                onToggle={() => setIssExpanded((v) => !v)}
                labelAll="Показать все проблемы"
              />
            ) : null
          }
        >
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-semibold">Проблема</th>
                <th className="px-3 py-2 font-semibold">Статус</th>
              </tr>
            </thead>
            <tbody>
              {issSlice.visible.map((issue) => (
                <tr key={issue.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-2">
                    <Link
                      href={entityDetailHref('issue', issue.id)}
                      className="font-medium text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                    >
                      {issue.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill
                      family="issue"
                      value={issue.status as 'Open' | 'Mitigating' | 'Closed'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetailSection>

        <DetailSection
          title="Риски"
          empty={risks.length === 0}
          footer={
            riskSlice.overflow ? (
              <OverflowToggle
                total={riskSlice.total}
                expanded={riskExpanded}
                onToggle={() => setRiskExpanded((v) => !v)}
                labelAll="Показать все риски"
              />
            ) : null
          }
        >
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-semibold">Риск</th>
                <th className="px-3 py-2 font-semibold">RAG</th>
              </tr>
            </thead>
            <tbody>
              {riskSlice.visible.map((risk) => (
                <tr key={risk.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-2">
                    <Link
                      href={entityDetailHref('risk', risk.id)}
                      className="font-medium text-[var(--text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                    >
                      {risk.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill family="rag" entity="risk" value={risk.rag} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetailSection>

        <DetailSection title="Решения" empty={decisions.length === 0}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 font-semibold">Тип</th>
                <th className="px-3 py-2 font-semibold">Заметка</th>
                <th className="px-3 py-2 font-semibold">Срок</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((d) => (
                <tr key={d.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-2 font-medium">
                    {presentDecisionType(
                      d.type as Parameters<typeof presentDecisionType>[0],
                    )}
                  </td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">{d.note}</td>
                  <td className="px-3 py-2 tabular-nums text-[var(--text-secondary)]">
                    {d.dueDate ? formatDateRu(d.dueDate) : '—'}
                    {d.milestoneId ? ` · ${d.milestoneId}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetailSection>

        {data.installationLag ? (
          <p className="text-sm text-[var(--text-secondary)]">{data.installationLag}</p>
        ) : null}
        {data.deliveryNote ? (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{data.deliveryNote}</p>
        ) : null}
      </PageContent>
    </PageFrame>
  );
}
