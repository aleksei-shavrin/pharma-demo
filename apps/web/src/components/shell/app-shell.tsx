'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { PageSurface } from './page-surface';
import { Sidebar } from './sidebar';
import { SkipLink } from './skip-link';
import { TopAppBar } from './top-app-bar';
import { useNarrowShell } from './use-narrow-shell';

const MENU_TAB_SELECTOR = 'a[href], button:not([disabled])';

/**
 * Dashboard (`/`) is a canvas of independent modules — no enclosing Page Surface.
 * All other screens keep the standard Page Surface pattern.
 *
 * Scroll ownership: `html`/`body` are locked in `globals.css`. Shell is
 * `fixed inset-0` so tall `#main-content` children cannot inflate
 * `documentElement.scrollHeight` (Chromium still grows the root scroller for
 * nested `overflow:auto` content when the shell is only `h-dvh` in-flow).
 * Dashboard canvas or `PageContent` is the page scroll owner; cards/boards may
 * own bounded scrolls.
 *
 * Below 1024px the sidebar leaves the row and opens over the page (§1.4).
 * That overlay is not the F07 collapse control.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === '/';
  const narrow = useNarrowShell();
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!narrow) setMenuOpen(false);
  }, [narrow]);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    dialogRef.current?.focus();
  }, [menuOpen]);

  useLayoutEffect(() => {
    if (menuOpen || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    menuButtonRef.current?.focus();
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        restoreFocusRef.current = true;
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>(MENU_TAB_SELECTOR)];
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  function closeFromPointer() {
    restoreFocusRef.current = true;
    setMenuOpen(false);
  }

  const showOverlay = narrow && menuOpen;

  return (
    <div className="fixed inset-0 flex min-h-0 overflow-hidden bg-[var(--canvas)] text-[var(--text)]">
      <SkipLink />
      {narrow ? null : <Sidebar />}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TopAppBar
          menu={
            narrow
              ? {
                  expanded: menuOpen,
                  controlsId: menuId,
                  onToggle: () => setMenuOpen((open) => !open),
                  buttonRef: menuButtonRef,
                }
              : undefined
          }
        />
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {showOverlay ? (
            <div className="absolute inset-0 z-40">
              <div
                className="absolute inset-0 bg-[color-mix(in_srgb,var(--text)_35%,transparent)]"
                data-shell-menu-backdrop
                onClick={closeFromPointer}
              />
              <div
                ref={dialogRef}
                id={menuId}
                role="dialog"
                aria-modal="true"
                aria-label="Основная навигация"
                tabIndex={-1}
                className="absolute inset-y-0 start-0 flex h-full w-[var(--sidebar-width)] outline-none"
                onClick={(event) => {
                  const target = event.target;
                  if (!(target instanceof Element)) return;
                  if (target.closest('a')) setMenuOpen(false);
                }}
              >
                <Sidebar />
              </div>
            </div>
          ) : null}
          <div
            className="flex min-h-0 min-w-0 flex-1 flex-col"
            inert={showOverlay ? true : undefined}
          >
            {isDashboard ? (
              <main
                id="main-content"
                tabIndex={-1}
                className="flex min-h-0 flex-1 flex-col overflow-auto outline-none"
                data-dashboard-canvas="true"
              >
                {children}
              </main>
            ) : (
              <PageSurface>
                <main
                  id="main-content"
                  tabIndex={-1}
                  className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none"
                >
                  {children}
                </main>
              </PageSurface>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
