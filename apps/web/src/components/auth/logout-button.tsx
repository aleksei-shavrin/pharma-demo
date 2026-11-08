'use client';

import type { ReactNode } from 'react';

function LogoutIcon(): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M10 3a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V5H5v14h4v-3a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6zm4.293 4.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L16.586 13H10a1 1 0 1 1 0-2h6.586l-2.293-2.293a1 1 0 0 1 0-1.414z"
      />
    </svg>
  );
}

/**
 * Session clear is POST-only. Rightmost interactive control in the top bar.
 */
export function LogoutButton() {
  const stopBubble = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
  };

  return (
    <form
      method="POST"
      action="/backend/v1/auth/logout"
      className="inline-flex"
      data-logout-control
      onClick={stopBubble}
    >
      <button
        type="submit"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text)] outline-none hover:bg-[var(--interactive)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        aria-label="Выйти"
        title="Выйти"
        data-logout-button
        onClick={stopBubble}
      >
        <LogoutIcon />
      </button>
    </form>
  );
}
