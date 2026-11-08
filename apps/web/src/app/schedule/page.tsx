'use client';

import { Suspense } from 'react';
import { ScheduleView } from '@/components/schedule/schedule-view';

function SchedulePage() {
  return <ScheduleView />;
}

export default function SchedulePageRoute() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-[var(--text-muted)]">Загрузка…</div>}>
      <SchedulePage />
    </Suspense>
  );
}
