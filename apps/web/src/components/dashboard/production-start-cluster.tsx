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
import { formatDateRu } from '@/lib/format/ru';
import type { ProductionStartClusterModel } from '@/lib/dashboard/production-start-cluster';
import { entityDetailHref } from '@/lib/entity-routes';

type Props = {
  cluster: ProductionStartClusterModel;
  rag: 'Green' | 'Red';
  subtitle?: string;
};

/** Half of size-3 (12px) marker — connector meets marker rims. */
const MARKER_RADIUS_PX = 6;
const LEADER_HEIGHT = '1.25rem';

function placeNear(
  el: HTMLElement | null,
  opts: { width: number; preferAbove: boolean; estimatedHeight: number },
): CSSProperties {
  if (!el || typeof window === 'undefined') return { top: 0, left: 0 };
  const r = el.getBoundingClientRect();
  const { width, preferAbove, estimatedHeight } = opts;
  let left = r.left + r.width / 2 - width / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  let top = preferAbove ? r.top - 8 - estimatedHeight : r.bottom + 8;
  if (preferAbove && top < 8) top = r.bottom + 8;
  if (!preferAbove && top + estimatedHeight > window.innerHeight - 8) {
    top = Math.max(8, r.top - 8 - estimatedHeight);
  }
  top = Math.max(8, Math.min(top, window.innerHeight - estimatedHeight - 8));
  return { top, left, width };
}

function deltaClass(
  tone: ProductionStartClusterModel['deltaTone'],
): string {
  if (tone === 'active') return 'text-[var(--status-danger-fg)]';
  if (tone === 'historical') return 'text-[var(--text-muted)]';
  return 'text-[var(--status-ok-fg)]';
}

/**
 * Consolidated Production Start presentation (R2-U1-R9).
 *
 * Geometry:
 *   ○────────●   (baseline ─ connector ─ current; true dates)
 *            │   (leader attached to current marker bottom)
 *            └─ annotation
 */
