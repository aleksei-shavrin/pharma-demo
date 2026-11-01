'use client';

import { DashboardView } from '@/components/dashboard/dashboard-view';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

export default function DashboardPage() {
  const { dashboard, status, error, retryLastSwitch, active } = useSnapshot();

  if (!dashboard && status === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-[var(--text-muted)]">
        Загрузка обзора…
      </div>
    );
  }

  if (!dashboard && status === 'error') {
    return (
      <div className="flex flex-1 flex-col items-start gap-3 p-8" role="alert">
        <h1 className="text-lg font-semibold text-[var(--text)]">Обзор</h1>
        <p className="text-sm text-[var(--status-danger-fg)]">
          Не удалось загрузить снимок {active}. {error}
        </p>
        <button
          type="button"
          className="text-sm font-medium text-[var(--link)] underline"
          onClick={() => {
            void retryLastSwitch();
          }}
        >
          Повторить
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-[var(--text-muted)]">
        Ожидание данных обзора…
      </div>
    );
  }

  return <DashboardView data={dashboard} />;
}
