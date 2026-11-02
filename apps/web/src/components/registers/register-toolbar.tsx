'use client';

import type { WorkstreamId } from '@/lib/api-client';
import {
  attentionOptionLabel,
  type AttentionFilter,
  type EntityTypeFilter,
  type RegisterFilterState,
  typeOptionLabel,
  workstreamOptionLabel,
} from '@/lib/registers/register-filters';
import { WORKSTREAM_DISPLAY_ORDER } from '@/lib/ui-labels';

const ATTENTION_OPTIONS: AttentionFilter[] = ['all', 'attention', 'normal'];
const TYPE_OPTIONS: EntityTypeFilter[] = ['all', 'Issue', 'Risk'];

export function RegisterSummary({
  total,
  visible,
  counters,
}: {
  total: number;
  visible: number;
  counters: Array<{ label: string; value: number }>;
}) {
  return (
    <div
      className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]"
      data-register-summary="true"
    >
      <p>
        Показано{' '}
        <span className="font-semibold tabular-nums text-[var(--text)]">
          {visible} / {total}
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
  searchPlaceholder = 'Поиск по названию или ID',
}: {
  filters: RegisterFilterState;
  onChange: (next: RegisterFilterState) => void;
  onReset: () => void;
  showType?: boolean;
  showWorkstream?: boolean;
  searchPlaceholder?: string;
}) {
  const selectClass =
    'h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]';

  return (
    <div
      className="flex flex-col gap-3"
      data-register-toolbar="true"
      role="search"
      aria-label="Фильтры реестра"
    >
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-[var(--text-muted)]">
          Поиск
          <input
            type="search"
            value={filters.query}
            placeholder={searchPlaceholder}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          />
        </label>

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

        {showWorkstream ? (
          <label className="flex flex-col gap-1 text-xs text-[var(--text-muted)]">
            Направление
            <select
              className={selectClass}
              value={filters.workstream}
              onChange={(e) =>
                onChange({
                  ...filters,
                  workstream: e.target.value as WorkstreamId | 'all',
                })
              }
              aria-label="Фильтр направления"
            >
              <option value="all">{workstreamOptionLabel('all')}</option>
              {WORKSTREAM_DISPLAY_ORDER.map((id) => (
                <option key={id} value={id}>
                  {workstreamOptionLabel(id)}
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

        <button
          type="button"
          onClick={onReset}
          className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 text-sm text-[var(--text-secondary)] outline-none hover:bg-[var(--interactive)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
}
