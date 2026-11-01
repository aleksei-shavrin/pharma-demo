'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'light' ? 'тёмную' : 'светлую';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Переключить на ${next} тему`}
      title={`Переключить на ${next} тему`}
      className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-secondary)] outline-none hover:bg-[var(--interactive)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      ) : (
        <Sun className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
