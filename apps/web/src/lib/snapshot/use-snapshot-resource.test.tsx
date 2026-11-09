/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SnapshotId } from '@/lib/snapshot/snapshot-id';
import { useSnapshotResource } from './use-snapshot-resource';

const snapState = vi.hoisted(() => ({
  active: '03' as SnapshotId,
  status: 'ready' as 'loading' | 'ready' | 'error',
}));

vi.mock('@/lib/snapshot/snapshot-context', () => ({
  useSnapshot: () => ({
    active: snapState.active,
    status: snapState.status,
  }),
}));

describe('useSnapshotResource', () => {
  beforeEach(() => {
    snapState.active = '03';
    snapState.status = 'ready';
  });

  it('does not expose prior snapshot payload after active changes', async () => {
    let resolveC: (v: { id: string }) => void = () => undefined;
    let resolveA: (v: { id: string }) => void = () => undefined;
    const fetchFn = vi.fn((projectId: string, snap: SnapshotId) => {
      if (snap === '03') {
        return new Promise<{ id: string }>((r) => {
          resolveC = r;
        });
      }
      return new Promise<{ id: string }>((r) => {
        resolveA = r;
      });
    });

    const { result, rerender } = renderHook(() =>
      useSnapshotResource(fetchFn, 'PRT-01'),
    );

    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBeNull();

    await act(async () => {
      resolveC({ id: 'from-C' });
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.data).toEqual({ id: 'from-C' });

    await act(async () => {
      snapState.active = '01';
      rerender();
    });
    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBeNull();

    await act(async () => {
      resolveA({ id: 'from-A' });
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.data).toEqual({ id: 'from-A' });
  });

  it('ignores late response from superseded snapshot', async () => {
    const resolvers: Record<string, (v: { id: string }) => void> = {};
    const fetchFn = vi.fn((_p: string, snap: SnapshotId) => {
      return new Promise<{ id: string }>((r) => {
        resolvers[snap] = r;
      });
    });

    const { result, rerender } = renderHook(() =>
      useSnapshotResource(fetchFn, 'PRT-01'),
    );

    await act(async () => {
      snapState.active = '01';
      rerender();
    });

    await act(async () => {
      resolvers['03']?.({ id: 'late-C' });
      resolvers['01']?.({ id: 'ok-A' });
    });

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.data).toEqual({ id: 'ok-A' });
  });

  it('retry re-enters loading and accepts new payload', async () => {
    let n = 0;
    let resolveNext: ((v: { id: string }) => void) | null = null;
    const fetchFn = vi.fn(
      () =>
        new Promise<{ id: string }>((r) => {
          n += 1;
          if (n === 1) {
            r({ id: 'v1' });
          } else {
            resolveNext = r;
          }
        }),
    );
    const { result } = renderHook(() =>
      useSnapshotResource(fetchFn, 'PRT-01'),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.data).toEqual({ id: 'v1' });

    await act(async () => {
      result.current.retry();
    });
    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBeNull();

    await act(async () => {
      resolveNext?.({ id: 'v2' });
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.data).toEqual({ id: 'v2' });
  });
});
