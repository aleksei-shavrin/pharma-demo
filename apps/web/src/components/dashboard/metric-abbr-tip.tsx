'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';

/**
 * Visible tip on hover and keyboard focus (not title-only).
 * Click/touch pins open (first click never closes); Escape dismisses pin.
 */
export function MetricAbbrTip({
  abbr,
  tip,
  children,
}: {
  abbr: string;
  tip: string;
  children?: ReactNode;
}) {
  const tipId = useId();
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || focus || pinned;

  useEffect(() => {
    if (!pinned) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPinned(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinned]);

  return (
    <span
      className="relative inline-flex"
      data-metric-abbr={abbr}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        className="cursor-help rounded-[var(--radius-sm)] text-left text-[var(--text-muted)] underline decoration-dotted underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        aria-describedby={open ? tipId : undefined}
        aria-label={`${abbr}: ${tip}`}
        aria-expanded={open}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onClick={() => setPinned(true)}
      >
        {children ?? abbr}
      </button>
      {open ? (
        <span
          id={tipId}
          role="tooltip"
          data-metric-abbr-tip="true"
          data-metric-abbr-pinned={pinned ? 'true' : undefined}
          className="absolute left-0 top-full z-20 mt-1 w-max max-w-[16rem] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-1.5 text-[11px] leading-snug text-[var(--text)] shadow-[var(--elevation-2)]"
        >
          {tip}
        </span>
      ) : null}
    </span>
  );
}
