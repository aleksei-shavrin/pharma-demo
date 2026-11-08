'use client';

import { DashboardView } from '@/components/dashboard/dashboard-view';
import { PageListError, PageListLoading } from '@/components/shell/page-list-states';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

export default function DashboardPage() {
  const { dashboard, status, error, retryLastSwitch, active } = useSnapshot();

  if (!dashboard && status === 'loading') {
    return <PageListLoading label="Загрузка дашборда" />;
  }

  if (!dashboard && status === 'error') {
    return (
      <PageListError
        message={`Не удалось загрузить снимок ${active}. ${error ?? ''}`}
        onRetry={() => {
          void retryLastSwitch();
        }}
      />
    );
  }

  if (!dashboard) {
    return <PageListLoading label="Ожидание данных дашборда" />;
  }

  return <DashboardView data={dashboard} />;
}
