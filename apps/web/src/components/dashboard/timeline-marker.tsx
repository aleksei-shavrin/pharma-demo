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

export type TimelineMarkerKind =
  | 'milestone'
  | 'ps-baseline'
  | 'ps-forecast'
  | 'ps-coincident';

type PopoverLink = { href: string; label: string };

type Props = {
  kind: TimelineMarkerKind;
  ratio: number;
  labelSide: 'above' | 'below';
  shortLabel: string;
  dateLabel: string;
  statusLabel: string;
  rag: 'Green' | 'Red';
  title?: string;
  subtitle?: string;
  /** Muted technical id shown in popover only */
  entityId?: string;
  labelAlign?: 'start' | 'center' | 'end';
  labelNudgePx?: number;
  /** 0 near axis; 1 outer (R2-U1-R3 collision lanes). */
  labelLane?: 0 | 1;
  ariaLabel: string;
  detailRows: { label: string; value: string }[];
  links: PopoverLink[];
  'data-testid'?: string;
  markerDataAttrs?: Record<string, string>;
};

function placeNearTrigger(
  el: HTMLButtonElement | null,
  opts: { width: number; preferAbove: boolean; estimatedHeight: number },
): CSSProperties {
  if (!el || typeof window === 'undefined') return { top: 0, left: 0 };
  const r = el.getBoundingClientRect();
  const { width, preferAbove, estimatedHeight } = opts;
  let left = r.left + r.width / 2 - width / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  let top = preferAbove
    ? r.top - 8 - estimatedHeight
    : r.bottom + 8;
  if (preferAbove && top < 8) {
    top = r.bottom + 8;
  }
  if (!preferAbove && top + estimatedHeight > window.innerHeight - 8) {
    top = Math.max(8, r.top - 8 - estimatedHeight);
  }
  top = Math.max(8, Math.min(top, window.innerHeight - estimatedHeight - 8));
  return { top, left, width };
}

/**
 * Fixed-geometry interactive timeline marker (HTML, not SVG-scaled).
 * Hover/focus → tooltip; click/Enter/Space → non-modal disclosure popover.
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
  entityId,
  labelAlign = 'center',
  labelNudgePx = 0,
  labelLane = 0,
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
  const [tipPos, setTipPos] = useState<CSSProperties | null>(null);
  const [popoverPos, setPopoverPos] = useState<CSSProperties | null>(null);
  const tipId = useId();
  const popId = useId();

  const showTip = !open && (hovered || focused);

  const updateTipPos = useCallback(() => {
    setTipPos(
      placeNearTrigger(triggerRef.current, {
        width: 168,
        preferAbove: true,
        estimatedHeight: 64,
      }),
    );
  }, []);

  const updatePopoverPos = useCallback(() => {
    setPopoverPos(
      placeNearTrigger(triggerRef.current, {
        width: 260,
        preferAbove: false,
        estimatedHeight: 200,
      }),
    );
  }, []);

  const openPopover = useCallback(() => {
    updatePopoverPos();
    setOpen(true);
  }, [updatePopoverPos]);

  const closePopover = useCallback(() => {
    setOpen(false);
    setPopoverPos(null);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showTip) {
      setTipPos(null);
      return;
    }
    updateTipPos();
    window.addEventListener('scroll', updateTipPos, true);
    window.addEventListener('resize', updateTipPos);
    return () => {
      window.removeEventListener('scroll', updateTipPos, true);
      window.removeEventListener('resize', updateTipPos);
    };
  }, [showTip, updateTipPos]);

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
    updatePopoverPos();
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', updatePopoverPos, true);
    window.addEventListener('resize', updatePopoverPos);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', updatePopoverPos, true);
      window.removeEventListener('resize', updatePopoverPos);
    };
  }, [open, closePopover, updatePopoverPos]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open) closePopover();
      else openPopover();
    }
  };

  const diamond =
    kind === 'milestone'
      ? 'size-2.5 rotate-45 rounded-[1px]'
      : 'size-3 rounded-full';

  const fill =
    kind === 'ps-baseline'
      ? 'bg-[var(--surface-raised)] ring-2 ring-[var(--text-secondary)]'
      : rag === 'Red'
        ? 'bg-[var(--status-danger-border)] ring-2 ring-[var(--status-danger-fg)]'
        : 'bg-[var(--status-ok-border)] ring-2 ring-[var(--status-ok-fg)]';

  const stemAbove = labelSide === 'above';
  const laneOffsetPx = labelLane === 1 ? 26 : 0;
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
      data-label-side={labelSide}
      data-label-lane={labelLane}
      {...(testId ? { 'data-testid': testId } : {})}
    >
      <div
        className={`pointer-events-none absolute flex w-max max-w-[5.25rem] flex-col ${alignClass} ${labelX}`}
        style={{
          ...(stemAbove
            ? { bottom: `calc(100% + 4px + ${laneOffsetPx}px)` }
            : { top: `calc(100% + 4px + ${laneOffsetPx}px)` }),
          ...(labelNudgePx !== 0 && labelAlign === 'center'
            ? { transform: `translateX(calc(-50% + ${labelNudgePx}px))` }
            : labelNudgePx !== 0
              ? { marginInlineStart: labelNudgePx }
              : null),
        }}
        data-milestone-label={markerDataAttrs?.['data-milestone-id']}
        data-label-side={labelSide}
        data-label-lane={labelLane}
      >
        {stemAbove ? (
          <>
            <span className="text-[10px] font-medium leading-tight text-[var(--text)]">
              {shortLabel}
            </span>
            <span className="text-[10px] tabular-nums text-[var(--text-muted)]">
              {dateLabel}
            </span>
            <span className="mt-0.5 h-1.5 w-px bg-[var(--border)]" aria-hidden />
          </>
        ) : (
          <>
            <span className="mb-0.5 h-1.5 w-px bg-[var(--border)]" aria-hidden />
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
        aria-haspopup="true"
        data-marker-trigger="true"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={() => (open ? closePopover() : openPopover())}
        onKeyDown={onKeyDown}
        {...markerDataAttrs}
      />

      {showTip && tipPos
        ? createPortal(
            <div
              id={tipId}
              role="tooltip"
              className="pointer-events-none fixed z-50 max-w-[12rem] rounded-[var(--radius-sm)] bg-[var(--surface-raised)] px-2.5 py-1.5 text-xs shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
              style={tipPos}
              data-timeline-tooltip
            >
              <p className="font-semibold text-[var(--text)]">{tipTitle}</p>
              <p className="tabular-nums text-[var(--text-secondary)]">
                {dateLabel}
              </p>
              <p className="text-[var(--text-muted)]">● {statusLabel}</p>
            </div>,
            document.body,
          )
        : null}

      {open && popoverPos
        ? createPortal(
            <div
              ref={popoverRef}
              id={popId}
              className="fixed z-50 w-[260px] rounded-[var(--radius-md)] bg-[var(--surface-raised)] p-3 text-sm shadow-[var(--elevation-1)] ring-1 ring-[var(--border)]"
              style={popoverPos}
              data-timeline-popover={kind}
            >
              <p className="font-semibold text-[var(--text)]">{tipTitle}</p>
              {subtitle ? (
                <p className="mt-0.5 text-xs leading-snug text-[var(--text-secondary)]">
                  {subtitle}
                </p>
              ) : null}
              {entityId ? (
                <p className="mt-0.5 text-[10px] tabular-nums text-[var(--text-muted)]">
                  {entityId}
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
