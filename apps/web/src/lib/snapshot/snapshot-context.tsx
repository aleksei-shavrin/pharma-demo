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
import { fetchDashboardOverview } from '@/lib/api-client';
import { runSnapshotLoad } from './run-snapshot-load';
import type { SnapshotId } from './snapshot-id';
import { createMonotonicSeq } from './snapshot-seq';
import {
  resolveBootstrapSnapshot,
  writeSessionSnapshot,
} from './snapshot-session';
import {
  initialSnapshotState,
  snapshotReducer,
  type SnapshotAction,
  type SnapshotState,
} from './snapshot-state';

const DEMO_PROJECT_ID = 'PRJ-01';

type SnapshotContextValue = SnapshotState & {
  switchSnapshot: (snapshot: SnapshotId) => Promise<void>;
  retryLastSwitch: () => Promise<void>;
};

const SnapshotContext = createContext<SnapshotContextValue | null>(null);

export function SnapshotProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(
    snapshotReducer,
    initialSnapshotState,
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastAttemptRef = useRef<SnapshotId>('A');
  const allocateSeqRef = useRef(createMonotonicSeq());

  /** Keep stateRef in sync before React re-render so getRequestSeq sees commits. */
  const dispatch = useCallback((action: SnapshotAction) => {
    stateRef.current = snapshotReducer(stateRef.current, action);
    rawDispatch(action);
  }, []);

  const runLoad = useCallback(async (snapshot: SnapshotId) => {
    lastAttemptRef.current = snapshot;
    await runSnapshotLoad({
      snapshot,
      projectId: DEMO_PROJECT_ID,
      allocateSeq: allocateSeqRef.current,
      dispatch,
      fetchDashboard: fetchDashboardOverview,
      getRequestSeq: () => stateRef.current.requestSeq,
      onCommitted: writeSessionSnapshot,
    });
  }, [dispatch]);

  useEffect(() => {
    void runLoad(resolveBootstrapSnapshot());
  }, [runLoad]);

  const switchSnapshot = useCallback(
    async (snapshot: SnapshotId) => {
      if (
        snapshot === stateRef.current.active &&
        stateRef.current.status !== 'error' &&
        stateRef.current.dashboard
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
