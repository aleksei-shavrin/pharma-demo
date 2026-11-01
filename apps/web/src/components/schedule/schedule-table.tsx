'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { StatusPill } from '@/components/dashboard/status-pill';
import {
  RegisterCell,
  RegisterRow,
  RegisterTable,
} from '@/components/registers/register-table';
import type { ScheduleItem } from '@/lib/api-client';
import { entityDetailHref } from '@/lib/entity-routes';
import { formatDateRu, formatDeltaDays } from '@/lib/format/ru';
import {
  selectionKeyEquals,
  selectionKeyId,
  selectionKeyOf,
  type ScheduleSelectionKey,
} from '@/lib/schedule/selection-key';
import {
  presentMilestoneName,
  scheduleKindLabel,
} from '@/lib/ui-labels';

const linkClass =
  'underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]';

function objectCell(item: ScheduleItem) {
  if (item.kind === 'equipment_delivery') {
    return (
      <Link
        href={entityDetailHref('equipment', item.id)}
        className={linkClass}
        onClick={(e) => e.stopPropagation()}
      >
        {item.id}
      </Link>
    );
  }
  return (
    <span className="inline-flex flex-col gap-0.5">
      <Link
        href={entityDetailHref('milestone', item.id)}
        className={linkClass}
        onClick={(e) => e.stopPropagation()}
      >
        {item.id}
      </Link>
      <span className="text-xs text-[var(--text-muted)]">
        {presentMilestoneName(item.id, item.name)}
      </span>
    </span>
  );
}

function statusCell(item: ScheduleItem) {
  if (item.kind === 'equipment_delivery') {
    return <StatusPill family="equipment" value={item.status} />;
  }
  return <StatusPill family="rag" value={item.rag} entity="milestone" />;
}

type Props = {
  items: ScheduleItem[];
  selected?: ScheduleSelectionKey | null;
  onSelect?: (key: ScheduleSelectionKey) => void;
};

/** Primary Schedule representation — dense control-point table (D10/D11). */
export function ScheduleTable({
  items,
  selected = null,
  onSelect,
}: Props) {
  const rowRefs = useRef<Map<string, HTMLTableRowElement | null>>(new Map());

  useEffect(() => {
    if (!selected) return;
    const el = rowRefs.current.get(selectionKeyId(selected));
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selected]);

  return (
    <RegisterTable
      caption="График контрольных точек"
      columns={[
        'Тип',
        'Объект',
        'Базовая дата',
        'Прогноз',
        'Отклонение',
        'Статус',
        'Критичность',
      ]}
    >
      {items.map((item) => {
        const key = selectionKeyOf(item);
        const isSelected = selectionKeyEquals(selected, key);
        return (
          <RegisterRow
            key={selectionKeyId(key)}
            selected={isSelected}
            onSelect={onSelect ? () => onSelect(key) : undefined}
            rowRef={(el) => {
              rowRefs.current.set(selectionKeyId(key), el);
            }}
          >
            <RegisterCell>{scheduleKindLabel(item.kind)}</RegisterCell>
            <RegisterCell className="font-medium text-[var(--text)]">
              {objectCell(item)}
            </RegisterCell>
            <RegisterCell>{formatDateRu(item.baselineDate)}</RegisterCell>
            <RegisterCell>{formatDateRu(item.forecastDate)}</RegisterCell>
            <RegisterCell className="tabular-nums text-[var(--text)]">
              {formatDeltaDays(item.dateVariance.deltaDays)}
            </RegisterCell>
            <RegisterCell>{statusCell(item)}</RegisterCell>
            <RegisterCell>
              {item.kind === 'equipment_delivery'
                ? item.critical
                  ? 'Да'
                  : 'Нет'
                : '—'}
            </RegisterCell>
          </RegisterRow>
        );
      })}
    </RegisterTable>
  );
}
