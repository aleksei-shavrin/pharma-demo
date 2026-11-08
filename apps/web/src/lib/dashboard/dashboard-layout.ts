/**
 * Shared desktop column template for the lower Dashboard card grid (R2-U1-R7, B11).
 * One auto-flow grid for Exceptions / Decisions / Attention / Changes.
 *
 * IMPORTANT: the class string MUST also appear as a full literal in a file
 * scanned by Tailwind (`src/components/**`, `src/app/**`). Tailwind content
 * does NOT include `src/lib/**` — a class that exists only in this module
 * will be present on the DOM but have no generated CSS (R6 failure mode).
 *
 * Prefer `lg:grid-cols-2` (viewport ≥1024) over fragile arbitrary templates.
 */
export const DASHBOARD_LOWER_GRID_CLASS =
  'grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-5';

export const DASHBOARD_LOWER_GRID_ATTR = '1fr_1fr';

/**
 * Pair lists fill remaining card height (flex-1); scroll only when overflowing.
 * Surface caps height so 18 decisions do not explode the lower grid; list uses
 * the remainder (no short 14.25rem pocket under a taller stretched card).
 * @deprecated kept for tests that assert historical constant presence.
 */
export const DASHBOARD_PAIR_LIST_MAX_HEIGHT = '100%';

/** Shared bound for Exceptions ↔ Decisions pair (~448px). */
export const DASHBOARD_PAIR_SURFACE_MAX_CLASS = 'max-h-[28rem]';

export const DASHBOARD_PAIR_LIST_SCROLL_CLASS =
  'mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]';

export const DASHBOARD_PAIR_SURFACE_CLASS =
  'flex h-full max-h-[28rem] min-h-0 min-w-0 flex-col overflow-hidden';
