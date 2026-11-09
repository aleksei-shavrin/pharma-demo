/**
 * Lower Dashboard cards — two independent equal columns (2026-11-09).
 * Left stack: People → Attention → Changes.
 * Right stack: Exceptions → Decisions?.
 *
 * IMPORTANT: the class string MUST also appear as a full literal in a file
 * scanned by Tailwind (`src/components/**`, `src/app/**`). Tailwind content
 * does NOT include `src/lib/**` — a class that exists only in this module
 * will be present on the DOM but have no generated CSS.
 *
 * Prefer `lg:grid-cols-2` + `items-start` (no cross-column stretch holes).
 */
export const DASHBOARD_LOWER_GRID_CLASS =
  'grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-5';

export const DASHBOARD_LOWER_COLUMN_CLASS =
  'flex min-w-0 flex-col gap-4';

export const DASHBOARD_LOWER_GRID_ATTR = '1fr_1fr';

export const DASHBOARD_LOWER_LAYOUT_ATTR = 'two-col-independent';

/**
 * Pair lists fill remaining card height (flex-1); scroll only when overflowing.
 * Surface caps height so long lists do not explode the lower zone.
 * @deprecated kept for tests that assert historical constant presence.
 */
export const DASHBOARD_PAIR_LIST_MAX_HEIGHT = '100%';

/** Shared bound for Exceptions ↔ Decisions panels (~448px). */
export const DASHBOARD_PAIR_SURFACE_MAX_CLASS = 'max-h-[28rem]';

export const DASHBOARD_PAIR_LIST_SCROLL_CLASS =
  'mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]';

/**
 * Bounded panel surface. Prefer max-h over stretching to a sibling column:
 * independent stacks use items-start — h-full only fills the card's own box.
 */
export const DASHBOARD_PAIR_SURFACE_CLASS =
  'flex h-full max-h-[28rem] min-h-0 min-w-0 flex-col overflow-hidden';
