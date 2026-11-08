'use client';

import { useMemo, useState } from 'react';
import type { PersonList } from '@/lib/api-client';
import {
  RegisterCell,
  RegisterEntityCell,
  RegisterRow,
  RegisterShell,
  RegisterTable,
} from '@/components/registers/register-table';
import { programLabelForWorkstream } from '@/lib/registers/program-filter';
import { formatDateRu } from '@/lib/format/ru';
import { presentRoleTitleRu } from '@/lib/people/present-role-title';

export function PeopleListView({ data }: { data: PersonList }) {
  const [query, setQuery] = useState('');
  const [program, setProgram] = useState('all');
  const q = query.trim().toLowerCase();

  const programs = useMemo(() => {
    const set = new Set<string>();
    for (const p of data.items) {
      if (p.primaryWorkstreamId) {
        set.add(programLabelForWorkstream(p.primaryWorkstreamId));
      }
    }
    return [...set].sort();
  }, [data.items]);

  const filtered = data.items.filter((p) => {
    if (program !== 'all') {
      const label = p.primaryWorkstreamId
        ? programLabelForWorkstream(p.primaryWorkstreamId)
        : '';
      if (label !== program) return false;
    }
    if (!q) return true;
    return (
      p.id.toLowerCase().includes(q) ||
      p.fullNameRu.toLowerCase().includes(q) ||
      presentRoleTitleRu(p.roleTitleRu).toLowerCase().includes(q)
    );
  });

  const clear = () => {
    setQuery('');
    setProgram('all');
  };

  return (
    <RegisterShell
      title="Участники"
      asOf={formatDateRu(data.scenarioAsOfDate)}
      snapshot={data.snapshotId}
    >
      <p className="text-sm text-[var(--text-secondary)]" data-list-subtitle="people">
        Показано{' '}
        <span className="font-semibold tabular-nums text-[var(--text)]">
          {filtered.length} / {data.items.length}
        </span>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2" data-list-toolbar="people">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени, роли или ID"
          className="h-8 w-60 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
        />
        <select
          className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-sm"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
        >
          <option value="all">Все программы</option>
          {programs.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
        {(q || program !== 'all') && (
          <button
            type="button"
            className="text-sm text-[var(--link)] underline"
            onClick={clear}
          >
            Сбросить
          </button>
        )}
      </div>
      <RegisterTable
        caption="Каталог участников проекта"
        columns={['Участник', 'Роль', 'Программа']}
      >
        {filtered.map((p) => (
          <RegisterRow key={p.id}>
            <RegisterEntityCell
              href={`/people/${encodeURIComponent(p.id)}`}
              title={p.fullNameRu}
              id={p.id}
            />
            <RegisterCell>
              {presentRoleTitleRu(p.roleTitleRu)}
            </RegisterCell>
            <RegisterCell>
              {p.primaryWorkstreamId
                ? programLabelForWorkstream(p.primaryWorkstreamId)
                : '—'}
            </RegisterCell>
          </RegisterRow>
        ))}
      </RegisterTable>
    </RegisterShell>
  );
}
