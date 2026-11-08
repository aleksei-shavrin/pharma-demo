import type { ProjectStatus, ScheduleWorkStatus } from '@/lib/api-client';
import {
  equipmentStatusLabel,
  issueStatusLabel,
  projectStatusLabel,
  ragLabel,
  workStatusLabel,
} from '@/lib/ui-labels';

type Props =
  | { family: 'equipment'; value: 'OnTrack' | 'Delayed' }
  | { family: 'issue'; value: 'Open' | 'Mitigating' | 'Closed' }
  | { family: 'rag'; value: 'Green' | 'Red'; entity: 'risk' | 'milestone' }
  | { family: 'project'; value: ProjectStatus }
  | { family: 'work'; value: ScheduleWorkStatus }
  /** Calendar due for Decision — never maps passed → danger/failed. */
  | {
      family: 'decisionDue';
      value: 'none' | 'upcoming' | 'passed' | 'today';
      label: string;
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

export function StatusPill(props: Props) {
  const text =
    props.family === 'decisionDue'
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

  const tone =
    props.family === 'decisionDue'
      ? props.value === 'passed'
        ? 'warn'
        : props.value === 'none'
          ? 'open'
          : 'info'
      : props.family === 'work'
        ? WORK_STATUS_TONE[props.value]
        : props.family === 'project'
          ? props.value === 'Green'
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
              : props.value === 'Green'
                ? 'ok'
                : 'danger';

  const marker =
    props.family === 'decisionDue'
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
                : '●';

  const cls =
    tone === 'ok'
      ? 'border-[var(--status-ok-border)] bg-[var(--status-ok-bg)] text-[var(--status-ok-fg)]'
      : tone === 'danger'
        ? 'border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]'
        : tone === 'warn'
          ? 'border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] text-[var(--status-warn-fg)]'
          : tone === 'info'
            ? 'border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-fg)]'
            : 'border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--text-secondary)]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-medium ${cls}`}
      data-status-pill={props.family}
      {...(props.family === 'decisionDue'
        ? { 'data-decision-due-badge': props.value }
        : {})}
    >
      <span aria-hidden className="text-[0.65rem] leading-none">
        {marker}
      </span>
      {text}
    </span>
  );
}
