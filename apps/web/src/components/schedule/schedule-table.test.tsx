/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ScheduleItem } from '@/lib/api-client';
import { ScheduleTable } from './schedule-table';

const items: ScheduleItem[] = [
  {
    kind: 'milestone',
    id: 'MS-PS',
    name: 'Ready for production',
    workstream: null,
    rag: 'Green',
    baselineDate: '2027-09-15',
    forecastDate: '2027-09-15',
    dateVariance: {
      baselineDate: '2027-09-15',
      forecastDate: '2027-09-15',
      deltaDays: 0,
    },
  },
  {
    kind: 'work',
    id: 'WK-01',
    name: 'Монтаж AHU',
    startDate: '2027-06-01',
    endDate: '2027-06-10',
    status: 'Waiting',
  },
];

afterEach(cleanup);

describe('ScheduleTable: работы', () => {
  it('строка работы: тип, id+название, начало/окончание, статус, прочерки', () => {
    render(<ScheduleTable items={items} />);
    expect(screen.getByText('Работа')).toBeInTheDocument();
    expect(screen.getByText('WK-01')).toBeInTheDocument();
    expect(screen.getByText('Монтаж AHU')).toBeInTheDocument();
    expect(screen.getByText('01.06.2027')).toBeInTheDocument();
    expect(screen.getByText('10.06.2027')).toBeInTheDocument();
    expect(screen.getByText('Ожидание')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Базовая дата / Начало' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Прогноз / Окончание' }),
    ).toBeInTheDocument();
  });

  it('без работ заголовки дат прежние', () => {
    render(<ScheduleTable items={[items[0]]} />);
    expect(
      screen.getByRole('columnheader', { name: 'Базовая дата' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Прогноз' }),
    ).toBeInTheDocument();
  });

  it('клик по строке работы отдаёт selection key work', async () => {
    const onSelect = vi.fn();
    render(<ScheduleTable items={items} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('WK-01'));
    expect(onSelect).toHaveBeenCalledWith({
      kind: 'work',
      entityId: 'WK-01',
    });
  });
});
