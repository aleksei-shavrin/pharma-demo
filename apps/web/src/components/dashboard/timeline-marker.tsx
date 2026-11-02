'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';

export type TimelineMarkerKind = 'milestone' | 'ps-baseline' | 'ps-forecast' | 'ps-coincident';

type PopoverLink = { href: string; label: string };

type Props = {
  kind: TimelineMarkerKind;
  ratio: number;
  labelSide: 'above' | 'below';
  /** Compact track label */
  shortLabel: string;
  dateLabel: string;
  statusLabel: string;
  rag: 'Green' | 'Red';
  /** Popover / tooltip title (defaults to shortLabel) */
  title?: string;
  /** Optional popover subtitle (e.g. full milestone name) */
  subtitle?: string;
  labelAlign?: 'start' | 'center' | 'end';
  /** Bounded horizontal nudge for label only (px); marker stays on date */
  labelNudgePx?: number;
  /** Accessible name for the trigger */
  ariaLabel: string;
  /** Richer popover rows — only existing contract fields */
  detailRows: { label: string; value: string }[];
  links: PopoverLink[];
  'data-testid'?: string;
  markerDataAttrs?: Record<string, string>;
};

/**
 * Fixed-geometry interactive timeline marker (HTML, not SVG-scaled).
 * Hover/focus → compact tooltip; click/Enter → popover.
 */
