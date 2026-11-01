'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { fetchProjectStub } from '@/lib/api-client';
import { runSnapshotLoad } from './run-snapshot-load';
import type { SnapshotId } from './snapshot-id';
import { createMonotonicSeq } from './snapshot-seq';
import { initialSnapshotState, snapshotReducer, type SnapshotState } from './snapshot-state';

const DEMO_PROJECT_ID = 'PRJ-01';

type SnapshotContextValue = SnapshotState & {
  switchSnapshot: (snapshot: SnapshotId) => Promise<void>;
  retryLastSwitch: () => Promise<void>;
};

const SnapshotContext = createContext<SnapshotContextValue | null>(null);

export function SnapshotProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(snapshotReducer, initialSnapshotState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastAttemptRef = useRef<SnapshotId>('A');
  /** Sync monotonic seq — not derived from React state. */
  const allocateSeqRef = useRef(createMonotonicSeq());

  const runLoad = useCallback(async (snapshot: SnapshotId) => {
    lastAttemptRef.current = snapshot;
    await runSnapshotLoad({
      snapshot,
      projectId: DEMO_PROJECT_ID,
      allocateSeq: allocateSeqRef.current,
      dispatch,
      fetchProject: fetchProjectStub,
    });
  }, []);

  useEffect(() => {
    void runLoad('A');
  }, [runLoad]);

  const switchSnapshot = useCallback(
    async (snapshot: SnapshotId) => {
      if (
        snapshot === stateRef.current.active &&
        stateRef.current.status !== 'error' &&
        stateRef.current.project
      ) {
        return;
      }
      await runLoad(snapshot);
    },
    [runLoad],
  );

  const retryLastSwitch = useCallback(async () => {
    await runLoad(lastAttemptRef.current);
  }, [runLoad]);

  const value = useMemo<SnapshotContextValue>(
    () => ({
      ...state,
      switchSnapshot,
      retryLastSwitch,
    }),
    [state, switchSnapshot, retryLastSwitch],
  );

  return (
    <SnapshotContext.Provider value={value}>{children}</SnapshotContext.Provider>
  );
}

export function useSnapshot(): SnapshotContextValue {
  const ctx = useContext(SnapshotContext);
  if (!ctx) {
    throw new Error('useSnapshot must be used within SnapshotProvider');
  }
  return ctx;
}