export function ProductionStartCluster({ cluster, rag, subtitle }: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tipPos, setTipPos] = useState<CSSProperties | null>(null);
  const [popoverPos, setPopoverPos] = useState<CSSProperties | null>(null);
  const tipId = useId();
  const popId = useId();
  const showTip = !open && (hovered || focused);

  const statusWord = rag === 'Green' ? 'В норме' : 'Критично';
  const currentFill =
    rag === 'Red'
      ? 'bg-[var(--status-danger-border)] ring-2 ring-[var(--status-danger-fg)]'
      : 'bg-[var(--status-ok-border)] ring-2 ring-[var(--status-ok-fg)]';
  const baselineFill =
    'bg-[var(--surface-raised)] ring-2 ring-[var(--border)]';

  const leftRatio = Math.min(cluster.baselineRatio, cluster.currentRatio);
  const spanRatio = Math.abs(cluster.currentRatio - cluster.baselineRatio);
  const showConnector = !cluster.coincident && spanRatio > 0.001;

  const updateTip = useCallback(() => {
    setTipPos(
      placeNear(triggerRef.current, {
        width: 200,
        preferAbove: true,
        estimatedHeight: 72,
      }),
    );
  }, []);

  const updatePop = useCallback(() => {
    setPopoverPos(
      placeNear(triggerRef.current, {
        width: 280,
        preferAbove: false,
        estimatedHeight: 220,
      }),
    );
  }, []);

  const openPopover = useCallback(() => {
    updatePop();
    setOpen(true);
  }, [updatePop]);

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
    updateTip();
    window.addEventListener('scroll', updateTip, true);
    window.addEventListener('resize', updateTip);
    return () => {
      window.removeEventListener('scroll', updateTip, true);
      window.removeEventListener('resize', updateTip);
    };
  }, [showTip, updateTip]);

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
    updatePop();
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', updatePop, true);
    window.addEventListener('resize', updatePop);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', updatePop, true);
      window.removeEventListener('resize', updatePop);
    };
  }, [open, closePopover, updatePop]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open) closePopover();
      else openPopover();
    }
  };

  const ariaLabel = [
    cluster.title,
    cluster.lineRu,
    cluster.deltaRu,
    statusWord,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-10"
      data-ps-cluster
      data-ps-cluster-state={cluster.state}
      data-ps-delta-tone={cluster.deltaTone}
      data-marker-geometry="fixed-html"
    >
      {/* Neutral connector — meets marker rims (not a danger progress bar) */}
      {showConnector ? (
        <span
          className="pointer-events-none absolute top-1/2 z-[8] h-px -translate-y-1/2 bg-[var(--border)]"
          style={{
            left: `calc(${leftRatio * 100}% + ${MARKER_RADIUS_PX}px)`,
            width: `calc(${spanRatio * 100}% - ${MARKER_RADIUS_PX * 2}px)`,
          }}
          aria-hidden
          data-ps-connector="baseline-current"
        />
      ) : null}

      {/* Baseline hollow point (non-interactive; cluster is one entity) */}
      {showConnector ? (
        <span
          className={`pointer-events-none absolute top-1/2 z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${baselineFill}`}
          style={{ left: `${cluster.baselineRatio * 100}%` }}
          aria-hidden
          data-ps-baseline-marker="true"
        />
      ) : null}

      {/*
        Current marker group: button + leader + annotation share one origin
        so the stem starts at the marker bottom (no floating gap).
      */}
      <div
        className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${cluster.currentRatio * 100}%` }}
        data-ps-current-anchor
      >
        <button
          ref={triggerRef}
          type="button"
          className={`pointer-events-auto relative block size-3 shrink-0 rounded-full ${currentFill} cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]`}
          aria-label={ariaLabel}
          aria-describedby={showTip ? tipId : undefined}
          aria-expanded={open}
          aria-controls={open ? popId : undefined}
          aria-haspopup="true"
          data-marker-trigger="true"
          data-milestone-marker="MS-PS"
          data-milestone-id="MS-PS"
          data-milestone-rag={rag}
          data-ps-current-marker="true"
          data-ps-baseline-marker={cluster.coincident ? 'true' : undefined}
          data-ps-forecast-marker={
            cluster.coincident ? 'coincident' : 'true'
          }
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onClick={() => {
            if (open) closePopover();
            else openPopover();
          }}
          onKeyDown={onKeyDown}
        />

        {/* Leader attached to current marker bottom edge */}
        <span
          className="pointer-events-none absolute left-1/2 top-full w-px -translate-x-1/2 bg-[var(--border)]"
          style={{ height: LEADER_HEIGHT }}
          aria-hidden
          data-ps-cluster-stem="true"
          data-ps-leader-attached="current"
        />

        {/* Annotation grows left from current X (right-edge safe) */}
        <div
          className="pointer-events-auto absolute z-20 w-max max-w-[11.5rem] -translate-x-full text-right"
          style={{
            left: '50%',
            top: `calc(100% + ${LEADER_HEIGHT})`,
          }}
          data-ps-cluster-label
          data-milestone-label="MS-PS"
          data-ps-delta-label
        >
          <button
            type="button"
            className="w-full cursor-pointer rounded-[var(--radius-sm)] px-1 py-0.5 text-right focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            onClick={() => {
              triggerRef.current?.focus();
              if (open) closePopover();
              else openPopover();
            }}
            tabIndex={-1}
            aria-hidden
          >
            <p className="text-[10px] font-semibold leading-tight text-[var(--text)]">
              {cluster.title}
            </p>
            <p className="mt-0.5 text-[10px] leading-snug tabular-nums text-[var(--text-secondary)]">
              {cluster.lineRu}
            </p>
            {cluster.deltaRu ? (
              <p
                className={`mt-0.5 text-[10px] font-semibold tabular-nums ${deltaClass(cluster.deltaTone)}`}
                data-ps-delta-line
              >
                {cluster.deltaRu}
              </p>
            ) : null}
          </button>
        </div>
      </div>

      {showTip && tipPos
        ? createPortal(
            <div
              id={tipId}
              role="tooltip"
              className="pointer-events-none fixed z-50 max-w-[14rem] rounded-[var(--radius-sm)] bg-[var(--surface-raised)] px-2.5 py-1.5 text-xs shadow-[var(--elevation-1)] ring-1 ring-[var(--border-subtle)]"
              style={tipPos}
              data-timeline-tooltip
            >
              <p className="font-semibold text-[var(--text)]">{cluster.title}</p>
              <p className="text-[var(--text-secondary)]">{cluster.lineRu}</p>
              {cluster.deltaRu ? (
                <p className="text-[var(--text-muted)]">{cluster.deltaRu}</p>
              ) : null}
              <p className="text-[var(--text-muted)]">● {statusWord}</p>
            </div>,
            document.body,
          )
        : null}

      {open && popoverPos
        ? createPortal(
            <div
              ref={popoverRef}
              id={popId}
              className="fixed z-50 w-[280px] rounded-[var(--radius-md)] bg-[var(--surface-raised)] p-3 text-sm shadow-[var(--elevation-1)] ring-1 ring-[var(--border)]"
              style={popoverPos}
              data-timeline-popover="ps-cluster"
            >
              <p className="font-semibold text-[var(--text)]">{cluster.title}</p>
              {subtitle ? (
                <p className="mt-0.5 text-xs leading-snug text-[var(--text-secondary)]">
                  {subtitle}
                </p>
              ) : null}
              <p className="mt-0.5 text-[10px] tabular-nums text-[var(--text-muted)]">
                MS-PS
              </p>
              <dl className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--text-muted)]">Базовый план</dt>
                  <dd className="text-right text-[var(--text-secondary)]">
                    {formatDateRu(cluster.baselineDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--text-muted)]">
                    {cluster.state === 'actual'
                      ? 'Факт'
                      : cluster.state === 'baseline'
                        ? 'План'
                        : 'Прогноз'}
                  </dt>
                  <dd className="text-right text-[var(--text-secondary)]">
                    {formatDateRu(cluster.currentDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--text-muted)]">Отклонение</dt>
                  <dd className="text-right text-[var(--text-secondary)]">
                    {cluster.deltaRu || 'По плану'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--text-muted)]">Состояние</dt>
                  <dd className="text-right text-[var(--text-secondary)]">
                    ● {statusWord}
                  </dd>
                </div>
              </dl>
              <ul className="mt-3 space-y-1.5 border-t border-[var(--border-subtle)] pt-2">
                <li>
                  <Link
                    href={entityDetailHref('milestone', 'MS-PS')}
                    className="text-xs font-medium text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    Открыть веху →
                  </Link>
                </li>
                <li>
                  <Link
                    href="/schedule"
                    className="text-xs font-medium text-[var(--link)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    Подробный график →
                  </Link>
                </li>
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
