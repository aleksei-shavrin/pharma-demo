import type { ProjectStatus, ScheduleWorkStatus } from '@/lib/api-client';
import {
  equipmentStatusLabel,
  issueStatusLabel,
  projectStatusLabel,
  ragLabel,
  workStatusLabel,
} from '@/lib/ui-labels';

export type StatusPillProps =
  | { family: 'equipment'; value: 'OnTrack' | 'Delayed' }
  | { family: 'issue'; value: 'Open' | 'Mitigating' | 'Closed' }
  | {
      family: 'rag';
      value: string | null | undefined;
      entity: 'risk' | 'milestone';
    }
  | { family: 'project'; value: ProjectStatus | string | null | undefined }
  | { family: 'work'; value: ScheduleWorkStatus }
  | {
      family: 'decisionDue';
      value: 'none' | 'upcoming' | 'passed' | 'today';
      label: string;
    }
  | {
      family: 'decisionExecution';
      value: 'unknown' | 'not_started' | 'in_progress' | 'completed';
      label: string;
    };

export type StatusPillTone = 'ok' | 'warn' | 'info' | 'danger' | 'open';

export type StatusPillPresentation = {
  text: string;
  tone: StatusPillTone;
  marker: string;
  className: string;
  family: StatusPillProps['family'];
  dataAttrs: Record<string, string>;
};

const WORK_STATUS_TONE: Record<
  ScheduleWorkStatus,
  'ok' | 'warn' | 'info' | 'danger'
> = {
  Waiting: 'warn',
  OnSchedule: 'info',
  Delayed: 'danger',
  Completed: 'ok',
};

function isKnownProjectStatus(
  value: unknown,
): value is ProjectStatus {
  return value === 'Green' || value === 'Yellow' || value === 'Red';
}

function isKnownRag(
  value: unknown,
): value is 'Green' | 'Red' | 'Yellow' | 'Amber' {
  return (
    value === 'Green' ||
    value === 'Red' ||
    value === 'Yellow' ||
    value === 'Amber'
  );
}

function toneClass(tone: StatusPillTone): string {
  return tone === 'ok'
    ? 'border-[var(--status-ok-border)] bg-[var(--status-ok-bg)] text-[var(--status-ok-fg)]'
    : tone === 'danger'
      ? 'border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]'
      : tone === 'warn'
        ? 'border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] text-[var(--status-warn-fg)]'
        : tone === 'info'
          ? 'border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-fg)]'
          : 'border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--text-secondary)]';
}

/** Shared mapping for React StatusPill and ECharts HTML tooltip (no react-dom/server). */
export function statusPillPresentation(
  props: StatusPillProps,
): StatusPillPresentation {
  const text =
    props.family === 'decisionDue' || props.family === 'decisionExecution'
      ? props.label
      : props.family === 'project'
        ? projectStatusLabel(props.value)
        : props.family === 'work'
          ? workStatusLabel(props.value)
          : props.family === 'rag'
            ? ragLabel(props.entity, props.value)
            : props.family === 'equipment'
              ? equipmentStatusLabel(props.value)
              : issueStatusLabel(props.value);

  const tone: StatusPillTone =
    props.family === 'decisionExecution'
      ? props.value === 'completed'
        ? 'ok'
        : props.value === 'in_progress'
          ? 'info'
          : props.value === 'not_started'
            ? 'warn'
            : 'open'
      : props.family === 'decisionDue'
        ? props.value === 'passed'
          ? 'warn'
          : props.value === 'none'
            ? 'open'
            : 'info'
        : props.family === 'work'
          ? WORK_STATUS_TONE[props.value]
          : props.family === 'project'
            ? !isKnownProjectStatus(props.value)
              ? 'open'
              : props.value === 'Green'
                ? 'ok'
                : props.value === 'Yellow'
                  ? 'warn'
                  : 'danger'
            : props.family === 'equipment'
              ? props.value === 'OnTrack'
                ? 'ok'
                : 'danger'
              : props.family === 'issue'
                ? props.value === 'Open'
                  ? 'open'
                  : props.value === 'Closed'
                    ? 'ok'
                    : 'info'
                : !isKnownRag(props.value)
                  ? 'open'
                  : props.value === 'Green'
                    ? 'ok'
                    : props.value === 'Yellow' || props.value === 'Amber'
                      ? 'warn'
                      : 'danger';

  const marker =
    props.family === 'decisionExecution'
      ? props.value === 'completed'
        ? '●'
        : props.value === 'in_progress'
          ? '◐'
          : '○'
      : props.family === 'decisionDue'
        ? props.value === 'passed'
          ? '◐'
          : props.value === 'today'
            ? '○'
            : '●'
        : props.family === 'equipment' && props.value === 'Delayed'
          ? '◆'
          : props.family === 'issue' && props.value === 'Open'
            ? '○'
            : props.family === 'issue' && props.value === 'Mitigating'
              ? '◐'
              : props.family === 'issue' && props.value === 'Closed'
                ? '●'
                : props.family === 'project' && props.value === 'Yellow'
                  ? '▲'
                  : props.family === 'project' &&
                      !isKnownProjectStatus(props.value)
                    ? '○'
                    : props.family === 'rag' && !isKnownRag(props.value)
                      ? '○'
                      : '●';

  const dataAttrs: Record<string, string> = {
    'data-status-pill': props.family,
  };
  if (props.family === 'decisionDue') {
    dataAttrs['data-decision-due-badge'] = props.value;
  }
  if (props.family === 'decisionExecution') {
    dataAttrs['data-decision-execution'] = props.value;
  }
  if (
    (props.family === 'project' && !isKnownProjectStatus(props.value)) ||
    (props.family === 'rag' && !isKnownRag(props.value))
  ) {
    dataAttrs['data-status-unknown'] = 'true';
  }

  return {
    text,
    tone,
    marker,
    className: `inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-medium leading-none ${toneClass(tone)}`,
    family: props.family,
    dataAttrs,
  };
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** HTML markup matching StatusPill for enterable ECharts tooltips. */
export function formatStatusPillHtml(props: StatusPillProps): string {
  const p = statusPillPresentation(props);
  const attrs = Object.entries(p.dataAttrs)
    .map(([k, v]) => `${k}="${escapeHtmlText(v)}"`)
    .join(' ');
  return `<span class="${p.className}" ${attrs}><span aria-hidden="true" style="font-size:0.65rem;line-height:1">${escapeHtmlText(p.marker)}</span>${escapeHtmlText(p.text)}</span>`;
}
