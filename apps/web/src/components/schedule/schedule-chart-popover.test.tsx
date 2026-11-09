/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleChartPopover } from './schedule-chart-popover';

describe('ScheduleChartPopover', () => {
  it('renders portal content, link, and closes on Escape', () => {
    const onClose = vi.fn();
    const onPanelIdChange = vi.fn();
    render(
      <ScheduleChartPopover
        open
        owner={{ left: 200, top: 120, right: 260, bottom: 128, width: 60, height: 8 }}
        model={{
          title: 'Линия упаковки',
          subtitle: 'EQ-1',
          kindLabel: 'Поставка оборудования',
          statusLabel: 'Статус: в срок',
          progressLabel: null,
          dateLines: [{ label: 'Прогноз', value: '15.03.2027' }],
          href: '/equipment/EQ-1',
          hrefLabel: 'Открыть',
        }}
        onClose={onClose}
        onPanelIdChange={onPanelIdChange}
      />,
    );
    const tip = screen.getByRole('tooltip');
    expect(tip).toHaveAttribute('data-schedule-chart-popover', 'true');
    expect(tip).toHaveAttribute('id');
    expect(onPanelIdChange).toHaveBeenCalledWith(tip.getAttribute('id'));
    expect(screen.getByText('Линия упаковки')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Открыть' })).toHaveAttribute(
      'href',
      '/equipment/EQ-1',
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ScheduleChartPopover
        open={false}
        owner={null}
        model={null}
        onClose={() => {}}
      />,
    );
    expect(container.querySelector('[data-schedule-chart-popover]')).toBeNull();
  });
});
