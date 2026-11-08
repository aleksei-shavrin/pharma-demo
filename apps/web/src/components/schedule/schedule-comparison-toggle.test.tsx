/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScheduleComparisonToggle } from './schedule-comparison-toggle';

afterEach(() => {
  cleanup();
});

describe('ScheduleComparisonToggle', () => {
  it('первая кнопка — Базовый план; затем прогноз и факт', () => {
    render(<ScheduleComparisonToggle mode="baseline" onChange={() => {}} />);
    const baseline = screen.getByRole('button', { name: 'Базовый план' });
    const forecast = screen.getByRole('button', {
      name: 'Базовый план / прогноз',
    });
    const actual = screen.getByRole('button', { name: 'Базовый план / факт' });
    expect(baseline).toHaveAttribute('aria-pressed', 'true');
    expect(forecast).toBeInTheDocument();
    expect(actual).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Сравнение полос' })).toBeInTheDocument();
  });

  it('ставит aria-pressed на выбранный режим сравнения', () => {
    const { rerender } = render(
      <ScheduleComparisonToggle mode="baseline" onChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Базовый план' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    rerender(<ScheduleComparisonToggle mode="actual" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Базовый план' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(
      screen.getByRole('button', { name: 'Базовый план / факт' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('при клике вызывает onChange с выбранным режимом', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ScheduleComparisonToggle mode="forecast" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Базовый план / факт' }));
    expect(onChange).toHaveBeenCalledWith('actual');

    await user.click(
      screen.getByRole('button', { name: 'Базовый план / прогноз' }),
    );
    expect(onChange).toHaveBeenCalledWith('forecast');
  });

  it('пробрасывает data-schedule-comparison на контейнер', () => {
    const { rerender, container } = render(
      <ScheduleComparisonToggle mode="forecast" onChange={() => {}} />,
    );
    const group = container.querySelector('[data-schedule-comparison]');
    expect(group).toHaveAttribute('data-schedule-comparison', 'forecast');

    rerender(<ScheduleComparisonToggle mode="actual" onChange={() => {}} />);
    expect(group).toHaveAttribute('data-schedule-comparison', 'actual');
  });
});
