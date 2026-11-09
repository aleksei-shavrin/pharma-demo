/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleZoomToggle } from './schedule-zoom-toggle';

describe('ScheduleZoomToggle', () => {
  it('calls onZoomIn/onZoomOut and disables at bounds', () => {
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();
    const { rerender } = render(
      <ScheduleZoomToggle
        levelIndex={2}
        canZoomIn
        canZoomOut
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Приблизить шкалу' }));
    fireEvent.click(screen.getByRole('button', { name: 'Отдалить шкалу' }));
    expect(onZoomIn).toHaveBeenCalledTimes(1);
    expect(onZoomOut).toHaveBeenCalledTimes(1);

    rerender(
      <ScheduleZoomToggle
        levelIndex={3}
        canZoomIn={false}
        canZoomOut
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />,
    );
    expect(screen.getByRole('button', { name: 'Приблизить шкалу' })).toBeDisabled();

    rerender(
      <ScheduleZoomToggle
        levelIndex={0}
        canZoomIn
        canZoomOut={false}
        disabled
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />,
    );
    expect(screen.getByRole('button', { name: 'Отдалить шкалу' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Приблизить шкалу' })).toBeDisabled();
  });
});
