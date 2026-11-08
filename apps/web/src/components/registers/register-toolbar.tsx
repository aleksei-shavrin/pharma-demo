'use client';

import {
  attentionOptionLabel,
  type AttentionFilter,
  type EntityTypeFilter,
  programOptionLabel,
  type RegisterFilterState,
  typeOptionLabel,
} from '@/lib/registers/register-filters';
import {
  PROGRAM_FILTER_OPTIONS,
  type ProgramFilterId,
} from '@/lib/registers/program-filter';

const ATTENTION_OPTIONS: AttentionFilter[] = ['all', 'attention', 'normal'];
const TYPE_OPTIONS: EntityTypeFilter[] = ['all', 'Issue', 'Risk'];

export function RegisterSummary({
  total,
  visible,
  counters,
  foundLabel = false,
}: {
  total: number;
  visible: number;
  counters: Array<{ label: string; value: number }>;
  /** Schedule: «Найдено N из T» instead of pagination-like «Показано». */
  foundLabel?: boolean;
}) {
  return (
    <div
      className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]"
      data-register-summary="true"
    >
      <p>
        {foundLabel ? 'Найдено' : 'Показано'}{' '}
        <span className="font-semibold tabular-nums text-[var(--text)]">
          {foundLabel ? `${visible} из ${total}` : `${visible} / ${total}`}
        </span>
      </p>
      {counters.map((c) => (
        <p key={c.label}>
          <span className="text-[var(--text-muted)]">{c.label}:</span>{' '}
          <span className="font-medium tabular-nums text-[var(--text)]">
            {c.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function RegisterToolbar({
  filters,
  onChange,
  onReset,
  showType = false,
  showWorkstream = true,
  showAttention = true,
  searchPlaceholder = 'Поиск по названию или ID',
  compactSearch = true,
  layout,
  showReset = true,
}: {
  filters: RegisterFilterState;
  onChange: (next: RegisterFilterState) => void;
  onReset: () => void;
  showType?: boolean;
  showWorkstream?: boolean;
  /** Decisions register supports search only — hide unsupported attention. */
  showAttention?: boolean;
  searchPlaceholder?: string;
  /** Search stays ~240px instead of filling the row (Schedule only). */
  compactSearch?: boolean;
  /** Presentation variant; omitted keeps the default registry layout. */
  layout?: 'schedule';
  /** When false, caller renders Reset after extra schedule filters (Тип точки). */
  showReset?: boolean;
}) {
  const selectClass =
    'h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]';

  return (
    <div
      className="flex flex-col gap-3"
      data-register-toolbar="true"
      data-register-toolbar-layout={layout}
      role="search"
      aria-label="Фильтры реестра"
    >
      <div className="flex flex-wrap items-end gap-2">
        <label
          className={[
            'flex flex-col gap-1 text-xs text-[var(--text-muted)]',
            compactSearch
              ? 'w-[240px] max-w-[240px] shrink-0'
              : 'min-w-[12rem] flex-1',
          ].join(' ')}
        >
          Поиск
          <input
            type="search"
            value={filters.query}
            placeholder={searchPlaceholder}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          />
        </label>

        {showAttention ? (
          <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
            Внимание
            <select
              className={selectClass}
              value={filters.attention}
              onChange={(e) =>
                onChange({
                  ...filters,
                  attention: e.target.value as AttentionFilter,
                })
              }
              aria-label="Фильтр внимания"
            >
              {ATTENTION_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {attentionOptionLabel(v)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showWorkstream ? (
          <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
            Программа
            <select
              className={selectClass}
              value={filters.program}
              onChange={(e) =>
                onChange({
                  ...filters,
                  program: e.target.value as ProgramFilterId,
                })
              }
              aria-label="Фильтр программы"
            >
              {PROGRAM_FILTER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {programOptionLabel(opt.id)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showType ? (
          <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
            Тип
            <select
              className={selectClass}
              value={filters.type}
              onChange={(e) =>
                onChange({
                  ...filters,
                  type: e.target.value as EntityTypeFilter,
                })
              }
              aria-label="Фильтр типа"
            >
              {TYPE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {typeOptionLabel(v)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showReset ? (
          <button
            type="button"
            onClick={onReset}
            className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 text-sm text-[var(--text-secondary)] outline-none hover:bg-[var(--interactive)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            Сбросить фильтры
          </button>
        ) : null}
      </div>
    </div>
  );
}
