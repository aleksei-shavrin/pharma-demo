'use client';

import { useEffect, useState } from 'react';
import { ProjectListView } from '@/components/portfolio/portfolio-views';
import { fetchAnalystProjects, type AnalystProjectRow } from '@/lib/api-client';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

export default function ProjectsPage() {
  const { active, status } = useSnapshot();
  const [items, setItems] = useState<AnalystProjectRow[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    let cancelled = false;
    void fetchAnalystProjects('PRJ-01', active)
      .then((payload) => {
        if (!cancelled) setItems(payload.items);
      })
      .catch((error: unknown) => {
        console.error('[ProjectsPage] Failed to load analyst projects:', error);
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [active, status]);

  return <ProjectListView items={items} />;
}
