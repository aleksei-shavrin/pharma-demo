'use client';

import { DashboardView } from '@/components/dashboard/dashboard-view';
import { PageListError, PageListLoading } from '@/components/shell/page-list-states';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { snapshotDisplayLabel } from '@/lib/snapshot/snapshot-id';

export default function DashboardPage() {
  const { dashboard, status, error, retryLastSwitch, active } = useSnapshot();

  if (!dashboard && status === 'error') {
    return (
      <PageListError
        message={`Не удалось загрузить снимок ${snapshotDisplayLabel(active)}. ${error ?? ''}`}
        onRetry={() => {
          void retryLastSwitch();
        }}
      />
    );
  }

  // Same loading label for every empty-dashboard branch — avoids SSR/CSR
  // hydration mismatch (was «Загрузка…» vs «Ожидание…»).
  if (!dashboard) {
    return <PageListLoading label="Загрузка дашборда" />;
  }

  return <DashboardView data={dashboard} />;
}
