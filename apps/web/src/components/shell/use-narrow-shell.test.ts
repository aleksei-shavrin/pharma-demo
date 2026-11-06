/** @vitest-environment jsdom */
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NARROW_SHELL_MEDIA_QUERY, useNarrowShell } from './use-narrow-shell';

describe('useNarrowShell', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('подписывается на change и снимает слушатель при размонтировании', async () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    let matches = false;
    const removeEventListener = vi.fn(
      (type: string, listener: EventListener) => {
        if (type === 'change') {
          listeners.delete(listener as (event: MediaQueryListEvent) => void);
        }
      },
    );

    vi.stubGlobal('matchMedia', (query: string) => {
      expect(query).toBe(NARROW_SHELL_MEDIA_QUERY);
      return {
        get matches() {
          return matches;
        },
        media: query,
        addEventListener: (type: string, listener: EventListener) => {
          if (type === 'change') {
            listeners.add(listener as (event: MediaQueryListEvent) => void);
          }
        },
        removeEventListener,
        dispatchEvent: () => true,
      };
    });

    const { result, unmount } = renderHook(() => useNarrowShell());
    await waitFor(() => expect(result.current).toBe(false));
    expect(listeners.size).toBe(1);

    matches = true;
    for (const listener of [...listeners]) {
      listener({ matches: true } as MediaQueryListEvent);
    }
    await waitFor(() => expect(result.current).toBe(true));

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
    expect(listeners.size).toBe(0);
  });
});
