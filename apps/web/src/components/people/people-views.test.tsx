/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { PersonDetail, PersonList } from '@/lib/api-client';
import { PeopleListView } from './people-list-view';
import { PersonDetailView } from './person-detail-view';
import { NAV_ITEMS } from '@/lib/navigation';

const list: PersonList = {
  snapshotId: 'C',
  scenarioAsOfDate: '2027-03-02',
  projectId: 'PRJ-01',
  items: [
    {
      id: 'PER-03',
      fullNameRu: 'Кузнецов Дмитрий Игоревич',
      roleTitleRu: 'Планирование и контроль проекта',
      primaryWorkstreamId: null,
      active: true,
    },
    {
      id: 'PER-04',
      fullNameRu: 'Новикова Анна Павловна',
      roleTitleRu: 'Закупки',
      primaryWorkstreamId: null,
      active: true,
    },
    {
      id: 'PER-08',
      fullNameRu: 'Смирнов Павел Андреевич',
      roleTitleRu: 'Ведущий направления HVAC',
      primaryWorkstreamId: 'WS-HVAC',
      active: true,
    },
    {
      id: 'PER-02',
      fullNameRu: 'Морозова Елена Сергеевна',
      roleTitleRu: 'Руководитель проекта (PM)',
      primaryWorkstreamId: null,
      active: true,
    },
  ],
};

/** Snapshot C HVAC lead: no Issues yet (ISS-HVAC-02 @ D); not BLD leftovers. */
const detail: PersonDetail = {
  snapshotId: 'C',
  scenarioAsOfDate: '2027-03-02',
  projectId: 'PRJ-01',
  person: list.items.find((p) => p.id === 'PER-08')!,
  issueIds: [],
  decisionIds: [],
  equipmentIds: ['EQ-HVAC-01', 'EQ-HVAC-02'],
  leadWorkstreamIds: ['WS-HVAC'],
};

afterEach(() => cleanup());

describe('People UI (R2-P1 / P1-R1)', () => {
  it('lists people in Russian without SH ids or EN role fragments', () => {
    render(<PeopleListView data={list} />);
    expect(screen.getByRole('heading', { name: 'Персоны' })).toBeInTheDocument();
    expect(screen.getByText('Смирнов Павел Андреевич')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Смирнов Павел Андреевич' }),
    ).toHaveAttribute('href', '/people/PER-08');
    expect(screen.getByText('Планирование и контроль проекта')).toBeInTheDocument();
    expect(screen.getByText('Закупки')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/SH-/);
    expect(document.body.textContent).not.toMatch(/Procurement/i);
    expect(document.body.textContent).not.toMatch(/Project Controls/i);
    expect(
      document.querySelector('[data-page-scroll-mode="workspace"]'),
    ).toBeTruthy();
  });

  it('PER-08 detail on C is HVAC lead without BLD issues', () => {
    render(<PersonDetailView data={detail} />);
    expect(
      screen.getByRole('heading', { name: 'Смирнов Павел Андреевич' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Ведущий направления HVAC')).toBeInTheDocument();
    expect(
      document.querySelector('a[href="/workstreams/WS-HVAC"]'),
    ).toBeTruthy();
    expect(screen.queryByText('ISS-BLD-01')).not.toBeInTheDocument();
    expect(screen.queryByText('ISS-BLD-02')).not.toBeInTheDocument();
    expect(screen.getByText('EQ-HVAC-01')).toBeInTheDocument();
    expect(screen.getByText('EQ-HVAC-02')).toBeInTheDocument();
    expect(
      document.querySelector('[data-page-scroll-mode="page"]'),
    ).toBeTruthy();
  });

  it('sidebar IA includes Персоны and not Workstreams top-level', () => {
    expect(NAV_ITEMS.some((n) => n.href === '/people' && n.label === 'Персоны')).toBe(
      true,
    );
    expect(NAV_ITEMS.some((n) => n.href === '/workstreams')).toBe(false);
  });
});