export function TimelineMarker({
  kind,
  ratio,
  labelSide,
  shortLabel,
  dateLabel,
  statusLabel,
  rag,
  title,
  subtitle,
  labelAlign = 'center',
  labelNudgePx = 0,
  ariaLabel,
  detailRows,
  links,
  'data-testid': testId,
  markerDataAttrs,
}: Props) {
  const tipTitle = title ?? shortLabel;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const tipId = useId();
  const popId = useId();

  const showTip = !open && (hovered || focused);

  const placePopover = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = 260;
    let left = r.left + r.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    let top = r.bottom + 8;
    if (top + 220 > window.innerHeight) {
      top = Math.max(8, r.top - 8 - 180);
    }
    setPopoverPos({ top, left });
  }, []);

  const openPopover = useCallback(() => {
    placePopover();
    setOpen(true);
  }, [placePopover]);

  const closePopover = useCallback(() => {
    setOpen(false);
    setPopoverPos(null);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePopover();
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        popoverRef.current?.contains(t) ||
        triggerRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
      setPopoverPos(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('resize', placePopover);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('resize', placePopover);
    };
  }, [open, closePopover, placePopover]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open) closePopover();
      else openPopover();
    }
  };

  const diamond =
    kind === 'milestone'
      ? 'size-3 rotate-45 rounded-[1px]'
      : 'size-3.5 rounded-full';

  const fill =
    kind === 'ps-baseline'
      ? 'bg-[var(--surface-raised)] ring-2 ring-[var(--text-secondary)]'
      : rag === 'Red'
        ? 'bg-[var(--status-danger-border)] ring-2 ring-[var(--status-danger-fg)]'
        : 'bg-[var(--status-ok-border)] ring-2 ring-[var(--status-ok-fg)]';

  const stemAbove = labelSide === 'above';
  const alignClass =
    labelAlign === 'start'
      ? 'items-start text-left'
      : labelAlign === 'end'
        ? 'items-end text-right'
        : 'items-center text-center';
  const labelX =
    labelAlign === 'start'
      ? 'left-1/2'
      : labelAlign === 'end'
        ? 'right-1/2 translate-x-1/2'
        : labelNudgePx !== 0
          ? 'left-1/2'
          : 'left-1/2 -translate-x-1/2';

  return (
    <div
      className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${ratio * 100}%` }}
      data-timeline-marker={kind}
      data-marker-geometry="fixed-html"
      {...(testId ? { 'data-testid': testId } : {})}
    >
      {/* Label + stem — separated from fixed marker geometry */}
      <div
        className={`pointer-events-none absolute flex w-max max-w-[5rem] flex-col ${alignClass} ${labelX} ${
          stemAbove ? 'bottom-[calc(100%+2px)]' : 'top-[calc(100%+2px)]'
        }`}
        style={
          labelNudgePx !== 0 && labelAlign === 'center'
            ? { transform: `translateX(calc(-50% + ${labelNudgePx}px))` }
            : labelNudgePx !== 0
              ? { marginInlineStart: labelNudgePx }
              : undefined
        }
        data-milestone-label={markerDataAttrs?.['data-milestone-id']}
      >
        {stemAbove ? (
          <>
            <span className="text-[10px] font-medium leading-tight text-[var(--text)]">
              {shortLabel}
            </span>
            <span className="text-[10px] tabular-nums text-[var(--text-muted)]">
              {dateLabel}
            </span>
            <span
              className="mt-0.5 h-1.5 w-px bg-[var(--border)]"
              aria-hidden
            />
          </>
        ) : (
          <>
            <span
              className="mb-0.5 h-1.5 w-px bg-[var(--border)]"
              aria-hidden
            />
            <span className="text-[10px] font-medium leading-tight text-[var(--text)]">
              {shortLabel}
            </span>
            <span className="text-[10px] tabular-nums text-[var(--text-muted)]">
              {dateLabel}
            </span>
          </>
        )}
      </div>

      <button
        ref={triggerRef}
        type="button"
        className={`relative block shrink-0 ${diamond} ${fill} cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]`}
        aria-label={ariaLabel}
        aria-describedby={showTip ? tipId : undefined}
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        data-marker-trigger="true"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={() => (open ? closePopover() : openPopover())}
        onKeyDown={onKeyDown}
        {...markerDataAttrs}
      />

      {showTip
        ? createPortal(
            <div
              id={tipId}
              role="tooltip"
              className="pointer-events-none fixed z-50 max-w-[12rem] rounded-[var(--radius-sm)] bg-[var(--surface-raised)] px-2.5 py-1.5 text-xs shadow-[var(--elevation-1)] ring-1 ring-[var(--border)]"
              style={tooltipStyle(triggerRef.current)}
              data-timeline-tooltip
            >
              <p className="font-semibold text-[var(--text)]">{tipTitle}</p>
              <p className="tabular-nums text-[var(--text-secondary)]">
                {dateLabel}
              </p>
              <p className="text-[var(--text-muted)]">
                ● {statusLabel}
              </p>
            </div>,
            document.body,
          )
        : null}

      {open && popoverPos
        ? createPortal(
            <div
              ref={popoverRef}
              id={popId}
              role="dialog"
              aria-label={ariaLabel}
              className="fixed z-50 w-[260px] rounded-[var(--radius-md)] bg-[var(--surface-raised)] p-3 text-sm shadow-[var(--elevation-1)] ring-1 ring-[var(--border)]"
              style={{ top: popoverPos.top, left: popoverPos.left }}
              data-timeline-popover={kind}
            >
              <p className="font-semibold text-[var(--text)]">{tipTitle}</p>
              {subtitle ? (
                <p className="mt-0.5 text-xs leading-snug text-[var(--text-secondary)]">
                  {subtitle}
                </p>
              ) : null}
              <dl className="mt-2 space-y-1 text-xs">
                {detailRows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-3">
                    <dt className="text-[var(--text-muted)]">{row.label}</dt>
                    <dd className="text-right text-[var(--text-secondary)]">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {links.length > 0 ? (
                <ul className="mt-3 space-y-1.5 border-t border-[var(--border-subtle)] pt-2">
                  {links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-xs font-medium text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                      >
                        {link.label} →
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function tooltipStyle(el: HTMLButtonElement | null): CSSProperties {
  if (!el || typeof window === 'undefined') return { top: 0, left: 0 };
  const r = el.getBoundingClientRect();
  const width = 160;
  let left = r.left + r.width / 2 - width / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  const top = Math.max(8, r.top - 8 - 56);
  return { top, left, width };
}
