'use client';

import { useEffect, useState } from 'react';

/**
 * In-flow sidebar starts at 1024px (§1.4). `max-width: 1023px` is the
 * complementary query so 1024px stays wide.
 */
export const NARROW_SHELL_MEDIA_QUERY = '(max-width: 1023px)';

/**
 * Starts `false` so the server and the first client render match (wide shell).
 * The listener is the source of truth after mount, including resizes.
 */
export function useNarrowShell(): boolean {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia(NARROW_SHELL_MEDIA_QUERY);
    const apply = () => {
      setNarrow(media.matches);
    };

    apply();
    media.addEventListener('change', apply);
    return () => {
      media.removeEventListener('change', apply);
    };
  }, []);

  return narrow;
}
