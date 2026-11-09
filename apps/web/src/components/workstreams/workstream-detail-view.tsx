'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { WorkstreamDetail } from '@/lib/api-client';
import { StatusPill } from '@/components/dashboard/status-pill';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu, formatRubRu } from '@/lib/format/ru';
import {
  presentDecisionType,
  presentMilestoneName,
  registerRowTypeLabel,
} from '@/lib/ui-labels';
import {
  PageContent,
  PageFrame,
  PageHeader,
} from '@/components/shell/page-frame';
import { snapshotDisplayLabel } from '@/lib/snapshot/snapshot-id';
import {
  previewSlice,
  sortAttentionForPreview,
  sortDecisionsForPreview,
  sortEquipmentForPreview,
  sortMilestonesForPreview,
  WORKSTREAM_SECTION_PREVIEW_LIMIT,
} from './workstream-detail-preview';

function Section({
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
        data-workstream-overflow="true"
      >
        {expanded ? 'Свернуть' : `${labelAll} ${total} →`}
      </button>
    </div>
  );
}

function CostSummary({ data }: { data: WorkstreamDetail }) {
  const cost = data.cost;
  if (!cost) {
    return (
      <p className="text-sm text-[var(--text-muted)]">Стоимость недоступна</p>
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
      data-workstream-block="cost"
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

export function WorkstreamDetailView({ data }: { data: WorkstreamDetail }) {
  const title = data.workstream.nameRu;
  const att = data.attention;

  const [msExpanded, setMsExpanded] = useState(false);
  const [eqExpanded, setEqExpanded] = useState(false);
  const [attExpanded, setAttExpanded] = useState(false);
  const [decExpanded, setDecExpanded] = useState(false);

  const milestonesSorted = sortMilestonesForPreview(data.milestones);
  const equipmentSorted = sortEquipmentForPreview(data.equipment);
  const attentionSorted = sortAttentionForPreview(data.issues, data.risks);
  const decisionsSorted = sortDecisionsForPreview(data.decisions);

  const ms = previewSlice(milestonesSorted, msExpanded);
  const eq = previewSlice(equipmentSorted, eqExpanded);
  const attention = previewSlice(attentionSorted, attExpanded);
  const dec = previewSlice(decisionsSorted, decExpanded);

  return (
    <PageFrame className="p-6" data-page="workstream-detail">
      <PageHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-[var(--text-muted)]">
              {data.workstream.id} · снимок {snapshotDisplayLabel(data.snapshotId)} · на{' '}
              {formatDateRu(data.scenarioAsOfDate)}
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text)]">
              {title}
            </h1>
            {data.workstream.leadPersonId && data.leadFullNameRu ? (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Руководитель направления:{' '}
                <Link
                  href={`/people/${encodeURIComponent(data.workstream.leadPersonId)}`}
                  className="font-medium text-[var(--text)] underline-offset-2 hover:underline"
                >
                  {data.leadFullNameRu}
                </Link>
              </p>
            ) : null}
          </div>
          <StatusPill family="project" value={data.rag} />
        </div>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          <Link
            href="/"
            className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            ← К обзору проекта
          </Link>
        </p>
      </PageHeader>

      <PageContent mode="page" className="mt-4 flex flex-col gap-4">
      <section
        className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-3"
        data-workstream-block="summary"
      >
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          Сводка
        </h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--text)]">
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
        <div className="mt-3 border-t border-[var(--border)] pt-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Стоимость направления
          </h3>
          <div className="mt-2">
            <CostSummary data={data} />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Резерв проекта не входит в бюджет направления.
          </p>
        </div>
      </section>

      <Section
        title="Вехи"
        empty={data.milestones.length === 0}
        footer={
          ms.overflow ? (
            <OverflowToggle
              total={ms.total}
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
            {ms.visible.map((m) => (
              <tr key={m.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-3 py-2">
                  <Link
                    href={entityDetailHref('milestone', m.id)}
                    className="font-medium text-[var(--text)] underline-offset-2 hover:underline"
                  >
                    {presentMilestoneName(m.id, m.name)}
                  </Link>
                  <div className="text-xs text-[var(--text-muted)]">{m.id}</div>
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
      </Section>

      <Section
        title="Оборудование"
        empty={data.equipment.length === 0}
        footer={
          eq.overflow ? (
            <OverflowToggle
              total={eq.total}
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
              <th className="px-3 py-2 font-semibold">Крит.</th>
              <th className="px-3 py-2 font-semibold">Прогноз</th>
            </tr>
          </thead>
          <tbody>
            {eq.visible.map((e) => (
              <tr key={e.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-3 py-2">
                  <Link
                    href={entityDetailHref('equipment', e.id)}
                    className="font-medium text-[var(--text)] underline-offset-2 hover:underline"
                  >
                    {e.name}
                  </Link>
                  <div className="text-xs text-[var(--text-muted)]">{e.id}</div>
                </td>
                <td className="px-3 py-2">
                  <StatusPill family="equipment" value={e.status} />
                </td>
                <td className="px-3 py-2 text-[var(--text-secondary)]">
                  {e.critical ? 'Да' : 'Нет'}
                </td>
                <td className="px-3 py-2 tabular-nums text-[var(--text-secondary)]">
                  {formatDateRu(e.forecastDelivery)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="Проблемы и риски"
        empty={data.issues.length === 0 && data.risks.length === 0}
        footer={
          attention.overflow ? (
            <OverflowToggle
              total={attention.total}
              expanded={attExpanded}
              onToggle={() => setAttExpanded((v) => !v)}
              labelAll="Показать все записи"
            />
          ) : null
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
            <tr>
              <th className="px-3 py-2 font-semibold">Тип</th>
              <th className="px-3 py-2 font-semibold">Запись</th>
              <th className="px-3 py-2 font-semibold">Статус</th>
            </tr>
          </thead>
          <tbody>
            {attention.visible.map((row) =>
              row.kind === 'issue' ? (
                <tr
                  key={`i-${row.item.id}`}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-3 py-2 text-[var(--text-muted)]">
                    {registerRowTypeLabel('Issue')}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={entityDetailHref('issue', row.item.id)}
                      className="font-medium text-[var(--text)] underline-offset-2 hover:underline"
                    >
                      {row.item.title}
                    </Link>
                    <div className="text-xs text-[var(--text-muted)]">{row.item.id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill family="issue" value={row.item.status} />
                  </td>
                </tr>
              ) : (
                <tr
                  key={`r-${row.item.id}`}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-3 py-2 text-[var(--text-muted)]">
                    {registerRowTypeLabel('Risk')}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={entityDetailHref('risk', row.item.id)}
                      className="font-medium text-[var(--text)] underline-offset-2 hover:underline"
                    >
                      {row.item.title}
                    </Link>
                    <div className="text-xs text-[var(--text-muted)]">{row.item.id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill family="rag" entity="risk" value={row.item.rag} />
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </Section>

      <Section
        title="Решения"
        empty={data.decisions.length === 0}
        footer={
          dec.overflow ? (
            <OverflowToggle
              total={dec.total}
              expanded={decExpanded}
              onToggle={() => setDecExpanded((v) => !v)}
              labelAll="Показать все решения"
            />
          ) : null
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
            <tr>
              <th className="px-3 py-2 font-semibold">Решение</th>
              <th className="px-3 py-2 font-semibold">Тип</th>
              <th className="px-3 py-2 font-semibold">Срок</th>
            </tr>
          </thead>
          <tbody>
            {dec.visible.map((d) => (
              <tr key={d.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-3 py-2">
                  <div className="font-medium text-[var(--text)]">{d.note}</div>
                  <div className="text-xs text-[var(--text-muted)]">{d.id}</div>
                </td>
                <td className="px-3 py-2 text-[var(--text-secondary)]">
                  {presentDecisionType(d.type)}
                </td>
                <td className="px-3 py-2 tabular-nums text-[var(--text-secondary)]">
                  {d.dueDate ? formatDateRu(d.dueDate) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Preview limit exported for tests via data attribute */}
      <span
        className="sr-only"
        data-workstream-preview-limit={WORKSTREAM_SECTION_PREVIEW_LIMIT}
      />
      </PageContent>
    </PageFrame>
  );
}
