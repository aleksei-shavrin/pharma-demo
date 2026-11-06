'use client';

import { useEffect, useState } from 'react';
import { ProgramListView } from '@/components/portfolio/portfolio-views';
import { fetchProgramList } from '@/lib/api-client';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

export default function ProgramsPage() {
  const { active, status } = useSnapshot();
  const [items, setItems] = useState<
    { id: string; name: string; status: 'Green' | 'Yellow' | 'Red' }[]
  >([]);

  useEffect(() => {
    if (status === 'loading') return;
    let cancelled = false;
    void fetchProgramList('PRJ-01', active)
      .then((payload) => {
        if (!cancelled) setItems(payload.items);
      })
      .catch((error: unknown) => {
        console.error('[ProgramsPage] Failed to load programs:', error);
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [active, status]);

  return <ProgramListView items={items} />;
}
