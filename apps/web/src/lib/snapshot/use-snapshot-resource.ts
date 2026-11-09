'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEMO_PORTFOLIO_ID } from '@/lib/demo-portfolio-id';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

export type ResourceStatus = 'loading' | 'ready' | 'error';

/**
 * Snapshot-scoped fetch. On active change → status=loading immediately and
 * data is not exposed until payload matches current resourceKey (no stale snap).
 */
export function useSnapshotResource<T>(
  fetchFn: (projectId: string, snapshotId: SnapshotId) => Promise<T>,
  projectId = DEMO_PORTFOLIO_ID,
): {
  data: T | null;
  status: ResourceStatus;
  error: string | null;
  retry: () => void;
  snapshotId: SnapshotId;
  resourceKey: string;
} {
  const { active, status: snapStatus } = useSnapshot();
  const [data, setData] = useState<T | null>(null);
  const [dataKey, setDataKey] = useState<string | null>(null);
  const [status, setStatus] = useState<ResourceStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const seq = useRef(0);

  const resourceKey = `${projectId}:${active}:${tick}`;
  const retry = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (snapStatus === 'loading') {
      setStatus('loading');
      return;
    }
    const my = ++seq.current;
    const key = `${projectId}:${active}:${tick}`;
    setStatus('loading');
    setError(null);
    let cancelled = false;
    void fetchFn(projectId, active)
      .then((payload) => {
        if (cancelled || my !== seq.current) return;
        setData(payload);
        setDataKey(key);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled || my !== seq.current) return;
        setData(null);
        setDataKey(null);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      });
    return () => {
      cancelled = true;
    };
  }, [active, snapStatus, fetchFn, projectId, tick]);

  const readyForActive = status === 'ready' && dataKey === resourceKey;
  return {
    data: readyForActive ? data : null,
    status: readyForActive ? 'ready' : status === 'error' ? 'error' : 'loading',
    error: status === 'error' ? error : null,
    retry,
    snapshotId: active,
    resourceKey,
  };
}
