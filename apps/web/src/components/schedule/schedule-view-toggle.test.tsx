/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScheduleViewToggle } from './schedule-view-toggle';

afterEach(() => {
  cleanup();
});

describe('ScheduleViewToggle', () => {
  it('даёт кнопкам доступные имена Таблица, Разделение, Временная шкала', () => {
    render(<ScheduleViewToggle mode="split" onChange={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Таблица' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Разделение' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Временная шкала' }),
    ).toBeInTheDocument();
  });

  it('ставит aria-pressed только на активный режим', () => {
    const { rerender } = render(
      <ScheduleViewToggle mode="table" onChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Таблица' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Разделение' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(
      screen.getByRole('button', { name: 'Временная шкала' }),
    ).toHaveAttribute('aria-pressed', 'false');

    rerender(<ScheduleViewToggle mode="gantt" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Таблица' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(
      screen.getByRole('button', { name: 'Временная шкала' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('при клике вызывает onChange с выбранным режимом', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ScheduleViewToggle mode="split" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Таблица' }));
    expect(onChange).toHaveBeenCalledWith('table');

    await user.click(screen.getByRole('button', { name: 'Временная шкала' }));
    expect(onChange).toHaveBeenCalledWith('gantt');

    await user.click(screen.getByRole('button', { name: 'Разделение' }));
    expect(onChange).toHaveBeenCalledWith('split');
  });

  it('группа имеет подпись «Режим представления календарного плана»', () => {
    render(<ScheduleViewToggle mode="split" onChange={() => {}} />);
    expect(
      screen.getByRole('group', {
        name: 'Режим представления календарного плана',
      }),
    ).toBeInTheDocument();
  });
});
