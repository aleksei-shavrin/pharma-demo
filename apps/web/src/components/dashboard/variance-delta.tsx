import type { VarianceDto } from '@/lib/api-client';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';

const SUBJECT_LABEL: Record<VarianceDto['subject'], string> = {
  equipment_delivery: 'Поставка оборудования',
  production_start: 'Запуск производства',
};

export function VarianceDelta({
  variance,
  size = 'md',
}: {
  variance: VarianceDto;
  size?: 'sm' | 'md';
}) {
  const label = SUBJECT_LABEL[variance.subject];
  const delta = formatDeltaDays(variance.deltaDays);
  const trackHint =
    variance.deltaDays === 0 ? ' · по плану' : '';

  return (
    <div
      className={
        size === 'md'
          ? 'rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2.5'
          : undefined
      }
    >
      <p
        className={
          size === 'md'
            ? 'text-base font-semibold tabular-nums text-[var(--text)]'
            : 'text-sm tabular-nums text-[var(--text-secondary)]'
        }
      >
        {label}: {delta}
        {trackHint}
      </p>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
        Базовый план {formatDateRu(variance.baselineDate)} → прогноз{' '}
        {formatDateRu(variance.forecastDate)}
      </p>
    </div>
  );
}
