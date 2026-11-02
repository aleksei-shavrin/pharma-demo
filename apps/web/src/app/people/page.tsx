'use client';

import { PeopleListView } from '@/components/people/people-list-view';
import {
  EntityDetailError,
  EntityDetailLoading,
} from '@/components/entity-detail/entity-detail-view';
import { fetchPeopleList } from '@/lib/api-client';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';
import { useEffect, useState } from 'react';
import type { PersonList } from '@/lib/api-client';

export default function PeoplePage() {
  const { active } = useSnapshot();
  const [data, setData] = useState<PersonList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'idle' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);
    void fetchPeopleList('PRJ-01', active)
      .then((list) => {
        if (cancelled) return;
        setData(list);
        setStatus('idle');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  if (status === 'loading') return <EntityDetailLoading />;
  if (status === 'error') {
    return (
      <EntityDetailError
        message={error ?? ''}
        onRetry={() => {
          setStatus('loading');
          void fetchPeopleList('PRJ-01', active)
            .then((list) => {
              setData(list);
              setStatus('idle');
            })
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : 'Ошибка загрузки');
              setStatus('error');
            });
        }}
      />
    );
  }
  if (!data) return <EntityDetailLoading />;
  return <PeopleListView data={data} />;
}
