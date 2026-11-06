/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScheduleComparisonToggle } from './schedule-comparison-toggle';

afterEach(() => {
  cleanup();
});

describe('ScheduleComparisonToggle', () => {
  it('оставляет подписи «Базовый план / прогноз» и «Базовый план / факт» как доступные имена', () => {
    render(<ScheduleComparisonToggle mode="forecast" onChange={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Базовый план / прогноз' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Базовый план / факт' }),
    ).toBeInTheDocument();
  });

  it('ставит aria-pressed на выбранный режим сравнения', () => {
    const { rerender } = render(
      <ScheduleComparisonToggle mode="forecast" onChange={() => {}} />,
    );
    expect(
      screen.getByRole('button', { name: 'Базовый план / прогноз' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Базовый план / факт' }),
    ).toHaveAttribute('aria-pressed', 'false');

    rerender(<ScheduleComparisonToggle mode="actual" onChange={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Базовый план / прогноз' }),
    ).toHaveAttribute('aria-pressed', 'false');
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
