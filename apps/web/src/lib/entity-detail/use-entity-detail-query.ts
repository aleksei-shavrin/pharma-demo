'use client';

import { DEMO_PORTFOLIO_ID } from '@/lib/demo-portfolio-id';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isNotFoundError } from '@/lib/api-client';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

type DetailPayload = { snapshotId: SnapshotId };

export type EntityDetailQueryState<T extends DetailPayload> = {
  data: T | null;
  status: 'idle' | 'loading' | 'error' | 'absent';
  error: string | null;
  retry: () => void;
};


/**
 * Loads entity detail for the committed active snapshot.
 * 404 → absent (same route / EmptyState). Never shows foreign-snapshot payload.
 */
export function useEntityDetailQuery<T extends DetailPayload>(
  entityId: string,
  fetchDetail: (
    projectId: string,
    entityId: string,
    snapshot: SnapshotId,
  ) => Promise<T>,
): EntityDetailQueryState<T> {
  const { active, status: snapStatus } = useSnapshot();
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'error' | 'absent'
  >('loading');
  const [error, setError] = useState<string | null>(null);
  const seqRef = useRef(0);
  const fetchRef = useRef(fetchDetail);
  fetchRef.current = fetchDetail;

  const load = useCallback(
    async (snapshot: SnapshotId, id: string) => {
      const seq = ++seqRef.current;
      setStatus('loading');
      setError(null);
      setData((prev) => (prev && prev.snapshotId === snapshot ? prev : null));
      try {
        const payload = await fetchRef.current(DEMO_PORTFOLIO_ID, id, snapshot);
        if (seq !== seqRef.current) return;
        if (payload.snapshotId !== snapshot) {
          throw new Error(
            `API returned snapshot ${payload.snapshotId}, expected ${snapshot}`,
          );
        }
        setData(payload);
        setStatus('idle');
      } catch (e) {
        if (seq !== seqRef.current) return;
        setData(null);
        if (isNotFoundError(e)) {
          setStatus('absent');
          setError(null);
          return;
        }
        setStatus('error');
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [],
  );

  useEffect(() => {
    if (snapStatus === 'loading') {
      setStatus('loading');
      setData(null);
      return;
    }
    void load(active, entityId);
  }, [active, snapStatus, entityId, load]);

  const retry = useCallback(() => {
    void load(active, entityId);
  }, [active, entityId, load]);

  const coherent =
    data && data.snapshotId === active && snapStatus !== 'loading'
      ? data
      : null;

  if (snapStatus === 'loading' || status === 'loading') {
    return { data: null, status: 'loading', error: null, retry };
  }

  if (coherent) {
    return { data: coherent, status: 'idle', error: null, retry };
  }

  if (status === 'absent') {
    return { data: null, status: 'absent', error: null, retry };
  }

  return {
    data: null,
    status: status === 'error' ? 'error' : 'loading',
    error,
    retry,
  };
}
