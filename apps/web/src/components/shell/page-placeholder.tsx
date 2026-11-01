'use client';

import { useSnapshot } from '@/lib/snapshot/snapshot-context';

type Props = {
  title: string;
  description: string;
};

/**
 * I2 route placeholder — proves shell + snapshot context only.
 * Not Dashboard/register/Schedule content (I3+).
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
        aria-label="Active snapshot context"
        className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-sm"
      >
        <p className="text-[var(--text-muted)]">
          Active snapshot:{' '}
          <span className="font-semibold text-[var(--text)]">{active}</span>
          {status === 'loading' ? ' (loading…)' : null}
        </p>
        {project ? (
          <dl className="mt-3 grid gap-1 text-[var(--text-secondary)] sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                As of
              </dt>
              <dd>{project.scenarioAsOfDate}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                Forecast PS
              </dt>
              <dd>{project.forecastProductionStart}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                Baseline PS
              </dt>
              <dd>{project.baselineProductionStart}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                API snapshotId
              </dt>
              <dd>{project.snapshotId}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-[var(--text-muted)]">
            Waiting for snapshot-aware API payload…
          </p>
        )}
      </section>
    </div>
  );
}
