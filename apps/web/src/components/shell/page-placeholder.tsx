'use client';

import { formatDateRu } from '@/lib/format/ru';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

type Props = {
  title: string;
  description: string;
};

/**
 * Route placeholder — shell + snapshot context only.
 * Register / Schedule content lands in later slices.
 */
export function PagePlaceholder({ title, description }: Props) {
  const { active, project, status } = useSnapshot();

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">
          {title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </header>
      <section
        aria-label="Контекст активного снимка"
        className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-sm"
      >
        <p className="text-[var(--text-muted)]">
          Активный снимок:{' '}
          <span className="font-semibold text-[var(--text)]">{active}</span>
          {status === 'loading' ? ' (загрузка…)' : null}
        </p>
        {project ? (
          <dl className="mt-3 grid gap-1 text-[var(--text-secondary)] sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                На дату
              </dt>
              <dd>{formatDateRu(project.scenarioAsOfDate)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                Прогноз запуска
              </dt>
              <dd>{formatDateRu(project.forecastProductionStart)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                Базовый запуск
              </dt>
              <dd>{formatDateRu(project.baselineProductionStart)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                Идентификатор снимка
              </dt>
              <dd>{project.snapshotId}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-[var(--text-muted)]">
            Ожидание данных снимка с API…
          </p>
        )}
      </section>
    </div>
  );
}
