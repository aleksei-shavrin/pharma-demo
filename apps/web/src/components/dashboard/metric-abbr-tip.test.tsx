/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricAbbrTip } from './metric-abbr-tip';

describe('MetricAbbrTip', () => {
  it('shows visible tip on hover and keyboard focus', async () => {
    const user = userEvent.setup();
    render(<MetricAbbrTip abbr="EAC" tip="Прогноз стоимости по завершении" />);
    const btn = screen.getByRole('button', { name: /EAC/ });
    expect(screen.queryByRole('tooltip')).toBeNull();

    await user.hover(btn);
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Прогноз стоимости по завершении',
    );
    expect(
      document.querySelector('[data-metric-abbr-tip="true"]'),
    ).toBeTruthy();

    await user.unhover(btn);
    expect(screen.queryByRole('tooltip')).toBeNull();

    await user.tab();
    expect(document.activeElement).toBe(btn);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('first click after focus pins open; Escape closes', async () => {
    const user = userEvent.setup();
    render(<MetricAbbrTip abbr="VAC" tip="Отклонение прогноза" />);
    const btn = screen.getByRole('button', { name: /VAC/ });

    await user.tab();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // First click must not toggle closed (focus→click race).
    await user.click(btn);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(
      document.querySelector('[data-metric-abbr-pinned="true"]'),
    ).toBeTruthy();

    await user.keyboard('{Escape}');
    expect(
      document.querySelector('[data-metric-abbr-pinned="true"]'),
    ).toBeNull();
  });
});
