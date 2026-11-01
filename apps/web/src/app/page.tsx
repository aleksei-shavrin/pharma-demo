import { fetchHealth, fetchProjectStub } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

/**
 * I1 smoke page: proves browser → API client → Nest.
 * Not App Shell / Dashboard (those start in I2+).
 */
export default async function HomePage() {
  let healthError: string | null = null;
  let projectError: string | null = null;
  let health: Awaited<ReturnType<typeof fetchHealth>> | null = null;
  let project: Awaited<ReturnType<typeof fetchProjectStub>> | null = null;

  try {
    health = await fetchHealth();
  } catch (e) {
    healthError = e instanceof Error ? e.message : String(e);
  }

  try {
    project = await fetchProjectStub('PRJ-01');
  } catch (e) {
    projectError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="mx-auto max-w-2xl p-8 font-sans text-slate-900">
      <h1 className="text-2xl font-semibold tracking-tight">
        Pharma Project Control — I1 scaffold
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Minimal FE check: HTTP API client only (REQ-NFR-001). UI Design screens
        start in later iterations.
      </p>

      <section className="mt-8 rounded border border-slate-200 p-4">
        <h2 className="text-lg font-medium">GET /health</h2>
        {healthError ? (
          <p className="mt-2 text-sm text-red-700">{healthError}</p>
        ) : (
          <pre className="mt-2 overflow-auto text-sm">
            {JSON.stringify(health, null, 2)}
          </pre>
        )}
      </section>

      <section className="mt-4 rounded border border-slate-200 p-4">
        <h2 className="text-lg font-medium">GET /v1/projects/PRJ-01</h2>
        <p className="mt-1 text-xs text-slate-500">
          Default Snapshot A stub (full A/B/C switch is I2).
        </p>
        {projectError ? (
          <p className="mt-2 text-sm text-red-700">{projectError}</p>
        ) : (
          <pre className="mt-2 overflow-auto text-sm">
            {JSON.stringify(project, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
