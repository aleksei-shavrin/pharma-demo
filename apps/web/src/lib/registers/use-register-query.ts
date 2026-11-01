'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

type RegisterPayload = { snapshotId: SnapshotId };

export type RegisterQueryState<T extends RegisterPayload> = {
  /** Payload only when it matches active snapshot. */
  data: T | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  retry: () => void;
};

const DEMO_PROJECT_ID = 'PRJ-01';

/**
 * Loads a register for the committed active snapshot.
 * Never presents a payload whose snapshotId ≠ active as current data.
 * Ignores stale/out-of-order responses via monotonic seq.
 */
export function useRegisterQuery<T extends RegisterPayload>(
  fetchRegister: (projectId: string, snapshot: SnapshotId) => Promise<T>,
): RegisterQueryState<T> {
  const { active, status: snapStatus } = useSnapshot();
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const seqRef = useRef(0);
  const fetchRef = useRef(fetchRegister);
  fetchRef.current = fetchRegister;

  const load = useCallback(
    async (snapshot: SnapshotId) => {
      const seq = ++seqRef.current;
      setStatus('loading');
      setError(null);
      // Drop previous payload immediately so it cannot be shown under new active.
      setData((prev) => (prev && prev.snapshotId === snapshot ? prev : null));
      try {
        const payload = await fetchRef.current(DEMO_PROJECT_ID, snapshot);
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
        setStatus('error');
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [],
  );

  useEffect(() => {
    // Wait until global snapshot switch settles so we fetch the committed active.
    if (snapStatus === 'loading') {
      setStatus('loading');
      setData(null);
      return;
    }
    void load(active);
  }, [active, snapStatus, load]);

  const retry = useCallback(() => {
    void load(active);
  }, [active, load]);

  const coherent =
    data && data.snapshotId === active && snapStatus !== 'loading'
      ? data
      : null;

  return {
    data: coherent,
    status:
      snapStatus === 'loading' || status === 'loading'
        ? 'loading'
        : coherent
          ? 'idle'
          : status,
    error: coherent ? null : error,
    retry,
  };
}
