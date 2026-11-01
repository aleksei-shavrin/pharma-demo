'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { SNAPSHOT_IDS, type SnapshotId } from '@/lib/snapshot/snapshot-id';
import { useSnapshot } from '@/lib/snapshot/snapshot-context';

function nextId(current: SnapshotId, delta: number): SnapshotId {
  const idx = SNAPSHOT_IDS.indexOf(current);
  const next = (idx + delta + SNAPSHOT_IDS.length) % SNAPSHOT_IDS.length;
  return SNAPSHOT_IDS[next];
}

/**
 * Snapshot A/B/C radiogroup with roving tabindex.
 * Loading: radios stay focusable (`aria-disabled`, not HTML `disabled`) so
 * keyboard focus is not ejected; activation is blocked until load settles.
 * Arrow keys still move focus during loading (focus-only, no new request).
 */
export function SnapshotSelector() {
  const {
    active,
    requested,
    status,
    error,
    switchSnapshot,
    retryLastSwitch,
  } = useSnapshot();
  const loading = status === 'loading';
  const groupId = useId();
  const [focusId, setFocusId] = useState<SnapshotId>(active);
  const radioRefs = useRef<Partial<Record<SnapshotId, HTMLButtonElement | null>>>(
    {},
  );

  useEffect(() => {
    if (!loading) {
      setFocusId(active);
    }
  }, [active, loading]);

  function focusRadio(id: SnapshotId) {
    setFocusId(id);
    queueMicrotask(() => {
      radioRefs.current[id]?.focus();
    });
  }

  function activate(id: SnapshotId) {
    if (loading) return;
    focusRadio(id);
    void switchSnapshot(id);
  }

  function moveFocus(delta: number) {
    const next = nextId(focusId, delta);
    focusRadio(next);
    if (!loading) {
      void switchSnapshot(next);
    }
  }

  function onRadioKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(-1);
        break;
      case 'Home':
        event.preventDefault();
        focusRadio('A');
        if (!loading) void switchSnapshot('A');
        break;
      case 'End':
        event.preventDefault();
        focusRadio('C');
        if (!loading) void switchSnapshot('C');
        break;
      case ' ':
      case 'Enter':
        // Prevent native button click to avoid double activation.
        event.preventDefault();
        activate(focusId);
        break;
      default:
        break;
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        role="radiogroup"
        aria-label="Демо-снимок"
        aria-busy={loading || undefined}
        id={groupId}
        className="inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-0.5"
      >
        {SNAPSHOT_IDS.map((id) => {
          const selected = active === id;
          const pending = loading && requested === id;
          const tabIndex = focusId === id ? 0 : -1;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={loading || undefined}
              tabIndex={tabIndex}
              aria-label={`Снимок ${id}${selected ? ', активный' : ''}${pending ? ', загрузка' : ''}`}
              ref={(el) => {
                radioRefs.current[id] = el;
              }}
              onClick={() => {
                activate(id);
              }}
              onKeyDown={onRadioKeyDown}
              className={[
                'min-w-9 rounded-[calc(var(--radius-sm)-1px)] px-2.5 py-1 text-xs font-semibold outline-none',
                'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
                selected
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--interactive)]',
                pending ? 'ring-2 ring-[var(--focus-ring)] ring-offset-1' : '',
                loading && !pending ? 'opacity-60' : '',
              ].join(' ')}
            >
              {id}
              {pending ? (
                <span className="sr-only"> загрузка</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {status === 'error' && error ? (
        <div
          role="alert"
          className="max-w-xs text-right text-xs text-[var(--status-danger-fg)]"
        >
          <p>
            Не удалось переключить снимок. Активный снимок остаётся {active}.
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
      {loading && requested ? (
        <p className="text-xs text-[var(--text-muted)]" aria-live="polite">
          Загрузка снимка {requested}…
        </p>
      ) : null}
    </div>
  );
}
