import {
  formatStatusPillHtml,
  statusPillPresentation,
  type StatusPillProps,
} from '@/lib/status-pill-presentation';

export type { StatusPillProps };
export { formatStatusPillHtml, statusPillPresentation };

export function StatusPill(props: StatusPillProps) {
  const p = statusPillPresentation(props);
  return (
    <span className={p.className} {...p.dataAttrs}>
      <span aria-hidden className="text-[0.65rem] leading-none">
        {p.marker}
      </span>
      {p.text}
    </span>
  );
}
