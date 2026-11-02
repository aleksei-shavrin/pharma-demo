'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  SELECTABLE_SNAPSHOT_IDS,
  isSelectableSnapshotId,
  type SelectableSnapshotId,
  type SnapshotId,
} from '@/lib/snapshot/snapshot-id';
import {
  SNAPSHOT_CONTEXT_RU,
  snapshotAsOfRu,
  snapshotOptionLabel,
} from '@/lib/snapshot/snapshot-meta';
import { formatDateRu } from '@/lib/format/ru';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

type PopupPos = { top: number; right: number; width: number };

function toSelectable(id: SnapshotId): SelectableSnapshotId {
  return isSelectableSnapshotId(id) ? id : 'A';
}

/**
 * Compact AppBar snapshot disclosure (E7 / E6+E7-R1).
 * Single ARIA pattern: button trigger + portaled listbox (no radiogroup/menu/tabs).
 * Portal avoids AppShell `overflow-hidden` clipping.
 */
export function SnapshotSelector() {
  const {
    active,
    requested,
    status,
    error,
    dashboard,
    switchSnapshot,
    retryLastSwitch,
  } = useSnapshot();
  const loading = status === 'loading';
  const settled = dashboard !== null;
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const optionRefs = useRef<
    Partial<Record<SelectableSnapshotId, HTMLLIElement | null>>
  >({});
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopupPos | null>(null);
  const [focusId, setFocusId] = useState<SelectableSnapshotId>(() =>
    toSelectable(settled ? active : (requested ?? 'A')),
  );

  useEffect(() => {
    if (!loading && settled) {
      setFocusId(toSelectable(active));
    } else if (loading && requested) {
      setFocusId(toSelectable(requested));
    }
  }, [active, loading, requested, settled]);

  function measurePopup() {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: r.bottom + 4,
      right: Math.max(window.innerWidth - r.right, 8),
      width: Math.min(22 * 16, window.innerWidth - 16),
    });
  }

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    measurePopup();
    function onResize() {
      measurePopup();
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocPointer(event: MouseEvent) {
      const t = event.target as Node | null;
      if (!t) return;
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
    }
    function onDocKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onDocPointer);
    document.addEventListener('keydown', onDocKey);
    return () => {
      document.removeEventListener('mousedown', onDocPointer);
      document.removeEventListener('keydown', onDocKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      optionRefs.current[focusId]?.focus();
    });
  }, [open, focusId]);

  function closeAndFocusTrigger() {
    setOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  }

  function activate(id: SelectableSnapshotId) {
    if (loading) return;
    setFocusId(id);
    void switchSnapshot(id);
    closeAndFocusTrigger();
  }

  function moveFocus(delta: number) {
    const idx = SELECTABLE_SNAPSHOT_IDS.indexOf(focusId);
    const next =
      SELECTABLE_SNAPSHOT_IDS[
        (idx + delta + SELECTABLE_SNAPSHOT_IDS.length) %
          SELECTABLE_SNAPSHOT_IDS.length
      ];
    setFocusId(next);
    queueMicrotask(() => optionRefs.current[next]?.focus());
  }

  function onOptionKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(-1);
        break;
      case 'Home':
        event.preventDefault();
        setFocusId('A');
        queueMicrotask(() => optionRefs.current.A?.focus());
        break;
      case 'End':
        event.preventDefault();
        setFocusId('H');
        queueMicrotask(() => optionRefs.current.H?.focus());
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activate(focusId);
        break;
      case 'Escape':
        event.preventDefault();
        closeAndFocusTrigger();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
      }
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeAndFocusTrigger();
    }
  }

  /** Committed API date when settled; narrative meta only for unsettled bootstrap. */
  const committedAsOfRu = settled
    ? formatDateRu(dashboard.scenarioAsOfDate)
    : snapshotAsOfRu(requested ?? active);
  const displayId = settled ? active : requested ?? active;
  const triggerLabel = settled
    ? loading && requested && requested !== active
      ? `Снимок ${active}, ${committedAsOfRu}, активный, загрузка снимка ${requested}`
      : `Снимок ${active}, ${committedAsOfRu}, активный`
    : loading && requested
      ? `Снимок ${requested}, загрузка`
      : 'Демо-снимок, загрузка';

  const listStyle: CSSProperties | undefined = pos
    ? {
        position: 'fixed',
        top: pos.top,
        right: pos.right,
        width: pos.width,
        maxHeight: 'min(22rem, 70vh)',
        zIndex: 80,
      }
    : undefined;

  const listbox =
    open && pos && typeof document !== 'undefined'
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Демо-снимок"
            aria-busy={loading || undefined}
            style={listStyle}
            className="overflow-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] py-1 shadow-[var(--elevation-1)]"
            data-snapshot-listbox="true"
          >
            {SELECTABLE_SNAPSHOT_IDS.map((id) => {
              const selected = settled && active === id;
              const pending = loading && requested === id;
              return (
                <li
                  key={id}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={loading || undefined}
                  tabIndex={focusId === id ? 0 : -1}
                  aria-label={snapshotOptionLabel(id)}
                  ref={(el) => {
                    optionRefs.current[id] = el;
                  }}
                  onClick={() => {
                    if (!loading) activate(id);
                  }}
                  onKeyDown={onOptionKeyDown}
                  className={[
                    'cursor-pointer px-3 py-1.5 outline-none',
                    'focus-visible:bg-[var(--interactive)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)]',
                    selected
                      ? 'bg-[var(--interactive)]'
                      : 'hover:bg-[var(--interactive)]',
                    pending ? 'ring-1 ring-inset ring-[var(--focus-ring)]' : '',
                    loading && !pending ? 'opacity-60' : '',
                  ].join(' ')}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="w-4 shrink-0 text-xs font-semibold text-[var(--text)]">
                      {id}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {snapshotAsOfRu(id)}
                    </span>
                    {selected ? (
                      <span className="ml-auto text-[10px] font-medium text-[var(--text-muted)]">
                        активный
                      </span>
                    ) : null}
                    {pending ? (
                      <span className="ml-auto text-[10px] text-[var(--text-muted)]">
                        загрузка
                      </span>
                    ) : null}
                  </div>
                  <p className="pl-6 text-[11px] leading-snug text-[var(--text-muted)]">
                    {SNAPSHOT_CONTEXT_RU[id]}
                  </p>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className="relative flex flex-col items-end gap-1">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-busy={loading || undefined}
        aria-label={triggerLabel}
        onClick={() => {
          setOpen((v) => !v);
        }}
        onKeyDown={onTriggerKeyDown}
        className={[
          'inline-flex min-h-9 min-w-[9.5rem] flex-col items-start justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-left outline-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
          loading ? 'opacity-80' : '',
        ].join(' ')}
      >
        <span className="text-xs font-semibold text-[var(--text)]">
          Снимок {displayId}
          {loading && requested ? (
            <span className="font-normal text-[var(--text-muted)]"> …</span>
          ) : null}
        </span>
        <span className="text-[10px] leading-tight text-[var(--text-muted)]">
          {settled ? committedAsOfRu : snapshotAsOfRu(displayId)}
        </span>
      </button>

      {listbox}

      {status === 'error' && error ? (
        <div
          role="alert"
          className="max-w-xs text-right text-xs text-[var(--status-danger-fg)]"
        >
          <p>
            {settled
              ? `Не удалось переключить снимок. Активный снимок остаётся ${active}.`
              : 'Не удалось загрузить снимок.'}
          </p>
          <p className="mt-0.5 text-[var(--text-muted)]">{error}</p>
          <button
            type="button"
            className="mt-1 font-medium text-[var(--link)] underline outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            onClick={() => {
              void retryLastSwitch();
            }}
          >
            Повторить
          </button>
        </div>
      ) : null}
      {loading && requested && !open ? (
        <p className="text-xs text-[var(--text-muted)]" aria-live="polite">
          Загрузка снимка {requested}…
        </p>
      ) : null}
    </div>
  );
}
