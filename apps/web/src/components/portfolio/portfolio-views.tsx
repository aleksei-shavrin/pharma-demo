'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type {
  AnalystProjectCard,
  AnalystProjectRow,
  ProgramDetail,
  ProjectStatus,
} from '@/lib/api-client';
import { PageContent, PageFrame, PageHeader } from '@/components/shell/page-frame';

export const NOT_FOUND_COPY = 'Запись не найдена в этом снимке';

function statusWord(status: ProjectStatus): string {
  if (status === 'Green') return 'В норме';
  if (status === 'Yellow') return 'Внимание';
  return 'Критично';
}

export function RecordMissing({ id }: { id: string }) {
  return (
    <PageFrame className="p-6">
      <PageContent mode="page">
        <div role="status" className="max-w-xl rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-6">
          <h1 className="text-lg font-semibold text-[var(--text)]">{id}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{NOT_FOUND_COPY}</p>
          <Link href="/programs" className="mt-4 inline-block text-sm text-[var(--link)] underline">
            К списку программ
          </Link>
        </div>
      </PageContent>
    </PageFrame>
  );
}

export function ProgramListView({
  items,
}: {
  items: { id: string; name: string; status: ProjectStatus }[];
}) {
  return (
    <PageFrame className="p-6">
      <PageHeader>
        <h1 className="text-lg font-semibold text-[var(--text)]">Программы</h1>
      </PageHeader>
      <PageContent mode="page">
        <ul className="mt-4 divide-y divide-[var(--border-subtle)]">
          {items.map((program) => (
            <li key={program.id}>
              <Link
                href={`/programs/${program.id}`}
                className="flex items-center justify-between py-3 text-sm"
                data-program-row={program.id}
              >
                <span>{program.name}</span>
                <span data-status={program.status}>{statusWord(program.status)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PageContent>
    </PageFrame>
  );
}

export function ProgramDashboardView({ data }: { data: ProgramDetail }) {
  const focus = useSearchParams().get('focus');
  useEffect(() => {
    if (!focus) return;
    document.getElementById(`project-${focus}`)?.scrollIntoView({ block: 'center' });
  }, [focus, data.id]);

  return (
    <PageFrame className="p-6">
      <PageHeader>
        <p className="text-xs text-[var(--text-muted)]">Снимок {data.snapshotId}</p>
        <h1 className="text-lg font-semibold text-[var(--text)]">{data.name}</h1>
        <p data-program-status={data.status}>{statusWord(data.status)}</p>
      </PageHeader>
      <PageContent mode="page">
        <section className="mt-4" aria-labelledby="program-issues">
          <h2 id="program-issues" className="text-sm font-semibold">
            Текущие проблемы
          </h2>
          {data.issues.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--text-muted)]">Открытых проблем программы в этом снимке нет.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {data.issues.map((issue) => (
                <li key={issue.id}>
                  {issue.projectId ? (
                    <Link
                      href={`/programs/${data.id}?focus=${issue.projectId}#project-${issue.projectId}`}
                      className="text-sm text-[var(--link)] underline"
                    >
                      {issue.title}
                    </Link>
                  ) : (
                    <span className="text-sm">{issue.title}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="mt-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Проекты программы</h2>
            <Link href={`/programs/${data.id}/projects`} className="text-sm text-[var(--link)] underline">
              Состав
            </Link>
          </div>
          <ProjectRows projects={data.projects} focus={focus} />
        </section>
      </PageContent>
    </PageFrame>
  );
}

export function ProgramCompositionView({ data }: { data: ProgramDetail }) {
  const [attentionOnly, setAttentionOnly] = useState(false);
  const rows = useMemo(
    () =>
      attentionOnly
        ? data.projects.filter((row) => row.status === 'Yellow' || row.status === 'Red')
        : data.projects,
    [attentionOnly, data.projects],
  );
  return (
    <PageFrame className="p-6">
      <PageHeader>
        <Link href={`/programs/${data.id}`} className="text-sm text-[var(--link)] underline">
          {data.name}
        </Link>
        <h1 className="text-lg font-semibold text-[var(--text)]">Состав</h1>
      </PageHeader>
      <PageContent mode="page">
        <button
          type="button"
          className="mt-4 text-sm underline"
          aria-pressed={attentionOnly}
          onClick={() => setAttentionOnly((value) => !value)}
          data-attention-filter={attentionOnly ? 'on' : 'off'}
        >
          {attentionOnly ? 'Сбросить фильтр' : 'Требует внимания'}
        </button>
        <ProjectRows projects={rows} focus={null} />
      </PageContent>
    </PageFrame>
  );
}

function ProjectRows({
  projects,
  focus,
}: {
  projects: AnalystProjectRow[];
  focus: string | null;
}) {
  return (
    <ul className="mt-3 divide-y divide-[var(--border-subtle)]">
      {projects.map((project) => (
        <li
          key={project.id}
          id={`project-${project.id}`}
          data-project-row={project.id}
          data-project-focus={focus === project.id ? 'true' : 'false'}
          className="py-3"
        >
          <Link href={`/projects/${project.id}`} className="text-sm font-medium text-[var(--link)] underline">
            {project.id} · {project.name}
          </Link>
          <p className="text-xs text-[var(--text-secondary)]" data-project-status={project.status}>
            {statusWord(project.status)} · {project.ownerLabel} · {project.progressLabel}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ProjectListView({ items }: { items: AnalystProjectRow[] }) {
  return (
    <PageFrame className="p-6">
      <PageHeader>
        <h1 className="text-lg font-semibold text-[var(--text)]">Проекты</h1>
      </PageHeader>
      <PageContent mode="page">
        <ProjectRows projects={items} focus={null} />
      </PageContent>
    </PageFrame>
  );
}

export function ProjectCardView({ data }: { data: AnalystProjectCard }) {
  return (
    <PageFrame className="p-6">
      <PageHeader>
        <p className="text-xs text-[var(--text-muted)]">Снимок {data.snapshotId}</p>
        <h1 className="text-lg font-semibold text-[var(--text)]">
          {data.id} · {data.name}
        </h1>
        <p>
          <Link href={`/programs/${data.programId}`} className="text-sm text-[var(--link)] underline">
            {data.programName}
          </Link>
        </p>
      </PageHeader>
      <PageContent mode="page">
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-[var(--text-muted)]">Статус</dt>
            <dd data-project-status={data.status}>{statusWord(data.status)}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Владелец</dt>
            <dd>
              {data.ownerPersonId ? (
                <Link href={`/people/${data.ownerPersonId}`} className="text-[var(--link)] underline">
                  {data.ownerLabel}
                </Link>
              ) : (
                data.ownerLabel
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Ход и сроки</dt>
            <dd>
              {data.progressLabel}. {data.datesLabel}
            </dd>
          </div>
        </dl>
        {data.installationLag ? (
          <p className="mt-4 text-sm" data-installation-lag>
            {data.installationLag}
          </p>
        ) : null}
        {data.deliveryNote ? (
          <p className="mt-2 text-sm" data-delivery-note>
            {data.deliveryNote}
          </p>
        ) : null}
        <h2 className="mt-6 text-sm font-semibold">Связанные проблемы</h2>
        <ul>
          {data.issues.map((issue) => (
            <li key={issue.id}>
              <Link href={`/issues/${issue.id}`} className="text-sm text-[var(--link)] underline">
                {issue.title}
              </Link>
            </li>
          ))}
        </ul>
        <h2 className="mt-6 text-sm font-semibold">Оборудование</h2>
        <ul>
          {data.equipment.map((item) => (
            <li key={item.id}>
              <Link href={`/equipment/${item.id}`} className="text-sm text-[var(--link)] underline">
                {item.name}
              </Link>
              <span className="text-sm text-[var(--text-secondary)]">
                {' '}
                · поставка {item.forecastDelivery} ({item.deltaDays} дн.)
              </span>
            </li>
          ))}
        </ul>
        <h2 className="mt-6 text-sm font-semibold">Вехи</h2>
        <ul>
          {data.milestones.map((milestone) => (
            <li key={milestone.id} className="text-sm">
              {milestone.name}: {milestone.forecastDate}
            </li>
          ))}
        </ul>
      </PageContent>
    </PageFrame>
  );
}
