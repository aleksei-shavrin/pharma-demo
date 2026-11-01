import {
  equipmentStatusLabel,
  issueStatusLabel,
  ragLabel,
} from '@/lib/ui-labels';

type Props =
  | { family: 'equipment'; value: 'OnTrack' | 'Delayed' }
  | { family: 'issue'; value: 'Open' | 'Mitigating' | 'Closed' }
  | { family: 'rag'; value: 'Green' | 'Red'; entity: 'risk' | 'milestone' };

export function StatusPill(props: Props) {
  const text =
    props.family === 'rag'
      ? ragLabel(props.entity, props.value)
      : props.family === 'equipment'
        ? equipmentStatusLabel(props.value)
        : issueStatusLabel(props.value);

  const tone =
    props.family === 'equipment'
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
    props.family === 'equipment' && props.value === 'Delayed'
      ? '◆'
      : props.family === 'issue' && props.value === 'Open'
        ? '○'
        : props.family === 'issue' && props.value === 'Mitigating'
          ? '◐'
          : props.family === 'issue' && props.value === 'Closed'
            ? '●'
            : '●';

  const cls =
    tone === 'ok'
      ? 'border-[var(--status-ok-border,#2f6b4f)] bg-[var(--status-ok-bg,#e3f2e9)] text-[var(--status-ok-fg,#1a4d36)]'
      : tone === 'danger'
        ? 'border-[var(--status-danger-border,#b42318)] bg-[var(--status-danger-bg,#fcebea)] text-[var(--status-danger-fg,#7a1710)]'
        : tone === 'info'
          ? 'border-[var(--status-info-border,#3a5f8a)] bg-[var(--status-info-bg,#e6eef7)] text-[var(--status-info-fg,#1e3558)]'
          : 'border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--text-secondary)]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      <span aria-hidden className="text-[0.65rem] leading-none">
        {marker}
      </span>
      {text}
    </span>
  );
}
